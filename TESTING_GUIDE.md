# CODEBLUER - Testing Guide

## Pre-Testing Checklist

- [ ] Supabase project created and configured
- [ ] Environment variables set (.env.local)
- [ ] Migrations applied to Supabase
- [ ] Google OAuth configured (optional)
- [ ] Dev server running: `npm run dev`
- [ ] Browser console open to check for errors

---

## Authentication Flow Testing

### Test 1: Email/Password Sign Up
1. Navigate to `/auth`
2. Click "Don't have an account? Sign up"
3. Enter test email: `test@example.com`
4. Enter password: `TestPassword123`
5. Click "Create account"
6. **Expected:** Verification email sent message (or auto-verified depending on Supabase settings)

### Test 2: Email/Password Sign In
1. Navigate to `/auth`
2. Enter previously created email
3. Enter password
4. Click "Sign in"
5. **Expected:** Redirected to `/onboarding` if no profile, else `/`

### Test 3: Sign Up with Google
1. Navigate to `/auth`
2. Click "Continue with Google"
3. Complete Google sign-in flow
4. **Expected:** Redirected to `/onboarding`

### Test 4: Password Reset
1. Navigate to `/auth`
2. Click "Forgot password?"
3. Enter email address
4. Click "Send reset link"
5. **Expected:** Success message saying check email

---

## Onboarding Flow Testing

### Test 5: Complete Employee Onboarding
1. After sign up, start onboarding
2. **Step 1 - Name (Progress: 1/3)**
   - Enter name: "John Smith"
   - Click "Continue"
   - **Expected:** Valid name accepted, progress bar visible

3. **Step 2 - Role (Progress: 2/3)**
   - Click "Employee"
   - Verify hint text displays
   - Click "Continue"
   - **Expected:** Employee role selected

4. **Step 3 - Details (Progress: 3/3)**
   - Sector: Select "Private"
   - Experience: Click "5 yrs" (for 5 years)
   - Qualification: Select "B.Sc Emergency Medicine Technology"
   - Salary: Enter "50000"
   - Click "Complete Setup"
   - **Expected:** Profile saved, redirected to home

### Test 6: Verify Employee Badge
1. After onboarding, go to profile page
2. **Expected Badge Display:**
   - Icon: 🚑
   - Label: "Paramedic • 5y"
   - Color: Purple background
   - Description: "B.Sc Emergency Medicine Technology"

### Test 7: Complete Student Onboarding
1. Create new account and start onboarding
2. Name: "Jane Doe"
3. Role: Select "Student"
4. **Step 3 - Student Details:**
   - Option: Click "Intern"
   - Click "Complete Setup"
   - **Expected:** "Intern" badge appears on profile

### Test 8: Complete Instructor Onboarding
1. Create new account and onboarding
2. Name: "Dr. Smith"
3. Role: Select "Instructor / Trainer"
4. Click "Complete Setup" (no additional questions)
5. **Expected:**
   - Profile saved immediately
   - Badge shows: "👨‍🏫 Instructor"

---

## Badge System Testing

### Test 9: All Badge Types
Create accounts for each role and verify correct badge display:

```
STUDENT → 🎓 Student
INTERN → 📋 Intern
EMT (Diploma) → 🏥 EMT • 2y
AEMT (PG Diploma) → ⭐ AEMT • 3y
PARAMEDIC (B.Sc) → 🚑 Paramedic • 5y
HR Manager → 👥 HR Manager
Instructor → 👨‍🏫 Instructor
Faculty → 🎓 Faculty
Global Coordinator → 🌍 Global Coordinator
```

### Test 10: Experience Year Display
1. Go to profile of an employee
2. Check badge shows correct years: "Paramedic • 5y"
3. **Expected:** Years match what was entered during onboarding

---

## Real-Time Synchronization Testing

### Test 11: Profile Real-Time Sync
1. Open profile in two browser windows
2. In Window 1: Edit profile name
3. In Window 2: Check name updates in real-time
4. **Expected:** Name changes instantly without refresh

### Test 12: Salary Data Real-Time
1. Open Salary Insights page
2. In another browser, submit salary data
3. Check main window updates automatically
4. **Expected:** New salary data appears in insights without refresh

---

## Notifications Testing

### Test 13: Bell Icon Display
1. Go to home page
2. Check bell icon in header (🔔)
3. **Expected:** Bell icon visible, no badge if no notifications

### Test 14: Notification Badge
1. Create mention or like trigger
2. Return to home page
3. **Expected:** Bell icon shows red badge with count (e.g., "2")

