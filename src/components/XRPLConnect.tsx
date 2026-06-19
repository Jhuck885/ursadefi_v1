'use client';

import { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { useWallet } from '@/context/WalletContext';

interface XRPLConnectProps {
  onConnect?: (wallet: { address: string; publicKey: string }) => void;
}

export default function XRPLConnect({ onConnect }: XRPLConnectProps = {}) {
  const { setWallet } = useWallet();
  const [qrUrl, setQrUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateXamanQR = () => {
    setLoading(true);
    setError('');

    try {
      const payload = { TransactionType: 'SignIn' };
      const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
      const qrCodeUrl = `https://xumm.app/sign/${base64Payload}`;
      setQrUrl(qrCodeUrl);
    } catch (err: any) {
      setError('Failed to generate QR: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

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
            {loading ? 'Generating QR...' : 'Connect with Xaman (Recommended)'}
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
          <button
            onClick={handleDemoConnect}
            className={outlineButton}
          >
            [MVP Demo] I already signed → Continue
          </button>
          <button
            onClick={() => setQrUrl('')}
            className="text-xs text-gray-500 hover:text-white"
          >
            Back
          </button>
        </div>
      )}
    </div>
  );
}