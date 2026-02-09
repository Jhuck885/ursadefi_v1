import './globals.css'
import { Inter } from 'next/font/google'
import { useEffect } from 'react'
import { Xumm } from '@xumm/sdk'

const inter = Inter({ subsets: ['latin'] })

const xumm = new Xumm('d3d4783b-a893-4212-a6c3-368c4442aac3') // Replace with your key from xumm.dev

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
