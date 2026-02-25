'use client';
import { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

interface XRPLConnectProps {
  onConnect?: (wallet: { address: string; publicKey: string }) => void; // optional for MVP landing page
}

export default function XRPLConnect({ onConnect }: XRPLConnectProps = {}) {
  const [qrUrl, setQrUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateXamanQR = () => {
    setLoading(true);
    setError('');

    try {
      const payload = {
        TransactionType: 'SignIn'
      };

      const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
      const qrCodeUrl = `https://xumm.app/sign/${base64Payload}`;

      setQrUrl(qrCodeUrl);
      console.log('QR URL generated:', qrCodeUrl);
    } catch (err: any) {
      setError('Failed to generate QR: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoConnect = () => {
    console.log('Demo connect clicked');
    const testAddress = 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh';
    const testPublicKey = 'ED00000000000000000000000000000000000000000000000000000000000000';
    onConnect?.({ address: testAddress, publicKey: testPublicKey });
    window.location.href = '/dashboard'; // auto-redirect after demo or real connect
  };

  return (
    <div className="space-y-6">
      {!qrUrl ? (
        <div className="text-center">
          <button
            onClick={generateXamanQR}
            disabled={loading}
            className="flex items-center justify-center gap-3 p-4 bg-[#1D9BF0] hover:bg-[#1a8cd8] text-white rounded-2xl font-medium transition w-full"
          >
            {loading ? 'Generating QR...' : '📱 Connect with Xaman (Recommended)'}
          </button>
          {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
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
            className="w-full py-3 text-xs text-gray-400 hover:text-white border border-gray-700 rounded-xl"
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