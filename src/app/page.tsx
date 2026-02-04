// src/app/page.tsx
import './globals.css';
import { redirect } from 'next/navigation';  // Added for redirect

export const metadata = {
  title: 'UrsaDeFi',
  description: 'DeFi-native invoicing for freelancers and small businesses',
};

export default function Home() {  // Renamed from RootLayout to Home (page standard)
  redirect('/login');  // Added: Redirect root / to /login
  return null;  // Silent— no content shown before redirect
}