import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UnlockModal } from '@/components/subjects/UnlockModal';
import { unlockSubject } from '@/app/actions/credits';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock server action
vi.mock('@/app/actions/credits', () => ({
  unlockSubject: vi.fn(),
}));

// Mock router
const mockRefresh = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mockRefresh,
  }),
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  X: () => <span data-testid="x-icon">X</span>,
  Lock: () => <span>Lock</span>,
  Loader2: () => <span>Loading</span>,
  CheckCircle2: () => <span>Success</span>,
  AlertCircle: () => <span>Error</span>,
}));

// Mock Portal (render children directly for tests)
vi.mock('@/components/ui/portal', () => ({
  Portal: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('UnlockModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    subjectId: 'sub-1',
    subjectTitle: 'Maths BACC 2024',
    creditCost: 10,
    currentBalance: 50,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly when open', () => {
    render(<UnlockModal {...defaultProps} />);
    
    expect(screen.getByText('Débloquer le sujet')).toBeInTheDocument();
    expect(screen.getByText('Maths BACC 2024')).toBeInTheDocument();
    expect(screen.getByText(/10 crédits/)).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument(); // Balance
    expect(screen.getByText('Confirmer le déblocage')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<UnlockModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('Débloquer le sujet')).not.toBeInTheDocument();
  });

  it('shows insufficient funds state', () => {
    render(<UnlockModal {...defaultProps} creditCost={100} currentBalance={50} />);
    
    expect(screen.getByText('Crédits insuffisants')).toBeInTheDocument();
    expect(screen.getByText('Recharger mes crédits')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Crédits insuffisants/i })).toBeDisabled();
  });

  it('calls unlockSubject and refreshes on success', async () => {
    (unlockSubject as any).mockResolvedValue({ success: true });
    
    render(<UnlockModal {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Confirmer le déblocage'));
    
    expect(screen.getByText('Traitement...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(unlockSubject).toHaveBeenCalledWith('sub-1', 10);
      expect(screen.getByText('Sujet débloqué !')).toBeInTheDocument();
    });

    // Check if close was called after timeout (simulated)
    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalled();
      expect(defaultProps.onClose).toHaveBeenCalled();
    }, { timeout: 2000 });
  });

  it('shows error message on failure', async () => {
    (unlockSubject as any).mockResolvedValue({ success: false, error: 'Database error' });
    
    render(<UnlockModal {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Confirmer le déblocage'));
    
    await waitFor(() => {
      expect(screen.getByText('Database error')).toBeInTheDocument();
    });
  });
});
