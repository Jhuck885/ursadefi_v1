'use client';
import { useEffect } from 'react';
import { Xumm } from 'xumm-sdk';

export default function Home() {
  useEffect(() => {
    const xumm = new Xumm('d3d4783b-a893-4212-a6c3-368c4442aac3');
    xumm.on('ready', () => {
      console.log('XUMM SDK ready');
    });
  }, []);

  return (
    <div>
      <h1>UrsaDeFi</h1>
      <p>App is running with correct SDK.</p>
    </div>
  );
}
