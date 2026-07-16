'use client';

import { useState, useEffect, useRef } from 'react';
import { useWallet } from '@/context/WalletContext';
import Link from 'next/link';
import LeftSidebar from '@/components/layout/LeftSidebar';
import {
  Copy, Check, ExternalLink, Wallet, User, Settings, LogOut,
  Building2, Globe, Phone, MapPin, Hash, Mail, Camera, Save
} from 'lucide-react';

interface CompanyProfile {
  username: string;
  companyName: string;
  website: string;
  phone: string;
  email: string;
  address: string;
  cityStateZip: string;
  country: string;
  ein: string;
  tagline: string;
  logoDataUrl: string;
}

const defaultProfile: CompanyProfile = {
  username: '',
  companyName: '',
  website: '',
  phone: '',
  email: '',
  address: '',
  cityStateZip: '',
  country: 'United States',
  ein: '',
  tagline: '',
  logoDataUrl: '',
};

export default function ProfilePage() {
  const { wallet, isConnected, disconnect } = useWallet();
  const [copied, setCopied] = useState(false);
  const [invoiceCount, setInvoiceCount] = useState(0);
  const [profile, setProfile] = useState<CompanyProfile>(defaultProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
      setInvoiceCount(invoices.length);

      const savedProfile = localStorage.getItem('ursadefi_company_profile');
      if (savedProfile) {
        setProfile({ ...defaultProfile, ...JSON.parse(savedProfile) });
      }
    } catch {
      setInvoiceCount(0);
    }
  }, []);

  const copyAddress = () => {
    if (!wallet?.address) return;
    navigator.clipboard.writeText(wallet.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shortAddress = wallet?.address
    ? `${wallet.address.slice(0, 8)}...${wallet.address.slice(-6)}`
    : null;

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Logo must be under 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfile(prev => ({ ...prev, logoDataUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      localStorage.setItem('ursadefi_company_profile', JSON.stringify(profile));
      window.dispatchEvent(new CustomEvent('company-profile-updated', { detail: profile }));
      setSaved(true);
      setIsEditing(false);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error(err);
      alert('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof CompanyProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <div className="text-center">
          <p className="text-[var(--text-secondary)] mb-4">Please connect your wallet to view your profile.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white rounded-full text-sm font-medium transition"
          >
            Connect Wallet
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="w-72 border-r border-[var(--border-color)] hidden lg:block flex-shrink-0">
        <LeftSidebar />
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-10">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Company Profile</h1>
              <p className="text-[var(--text-secondary)] mt-1">This info appears on your invoices</p>
            </div>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-5 py-2.5 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white rounded-full text-sm font-medium transition"
              >
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 border border-[var(--border-color)] hover:bg-[var(--bg-secondary)] rounded-full text-sm transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white rounded-full text-sm font-medium transition disabled:opacity-60"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            )}
          </div>

          {saved && (
            <div className="mb-6 px-4 py-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-xl text-sm">
              Profile saved successfully. This data will be used on future invoices.
            </div>
          )}

          {/* Logo + Company Name */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center overflow-hidden">
                  {profile.logoDataUrl ? (
                    <img src={profile.logoDataUrl} alt="Company Logo" className="w-full h-full object-contain" />
                  ) : (
                    <Building2 className="w-10 h-10 text-[var(--text-muted)]" />
                  )}
                </div>
                {isEditing && (
                  <>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-2 -right-2 w-9 h-9 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white rounded-full flex items-center justify-center shadow-lg transition"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </>
                )}
              </div>

              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={profile.companyName}
                      onChange={(e) => updateField('companyName', e.target.value)}
                      placeholder="Company Name"
                      className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-lg font-semibold focus:outline-none focus:border-[var(--brand-primary)]"
                    />
                    <input
                      type="text"
                      value={profile.tagline}
                      onChange={(e) => updateField('tagline', e.target.value)}
                      placeholder="Tagline or short description (optional)"
                      className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--brand-primary)]"
                    />
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold">{profile.companyName || 'Your Company Name'}</h2>
                    {profile.tagline && (
                      <p className="text-[var(--text-secondary)] mt-1">{profile.tagline}</p>
                    )}
                    {!profile.companyName && (
                      <p className="text-[var(--text-muted)] text-sm mt-1">Click Edit Profile to add your company details</p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Company Details */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6 mb-6">
            <h3 className="font-semibold text-lg mb-5 flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Company Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1.5">Username / Handle</label>
                {isEditing ? (
                  <input type="text" value={profile.username} onChange={(e) => updateField('username', e.target.value)} placeholder="yourhandle" className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--brand-primary)]" />
                ) : (
                  <p className="text-sm py-3">{profile.username || '—'}</p>
                )}
              </div>

              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1.5 flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5" /> EIN / Tax ID
                </label>
                {isEditing ? (
                  <input type="text" value={profile.ein} onChange={(e) => updateField('ein', e.target.value)} placeholder="XX-XXXXXXX" className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--brand-primary)]" />
                ) : (
                  <p className="text-sm py-3 font-mono">{profile.ein || '—'}</p>
                )}
              </div>

              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1.5 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5" /> Website
                </label>
                {isEditing ? (
                  <input type="url" value={profile.website} onChange={(e) => updateField('website', e.target.value)} placeholder="https://yourcompany.com" className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--brand-primary)]" />
                ) : (
                  <p className="text-sm py-3">
                    {profile.website ? (
                      <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-[var(--brand-primary)] hover:underline">{profile.website}</a>
                    ) : '—'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1.5 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" /> Phone
                </label>
                {isEditing ? (
                  <input type="tel" value={profile.phone} onChange={(e) => updateField('phone', e.target.value)} placeholder="+1 (555) 000-0000" className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--brand-primary)]" />
                ) : (
                  <p className="text-sm py-3">{profile.phone || '—'}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs text-[var(--text-secondary)] mb-1.5 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" /> Business Email
                </label>
                {isEditing ? (
                  <input type="email" value={profile.email} onChange={(e) => updateField('email', e.target.value)} placeholder="billing@yourcompany.com" className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--brand-primary)]" />
                ) : (
                  <p className="text-sm py-3">{profile.email || '—'}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs text-[var(--text-secondary)] mb-1.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> Street Address
                </label>
                {isEditing ? (
                  <input type="text" value={profile.address} onChange={(e) => updateField('address', e.target.value)} placeholder="123 Main Street, Suite 100" className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--brand-primary)]" />
                ) : (
                  <p className="text-sm py-3">{profile.address || '—'}</p>
                )}
              </div>

              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1.5">City, State ZIP</label>
                {isEditing ? (
                  <input type="text" value={profile.cityStateZip} onChange={(e) => updateField('cityStateZip', e.target.value)} placeholder="Dallas, TX 75218" className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--brand-primary)]" />
                ) : (
                  <p className="text-sm py-3">{profile.cityStateZip || '—'}</p>
                )}
              </div>

              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1.5">Country</label>
                {isEditing ? (
                  <input type="text" value={profile.country} onChange={(e) => updateField('country', e.target.value)} placeholder="United States" className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--brand-primary)]" />
                ) : (
                  <p className="text-sm py-3">{profile.country || '—'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Wallet Card */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6 mb-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[var(--brand-primary)]/10 flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-[var(--brand-primary)]" />
                </div>
                <div>
                  <p className="text-sm text-[var(--text-secondary)] mb-1">Connected Wallet (XRPL)</p>
                  <p className="font-mono text-base font-medium">{shortAddress}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={copyAddress} className="flex items-center gap-2 px-4 py-2 border border-[var(--border-color)] hover:bg-[var(--bg-primary)] rounded-full text-sm transition">
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <a href={`https://test.bithomp.com/explorer/${wallet?.address}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 border border-[var(--border-color)] hover:bg-[var(--bg-primary)] rounded-full text-sm transition">
                  <ExternalLink className="w-4 h-4" />
                  Explorer
                </a>
              </div>
            </div>
          </div>

          {/* Stats + Actions */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-5">
              <p className="text-sm text-[var(--text-secondary)] mb-1">Invoices Created</p>
              <p className="text-3xl font-bold">{invoiceCount}</p>
            </div>
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-5">
              <p className="text-sm text-[var(--text-secondary)] mb-1">Network</p>
              <p className="text-xl font-semibold text-[var(--brand-primary)]">XRPL Testnet</p>
            </div>
          </div>

          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6">
            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Account Actions
            </h2>

            <div className="space-y-3">
              <Link href="/clients" className="flex items-center justify-between w-full px-4 py-3 rounded-xl hover:bg-[var(--bg-primary)] transition border border-transparent hover:border-[var(--border-color)]">
                <span className="flex items-center gap-3">
                  <User className="w-5 h-5 text-[var(--text-secondary)]" />
                  Manage Clients
                </span>
                <span className="text-[var(--text-muted)]">→</span>
              </Link>

              <Link href="/dashboard" className="flex items-center justify-between w-full px-4 py-3 rounded-xl hover:bg-[var(--bg-primary)] transition border border-transparent hover:border-[var(--border-color)]">
                <span className="flex items-center gap-3">
                  <Wallet className="w-5 h-5 text-[var(--text-secondary)]" />
                  View Activity & Invoices
                </span>
                <span className="text-[var(--text-muted)]">→</span>
              </Link>

              <button onClick={disconnect} className="flex items-center justify-between w-full px-4 py-3 rounded-xl hover:bg-red-950/30 text-red-400 transition border border-transparent hover:border-red-900/50">
                <span className="flex items-center gap-3">
                  <LogOut className="w-5 h-5" />
                  Disconnect Wallet
                </span>
                <span>→</span>
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-[var(--text-muted)] mt-10">
            This company information is used on invoices you generate. UrsaDeFi is non-custodial.
          </p>
        </div>
      </div>
    </div>
  );
}
