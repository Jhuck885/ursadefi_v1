'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/context/WalletContext';
import { supabaseBrowser } from '@/lib/supabase';
import Link from 'next/link';

interface Client {
  id: string;
  name: string;
  email?: string;
  address?: string;
  city_state?: string;
  created_at: string;
}

export default function ClientsPage() {
  const { wallet, isConnected } = useWallet();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchClients = async () => {
    if (!wallet?.address) return;
    
    setLoading(true);
    const { data, error } = await supabaseBrowser
      .from('clients')
      .select('*')
      .eq('wallet_address', wallet.address)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setClients(data as Client[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isConnected) {
      fetchClients();
    }
  }, [wallet?.address, isConnected]);

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete client "${name}"? This cannot be undone.`)) return;

    const { error } = await supabaseBrowser
      .from('clients')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Failed to delete client');
    } else {
      setClients(prev => prev.filter(c => c.id !== id));
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400 mb-4">Please connect your wallet to view your clients.</p>
          <Link href="/" className="text-[#1D9BF0] hover:underline">Go to homepage</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-zinc-400 mt-1">Manage your client database</p>
        </div>
        <Link 
          href="/dashboard" 
          className="px-4 py-2 bg-[#1D9BF0] hover:bg-[#1a8cd8] text-white rounded-full text-sm font-medium transition"
        >
          + New Invoice
        </Link>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search clients by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1D9BF0]"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-zinc-400">Loading clients...</div>
      ) : filteredClients.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-zinc-400 mb-4">
            {searchTerm ? 'No clients match your search.' : 'No clients yet.'}
          </p>
          <Link 
            href="/dashboard" 
            className="inline-block px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-full text-sm transition"
          >
            Create your first invoice
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredClients.map((client) => (
            <div 
              key={client.id} 
              className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 flex items-start justify-between hover:border-zinc-700 transition"
            >
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{client.name}</h3>
                {client.email && (
                  <p className="text-sm text-zinc-400 mt-1">{client.email}</p>
                )}
                {client.address && (
                  <p className="text-sm text-zinc-500 mt-1">{client.address}</p>
                )}
                {client.city_state && (
                  <p className="text-sm text-zinc-500">{client.city_state}</p>
                )}
                <p className="text-xs text-zinc-600 mt-3">
                  Added {new Date(client.created_at).toLocaleDateString()}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleDelete(client.id, client.name)}
                  className="px-4 py-2 text-sm text-red-400 hover:text-red-500 hover:bg-red-950/50 rounded-xl transition"
                >
                  Delete
                </button>
                {/* Edit button placeholder for next step */}
                <button className="px-4 py-2 text-sm border border-zinc-700 hover:bg-zinc-900 rounded-xl transition">
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
