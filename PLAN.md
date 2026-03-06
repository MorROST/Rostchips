# Rostchips - Implementation Plan

## Context

Build a mobile-first PWA (like "Deglaze") that lets users save recipes from social media videos. The user pastes a video link (Instagram Reels, TikTok, YouTube, Facebook), AI extracts a structured recipe from the video's transcript, and the recipe is saved with the embedded video on top for reference. Users must register before using the app.

**Tech stack:** Next.js + AWS (DynamoDB + Cognito) + Claude API + Bilingual (Hebrew RTL + English)

---

## Architecture Overview

```
[iPhone/Mobile Browser]
        |
   [Next.js on Vercel]
    /        |        \
[Cognito]  [API Routes]  [next-intl i18n]
             |
    +--------+--------+
    |        |        |
[oEmbed] [Transcript] [Claude API]
  APIs    APIs(3rd     (recipe
          party)       extraction)
             |
        [DynamoDB]
```

---

## Phase 1: Project Scaffold + Auth (~Day 1)

### 1.1 Initialize project
- `npx create-next-app@latest` with TypeScript, Tailwind, App Router, src dir
- Install deps: `aws-amplify`, `@aws-amplify/adapter-nextjs`, `@aws-sdk/client-dynamodb`, `@aws-sdk/lib-dynamodb`, `@anthropic-ai/sdk`, `next-intl`, `zod`, `ulid`, `@heroicons/react`, `clsx`, `tailwind-merge`

### 1.2 Set up i18n (next-intl)
- `src/lib/i18n/config.ts` — locales: `['en', 'he']`, default: `en`
- `src/lib/i18n/navigation.ts` — localized Link, useRouter, usePathname
- `src/messages/en.json` + `src/messages/he.json` — translation files
- `src/middleware.ts` — next-intl middleware for locale routing
- All pages under `src/app/[locale]/`
- Locale layout sets `dir="rtl"` for Hebrew, loads Inter + Heebo fonts

### 1.3 AWS Cognito auth
- **User needs to create** a Cognito User Pool in AWS Console (email sign-up, no client secret)
- `src/lib/aws/cognito.ts` — Amplify v6 config + auth helpers (signUp, signIn, signOut)
- `src/lib/aws/config.ts` — AWS region, pool IDs, table name from env vars
- `src/hooks/useAuth.ts` — auth state hook
- `src/components/AuthGuard.tsx` — protected route wrapper

### 1.4 Auth pages
- `src/app/[locale]/login/page.tsx` — email + password login form
- `src/app/[locale]/register/page.tsx` — sign-up form with email verification
- Middleware redirects unauthenticated users to `/login`

### 1.5 Environment variables (`.env.local`)
```
AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
DYNAMODB_TABLE_NAME=Rostchips_dynamoDB_table
NEXT_PUBLIC_COGNITO_USER_POOL_ID, NEXT_PUBLIC_COGNITO_CLIENT_ID
ANTHROPIC_API_KEY
RAPIDAPI_KEY
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Phase 2: Core UI Shell (~Day 2)

### 2.1 Design system
- Orange/amber color theme (food app)
- `src/components/ui/` — Button, Input, Card, Spinner (minimal reusable components)
- Fonts: Inter (English) + Heebo (Hebrew) via `next/font/google`
- **All spacing uses logical properties**: `ps-`, `pe-`, `ms-`, `me-`, `start-0`, `end-0` (RTL-safe)

### 2.2 Layout & Navigation
- `src/components/Navbar.tsx` — fixed bottom nav (mobile) with 3 tabs: My Recipes, Add Recipe, Settings
- Root layout configures Amplify, fonts, and providers
- Locale layout wraps with `NextIntlClientProvider`

### 2.3 Pages (UI only, mock data initially)
| Page | File | Description |
|------|------|-------------|
| Home/Library | `src/app/[locale]/page.tsx` | Grid of RecipeCards (empty state message when none) |
| Add Recipe | `src/app/[locale]/add/page.tsx` | URL input form with platform detection icon |
| Recipe Detail | `src/app/[locale]/recipe/[id]/page.tsx` | Video embed on top + ingredients + instructions below |
| Settings | `src/app/[locale]/settings/page.tsx` | Language toggle, profile info, logout |

### 2.4 Key components
- `RecipeCard.tsx` — thumbnail, title, tags, tap to open detail
- `RecipeList.tsx` — responsive grid of cards
- `RecipeDetail.tsx` — full recipe with video, ingredients (checkable), steps
- `VideoEmbed.tsx` — platform-aware embed (loads TikTok/Instagram scripts dynamically)
- `AddRecipeForm.tsx` — URL input with validation + platform indicator
- `LanguageToggle.tsx` — he/en switch that changes locale
- `ExtractionProgress.tsx` — animated steps during extraction

### 2.5 PWA
- `public/manifest.json` — standalone display, orange theme, app icons
- Basic service worker for app shell caching
- Meta tags for iOS: `apple-mobile-web-app-capable`, status bar style, icons

---

## Phase 3: Video-to-Recipe Pipeline (~Day 3)

This is the core intelligence of the app.

### 3.1 Pipeline flow
```
User pastes URL
       |
       v
