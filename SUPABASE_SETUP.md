# CODEBLUER - Supabase Setup Guide (Step-by-Step)

## Phase 1: Create Supabase Project (5 minutes)

### Step 1.1: Go to Supabase
1. Open https://supabase.com
2. Click **"Sign Up"** (top right)
3. Sign in with GitHub or email

### Step 1.2: Create New Project
1. Click **"New Project"** button
2. Fill in the form:
   - **Project Name**: `codebluer` (or any name)
   - **Database Password**: Create strong password (save this!)
   - **Region**: Choose closest to your users
   - **Pricing**: Select Free tier (sufficient for development)
3. Click **"Create new project"**
4. Wait 2-3 minutes for project creation

### Step 1.3: Wait for Project to Initialize
- You'll see a loading screen
- Once done, you'll be on the Dashboard
- **Do not close this page**

---

## Phase 2: Get Your API Keys (2 minutes)

### Step 2.1: Navigate to Settings
1. In Supabase dashboard, click **"Settings"** (bottom left)
2. Click **"API"** from the left menu

### Step 2.2: Find Your Credentials
You'll see two important keys:

```
🔑 Project URL (copy this)
Example: https://txluavcliagzagwnwijt.supabase.co

🔑 Anon Public Key (copy this)
Example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Copy both values** - you'll need them next.

---

## Phase 3: Set Environment Variables (3 minutes)

### Step 3.1: Create .env.local File
1. In VS Code, go to root folder: `/workspaces/codebluer/`
2. Click **"Create New File"** (right-click in Explorer)
3. Name it: `.env.local` (note the dot at the start)
4. Copy-paste this template:

```
VITE_SUPABASE_URL=https://your-project-url.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here
```

### Step 3.2: Paste Your Credentials
Replace the values:
- Replace `https://your-project-url.supabase.co` with your **Project URL**
- Replace `your-anon-key-here` with your **Anon Public Key**

**Example result:**
```
VITE_SUPABASE_URL=https://txluavcliagzagwnwijt.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 3.3: Save File
- Press **Ctrl+S** (or Cmd+S on Mac)
- Verify file is saved (no dot next to filename)

---

## Phase 4: Create Database Tables via Migrations (5 minutes)

### Step 4.1: Open Supabase SQL Editor
1. Go back to Supabase dashboard
2. Click **"SQL Editor"** (left menu)
3. Click **"New Query"** button

### Step 4.2: Create Notifications Table
1. Copy the entire SQL from: `supabase/migrations/20260304_create_notifications_table.sql`
   
   **In your project**, open the file:
   - Navigate to: `/workspaces/codebluer/supabase/migrations/20260304_create_notifications_table.sql`
   - Select all text (Ctrl+A)
   - Copy (Ctrl+C)

2. In Supabase SQL Editor:
   - Paste the SQL (Ctrl+V)
   - Click **"Run"** button (or press Ctrl+Enter)
   - Wait for success message ✅

### Step 4.3: Create Mentions Table
1. Click **"New Query"** again
2. Copy SQL from: `supabase/migrations/20260304_create_mentions_table.sql`
   - Navigate to the file in VS Code
   - Select all (Ctrl+A)
   - Copy (Ctrl+C)

3. In Supabase SQL Editor:
   - Paste (Ctrl+V)
   - Click **"Run"**
   - Wait for success ✅

### Step 4.4: Verify Tables Created
1. In Supabase, click **"Table Editor"** (left menu)
2. You should see these tables in the list:
   - ✅ `notifications` (new)
   - ✅ `mentions` (new)
   - ✅ `profiles` (already exists)
   - ✅ `messages` (already exists)
   - ✅ `salary_posts` (already exists)
   - And others...

---

## Phase 5: Configure Row Level Security (RLS) (3 minutes)

### Step 5.1: Enable RLS on Notifications
1. In Table Editor, click on **"notifications"** table
2. Click **"RLS"** button (top right of table)
3. Verify these policies exist:
   - "Users can read their own notifications"
   - "Users can update their own notifications"
   - "System can insert notifications"

If not showing, they were created by the migration SQL. ✅

### Step 5.2: Check Other Tables
1. Do the same for **"mentions"** table
2. All other tables should already have RLS configured

---

## Phase 6: Configure Authentication (5 minutes)

### Step 6.1: Enable Email Provider
1. In Supabase dashboard, click **"Authentication"** (left menu)
2. Click **"Providers"** tab
3. Make sure **"Email"** is enabled (should be by default) ✅

### Step 6.2: (Optional) Set Up Google OAuth
If you want Google sign-in to work:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web application type)
5. Add authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`
6. Copy **Client ID** and **Client Secret**
7. In Supabase → Authentication → Providers → Google:
   - Paste Client ID
   - Paste Client Secret
   - Click **"Save"**

**For now, you can skip this and use Email/Password only.**

---

## Phase 7: Test Your Setup (5 minutes)

### Step 7.1: Restart Dev Server
1. In terminal, stop the dev server (Ctrl+C)
2. Start it again:
   ```bash
   npm run dev
   ```
3. Wait for "Local: http://localhost:5173" message

