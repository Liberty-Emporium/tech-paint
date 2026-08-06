'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'customer';
  company?: string;
  phone?: string;
  createdAt: string;
}

const emptyForm = { email: '', password: '', name: '', role: 'customer' as 'admin' | 'customer', company: '', phone: '' };

export default function UsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') { router.replace('/login'); return; }
    if (status === 'authenticated' && (session?.user as any)?.role !== 'admin') { router.replace('/portal'); return; }
    if (status === 'authenticated') loadUsers();
  }, [status]);

  const loadUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) setUsers(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const res = await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (res.ok) { setShowModal(false); setForm(emptyForm); loadUsers(); }
      else { const data = await res.json(); setError(data.error || 'Failed to create user'); }
    } catch { setError('Failed to create user'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      await fetch('/api/users', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      loadUsers();
    } catch {}
  };

  if (status === 'loading' || loading) {
    return <main className="min-h-screen bg-ink-50 flex items-center justify-center"><div className="w-8 h-8 border-[3px] border-brand-100 border-t-brand-600 rounded-full animate-spin" /></main>;
  }

  return (
    <main className="min-h-screen bg-ink-50 pt-24 px-4 sm:px-6 lg:px-8 pb-16">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 animate-fade-up">
          <div>
            <span className="section-eyebrow">Access</span>
            <h1 className="mt-3 font-display text-3xl sm:text-4xl font-extrabold text-ink-950">User Management</h1>
            <p className="mt-1.5 text-ink-600">Manage admin and customer accounts</p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn btn-primary btn-md">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add User
          </button>
        </div>

        {/* Users table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table-shell">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Company</th>
                  <th className="!text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="font-semibold text-ink-900">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-violet-500 text-white flex items-center justify-center text-sm font-bold">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        {u.name}
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <span className={u.role === 'admin' ? 'badge-purple' : 'badge-green'}>
                        {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                      </span>
                    </td>
                    <td>{u.company || '—'}</td>
                    <td className="!text-right">
                      <button onClick={() => handleDelete(u.id, u.name)}
                        className="btn btn-sm text-rose-600 bg-rose-50 hover:bg-rose-100">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add User Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-ink-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
            <div className="card max-w-lg w-full p-7 animate-fade-up" onClick={e => e.stopPropagation()}>
              <h2 className="font-display text-xl font-bold text-ink-900 mb-5">Add New User</h2>
              {error && <div className="badge-red w-full justify-start py-2.5 px-3 mb-4 text-sm border border-rose-200">{error}</div>}
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Full Name *</label>
                    <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input" placeholder="Jane Smith" />
                  </div>
                  <div>
                    <label className="label">Email *</label>
                    <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="input" placeholder="jane@example.com" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Password *</label>
                    <input type="password" required value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="input" placeholder="••••••••" minLength={4} />
                  </div>
                  <div>
                    <label className="label">Role</label>
                    <select value={form.role} onChange={e => setForm({...form, role: e.target.value as any})} className="input">
                      <option value="customer">Customer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Company</label>
                    <input type="text" value={form.company} onChange={e => setForm({...form, company: e.target.value})} className="input" placeholder="Company name" />
                  </div>
                  <div>
                    <label className="label">Phone</label>
                    <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="input" placeholder="(555) 000-0000" />
                  </div>
                </div>
                <div className="flex gap-3 justify-end pt-5 border-t border-ink-100">
                  <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost btn-md">Cancel</button>
                  <button type="submit" disabled={saving} className="btn btn-primary btn-md disabled:opacity-50">
                    {saving ? 'Creating…' : 'Create User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