[1] Platform Detection — parse URL, detect tiktok/instagram/youtube/facebook
       |
       v
[2] Create Recipe in DynamoDB — status="processing"
       |
       v
[3] oEmbed Fetch — get embed HTML + thumbnail for video
       |
       v
[4] Transcript Extraction — route to platform-specific provider
       |
       v
[5] Claude Recipe Extraction — send transcript, get structured recipe JSON
       |
       v
[6] Update Recipe in DynamoDB — status="completed"
```

### 3.2 Platform detection
- `src/lib/video/platforms.ts` — regex patterns to detect TikTok, Instagram, YouTube, Facebook from URL

### 3.3 oEmbed integration
- `src/lib/video/oembed.ts`
- **TikTok**: open endpoint `https://www.tiktok.com/oembed?url=...` (no auth needed)
- **YouTube**: open endpoint `https://www.youtube.com/oembed?url=...` (no auth needed)
- **Instagram**: iframe fallback `<iframe src="URL/embed">` — Meta's oEmbed requires app review, skip for MVP

### 3.4 Transcript extraction
- `src/lib/video/transcript.ts` — orchestrator with platform routing
- `src/lib/video/providers/youtube.ts` — use `youtube-transcript` npm package (free, no auth)
- `src/lib/video/providers/tiktok.ts` — RapidAPI transcript service
- `src/lib/video/providers/instagram.ts` — RapidAPI transcript service
- `src/lib/video/providers/facebook.ts` — RapidAPI transcript service

### 3.5 Claude recipe extraction
- `src/lib/ai/schema.ts` — Zod schema for structured recipe output:
  - title, titleHe, description
  - ingredients[] (name, quantity, unit, note)
  - instructions[] (step, text)
  - prepTime, cookTime, totalTime, servings
  - tags[], sourceLanguage
- `src/lib/ai/claude.ts` — sends transcript to Claude Sonnet via tool_use structured output
- System prompt instructs Claude to:
  - Extract all ingredients (estimate quantities if not stated in video)
  - Write clear numbered steps even if video was casual
  - Provide Hebrew title if source is English (and vice versa)
  - Detect source language
- **Cost**: ~$0.02 per extraction

---

## Phase 4: Database + Full CRUD (~Day 4)

### 4.1 DynamoDB setup
- **User needs to create** table `Rostchips_dynamoDB_table` in AWS Console
- Partition key: `PK` (String), Sort key: `SK` (String)
- GSI1: partition key `GSI1PK`, sort key `GSI1SK` — for querying user's recipes sorted by date
- On-demand billing mode

### 4.2 Data model (single-table design)
**User item:**
```
PK = USER#<cognitoSub>
SK = PROFILE
email, displayName, preferredLanguage, createdAt
```

**Recipe item:**
```
PK = RECIPE#<ulid>
SK = META
GSI1PK = USER#<cognitoSub>
GSI1SK = RECIPE#<isoTimestamp>
title, titleHe, description, ingredients[], instructions[],
prepTime, cookTime, servings, tags[], videoUrl, videoPlatform,
embedHtml, thumbnailUrl, transcript, sourceLanguage,
extractionStatus, createdAt, updatedAt
```

### 4.3 DynamoDB helpers
- `src/lib/aws/dynamodb.ts` — DynamoDB Document Client singleton + CRUD functions:
  - `createRecipeRecord()` — initial record with status=processing
  - `updateRecipeWithExtraction()` — fill in extracted data
  - `getUserRecipes()` — query GSI1 by userId, newest first, paginated
  - `getRecipeById()` — get by PK
  - `deleteRecipe()` — delete by PK

### 4.4 API routes
| Route | Method | Description |
|-------|--------|-------------|
| `/api/recipes` | POST | Validate URL, create record, run pipeline, return recipe |
| `/api/recipes` | GET | List user's recipes (paginated via cursor) |
| `/api/recipes/[id]` | GET | Get single recipe (verify ownership) |
| `/api/recipes/[id]` | DELETE | Delete recipe (verify ownership) |

- All routes verify Cognito JWT via Amplify server-side auth

### 4.5 Connect UI to API
- `src/hooks/useRecipes.ts` — fetch/mutate recipes
- Wire AddRecipeForm → POST /api/recipes
- Wire RecipeList → GET /api/recipes
- Wire RecipeDetail → GET /api/recipes/[id]
- Wire delete button → DELETE /api/recipes/[id]

---

## Phase 5: Polish & Deploy (~Day 5)

### 5.1 Complete Hebrew translations in `src/messages/he.json`
### 5.2 RTL layout verification on every page
### 5.3 Error handling — user-friendly error messages, network error detection
### 5.4 Loading states — skeleton loaders for cards, extraction progress animation
### 5.5 Deploy to Vercel
- Connect GitHub repo
- Set environment variables in Vercel dashboard
- Test PWA "Add to Home Screen" on iPhone Safari
- Test both languages end-to-end

