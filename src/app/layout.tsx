'use client';
import './globals.css'
import { Inter } from 'next/font/google'
import { useEffect } from 'react'
import { Xumm } from 'xumm-sdk'

const inter = Inter({ subsets: ['latin'] })

const xumm = new Xumm('your_api_key_here') // Replace with your key

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    xumm.on('ready', () => {
      console.log('XUMM SDK ready');
    });
  }, []);

  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
