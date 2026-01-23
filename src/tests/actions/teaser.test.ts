import { checkSubjectAccess, recordTeaserView, recordTeaserCTA } from '@/app/actions/teaser';
import { vi, describe, beforeEach, it, expect } from 'vitest';

// Mock Supabase client
const mockInsert = vi.fn();
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();
const mockOr = vi.fn();

const mockSupabase = {
  from: vi.fn(() => ({
    select: mockSelect,
    insert: mockInsert,
  })),
  auth: {
    getUser: vi.fn(),
  },
};

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));

describe('Teaser Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup chain mocks
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ single: mockSingle, or: mockOr, eq: mockEq });
    mockOr.mockReturnValue({ single: mockSingle });
    mockInsert.mockReturnValue({ error: null });
  });

  describe('recordTeaserView', () => {
    it('records a view with variant', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-123' } } });
      
      const result = await recordTeaserView('subject-123', 'search', 'variant-A');
      
      expect(mockSupabase.from).toHaveBeenCalledWith('teaser_views');
      expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
        subject_id: 'subject-123',
        user_id: 'user-123',
        source: 'search',
        variant: 'variant-A',
      }));
      expect(result.success).toBe(true);
    });
  });

  describe('recordTeaserCTA', () => {
    it('records a cta click with variant', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });
      
      const result = await recordTeaserCTA('subject-123', 'unlock', 'variant-B');
      
      expect(mockSupabase.from).toHaveBeenCalledWith('teaser_conversions');
      expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
        subject_id: 'subject-123',
        user_id: null,
        cta_type: 'unlock',
        variant: 'variant-B',
      }));
      expect(result.success).toBe(true);
    });
  });
});
