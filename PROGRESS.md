# Rostcipes — Implementation Progress

## Status: All 5 Phases Complete (Build Passing)

**Date:** 2026-02-19
**Build:** `npm run build` compiles with zero errors (Next.js 16.1.6 Turbopack)

---

## Tech Stack

- **Framework:** Next.js 16.1.6 (App Router, TypeScript, Tailwind CSS v4)
- **Auth:** AWS Cognito via Amplify v6
- **Database:** AWS DynamoDB (single-table design)
- **AI:** Claude Sonnet via `@anthropic-ai/sdk` (tool_use structured output)
- **i18n:** next-intl v4 (English + Hebrew RTL)
- **Transcript:** youtube-transcript (free) + RapidAPI (TikTok, Instagram, Facebook)
- **PWA:** manifest.json + service worker + iOS meta tags

---

## File Structure (Complete)

```
rostcipes/
├── public/
│   ├── icons/
│   │   ├── icon-192.png              # Orange placeholder PWA icon
│   │   └── icon-512.png              # Orange placeholder PWA icon
│   ├── manifest.json                  # PWA: standalone display, orange theme
│   └── sw.js                          # Service worker: stale-while-revalidate caching
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── layout.tsx             # Sets dir="rtl" for Hebrew, wraps with NextIntlClientProvider + AuthGuard + Navbar
│   │   │   ├── page.tsx               # Home — recipe grid using useRecipes hook
│   │   │   ├── login/page.tsx         # Email + password login form via Cognito
│   │   │   ├── register/page.tsx      # Sign-up with email verification (2-step: register → verify code)
│   │   │   ├── add/page.tsx           # URL input + AddRecipeForm component
│   │   │   ├── recipe/[id]/page.tsx   # Fetches single recipe, renders RecipeDetail, handles delete
│   │   │   └── settings/page.tsx      # Language toggle, profile info, logout button
│   │   ├── api/
│   │   │   ├── auth.ts                # JWT verification: decodes Cognito token, checks expiry, extracts sub
│   │   │   ├── extract/route.ts       # POST: standalone extraction endpoint (oEmbed + transcript + Claude)
│   │   │   ├── recipes/route.ts       # GET: list user recipes | POST: create + run full pipeline
│   │   │   └── recipes/[id]/route.ts  # GET: single recipe (ownership check) | DELETE: remove recipe
│   │   ├── layout.tsx                 # Root layout: Inter + Heebo fonts, PWA meta tags, viewport config
│   │   └── not-found.tsx              # Simple 404 page
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx             # Variants: primary/secondary/ghost/danger, sizes: sm/md/lg, loading spinner
│   │   │   ├── Input.tsx              # With label, error state, forwardRef
│   │   │   ├── Card.tsx               # Rounded card with optional onClick hover effect
│   │   │   └── Spinner.tsx            # SVG spinner in sm/md/lg sizes
│   │   ├── AddRecipeForm.tsx          # URL input with platform detection icon, extraction progress, done/error states
│   │   ├── AuthGuard.tsx              # Redirects unauthenticated users to /login (skips /login and /register)
│   │   ├── ExtractionProgress.tsx     # 5-step animated progress: fetching → transcript → extracting → saving → done
│   │   ├── LanguageToggle.tsx         # Pill toggle between English and עברית, uses router.replace with locale
│   │   ├── Navbar.tsx                 # Fixed bottom nav with 3 tabs: My Recipes, Add Recipe, Settings (filled/outline icons)
│   │   ├── RecipeCard.tsx             # Grid card: thumbnail (or platform icon fallback), title, tags, cook time
│   │   ├── RecipeDetail.tsx           # Full recipe view: video embed, checkable ingredients, numbered steps, meta badges
│   │   ├── RecipeList.tsx             # Responsive grid (2/3/4 cols), empty state with icon, loading spinner
│   │   └── VideoEmbed.tsx             # Platform-aware: injects HTML + loads TikTok/Instagram embed scripts dynamically
│   ├── hooks/
│   │   ├── useAuth.ts                 # Auth state: getCurrentUser + fetchAuthSession, returns user/loading/signOut/refresh
│   │   ├── useExtraction.ts           # Extraction state machine: idle→fetching→transcript→extracting→saving→done/error
│   │   └── useRecipes.ts             # Fetch user recipes, delete recipe, auto-refresh on token change
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── claude.ts              # Sends transcript to Claude Sonnet with tool_use, returns structured ExtractionResult
│   │   │   └── schema.ts             # Zod schemas: ingredientSchema, recipeExtractionSchema
│   │   ├── aws/
│   │   │   ├── cognito.ts            # Amplify v6 config + auth wrappers (signUp, signIn, signOut, confirmSignUp, etc.)
│   │   │   ├── config.ts             # AWS region, Cognito pool IDs, DynamoDB table name from env vars
│   │   │   └── dynamodb.ts           # DDB Document Client + CRUD: create, update with extraction, mark failed, get user recipes, get by ID, delete
│   │   ├── i18n/
│   │   │   ├── navigation.ts         # defineRouting + createNavigation (Link, useRouter, usePathname, redirect)
│   │   │   └── request.ts            # getRequestConfig for server-side locale + message loading
│   │   └── video/
│   │       ├── oembed.ts             # TikTok/YouTube (open endpoints), Instagram/Facebook (iframe fallbacks)
│   │       ├── platforms.ts           # Regex detection for TikTok, Instagram, YouTube, Facebook + icon/name helpers
│   │       ├── transcript.ts          # Orchestrator: routes to correct provider, joins segments into full text
│   │       └── providers/
│   │           ├── facebook.ts        # RapidAPI transcript service
│   │           ├── instagram.ts       # RapidAPI transcript service
│   │           ├── tiktok.ts          # RapidAPI transcript service
│   │           └── youtube.ts         # Uses youtube-transcript npm package (free, no auth)
│   ├── messages/
│   │   ├── en.json                    # Full English translations (common, nav, auth, recipes, settings)
│   │   └── he.json                    # Full Hebrew translations (matching keys)
│   ├── middleware.ts                  # next-intl locale routing middleware
│   ├── styles/
│   │   └── globals.css                # (imported from app/globals.css — Tailwind v4 @theme with orange palette)
│   └── types/
│       └── index.ts                   # Platform, ExtractionStatus, Ingredient, Recipe, UserProfile, OEmbedResponse, TranscriptSegment, ExtractionResult
├── .env.local                         # All env var placeholders (empty, ready to fill)
├── next.config.ts                     # next-intl plugin + image remote patterns (tiktokcdn, ytimg, cdninstagram, fbcdn)
├── package.json                       # All deps installed
├── tsconfig.json                      # Strict mode, @/* path alias
└── PLAN.md                            # Original implementation plan
```

