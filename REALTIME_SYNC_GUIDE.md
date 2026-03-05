# Complete Real-Time Synchronization Architecture

## Overview
This document outlines the complete real-time synchronization system implemented across the CodeBluer application. Every change made anywhere in the app instantly updates across all users and devices without requiring a page refresh.

## Architecture

### Global Real-Time Manager: `useRealtimeSync()`
Located in: `src/hooks/useRealtimeSync.ts`

This hook initializes and manages subscriptions to ALL database tables that need real-time updates. It's instantiated globally in the `ProtectedRoute` component so that synchronization begins as soon as a user logs in.

**Subscribed Tables:**
- `messages` - Create, update, delete messages
- `message_votes` - Like/vote counts on messages
- `profiles` - User profile updates (avatar, name, credentials, etc.)
- `salary_posts` - Salary data submissions
- `notifications` - New notifications for users
- `rooms` - Room information updates
- `topics` - Topic updates within rooms
- `jobs` - Job board postings

### Real-Time Data Flow

```
Database Change
     ↓
Supabase Realtime Triggers postgres_changes event
     ↓
useRealtimeSync() channel receives payload
     ↓
React Query Cache is invalidated
     ↓
useQuery() refetches fresh data from database
     ↓
Component re-renders with latest data
     ↓
User sees update instantly (no refresh needed)
```

## Component-Level Real-Time Subscriptions

### Messages (`useMessages()`)
- **Subscription:** Room-specific message changes
- **Syncs:** Message creation, updates, deletions
- **Also tracks:** Profile changes that affect message display (avatar, name, badges)

**Key Features:**
```typescript
// Messages appear instantly when created
// Message edits appear instantly  
// Deleted messages disappear immediately
// Profile changes (avatar, name) update in all messages
// Badge information updates when qualification/experience changes
```

### Message Votes (`useMessageVotes()`)
- **Subscription:** Vote table changes
- **Syncs:** Like/dislike counts, user's own vote status
- **Auto-invalidates:** Trending messages, related messages

### User Profiles (`useProfile()`)
- **Subscription:** User's own profile changes
- **Syncs:** Name, avatar, qualification, sector, salary, experience
- **Cascades:** Invalidates all message queries to update badges

### Notifications (`useRealtimeNotifications()`)
- **Subscription:** New notifications for logged-in user
- **Syncs:** Notification count, notification list
- **Auto-marks:** Notifications as read

### Salary Data (`useSalaryData()`)
- **Subscription:** New salary posts
- **Syncs:** Aggregated salary insights, individual salary posts

## Badge Display with Experience Years

### Profile Section
```typescript
// Shows badge with experience years
// Example: "Paramedic • 5y" or "EMT • 2y"
<UserBadge 
  userType={profile?.userType}
  qualification={profile?.qualification}
  experienceYears={experienceYears}
/>
```

### Room/Chat Messages
All room chat components now display the same badge format as the profile:

**WhatsAppChat Component:**
```typescript
// Uses getBadgeInfo() for consistent badge display
const badgeInfo = getBadgeInfo(
  msg.user.userType,
  msg.user.qualification,
  msg.user.experienceYears  // ← Experience included
);

// Displays: "Paramedic • 5y" in message headers
```

**TrendingBanner & RoomChat:**
```typescript
// Uses formatBadgeWithExperience() 
const badgeText = formatBadgeWithExperience(
  currentMessage?.user?.userType,
  currentMessage?.user?.qualification,
  experienceYears
);
```

### Badge Logic
Located in: `src/lib/badges.ts`

**How Experience Years are Calculated:**
```typescript
// From profile.experience_start_date
export function getExperienceYears(startDate: string | null): number {
  if (!startDate) return 0;
  const start = new Date(startDate);
  const now = new Date();
  return Math.floor(
    (now.getTime() - start.getTime()) / 
    (365.25 * 24 * 60 * 60 * 1000)
  );
}
```

**Badge Labels Include Experience:**
- Student → "Student • 1y"
- Intern → "Intern • 2y"
- Paramedic (BSc) → "Paramedic • 5y"
- EMT (Diploma) → "EMT • 3y"
- AEMT (PG Diploma) → "AEMT • 4y"
- Instructor → "Instructor"
- Faculty → "Faculty"
- HR Manager → "HR Manager"

## Real-Time Features Implemented

### ✅ Messages
- [x] New messages appear instantly
- [x] Message updates reflect immediately
- [x] Deleted messages disappear
- [x] Message pins/unpins sync
- [x] Replies appear in real-time

### ✅ Badges & User Info
- [x] User profile changes update in all messages
- [x] Experience years displayed with badges
- [x] Avatar changes sync everywhere
- [x] Name changes sync everywhere

### ✅ Engagement
- [x] Likes/votes update in real-time
- [x] Vote counts shown immediately
- [x] Your vote status updates instantly

### ✅ Notifications
- [x] New notifications appear instantly
- [x] Unread count updates in real-time
- [x] Mark as read syncs immediately

