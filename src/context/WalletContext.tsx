'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { upsertProfile } from '@/lib/supabase';
import { isDemoWallet, resetDemoLocalState } from '@/lib/demo';

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

  useEffect(() => {
    const saved = localStorage.getItem('xrpl_wallet');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.address) {
          // Legacy shared demo address: do not rehydrate personal leftovers — wipe and stay logged out
          if (isDemoWallet(parsed.address) && parsed.address === 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh') {
            resetDemoLocalState();
            setWalletState(null);
          } else {
            setWalletState(parsed);
            if (!isDemoWallet(parsed.address)) {
              upsertProfile(parsed.address, parsed.publicKey).then((res) => {
                setProfileSynced(res.ok);
              });
            }
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

  const disconnect = () => {
    const addr = wallet?.address;
    // Leaving demo wipes any typed personal data from this browser
    if (isDemoWallet(addr)) {
      resetDemoLocalState();
    } else {
      localStorage.removeItem('xrpl_wallet');
    }
    setWalletState(null);
    setProfileSynced(false);
  };

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
