# Vercel Deployment Guide

This guide explains how to deploy CodeBluer to Vercel.

## Prerequisites

- GitHub account with the repository pushed
- Vercel account (free tier available)
- Supabase project with credentials

## Deployment Steps

### 1. Connect GitHub to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click **"New Project"**
4. Select your `codebluer` repository
5. Click **"Import"**

### 2. Set Environment Variables

Before deploying, you need to configure the Supabase credentials. These are **required** for the app to work.

#### Option A: Set via Vercel Dashboard (Recommended)

1. In the Vercel project setup, scroll to **"Environment Variables"**
2. Add the following variables:

   ```
   VITE_SUPABASE_URL=<your_supabase_url>
   VITE_SUPABASE_PUBLISHABLE_KEY=<your_publishable_key>
   VITE_SUPABASE_PROJECT_ID=<your_project_id>
   ```

3. Get these values from your Supabase project:
   - Go to [supabase.com](https://supabase.com)
   - Open your project settings
   - Copy from **Project Settings > API**:
     - `URL` → `VITE_SUPABASE_URL`
     - `public anon key` → `VITE_SUPABASE_PUBLISHABLE_KEY`

#### Option B: Set via Vercel CLI

If you have Vercel CLI installed:

```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_PUBLISHABLE_KEY
vercel env add VITE_SUPABASE_PROJECT_ID
```

### 3. Deploy

The deployment will automatically start after you set the environment variables. Vercel will:

1. Clone the repository from GitHub
2. Install dependencies
3. Run `npm run build:production` 
4. Deploy to your Vercel domain

### 4. Verify Deployment

1. Wait for the deployment to complete (you'll see a green checkmark)
2. Click **"Visit"** to open your live application
3. Test the login and full functionality

## Troubleshooting

### Error: "supabaseUrl is required"

This means the `VITE_SUPABASE_URL` environment variable is not set.

**Solution:** Add the variable to Vercel:
1. Go to your Vercel project settings
2. Click **"Environment Variables"**
3. Add `VITE_SUPABASE_URL` with your Supabase URL

### Error: 404 Not Found on page refresh

This should be fixed by the `vercel.json` configuration that rewrites all routes to `index.html` for SPA routing.

If it still happens:
1. Check that `vercel.json` exists in the root directory
2. Redeploy by pushing a new commit to main

### Build fails during deployment

Check the Vercel build logs:
1. Go to your Vercel project
2. Click **"Deployments"**
3. Click the failed deployment
4. Click **"Build Logs"** to see the error

## Local Development

For local development, create a `.env.local` file:

```bash
cp .env.example .env.local
```

Then fill in your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_public_key_here
VITE_SUPABASE_PROJECT_ID=your_project_id
```

Run the dev server:

```bash
npm run dev
```

## Redeploying

Any push to the `main` branch will automatically trigger a new deployment on Vercel. You can also manually redeploy from the Vercel dashboard by clicking **"Redeploy"**.

## Custom Domain

1. In Vercel project settings
2. Go to **"Domains"**
3. Add your custom domain
4. Follow the instructions to configure DNS records with your domain provider

## More Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase API Keys](https://supabase.com/docs/guides/api)
- [React Deployment Guide](https://react.dev/learn/start-a-new-react-project#production-grade-apps)
