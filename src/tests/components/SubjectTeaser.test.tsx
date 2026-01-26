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
}));

const mockSubject: SubjectWithAccess = {
  id: 'subject-123',
  matiere: 'MATHEMATIQUES',
  matiere_display: 'Mathématiques',
  exam_type: 'BACC',
  year: 2024,
  serie: 'C',
  description: 'Test subject',
  preview_text: 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5',
  has_access: false,
  is_free: false,
  credit_cost: 10,
  page_count: 5,
  view_count: 100,
  download_count: 10,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  thumbnail_url: null,
  file_url: null,
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
    expect(screen.getByText('Line 4').closest('.blur-sm')).toBeInTheDocument();
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
    await waitFor(() => screen.getByRole('link', { name: /sujet complet|Accéder au contenu/i }));
    
    const cta = screen.getByRole('link', { name: /sujet complet|Accéder au contenu/i });
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
    expect(screen.getByText('Consulter le sujet complet')).toBeInTheDocument();
  });
});
