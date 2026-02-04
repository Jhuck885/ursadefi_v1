'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallet, setWalletState] = useState<Wallet | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('xrpl_wallet');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setWalletState(parsed);
      } catch (e) {
        localStorage.removeItem('xrpl_wallet');
      }
    }
    setIsReady(true); // Ready after checking localStorage
  }, []);

  const setWallet = (newWallet: Wallet | null) => {
    if (newWallet) {
      localStorage.setItem('xrpl_wallet', JSON.stringify(newWallet));
    } else {
      localStorage.removeItem('xrpl_wallet');
    }
    setWalletState(newWallet);
  };

  const disconnect = () => setWallet(null);

  return (
    <WalletContext.Provider value={{ wallet, setWallet, isConnected: !!wallet, disconnect, isReady }}>
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