### Test 15: Open Notifications Popover
1. Click bell icon
2. **Expected:**
   - Popover opens below bell
   - Shows "Notifications" title
   - Shows unread count
   - Displays notification list

### Test 16: Mark as Read
1. Open notifications popover
2. Hover over unread notification
3. Click X button on right side
4. **Expected:**
   - Notification marked as read
   - Badge count decreases
   - Notification styling changes

---

## Salary Insights Testing

### Test 17: View Salary Insights
1. Go to Tools → Salary Insights
2. **Expected:**
   - See aggregated salary data
   - Filtered by role and sector
   - Shows: Count, Average, Median, Min, Max

### Test 18: Submit Salary Data
1. Click "Contribute your data" or "+" button
2. Fill form:
   - Role: EMT
   - Sector: Private
   - Location: Mumbai
   - Experience: 3
   - Salary: 35000
3. Click "Submit"
4. **Expected:**
   - Success confirmation
   - Data submitted anonymously
   - Insights update to include new data

---

## Multi-User Testing

### Test 19: Different Roles Interaction
1. Create accounts with different roles
2. Enter same rooms/messages
3. Check badge display for each user
4. **Expected:** Each user shows correct role badge

### Test 20: Cross-User Notifications
1. Create 2 accounts
2. In Account A: Mention Account B
3. In Account B: Check notifications
4. **Expected:**
   - Notification received
   - Badge count increases
   - Shows mention from Account A

---

## Performance Testing

### Test 21: Real-Time Connection (30 seconds)
1. Open profile page
2. Monitor network tab (DevTools)
3. Watch for WebSocket connections to Supabase
4. **Expected:** Persistent WebSocket connection maintained

### Test 22: Load Time
1. Sign in to app
2. Check DevTools Performance
3. **Expected:** Page load < 2 seconds

### Test 23: Notification Update Speed
1. Trigger notification in one window
2. Check time for update in main window
3. **Expected:** Update within 1-2 seconds

---

## Error Handling Testing

### Test 24: Invalid Email Sign Up
1. Try signing up with invalid email: "notanemail"
2. **Expected:** Error message: "Invalid email address"

### Test 25: Weak Password
1. Try signing up with password: "123"
2. **Expected:** Error message about minimum length (6 chars)

### Test 26: Duplicate Email Sign Up
1. Sign up with email
2. Try signing up again with same email
3. **Expected:** Error message: "User already exists"

### Test 27: Network Error Handling
1. Disconnect internet
2. Try to update profile
3. **Expected:** Error toastmessage shown
4. Reconnect internet
5. **Expected:** Can update again successfully

---

## Badge Auto-Update Testing

### Test 28: Automatic Experience Update
1. Create employee with start date = 2 years ago
2. Display badge (should show 2y)
3. Wait for year to pass (simulate with date change)
4. **Expected:** Badge automatically shows 3y on next view

---

## Browser Compatibility Testing

Test in:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Chrome
- [ ] Mobile Safari

---

## Final Comprehensive Test

### Test 29: Complete User Journey
1. **Sign Up** → Email/Password
2. **Verify Email** → Click link in email (if required)
3. **Onboard** → Complete employee flow
4. **View Profile** → Check badge displays correctly
5. **Update Profile** → Change name, verify real-time sync
6. **Submit Salary** → Contribute data, see insights update
7. **Trigger Notification** → Get mentioned, see badge
8. **View Notification** → Click bell, see popover
9. **Mark as Read** → Close notification
10. **Sign Out** → Verify logout works

All steps should complete without errors.

---

## Debugging Tips

### Check Supabase Connection
```javascript
// In browser console
import { supabase } from '@/integrations/supabase/client';
console.log(supabase.auth.getUser());
```

### Monitor Real-Time
```javascript
// In browser console
// Open DevTools Network tab and filter by "WebSocket"
// Should show active connection to Supabase
```

### Check Profile Data
```sql
-- In Supabase SQL Editor
SELECT * FROM profiles WHERE user_id = 'current-user-id';
SELECT * FROM notifications WHERE user_id = 'current-user-id';
```

---

## Known Limitations

1. Profile update may take 1-2 seconds to propagate
2. Notifications require active browser window (due to WebSocket)
3. Salary data is anonymous, no personal identification

---

## Success Criteria

✅ All tests pass
✅ No console errors
✅ Real-time updates working (< 2 seconds)
✅ Badge system functional
✅ Notifications triggering correctly
✅ Profile syncing across tabs
✅ All 7 roles displaying correct badges

If all tests pass, your CODEBLUER implementation is complete and ready for production!