---

## DynamoDB Data Model (Single-Table)

**Table:** `Rostcipes`
**Keys:** PK (String), SK (String)
**GSI1:** GSI1PK (String), GSI1SK (String) — for querying user's recipes sorted by date

| Entity  | PK              | SK       | GSI1PK         | GSI1SK               |
|---------|-----------------|----------|----------------|-----------------------|
| Recipe  | `RECIPE#<ulid>` | `META`   | `USER#<sub>`   | `RECIPE#<timestamp>` |

### Recipe Item Fields
- id, userId, url, platform
- title, titleHe, description, descriptionHe
- ingredients[] (name, nameHe, amount, unit)
- instructions[], instructionsHe[]
- prepTime, cookTime, servings
- tags[]
- thumbnailUrl, embedHtml
- extractionStatus (processing | completed | failed)
- extractionError (if failed)
- sourceLanguage
- createdAt, updatedAt

---

## API Routes

| Method | Path                | Auth | Description |
|--------|---------------------|------|-------------|
| GET    | `/api/recipes`      | Yes  | List user's recipes (paginated via cursor) |
| POST   | `/api/recipes`      | Yes  | Create recipe + run full extraction pipeline |
| GET    | `/api/recipes/[id]` | Yes  | Get single recipe (ownership verified) |
| DELETE | `/api/recipes/[id]` | Yes  | Delete recipe (ownership verified) |
| POST   | `/api/extract`      | Yes  | Standalone extraction (returns result without saving) |

**Auth:** Bearer token in Authorization header. JWT payload decoded, `sub` used as userId, expiry checked.

---

## Extraction Pipeline Flow