---

## Project Structure

```
rostchips/
├── public/
│   ├── icons/                    # PWA icons (192x192, 512x512)
│   ├── manifest.json
│   └── sw.js                     # Service worker
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── layout.tsx        # Locale layout (dir=rtl/ltr, fonts)
│   │   │   ├── page.tsx          # Home / Recipe Library
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   ├── add/page.tsx
│   │   │   ├── recipe/[id]/page.tsx
│   │   │   └── settings/page.tsx
│   │   ├── api/
│   │   │   ├── recipes/route.ts
│   │   │   ├── recipes/[id]/route.ts
│   │   │   └── extract/route.ts
│   │   ├── layout.tsx            # Root layout (Amplify config, providers)
│   │   └── not-found.tsx
│   ├── components/
│   │   ├── ui/                   # Button, Input, Card, Spinner
│   │   ├── RecipeCard.tsx
│   │   ├── RecipeDetail.tsx
│   │   ├── RecipeList.tsx
│   │   ├── VideoEmbed.tsx
│   │   ├── AddRecipeForm.tsx
│   │   ├── Navbar.tsx
│   │   ├── LanguageToggle.tsx
│   │   ├── AuthGuard.tsx
│   │   └── ExtractionProgress.tsx
│   ├── lib/
│   │   ├── aws/
│   │   │   ├── cognito.ts        # Amplify v6 auth config + helpers
│   │   │   ├── dynamodb.ts       # DynamoDB client + CRUD helpers
│   │   │   └── config.ts         # AWS configuration from env vars
│   │   ├── ai/
│   │   │   ├── claude.ts         # Claude API recipe extraction
│   │   │   └── schema.ts         # Zod schema for recipe output
│   │   ├── video/
│   │   │   ├── oembed.ts         # oEmbed fetcher (multi-platform)
│   │   │   ├── transcript.ts     # Transcript extraction orchestrator
│   │   │   ├── platforms.ts      # URL detection + platform config
│   │   │   └── providers/
│   │   │       ├── youtube.ts    # YouTube transcript (free API)
│   │   │       ├── tiktok.ts     # TikTok transcript (RapidAPI)
│   │   │       ├── instagram.ts  # Instagram transcript (RapidAPI)
│   │   │       └── facebook.ts   # Facebook transcript (RapidAPI)
│   │   └── i18n/
│   │       ├── config.ts         # next-intl routing config
│   │       ├── request.ts        # next-intl request config
│   │       └── navigation.ts     # Localized Link, redirect, useRouter
│   ├── messages/
│   │   ├── en.json               # English translations
│   │   └── he.json               # Hebrew translations
│   ├── hooks/
│   │   ├── useAuth.ts            # Auth state + actions
│   │   ├── useRecipes.ts         # Recipe CRUD operations
│   │   └── useExtraction.ts      # Extraction progress tracking
│   ├── types/
│   │   └── index.ts              # All TypeScript interfaces
│   ├── middleware.ts              # next-intl + auth middleware
│   └── styles/
│       └── globals.css           # Tailwind directives + custom styles
├── next.config.ts
├── tailwind.config.ts
├── package.json
├── tsconfig.json
└── .env.local                    # Never committed
```

---

## AWS Resources to Create (Manual Steps)

1. **Cognito User Pool** — email sign-up, app client with no secret, email verification enabled
2. **DynamoDB Table** `Rostchips_dynamoDB_table` — PK (String) + SK (String), GSI1 (GSI1PK + GSI1SK), on-demand billing

---

## External API Keys Needed

| Service | Purpose | Free Tier |
|---------|---------|-----------|
| Anthropic (Claude) | Recipe extraction from transcript | Pay-as-you-go (~$0.02/extraction) |
| RapidAPI | TikTok/Instagram transcript extraction | Varies by provider |
| AWS | Cognito + DynamoDB | Free tier covers MVP scale |

---

## Estimated Monthly Cost (100 users, 500 extractions)

| Service | Cost |
|---------|------|
| Vercel (Hobby) | $0 |
| Cognito | $0 (free tier) |
| DynamoDB (on-demand) | ~$1-2 |
| Claude API | ~$10 |
| RapidAPI transcripts | ~$10-15 |
| **Total** | **~$25/month** |

---

## Verification Checklist

- [ ] Register a new user, verify email, log in — session persists across refresh
- [ ] Paste a TikTok recipe video URL — recipe extraction completes
- [ ] Paste a YouTube recipe video URL — extraction works
- [ ] View recipe detail — video plays on tap, recipe text is readable
- [ ] Switch to Hebrew — RTL layout correct, Hebrew translations show
- [ ] Return to home — recipe appears in library list
- [ ] Delete a recipe — removed from list
- [ ] Open on iPhone Safari — "Add to Home Screen" PWA works
- [ ] Test on Android Chrome — basic functionality works