### ✅ Salary Data
- [x] New salary posts appear instantly
- [x] Salary insights update in real-time
- [x] Aggregated data refreshes immediately

### ✅ Room Info
- [x] Room updates sync across all viewers
- [x] Member count updates instantly
- [x] Room topics update in real-time

## Ensuring All Changes Sync

### Table of What Syncs Where

| Feature | Real-Time | Synced Across | Update Method |
|---------|-----------|---------------|---------------|
| Messages | ✅ Yes | All rooms | postgres_changes |
| Message Pins | ✅ Yes | All users | is_pinned flag |
| Message Likes | ✅ Yes | All users | message_votes table |
| Profile Updates | ✅ Yes | All messages | user_type, qualification |
| Badges | ✅ Yes | Room messages | userType + qualification |
| Notifications | ✅ Yes | Logged-in user | notifications table |
| Salary Posts | ✅ Yes | Salary page | salary_posts table |
| Topics | ✅ Yes | Room viewers | topics table |
| Jobs | ✅ Yes | Job board | jobs table |

## How to Add Real-Time Sync to New Features

### Step 1: Add Database Subscription
In `useRealtimeSync.ts`:

```typescript
// Add new channel for your table
const yourTableChannel = supabase
  .channel('realtime:your_table_sync')
  .on(
    'postgres_changes',
    {
      event: '*',  // '*' means all (INSERT, UPDATE, DELETE)
      schema: 'public',
      table: 'your_table_name',
    },
    (payload) => {
      // Invalidate relevant React Query caches
      queryClient.invalidateQueries({ 
        queryKey: ['your_query_key'] 
      });
    }
  )
  .subscribe();

subscriptionsRef.current.push(yourTableChannel);
```

### Step 2: Ensure Hook Uses the Cache
```typescript
// Your custom hook
export function useYourFeature() {
  return useQuery({
    queryKey: ['your_query_key'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('your_table_name')
        .select('*');
      // ... return data
    },
  });
}

// When data is mutated
export function useYourMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newData) => {
      // ... mutation logic
    },
    onSuccess: () => {
      // Invalidate cache to trigger refetch
      queryClient.invalidateQueries({ 
        queryKey: ['your_query_key'] 
      });
    },
  });
}
```

## Testing Real-Time Sync

### Manual Testing Checklist
1. **Open app in two browser windows** (same user)
2. **Send a message in one window**
   - [ ] Message appears in other window instantly
   - [ ] No page refresh needed
3. **Like a message in one window**
   - [ ] Like count updates in other window
   - [ ] Your vote status shows correctly
4. **Update profile in other window**
   - [ ] Badge updates in messages
   - [ ] Avatar changes everywhere
   - [ ] Name changes in all messages
5. **Pin a message**
   - [ ] Pin appears/disappears instantly
   - [ ] Status shows in both windows
6. **Create new notification**
   - [ ] Notification count updates
   - [ ] Notification appears immediately

### Browser DevTools Verification
1. Open Network tab
2. Filter for "supabase" requests
3. Watch for WebSocket connections
4. Should see `postgres_changes` events flowing in real-time

## Performance Considerations

### Cache Invalidation Strategy
- **Broad invalidation:** `queryKey: ['messages']` - refetches all messages
- **Targeted invalidation:** `queryKey: ['messages', roomId]` - specific room only
- **Cascading invalidation:** Invalidate dependent queries when needed

### Best Practices
1. ✅ Use specific queryKey patterns to avoid over-invalidation
2. ✅ Keep subscription channels alive during session
3. ✅ Unsubscribe on component unmount
4. ✅ Use optimistic updates for better UX (if applicable)

## Known Limitations & Future Enhancements

### Future Enhancements
- [ ] Typing indicators (show when others are typing)
- [ ] User presence tracking (show who's online)
- [ ] Read receipts (show when messages are read)
- [ ] Live cursors (see where others are viewing)
- [ ] Selective field subscriptions (only sync changed fields)

## Debugging Real-Time Issues

### Check if Subscriptions Are Active
```typescript
// In browser console
// Look for Supabase WebSocket connection
// Should see: WebSocket connections active in DevTools Network tab
```

### Verify Cache Invalidation
```typescript
// Check React Query DevTools
// https://react-query.tanstack.com/devtools
// Watch query states as changes occur
```

### Common Issues
1. **Messages not updating:** Check if `useMessages()` is properly subscribed
2. **Badges not updating:** Ensure profile changes trigger `['messages', roomId]` invalidation
3. **Notifications not arriving:** Verify `notifications` table exists in database
4. **Votes not syncing:** Check `message_votes` table subscriptions

## Summary

The CodeBluer application now has **comprehensive, instant real-time synchronization** across all major features:
- Every message change syncs instantly
- Every like/vote updates in real-time
- Every profile change propagates everywhere
- Every notification appears immediately
- User badges always show current experience levels

The system is architected to be **extensible** — new features can easily be added to the real-time sync by following the standardized pattern of adding a subscription to `useRealtimeSync()` and invalidating the appropriate query cache.
