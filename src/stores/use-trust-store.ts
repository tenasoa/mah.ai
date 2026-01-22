import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TrustState {
  trustStatus: 'idle' | 'trusted' | 'expired';
  expirationTime: number | null; // Timestamp
  referenceCode: string | null;
  
  // Actions
  unlockTrust: (code: string) => void;
  checkExpiration: () => void;
  revokeTrust: () => void;
}

export const useTrustStore = create<TrustState>()(
  persist(
    (set, get) => ({
      trustStatus: 'idle',
      expirationTime: null,
      referenceCode: null,

      unlockTrust: (code: string) => {
        // Optimistic update: Immediate access for 1 hour
        const oneHourFromNow = Date.now() + 60 * 60 * 1000;
        set({
          trustStatus: 'trusted',
          referenceCode: code,
          expirationTime: oneHourFromNow,
        });
      },

      checkExpiration: () => {
        const { expirationTime, trustStatus } = get();
        if (trustStatus === 'trusted' && expirationTime && Date.now() > expirationTime) {
          set({ trustStatus: 'expired', expirationTime: null });
        }
      },

      revokeTrust: () => {
        set({ trustStatus: 'idle', expirationTime: null, referenceCode: null });
      },
    }),
    {
      name: 'mah-trust-storage', // Key in localStorage
    }
  )
);
