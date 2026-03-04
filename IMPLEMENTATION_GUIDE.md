# CODEBLUER Real-Time Authentication & Onboarding Setup Guide

## Overview
This document guides you through the complete setup of the real-time authentication, onboarding, and notification system for CODEBLUER.

## What's Been Implemented

### 1. **Real-Time Supabase Authentication**
- ✅ Proper Supabase client setup with real auth (removed mock data)
- ✅ Support for Email/Password authentication
- ✅ Google OAuth integration
- ✅ Password reset functionality
- ✅ Session persistence

**Files Updated:**
- `src/contexts/AuthContext.tsx` - Real Supabase auth
- `src/pages/Auth.tsx` - Updated to use context methods

### 2. **Comprehensive Onboarding Wizard**
The onboarding process includes:

#### Step 1: Name Collection
- Simple text input for user name
- Validates minimum length (2 characters)

#### Step 2: Role Selection (6 roles supported)
1. **Student** - Currently studying in EMS programs
2. **Employee** - Working as EMT/Paramedic
3. **HR Manager** - Recruiting EMS professionals
4. **International Coordinator** - Bringing global opportunities
5. **Instructor/Trainer** - Providing certifications
6. **Faculty/Lecturer** - Teaching in EMS programs

#### Step 3: Role-Specific Questions

**For EMPLOYEE:**
- Sector selection: Private or Government
- Years of experience: 0-10+ years
- Qualification:
  - Diploma in EMT → Badge: EMT
  - PG Diploma in Emergency Care → Badge: AEMT
  - B.Sc Emergency Medicine Technology → Badge: Paramedic
- Monthly salary (for salary insights)

**For STUDENT:**
- Status selection:
  - Student → Badge: Student
  - Intern → Badge: Intern

**Other Roles:**
- Quick completion without additional questions

**Files:**
- `src/components/onboarding/OnboardingWizard.tsx` - Main wizard
- `src/components/onboarding/steps/NameInput.tsx`
- `src/components/onboarding/steps/RoleSelection.tsx`
- `src/components/onboarding/steps/EmployeeDetails.tsx`
- `src/components/onboarding/steps/StudentDetails.tsx`

### 3. **Badge System**
Badges are automatically assigned based on role and qualifications:

```
Student (0y) → 🎓 Student badge (blue)
Intern (0y) → 📋 Intern badge (emerald)
EMT (2y) → 🏥 EMT • 2y badge (red)
AEMT (3y) → ⭐ AEMT • 3y badge (orange)
Paramedic (5y) → 🚑 Paramedic • 5y badge (purple)
HR Manager → 👥 HR Manager badge (cyan)
Instructor → 👨‍🏫 Instructor badge (green)
Faculty → 🎓 Faculty badge (indigo)
Global Coordinator → 🌍 Global Coordinator badge (amber)
```

**Files:**
- `src/lib/badges.ts` - Badge logic and styling
- `src/components/profile/UserBadge.tsx` - Badge component

### 4. **Real-Time Notifications System**

#### Features:
- Real-time mention notifications
- Like notifications
- Reply notifications
- Follow notifications
- Message notifications
- Unread badge counter

#### Notification Types:
```
mention → Someone mentioned you
like → Someone liked your post
reply → New reply to your message
follow → Someone followed you
message → New direct message
```

**Files:**
- `src/hooks/useRealtime.ts` - Real-time profile & notification hooks
- `src/components/notifications/NotificationsPopover.tsx` - Notification UI
- `src/components/layout/Header.tsx` - Notification bell integration

### 5. **Salary Insights**
- Real-time salary data aggregation
- Filtered by experience level and sector
- Market insights provided during onboarding
- Users can anonymously contribute salary data

**Files:**
- `src/hooks/useSalaryInsights.ts` - Salary data hooks with real-time updates

### 6. **Profile Display**
- Shows user badge with role and experience
- Real-time profile updates
- Profile auto-updates when experience year increments
- Beautiful badge display with emoji icons

---

## Supabase Configuration

### Required Tables

The system requires these Supabase tables:

1. **profiles** (already exists)
   - `id`, `user_id`, `name`, `user_type`, `sector`, `qualification`, `salary`
   - `experience_start_date`, `onboarding_completed`, `avatar_url`

2. **notifications** (needs to be created)
   - See: `supabase/migrations/20260304_create_notifications_table.sql`

3. **mentions** (needs to be created)
   - See: `supabase/migrations/20260304_create_mentions_table.sql`

4. **messages** (already exists)
5. **salary_posts** (already exists)

### Running Migrations

