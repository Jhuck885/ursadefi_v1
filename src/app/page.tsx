'use client';
import { useEffect } from 'react';
import { Xumm } from '@xumm/xumm-sdk';

const xumm = new Xumm('your_api_key_here'); // Replace with your key

export default function Home() {
  useEffect(() => {
    xumm.on('ready', () => {
      console.log('XUMM SDK ready');
    });
  }, []);

  return (
    <div>
      <h1>UrsaDeFi</h1>
      {/* Your app */}
    </div>
  );
}