```
1. User pastes URL
2. detectPlatform(url) → tiktok | instagram | youtube | facebook
3. POST /api/recipes { url }
   a. createRecipeRecord() → DynamoDB (status: processing)
   b. getOEmbed(url, platform) → embed HTML + thumbnail
   c. getTranscript(url, platform) → full transcript text
      - YouTube: youtube-transcript npm (free)
      - TikTok/Instagram/Facebook: RapidAPI services
   d. extractRecipeFromTranscript(transcript) → Claude Sonnet tool_use
      - System prompt instructs bilingual extraction (en↔he)
      - Returns structured recipe via save_recipe tool
   e. updateRecipeWithExtraction() → DynamoDB (status: completed)
4. Client navigates to /recipe/[id]
```

---

## Claude Integration Details

- **Model:** claude-sonnet-4-20250514
- **Method:** tool_use with `tool_choice: { type: 'tool', name: 'save_recipe' }`
- **Tool schema fields:** title, titleHe, description, descriptionHe, ingredients[], instructions[], instructionsHe[], prepTime, cookTime, servings, tags[], sourceLanguage
- **System prompt:** Instructs Claude to extract all ingredients with quantities (estimate if not stated), provide bilingual translations, detect source language, assign tags
- **Cost:** ~$0.02 per extraction

---

## Key Design Decisions

1. **Tailwind v4** — CSS-based config with `@theme inline`, no tailwind.config.ts
2. **Logical properties** — RTL-safe spacing (`start-0`, `end-0`, `ps-`, `pe-`, `ms-`, `me-`)
3. **next-intl v4** — `defineRouting` + `createNavigation` pattern, server `getRequestConfig`
4. **Single-table DynamoDB** — ULID for recipe IDs (sortable), GSI1 for user's recipes by date
5. **Amplify v6 client-side auth** — server-side JWT decode without full Cognito verification (MVP)
6. **Synchronous extraction** — POST /api/recipes awaits the full pipeline (MVP; could be async with polling later)
7. **Instagram oEmbed** — iframe fallback since Meta's oEmbed API requires app review
8. **Fonts** — Inter (Latin) + Heebo (Hebrew) loaded via next/font/google

---

## Environment Variables Required (.env.local)

```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=           # IAM user with DynamoDB access
AWS_SECRET_ACCESS_KEY=       # IAM user secret
DYNAMODB_TABLE_NAME=Rostcipes
NEXT_PUBLIC_COGNITO_USER_POOL_ID=   # From Cognito console
NEXT_PUBLIC_COGNITO_CLIENT_ID=      # App client ID (no secret)
ANTHROPIC_API_KEY=           # Claude API key
RAPIDAPI_KEY=                # For TikTok/Instagram/Facebook transcripts
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## AWS Resources to Create (Manual)

1. **Cognito User Pool**
   - Sign-in: email
   - Password policy: default
   - App client: no client secret, ALLOW_USER_PASSWORD_AUTH
   - Email verification enabled

2. **DynamoDB Table** `Rostcipes`
   - Partition key: `PK` (String)
   - Sort key: `SK` (String)
   - GSI1: partition key `GSI1PK` (String), sort key `GSI1SK` (String)
   - Billing: on-demand

---

## Dependencies Installed

### Production
aws-amplify, @aws-amplify/adapter-nextjs, @aws-sdk/client-dynamodb, @aws-sdk/lib-dynamodb, @anthropic-ai/sdk, next-intl, zod, ulid, @heroicons/react, clsx, tailwind-merge, youtube-transcript

### Dev
@tailwindcss/postcss, @types/node, @types/react, @types/react-dom, eslint, eslint-config-next, tailwindcss, typescript

---

## Known Notes / Future Improvements

- **Next.js 16 middleware warning:** "The middleware file convention is deprecated. Please use proxy instead." — functional but will need migration eventually
- **PWA icons** are solid orange placeholders — replace with actual app icon
- **Auth verification** on API routes decodes JWT without full Cognito signature validation (acceptable for MVP, should add jwks verification for production)
- **Extraction is synchronous** — for better UX, could make it async with polling/SSE
- **No image optimization** for recipe thumbnails — could add next/image with remote patterns
- **Service worker** is basic stale-while-revalidate — could add offline recipe viewing
- **No rate limiting** on API routes — should add for production
- **RapidAPI endpoints** for transcript are placeholder URLs — verify actual API endpoints match your RapidAPI subscription