```bash
# Apply migrations via Supabase CLI
supabase migration up

# Or manually run the SQL in Supabase dashboard:
# Query Editor → paste SQL from migration file → Run
```

### Environment Variables

Ensure your `.env.local` has:

```
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
```

---

## Feature Implementation Details

### Real-Time Profile Syncing

```typescript
// In any component
import { useRealtimeProfile } from '@/hooks/useRealtime';

function MyComponent() {
  const { profile, loading } = useRealtimeProfile();
  
  // Profile updates automatically when changed in Supabase
  return <div>{profile?.name}</div>;
}
```

### Real-Time Notifications

```typescript
import { useRealtimeNotifications } from '@/hooks/useRealtime';

function NotificationCenter() {
  const { notifications, unreadCount, markAsRead } = useRealtimeNotifications();
  
  // Automatically listens for new notifications
}
```

### Access Badge Info

```typescript
import { getBadgeInfo } from '@/lib/badges';

const badge = getBadgeInfo(
  userType,      // 'employee', 'student', 'instructor', etc.
  qualification, // 'bsc_emt', 'diploma_emt', 'pg_diploma'
  experienceYears // number
);

console.log(badge.label);       // "Paramedic • 5y"
console.log(badge.color);       // "bg-purple-100 text-purple-700 ..."
console.log(badge.icon);        // "🚑"
```

---

## User Flow

### First Time User (Sign Up)

1. **Sign In** → Email/Password or Google
2. **Verify Email** (if email signup)
3. **Onboarding Wizard**:
   - Enter Name (Step 1/3)
   - Select Role (Step 2/3)
   - Answer Role-Specific Questions (Step 3/3)
4. **Profile Created** → Redirected to home
5. **Badge Assigned** → Automatically appears on profile

### Returning User

1. **Sign In** → Redirected to home
2. **Profile Loads** → Real-time sync
3. **Notifications** → Bell icon shows unread count
4. **Badge** → Displays on profile with experience year

---

## Real-Time Features

### Auto-Updating Experience

If a user sets `experience_start_date` to a specific date, the badge can automatically update:

```typescript
// In profile component
const getExperienceYears = (startDate: string) => {
  const start = new Date(startDate);
  const now = new Date();
  return now.getFullYear() - start.getFullYear();
};
```

The badge will show the correct experience year every time the profile is viewed.

### Real-Time Message Syncing

All messages in rooms are synced in real-time:
- New messages appear instantly
- Likes and replies update in real-time
- Message deletion is reflected immediately

---

## Testing Checklist

- [ ] Authentication works (email/password)
- [ ] Google OAuth sign-in works
- [ ] Onboarding completes successfully
- [ ] Badge appears on profile after onboarding
- [ ] Badge shows correct icon and colors
- [ ] Experience years display in badge
- [ ] Notifications appear in real-time
- [ ] Unread badge counter updates
- [ ] Profile updates sync across sessions
- [ ] Salary data populates from submissions
- [ ] Mentions trigger notifications
- [ ] Role-specific questions appear correctly

---

## Troubleshooting

### Notifications Not Appearing
```
1. Check if notifications table is created
2. Verify RLS policies are enabled
3. Check browser console for errors
```

### Profile Not Updating in Real-Time
```
1. Ensure supabase client is connected
2. Check Row Level Security policies
3. Verify user_id is being set correctly
```

### Badge Not Showing
```
1. Confirm user_type is set in profiles table
2. Check qualification field is populated
3. Verify getBadgeInfo function is called
```

---

## Next Steps

1. **Apply Migrations**: Run the SQL migration files in Supabase
2. **Test Authentication**: Sign up with email and Google
3. **Test Onboarding**: Complete all role flows
4. **Verify Real-Time**: Check notifications update instantly
5. **Test Badge Display**: Confirm badges appear on profiles
6. **Monitor Performance**: Use Supabase dashboard to monitor real-time connections

---

## API Reference

### useAuth()
```typescript
const { user, session, loading, signIn, signUp, signInWithGoogle, resetPassword, signOut } = useAuth();
```

### useRealtimeProfile()
```typescript
const { profile, loading } = useRealtimeProfile();
// Profile updates in real-time
```

### useRealtimeNotifications()
```typescript
const { notifications, unreadCount, markAsRead } = useRealtimeNotifications();
// Auto-subscribed to new notifications
```

### useSalaryInsights()
```typescript
const { insights, isLoading } = useSalaryInsights(experienceYears, sector);
// Real-time aggregated salary data
```

---

## Support

For issues or questions:
1. Check Supabase dashboard logs
2. Review migration files
3. Check browser console for errors
4. Verify environment variables
5. Ensure Supabase project is active
