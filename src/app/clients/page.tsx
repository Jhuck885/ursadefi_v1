'use client';

import { useState, useEffect } from 'react';

import { useWallet } from '@/context/WalletContext';

import { supabaseBrowser } from '@/lib/supabase';

import Link from 'next/link';

import { AlertTriangle } from 'lucide-react';

import LeftSidebar from '@/components/layout/LeftSidebar';

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

  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editPhone, setEditPhone] = useState('');

  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  const fetchClients = async () => {
    if (!wallet?.address) return;
    setLoading(true);
    const { data, error } = await supabaseBrowser
      .from('clients')
      .select('*')
      .eq('wallet_address', wallet.address)
      .order('created_at', { ascending: false });
    if (!error && data) setClients(data as Client[]);
    setLoading(false);
  };

  useEffect(() => {
    if (isConnected) fetchClients();
  }, [wallet?.address, isConnected]);

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddClient = async () => {
    if (!newName.trim() || !wallet?.address) {
      alert('Client name is required');
      return;
    }

    const { data, error } = await supabaseBrowser
      .from('clients')
      .insert([{
        wallet_address: wallet.address,
        name: newName.trim(),
        email: newEmail.trim() || null,
        address: newAddress.trim() || null,
        city_state: newPhone.trim() || null,
      }])
      .select()
      .single();

    if (error) {
      alert('Failed to add client');
    } else if (data) {
      setClients(prev => [data as Client, ...prev]);
      setNewName(''); setNewEmail(''); setNewAddress(''); setNewPhone('');
      setShowAddForm(false);
    }
  };

  const confirmDelete = (client: Client) => {
    setClientToDelete(client);
  };

  const handleDelete = async () => {
    if (!clientToDelete) return;

    const { error } = await supabaseBrowser
      .from('clients')
      .delete()
      .eq('id', clientToDelete.id);

    if (error) {
      alert('Failed to delete client');
      console.error('Delete error:', error);
    } else {
      setClients(prev => prev.filter(c => c.id !== clientToDelete.id));
    }
    setClientToDelete(null);
  };

  const startEdit = (client: Client) => {
    setEditingClient(client);
    setEditName(client.name);
    setEditEmail(client.email || '');
    setEditAddress(client.address || '');
    setEditPhone(client.city_state || '');
  };

  const handleSaveEdit = async () => {
    if (!editingClient || !editName.trim()) return;

    const { error } = await supabaseBrowser
      .from('clients')
      .update({
        name: editName.trim(),
        email: editEmail.trim() || null,
        address: editAddress.trim() || null,
        city_state: editPhone.trim() || null,
      })
      .eq('id', editingClient.id);

    if (error) {
      alert('Failed to update client');
    } else {
      setClients(prev =>
        prev.map(c =>
          c.id === editingClient.id
            ? { ...c, name: editName.trim(), email: editEmail.trim() || undefined, address: editAddress.trim() || undefined, city_state: editPhone.trim() || undefined }
            : c
        )
      );
      setEditingClient(null);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <div className="text-center">
          <p className="text-[var(--text-secondary)] mb-4">Please connect your wallet to view your clients.</p>
          <Link href="/" className="text-[#1D9BF0] hover:underline">Go to homepage</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Left Navigation Only */}
      <div className="w-72 border-r border-[var(--border-color)] hidden lg:block flex-shrink-0">
        <LeftSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
              <p className="text-[var(--text-secondary)] mt-1">Manage your client database</p>
            </div>

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-5 py-2 bg-[#1D9BF0] hover:bg-[#1a8cd8] text-white rounded-full text-sm font-medium transition"
            >
              + New Client
            </button>
          </div>

          {showAddForm && (
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6 mb-8 max-w-2xl">
              <h3 className="font-semibold mb-4">Add New Client</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="Client / Company Name *" value={newName} onChange={e => setNewName(e.target.value)} className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm" />
                <input type="email" placeholder="Email" value={newEmail} onChange={e => setNewEmail(e.target.value)} className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm" />
                <input type="text" placeholder="Address" value={newAddress} onChange={e => setNewAddress(e.target.value)} className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm md:col-span-2" />
                <input type="text" placeholder="Phone" value={newPhone} onChange={e => setNewPhone(e.target.value)} className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm" />
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={handleAddClient} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 rounded-full text-sm font-medium transition">Save Client</button>
                <button onClick={() => setShowAddForm(false)} className="px-6 py-2.5 border border-[var(--border-color)] hover:bg-[var(--bg-secondary)] rounded-full text-sm transition">Cancel</button>
              </div>
            </div>
          )}

          <div className="mb-6">
            <input
              type="text"
              placeholder="Search clients by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full max-w-md bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1D9BF0]"
            />
          </div>

          {loading ? (
            <div className="text-center py-12 text-[var(--text-secondary)]">Loading clients...</div>
          ) : filteredClients.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[var(--text-secondary)] mb-4">{searchTerm ? 'No clients match your search.' : 'No clients yet.'}</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredClients.map((client) => (
                <div key={client.id} className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6 flex items-start justify-between hover:border-[var(--border-color)] transition">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{client.name}</h3>
                    {client.email && <p className="text-sm text-[var(--text-secondary)] mt-1">{client.email}</p>}
                    {client.address && <p className="text-sm text-[var(--text-secondary)] mt-1">{client.address}</p>}
                    {client.city_state && <p className="text-sm text-[var(--text-secondary)]">{client.city_state}</p>}
                    <p className="text-xs text-[var(--text-secondary)] mt-3">Added {new Date(client.created_at).toLocaleDateString()}</p>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => confirmDelete(client)} className="px-4 py-2 text-sm text-red-400 hover:text-red-500 hover:bg-red-950/50 rounded-xl transition">Delete</button>
                    <button onClick={() => startEdit(client)} className="px-4 py-2 text-sm border border-[var(--border-color)] hover:bg-[var(--bg-secondary)] rounded-xl transition">Edit</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingClient && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl p-8 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-6">Edit Client</h3>

            <div className="space-y-4">
              <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm" placeholder="Name" />
              <input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm" placeholder="Email" />
              <input type="text" value={editAddress} onChange={e => setEditAddress(e.target.value)} className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm" placeholder="Address" />
              <input type="text" value={editPhone} onChange={e => setEditPhone(e.target.value)} className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm" placeholder="Phone" />
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={handleSaveEdit} className="flex-1 py-3 bg-[#1D9BF0] hover:bg-[#1a8cd8] rounded-full text-sm font-semibold transition">Save Changes</button>
              <button onClick={() => setEditingClient(null)} className="flex-1 py-3 border border-[var(--border-color)] hover:bg-[var(--bg-secondary)] rounded-full text-sm transition">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Delete Warning Modal */}
      {clientToDelete && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl p-8 w-full max-w-md text-center">
            <div className="flex justify-center mb-4">
              <AlertTriangle className="w-12 h-12 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">WARNING</h3>
            <p className="text-[var(--text-secondary)] mb-2">All client data will be lost</p>
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              This will permanently delete <span className="font-medium text-[var(--text-primary)]">{clientToDelete.name}</span> and all associated information.
            </p>

            <div className="flex gap-3">
              <button onClick={() => setClientToDelete(null)} className="flex-1 py-3 border border-[var(--border-color)] hover:bg-[var(--bg-secondary)] rounded-full text-sm transition">Cancel</button>
              <button onClick={handleDelete} className="flex-1 py-3 bg-red-600 hover:bg-red-700 rounded-full text-sm font-semibold transition">Delete Client</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
