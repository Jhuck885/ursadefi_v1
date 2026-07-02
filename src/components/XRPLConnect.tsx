'use client';

import { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { useWallet } from '@/context/WalletContext';

interface XRPLConnectProps {
  onConnect?: (wallet: { address: string; publicKey: string }) => void;
}

export default function XRPLConnect({ onConnect }: XRPLConnectProps = {}) {
  const { setWallet } = useWallet();
  const [qrUrl, setQrUrl] = useState('');
  const [uuid, setUuid] = useState('');
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [error, setError] = useState('');

  const generateXamanQR = async () => {
    setLoading(true);
    setError('');
    setQrUrl('');
    setUuid('');

    try {
      const res = await fetch('/api/xaman/create-signin', {
        method: 'POST'
      });

      if (!res.ok) throw new Error('Failed to create Xaman payload');

      const data = await res.json();

      if (data.error) throw new Error(data.error);

      setQrUrl(data.qr_png || data.next_always);
      setUuid(data.uuid);
      setPolling(true);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to Xaman');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!polling || !uuid) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/xaman/poll-payload?uuid=${uuid}`);
        const data = await res.json();

        if (data.signed && data.address) {
          clearInterval(interval);
          setPolling(false);

          const wallet = {
            address: data.address,
            publicKey: data.publicKey || ''
          };

          setWallet(wallet);
          onConnect?.(wallet);

          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 300);
        }

        if (data.expired) {
          clearInterval(interval);
          setPolling(false);
          setError('QR code expired. Please try again.');
          setQrUrl('');
          setUuid('');
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [polling, uuid, setWallet, onConnect]);

  const handleDemoConnect = () => {
    const testAddress = 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh';
    const testPublicKey = 'ED00000000000000000000000000000000000000000000000000000000000000';

    const demoWallet = { address: testAddress, publicKey: testPublicKey };
    setWallet(demoWallet);
    onConnect?.(demoWallet);

    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 400);
  };

  const pillButton = 'w-full py-3.5 bg-[#1D9BF0] hover:bg-[#1a8cd8] text-white font-semibold rounded-full transition disabled:opacity-60';
  const outlineButton = 'w-full py-3 text-sm text-gray-400 hover:text-white border border-gray-700 rounded-full transition';

  return (
    <div className="space-y-6">
      {!qrUrl ? (
        <div className="text-center space-y-3">
          <button
            onClick={generateXamanQR}
            disabled={loading}
            className={pillButton}
          >
            {loading ? 'Connecting to Xaman...' : 'Connect with Xaman (Recommended)'}
          </button>
          <button
            onClick={handleDemoConnect}
            className={outlineButton}
          >
            [MVP Demo] Use test wallet → Continue
          </button>
          {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
          <p className="text-[10px] text-zinc-500">Demo instantly connects a test XRPL address</p>
        </div>
      ) : (
        <div className="space-y-4 text-center">
          {/* Logo in top right of QR screen */}
          <div className="flex justify-end mb-2">
            <img src="/ursa-logo.png" alt="UrsaDeFi" className="w-8 h-8" />
          </div>
          <p className="text-sm text-gray-300">Scan with Xaman on your iPhone</p>
          <div className="inline-block p-4 bg-white rounded-2xl">
            <QRCodeCanvas value={qrUrl} size={220} />
          </div>
          <div className="space-y-1 text-xs text-gray-400">
            <p>1. Open Xaman app</p>
            <p>2. Tap camera icon</p>
            <p>3. Scan QR code</p>
            <p>4. Approve SignIn</p>
          </div>

          {polling && <p className="text-xs text-[#1D9BF0]">Waiting for approval in Xaman...</p>}

          <button
            onClick={handleDemoConnect}
            className={outlineButton}
          >
            [MVP Demo] I already signed → Continue
          </button>
          <button
            onClick={() => {
              setQrUrl('');
              setUuid('');
              setPolling(false);
              setError('');
            }}
            className="text-xs text-gray-500 hover:text-white"
          >
            Back
          </button>
        </div>
      )}
    </div>
  );
}
