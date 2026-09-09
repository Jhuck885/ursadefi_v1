'use client';

import { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { useWallet } from '@/context/WalletContext';
import { startFreshDemoSandbox } from '@/lib/demo';

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
    const demoWallet = startFreshDemoSandbox();
    setWallet(demoWallet);
    onConnect?.(demoWallet);

    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 400);
  };

  return (
    <div className="space-y-6">
      {!qrUrl ? (
        <div className="text-center space-y-3">
          <button
            onClick={generateXamanQR}
            disabled={loading}
            className="w-full py-3.5 rounded-full font-semibold text-white transition disabled:opacity-60 bg-[#0D9488] hover:bg-[#0F766E] dark:bg-[#14B8A6] dark:hover:bg-[#2DD4BF]"
          >
            {loading ? 'Connecting to Xaman...' : 'Connect with Xaman'}
          </button>
          <button
            onClick={handleDemoConnect}
            className="btn-secondary w-full py-3 text-sm"
          >
            Try Demo
          </button>
          {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
        </div>
      ) : (
        <div className="space-y-4 text-center">
          <p className="text-sm text-[var(--text-secondary)]">Scan with Xaman on your iPhone</p>
          <div className="inline-block p-4 bg-white rounded-2xl">
            <QRCodeCanvas value={qrUrl} size={220} />
          </div>
          <div className="space-y-1 text-xs text-[var(--text-muted)]">
            <p>1. Open Xaman app</p>
            <p>2. Tap camera icon</p>
            <p>3. Scan QR code</p>
            <p>4. Approve SignIn</p>
          </div>

          {polling && <p className="text-xs text-[#14B8A6]">Waiting for approval in Xaman...</p>}

          <button
            onClick={handleDemoConnect}
            className="btn-secondary w-full py-3 text-sm"
          >
            Try Demo
          </button>
          <button
            onClick={() => {
              setQrUrl('');
              setUuid('');
              setPolling(false);
              setError('');
            }}
            className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            Back
          </button>
        </div>
      )}
    </div>
  );
}
