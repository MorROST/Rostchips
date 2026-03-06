# Rostchips - Manual Precondition Procedure

This guide covers all 3rd party services that must be set up manually before the app can be built and deployed.

---

## 1. AWS Cognito (User Authentication)

### Create a User Pool

1. Go to **AWS Console > Amazon Cognito > Create user pool**
2. **Sign-in experience:**
   - Select **Email** as the sign-in option
3. **Security requirements:**
   - Keep default password policy (or customize to your preference)
   - MFA: not required for MVP
4. **Sign-up experience:**
   - Enable **self-registration**
   - Enable **email verification** (Cognito sends a verification code)
   - Required attributes: **email**
5. **Message delivery:**
   - Select **Send email with Cognito** (default, limited to 50 emails/day — sufficient for MVP)
6. **App integration:**
   - User pool name: `Rostchips-UserPool`
   - Create an **App client:**
     - Application type: **Single-page application (SPA)**
     - App client name: `rostchips-web`
     - **Do NOT generate a client secret** (public client for browser-based auth)
     - Auth flows: enable `ALLOW_USER_SRP_AUTH` and `ALLOW_REFRESH_TOKEN_AUTH`
7. Click **Create user pool**

### Values to save

| Value | Environment Variable |
|-------|---------------------|
| User Pool ID (e.g. `us-east-1_AbCdEfG`) | `NEXT_PUBLIC_COGNITO_USER_POOL_ID` |
| App Client ID | `NEXT_PUBLIC_COGNITO_CLIENT_ID` |
| Region (e.g. `us-east-1`) | `AWS_REGION` |

---

## 2. AWS DynamoDB (Database)

### Create the table

1. Go to **AWS Console > DynamoDB > Create table**
2. Table name: **`Rostchips_dynamoDB_table`**
3. Partition key: **`PK`** (String)
4. Sort key: **`SK`** (String)
5. Capacity mode: **On-demand** (pay-per-request, no capacity planning needed)
6. Click **Create table**

### Add a Global Secondary Index (GSI)

1. Open the `Rostchips_dynamoDB_table` table > **Indexes** tab > **Create index**
2. Partition key: **`GSI1PK`** (String)
3. Sort key: **`GSI1SK`** (String)
4. Index name: **`GSI1`**
5. Projection type: **All attributes**
6. Click **Create index**

### Values to save

| Value | Environment Variable |
|-------|---------------------|
| Table name (`Rostchips_dynamoDB_table`) | `DYNAMODB_TABLE_NAME` |

---

## 3. AWS IAM (Server Access Keys)

### Create an IAM user for server-side access

1. Go to **AWS Console > IAM > Users > Create user**
2. User name: `rostchips-server`
3. **Attach policies directly:**
   - `AmazonDynamoDBFullAccess`
   - (For tighter security, create a custom policy scoped to the `Rostchips` table only)
4. Click **Create user**

### Generate access keys

1. Open the user > **Security credentials** tab > **Create access key**
2. Use case: **Application running outside AWS**
3. Click **Create access key**

### Values to save

| Value | Environment Variable |
|-------|---------------------|
| Access Key ID | `AWS_ACCESS_KEY_ID` |
| Secret Access Key | `AWS_SECRET_ACCESS_KEY` |

> **Security note:** Store these credentials securely. Never commit them to version control.

---

## 4. Anthropic / Claude API (AI Recipe Extraction)

### Get an API key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up or log in
3. Navigate to **API Keys** > **Create Key**
4. Key name: `rostchips`
5. Copy the generated key

### Set up billing

1. Go to **Plans & Billing**
2. Add a payment method
3. Pricing is pay-as-you-go (~$0.02 per recipe extraction)

### Values to save

| Value | Environment Variable |
|-------|---------------------|
| API Key (starts with `sk-ant-`) | `ANTHROPIC_API_KEY` |

---

## 5. RapidAPI (Video Transcript Extraction)

RapidAPI is used to extract transcripts from TikTok, Instagram, and Facebook videos. YouTube transcripts use a free npm package and don't require RapidAPI.

### Get an API key

1. Go to [rapidapi.com](https://rapidapi.com) and sign up or log in
2. Search for a transcript/caption extraction API that supports TikTok and Instagram
3. Subscribe to the API (most offer a free tier with limited requests)
4. Go to **Dashboard > Apps > default-application > Security**
5. Copy your API key

### Values to save

| Value | Environment Variable |
|-------|---------------------|
| RapidAPI Key | `RAPIDAPI_KEY` |

> **Note:** The specific RapidAPI provider will determine the exact endpoints used in the transcript extraction code. Look for APIs that return captions/subtitles/transcripts rather than full video downloads.

---

## Final `.env.local` File

After completing all steps above, create a `.env.local` file in the project root with the following values:

```env
# AWS General
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...

# DynamoDB
DYNAMODB_TABLE_NAME=Rostchips_dynamoDB_table

# Cognito
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_XXXXXXX
NEXT_PUBLIC_COGNITO_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# RapidAPI
RAPIDAPI_KEY=...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Reminder:** Never commit `.env.local` to version control. Ensure it is listed in `.gitignore`.

---

## Verification

After setup, confirm the following:

- [ ] Cognito User Pool is created and you have the Pool ID and Client ID
- [ ] DynamoDB table `Rostchips` exists with PK/SK keys and the GSI1 index
- [ ] IAM user has access keys and DynamoDB permissions
- [ ] Anthropic API key is active with billing enabled
- [ ] RapidAPI key is active with a transcript API subscription
- [ ] `.env.local` file is populated with all values listed above
