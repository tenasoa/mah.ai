import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SubjectTeaser } from '@/components/subjects/SubjectTeaser';
import { recordTeaserView, recordTeaserCTA } from '@/app/actions/teaser';
import type { SubjectWithAccess } from '@/lib/types/subject';
import { vi, describe, beforeEach, it, expect } from 'vitest';

// Mock server actions
vi.mock('@/app/actions/teaser', () => ({
  recordTeaserView: vi.fn().mockResolvedValue({ success: true }),
  recordTeaserCTA: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock('@/app/actions/credits', () => ({
  getCreditBalance: vi.fn().mockResolvedValue(null),
}));

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => {
  const query: any = {
    select: vi.fn(() => query),
    eq: vi.fn(() => query),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    delete: vi.fn(() => query),
    insert: vi.fn().mockResolvedValue({ data: null, error: null }),
  };

  return {
    createClient: () => ({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      },
      from: vi.fn(() => query),
    }),
  };
});

// Mock router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  Lock: () => <span data-testid="lock-icon">Lock</span>,
  Unlock: () => <span data-testid="unlock-icon">Unlock</span>,
  ChevronDown: () => <span data-testid="chevron-down">ChevronDown</span>,
  Heart: () => <span data-testid="heart-icon">Heart</span>,
  Bookmark: () => <span data-testid="bookmark-icon">Bookmark</span>,
  Share2: () => <span data-testid="share-icon">Share</span>,
}));

const mockSubject: SubjectWithAccess = {
  id: 'subject-123',
  title: 'Mathématiques - Baccalauréat 2024',
  description: 'Test subject',
  matiere: 'MATHEMATIQUES',
  matiere_display: 'Mathématiques',
  exam_type: 'baccalaureat',
  year: 2024,
  session: 'normale',
  serie: 'C',
  niveau: 'Terminale',
  exam_metadata: {},
  content_markdown: '# Sujet\n\nContenu test',
  content_html: null,
  preview_text: 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5',
  thumbnail_url: null,
  has_access: false,
  access_expires_at: null,
  is_free: false,
  credit_cost: 10,
  tags: [],
  view_count: 100,
  download_count: 10,
  status: 'published',
  uploaded_by: null,
  published_at: '2024-01-01T00:00:00Z',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

describe('SubjectTeaser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders visible preview lines correctly', () => {
    render(<SubjectTeaser subject={mockSubject} previewLines={3} />);
    
    expect(screen.getByText('Line 1')).toBeInTheDocument();
    expect(screen.getByText('Line 3')).toBeInTheDocument();
    expect(screen.queryByText('Line 4')).toBeInTheDocument(); // Hidden but in DOM
    expect(screen.getByText('Line 4').closest('.blur-md')).toBeInTheDocument();
  });

  it('calls recordTeaserView on mount with a variant', async () => {
    render(<SubjectTeaser subject={mockSubject} />);
    
    await waitFor(() => {
      expect(recordTeaserView).toHaveBeenCalledWith(
        'subject-123',
        'direct',
        expect.stringMatching(/control|view_full|access/)
      );
    });
  });

  it('calls recordTeaserCTA when unlock button is clicked', async () => {
    render(<SubjectTeaser subject={mockSubject} />);
    
    // Wait for hydration/mount
    await waitFor(() => screen.getAllByRole('button', { name: /sujet complet|Accéder au contenu|Débloquer le sujet complet/i }));
    
    const cta = screen.getAllByRole('button', { name: /sujet complet|Accéder au contenu|Débloquer le sujet complet/i })[0];
    fireEvent.click(cta);
    
    expect(recordTeaserCTA).toHaveBeenCalledWith(
      'subject-123',
      'unlock',
      expect.stringMatching(/control|view_full|access/)
    );
  });

  it('shows access badge when user has access', () => {
    const accessibleSubject = { ...mockSubject, has_access: true };
    render(<SubjectTeaser subject={accessibleSubject} />);
    
    expect(screen.getByText('Accès débloqué')).toBeInTheDocument();
    expect(screen.getByText('Consulter le sujet')).toBeInTheDocument();
  });
});
