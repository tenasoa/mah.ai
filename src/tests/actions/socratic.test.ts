import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { askSocraticTutor, getSocraticHistory } from '@/app/actions/socratic';
import { createClient } from '@/lib/supabase/server';

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('@/lib/redis', () => ({
  redis: {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue(null),
  },
  getCacheKey: vi.fn().mockReturnValue('cache-key'),
}));

vi.mock('@/app/actions/grit', () => ({
  addGritPoints: vi.fn().mockResolvedValue({ success: true }),
}));

type MockOptions = {
  user?: { id: string } | null;
  subject?: { is_free: boolean; uploaded_by: string | null } | null;
  roles?: string[];
  hasPurchasedAccess?: boolean;
  history?: Array<{
    user_message: string;
    ai_response: string;
    created_at: string;
    insisted_for_answer: boolean;
  }>;
};

function buildMockSupabase(options: MockOptions = {}) {
  const {
    user = { id: 'user-123' },
    subject = { is_free: true, uploaded_by: 'author-999' },
    roles = [],
    hasPurchasedAccess = false,
    history = [],
  } = options;

  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user } }),
    },
    from: vi.fn().mockImplementation((table: string) => {
      if (table === 'subjects') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({ data: subject, error: null }),
            }),
          }),
        };
      }

      if (table === 'profiles') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({ data: { roles }, error: null }),
            }),
          }),
        };
      }

      if (table === 'user_subject_access') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                or: vi.fn().mockReturnValue({
                  maybeSingle: vi.fn().mockResolvedValue({
                    data: hasPurchasedAccess ? { id: 'access-123' } : null,
                    error: null,
                  }),
                }),
              }),
            }),
          }),
        };
      }

      if (table === 'socratic_exchanges') {
        return {
          insert: vi.fn().mockResolvedValue({ error: null }),
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  order: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue({ data: history, error: null }),
                  }),
                }),
              }),
            }),
          }),
        };
      }

      return {
        select: vi.fn(),
      };
    }),
  };
}

describe('Socratic Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.PERPLEXITY_API_KEY = 'test-key';
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: 'Quelle piste de réflexion as-tu déjà explorée sur ce concept ?',
              },
            },
          ],
        }),
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('askSocraticTutor', () => {
    it('retourne auth_required si non authentifié', async () => {
      (createClient as any).mockResolvedValue(
        buildMockSupabase({ user: null }),
      );

      const result = await askSocraticTutor({
        subjectId: 'subject-123',
        questionId: 'question-123',
        questionText: 'Quelle est la force nucléaire forte ?',
      });

      expect(result).toEqual({ data: null, error: 'auth_required' });
    });

    it('retourne access_denied si utilisateur sans accès', async () => {
      (createClient as any).mockResolvedValue(
        buildMockSupabase({
          subject: { is_free: false, uploaded_by: 'author-999' },
          roles: ['student'],
          hasPurchasedAccess: false,
        }),
      );

      const result = await askSocraticTutor({
        subjectId: 'subject-123',
        questionId: 'question-123',
        questionText: 'Quelle est la force nucléaire forte ?',
      });

      expect(result).toEqual({ data: null, error: 'access_denied' });
    });

    it('retourne une réponse socratique quand le sujet est accessible', async () => {
      (createClient as any).mockResolvedValue(
        buildMockSupabase({
          subject: { is_free: true, uploaded_by: 'author-999' },
        }),
      );

      const result = await askSocraticTutor({
        subjectId: 'subject-123',
        questionId: 'question-123',
        questionText: 'Quelle est la force nucléaire forte ?',
      });

      expect(result.data?.response).toContain('piste de réflexion');
      expect(result.error).toBeNull();
    });

    it('gère insistForAnswer sans erreur', async () => {
      (createClient as any).mockResolvedValue(
        buildMockSupabase({
          subject: { is_free: true, uploaded_by: 'author-999' },
        }),
      );

      const result = await askSocraticTutor({
        subjectId: 'subject-123',
        questionId: 'question-123',
        questionText: 'Quelle est la force nucléaire forte ?',
        insistForAnswer: true,
      });

      expect(result.data?.response).toBeDefined();
      expect(result.error).toBeNull();
    });
  });

  describe('getSocraticHistory', () => {
    it('retourne auth_required si non authentifié', async () => {
      (createClient as any).mockResolvedValue(
        buildMockSupabase({ user: null }),
      );

      const result = await getSocraticHistory('subject-123', 'question-123');
      expect(result).toEqual({ data: [], error: 'auth_required' });
    });

    it('retourne l’historique si authentifié', async () => {
      const mockHistory = [
        {
          user_message: 'Question test',
          ai_response: 'Réponse test',
          created_at: '2024-01-01T00:00:00Z',
          insisted_for_answer: false,
        },
      ];

      (createClient as any).mockResolvedValue(
        buildMockSupabase({ history: mockHistory }),
      );

      const result = await getSocraticHistory('subject-123', 'question-123');
      expect(result.data).toEqual(mockHistory);
      expect(result.error).toBeNull();
    });
  });
});