### Step 7.2: Test Sign Up
1. Open http://localhost:5173 in browser
2. Click **"Don't have an account? Sign up"**
3. Enter:
   - Email: `test@example.com`
   - Password: `TestPassword123`
4. Click **"Create account"**
5. **Expected**: Success message or email verification prompt ✅

### Step 7.3: Verify in Supabase
1. Go to Supabase dashboard
2. Click **"Authentication"** → **"Users"**
3. You should see your new user `test@example.com` ✅

### Step 7.4: Test Sign In
1. Go back to app
2. Sign in with the credentials you just created
3. **Expected**: Redirected to onboarding page ✅

---

## Phase 8: Complete Onboarding Test (5 minutes)

### Step 8.1: Go Through Onboarding
1. Complete the onboarding wizard:
   - **Name**: Your name
   - **Role**: "Employee"
   - **Sector**: "Private"
   - **Experience**: "3 years"
   - **Qualification**: "B.Sc Emergency Medicine Technology"
   - **Salary**: "50000"

2. Click **"Complete Setup"**

### Step 8.2: Verify Profile Created
1. Check home page loads ✅
2. Go to **Profile** tab
3. You should see:
   - Your name ✅
   - Badge: **🚑 Paramedic • 3y** ✅
   - Your email ✅

### Step 8.3: Verify in Database
1. Go to Supabase → Table Editor
2. Click on **"profiles"** table
3. You should see a row with your data ✅
4. Check columns:
   - `name`: Your name
   - `user_type`: "employee"
   - `qualification`: "bsc_emt"
   - `salary`: 50000
   - `experience_start_date`: ~3 years ago

---

## Phase 9: Test Real-Time Features (5 minutes)

### Step 9.1: Test Profile Sync
1. Open app in **2 browser windows** (side by side)
2. In Window 1: Go to Profile
3. In Window 2: Also go to Profile
4. In Window 1: Edit profile name → Save
5. In Window 2: Check if name updates automatically ✅

### Step 9.2: Test Notifications
1. In app, click **bell icon** (top right)
2. **Expected**: Notification popover opens ✅
3. Should say "No notifications yet" (since no actions yet)

### Step 9.3: Test Salary Insights
1. Go to **Tools** → **Salary Insights**
2. Click **"Contribute your data"** or **"+"** button
3. Fill form:
   - Role: "EMT"
   - Sector: "Private"
   - Location: "Your City"
   - Experience: "3"
   - Salary: "50000"
4. Click **"Submit"**
5. **Expected**: Success message ✅

### Step 9.4: Verify Salary Data Saved
1. Go to Supabase → Table Editor
2. Click **"salary_posts"** table
3. You should see your submission with your salary ✅

---

## ✅ Success Checklist

After setup, verify all of this:

- [ ] Supabase project created
- [ ] API keys copied
- [ ] .env.local file created with keys
- [ ] Notifications table created
- [ ] Mentions table created
- [ ] RLS enabled on all tables
- [ ] Dev server running
- [ ] Can sign up with email/password
- [ ] User appears in Supabase Auth
- [ ] Can complete onboarding
- [ ] Profile appears in database
- [ ] Badge displays on profile
- [ ] Can open notifications
- [ ] Can submit salary data
- [ ] Real-time sync works (2 windows)

---

## 🎉 If Everything Works, You're Done!

All 13 points checked? **You're ready to build more features!**

---

## 🆘 Troubleshooting

### Problem: "Cannot read property 'url' of undefined"
**Solution:**
1. Check .env.local exists in root folder
2. Verify both keys are pasted correctly
3. Restart dev server (Ctrl+C, then npm run dev)

### Problem: "Error: Database error"
**Solution:**
1. Go to Supabase SQL Editor
2. Run migrations again
3. Check Table Editor to verify tables exist
4. Refresh page and try again

### Problem: "Sign up button doesn't work"
**Solution:**
1. Open browser DevTools (F12)
2. Check Console tab for error messages
3. Make sure .env.local file is saved
4. Restart dev server

### Problem: "Badge not showing on profile"
**Solution:**
1. Make sure you completed onboarding
2. Go to Supabase → profiles table
3. Check if your row has `user_type: "employee"`
4. If not, go back and complete onboarding again

### Problem: "Real-time not syncing between tabs"
**Solution:**
1. Check network tab (DevTools → Network)
2. Look for WebSocket connection to Supabase
3. If not there, authentication might have failed
4. Try signing out and back in

---

## 📞 Need More Help?

1. Check browser console for error messages (F12)
2. Check Supabase dashboard logs (Logs → Recent)
3. Verify all credentials are correct
4. Try restarting dev server
5. Clear browser cache (Ctrl+Shift+Delete)

---

## Next Steps After Setup

Once all ✅ checks pass:
1. Read **QUICK_START.md** for feature overview
2. Follow **TESTING_GUIDE.md** for comprehensive testing
3. Customize onboarding questions if needed
4. Add Google OAuth (optional)
5. Deploy to production

---

**Status**: Ready to Go! 🚀
**Estimated Time**: 30 minutes total
**Difficulty**: Easy - Just copy/paste and clicks!

Good luck! 🎉
