import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAdmin } from './useAdmin';
import { useQuery } from '@tanstack/react-query';

// Mocking dependencies
vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'test-user-id' } }),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn(),
          })),
        })),
      })),
    })),
  },
}));

describe('useAdmin Hook', () => {
  it('should return isAdmin: true when role is admin', async () => {
    // Mocking useQuery to return true
    (useQuery as any).mockReturnValue({
      data: true,
      isLoading: false,
    });

    const { result } = renderHook(() => useAdmin());

    expect(result.current.isAdmin).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it('should return isAdmin: false when role is not admin', async () => {
    // Mocking useQuery to return false
    (useQuery as any).mockReturnValue({
      data: false,
      isLoading: false,
    });

    const { result } = renderHook(() => useAdmin());

    expect(result.current.isAdmin).toBe(false);
  });
});
