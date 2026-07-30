'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { upsertProfile } from '@/lib/supabase';
import { isDemoWallet } from '@/lib/demo';

interface Wallet {
  address: string;
  publicKey: string;
}

interface WalletContextType {
  wallet: Wallet | null;
  setWallet: (wallet: Wallet | null) => void;
  isConnected: boolean;
  disconnect: () => void;
  isReady: boolean;
  profileSynced: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallet, setWalletState] = useState<Wallet | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [profileSynced, setProfileSynced] = useState(false);

  // Rehydrate wallet from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('xrpl_wallet');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.address) {
          setWalletState(parsed);
          // Never sync demo wallet to cloud (avoids leaking personal profile into shared demo)
          if (!isDemoWallet(parsed.address)) {
            upsertProfile(parsed.address, parsed.publicKey).then((res) => {
              setProfileSynced(res.ok);
            });
          }
        }
      } catch {
        localStorage.removeItem('xrpl_wallet');
      }
    }
    setIsReady(true);
  }, []);

  const setWallet = (newWallet: Wallet | null) => {
    if (newWallet?.address) {
      localStorage.setItem('xrpl_wallet', JSON.stringify(newWallet));
      setWalletState(newWallet);
      setProfileSynced(false);

      if (!isDemoWallet(newWallet.address)) {
        upsertProfile(newWallet.address, newWallet.publicKey).then((res) => {
          setProfileSynced(res.ok);
        });
      }
    } else {
      localStorage.removeItem('xrpl_wallet');
      setWalletState(null);
      setProfileSynced(false);
    }
  };

  const disconnect = () => setWallet(null);

  return (
    <WalletContext.Provider
      value={{
        wallet,
        setWallet,
        isConnected: !!wallet,
        disconnect,
        isReady,
        profileSynced,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
