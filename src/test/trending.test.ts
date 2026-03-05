import { describe, it, expect } from 'vitest';
import { computeScore, processRawMessages } from '@/hooks/useTrendingMessages';

describe('trending helpers', () => {
  it('computeScore weights likes, replies and pinned', () => {
    expect(computeScore({ likes: 1, replies: 0, is_pinned: false })).toBe(3);
    expect(computeScore({ likes: 0, replies: 1, is_pinned: false })).toBe(2);
    expect(computeScore({ likes: 2, replies: 2, is_pinned: true })).toBe(2*3 + 2*2 + 50);
    expect(computeScore({ likes: 0, replies: 0, is_pinned: true })).toBe(50);
  });

  it('processRawMessages filters out zero-engagement rows and sorts correctly', () => {
    const now = new Date().toISOString();
    const messages = [
      { id: 'a', room_id: 'room1', user_id: 'u1', content: 'foo', is_anonymous: false, is_pinned: false, likes: 0, replies: 0, created_at: now },
      { id: 'b', room_id: 'room1', user_id: 'u1', content: 'bar', is_anonymous: false, is_pinned: true, likes: 0, replies: 0, created_at: now },
      { id: 'c', room_id: 'room1', user_id: 'u1', content: 'baz', is_anonymous: false, is_pinned: false, likes: 2, replies: 0, created_at: now },
      { id: 'd', room_id: 'room1', user_id: 'u1', content: 'qux', is_anonymous: false, is_pinned: false, likes: 0, replies: 3, created_at: now },
    ];
    const profiles: any[] = [];
    const result = processRawMessages(messages, profiles, 10);
    // should drop message 'a'
    expect(result.map(m => m.id)).toEqual(['b', 'd', 'c']);
    // pinned should come first
    expect(result[0].isPinned).toBe(true);
  });
});
