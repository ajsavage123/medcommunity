# CODEBLUER - Quick Start Guide

## ⚡ 5-Minute Setup

### Step 1: Environment Setup
```bash
# Create .env.local file in root directory
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGc...
```

Get these from: Supabase → Settings → API

### Step 2: Apply Database Migrations
1. Go to Supabase Dashboard
2. Navigate to SQL Editor
3. Copy-paste contents from:
   - `supabase/migrations/20260304_create_notifications_table.sql`
   - `supabase/migrations/20260304_create_mentions_table.sql`
4. Run each query

### Step 3: Start Development Server
```bash
npm run dev
```

Open http://localhost:5173 in your browser

---

## 🚀 First User Journey (2 minutes)

### 1. Sign Up
- Click "Don't have an account? Sign up"
- Email: `test@example.com`
- Password: `Test123456`
- Click "Create account"

### 2. Onboarding
- **Name**: "Alex Johnson"
- **Role**: Select "Employee"
- **Sector**: "Private"
- **Experience**: "3 years"
- **Qualification**: "B.Sc Emergency Medicine Technology"
- **Salary**: "45000"
- Click "Complete Setup"

### 3. Verify Badge
- Go to Profile tab
- See badge: **🚑 Paramedic • 3y**
- If not showing, check browser console for errors

---

## ✅ Critical Features Implemented

| Feature | Status | File |
|---------|--------|------|
| Email/Password Auth | ✅ | `src/contexts/AuthContext.tsx` |
| Google OAuth | ✅ | `src/contexts/AuthContext.tsx` |
| 6-Role Onboarding | ✅ | `src/components/onboarding/` |
| Badge System | ✅ | `src/lib/badges.ts` |
| Real-Time Profile | ✅ | `src/hooks/useRealtime.ts` |
| Notifications | ✅ | `src/components/notifications/` |
| Salary Insights | ✅ | `src/hooks/useSalaryInsights.ts` |
| Role-Specific Questions | ✅ | `src/components/onboarding/steps/` |

---

## 🎯 Test Each Feature (10 minutes)

### 1. Authentication (2 min)
```
Sign Up → Verify Email → Sign In → Should redirect to home
```

### 2. Onboarding (2 min)
```
Create account → Go through 3 steps → Check badge on profile
```

### 3. Real-Time Updates (2 min)
```
Open profile in 2 tabs → Edit in one → Check other updates instantly
```

### 4. Notifications (2 min)
```
Click bell icon → See notification popover → Verify unread count
```

### 5. Salary Insights (2 min)
```
Go to Tools → Salary Insights → See aggregated data
```

---

## 📊 Role Selection Options

```
1. Student → 🎓 Student (or Intern)
2. Employee → 🚑 Paramedic (+ experience/qualification)
3. HR Manager → 👥 HR Manager
4. International Coordinator → 🌍 Global Coordinator
5. Instructor/Trainer → 👨‍🏫 Instructor
6. Faculty/Lecturer → 🎓 Faculty
```

**Employee gets 3 questions:**
- Sector (Private/Government)
- Years of experience (0-10+)
- Qualification (determines badge type)
- Salary (for salary insights)

**Student gets 1 follow-up:**
- Are you a Student or Intern?

---

## 🔧 Troubleshooting

### "Cannot read property 'url' of undefined"
```
❌ Missing VITE_SUPABASE_URL in .env.local
✅ Add to .env.local and restart dev server
```

### Badge not showing on profile
```
❌ Supabase not returning user_type
✅ Check: Onboarding completed? Profile saved? Row Level Security enabled?
```

### Notifications not appearing
```
❌ Notifications table not created
✅ Run migrations in Supabase SQL Editor
```

### Real-time updates not syncing
```
❌ Network/WebSocket connection issue
✅ Check browser DevTools → Network → Look for WebSocket to Supabase
```

---

## 📱 Key Screens

### 1. Auth Page (`/auth`)
- Email/Password login & signup
- Google OAuth button
- Password reset

### 2. Onboarding (`/onboarding`)
- 3 steps maximum
- Progress indicator
- Role-specific questions

### 3. Profile (`/profile`)
- Shows badge with role + experience
- Shows stats (posts, likes, rooms)
- Verification CTA for employees

### 4. Notifications (Bell icon)
- Real-time notification popover
- Mark as read
- Unread badge counter

### 5. Salary Insights (`/tools/salary`)
- View aggregated salary data
- Submit salary anonymously
- Filter by role/sector

---

## 🎨 Badge System at a Glance

```
USER TYPE → BADGE
├─ Student → 🎓 Student
├─ Intern → 📋 Intern
├─ EMT (Diploma) → 🏥 EMT • [years]
├─ AEMT (PG Diploma) → ⭐ AEMT • [years]
├─ Paramedic (B.Sc) → 🚑 Paramedic • [years]
├─ HR Manager → 👥 HR Manager
├─ Instructor → 👨‍🏫 Instructor
├─ Faculty → 🎓 Faculty
└─ Global Coordinator → 🌍 Global Coordinator
```

All badges include experience years (e.g., "Paramedic • 5y")

---

## 🔒 Security Notes

✅ Passwords hashed by Supabase Auth
✅ Row Level Security enabled on all tables
✅ Salary data submitted anonymously
✅ Email verification required (configurable)
✅ Google OAuth via Supabase

---

## 📚 Documentation Files

1. **IMPLEMENTATION_GUIDE.md** → Full technical details
2. **TESTING_GUIDE.md** → 29 comprehensive tests
3. **This file** → Quick start

---

## 🚀 Next Steps

1. [ ] Set up Supabase environment variables
2. [ ] Apply database migrations
3. [ ] Start dev server
4. [ ] Create test account
5. [ ] Complete onboarding flow
6. [ ] Verify badge displays
7. [ ] Test real-time features
8. [ ] Check notifications
9. [ ] Deploy to production

---

## 💬 Support

**Having issues?**
1. Check browser console (F12)
2. Check Supabase logs (Dashboard → Logs)
3. Run migrations in Supabase SQL Editor
4. Verify environment variables
5. Check Row Level Security policies

---

## 🎉 Success!

If you can:
✅ Sign up with email/Google
✅ Complete onboarding
✅ See badge on profile
✅ Receive notifications
✅ View salary insights

**Congratulations! 🎊 Your CODEBLUER implementation is complete!**

---

Generated: March 2026
Version: 1.0.0 (Complete Real-Time Implementation)
