'use client';

import { useState, useEffect } from 'react';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  company: string;
}

const emptyForm = { name: '', email: '', phone: '', address: '', company: '' };

export default function CustomersPage(): JSX.Element {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadCustomers(); }, []);

  const loadCustomers = async (): Promise<void> => {
    try {
      const res = await fetch('/api/customers');
      if (res.ok) setCustomers(await res.json());
    } catch (error) {
      console.error('Failed to load customers:', error);
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setSaving(true);
    try {
      const method = editingCustomer ? 'PUT' : 'POST';
      const url = editingCustomer ? `/api/customers/${editingCustomer.id}` : '/api/customers';
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        await loadCustomers();
        setShowModal(false); setEditingCustomer(null); setFormData(emptyForm);
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to save customer');
      }
    } catch (error) {
      alert('Failed to save customer');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    try {
      const res = await fetch(`/api/customers/${id}`, { method: 'DELETE' });
      if (res.ok) await loadCustomers();
      else alert('Failed to delete customer');
    } catch (error) { alert('Failed to delete customer'); }
  };

  const openCreateModal = (): void => {
    setEditingCustomer(null); setFormData(emptyForm); setShowModal(true);
  };

  const openEditModal = (customer: Customer): void => {
    setEditingCustomer(customer);
    setFormData({ name: customer.name, email: customer.email, phone: customer.phone, address: customer.address, company: customer.company });
    setShowModal(true);
  };

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-ink-50 pt-24 px-4 sm:px-6 lg:px-8 pb-16">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 animate-fade-up">
          <div>
            <span className="section-eyebrow">Directory</span>
            <h1 className="mt-3 font-display text-3xl sm:text-4xl font-extrabold text-ink-950">Customers</h1>
            <p className="mt-1.5 text-ink-600">Manage your customers and contacts</p>
          </div>
          <button onClick={openCreateModal} className="btn btn-primary btn-md">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Customer
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6 max-w-md">
          <svg className="w-4 h-4 text-ink-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text" placeholder="Search customers…" value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input !pl-10"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-ink-500">
            <div className="w-8 h-8 border-[3px] border-brand-100 border-t-brand-600 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table-shell">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Company</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th className="!text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="!py-14 text-center text-ink-500">
                        {search ? 'No customers found matching your search.' : 'No customers yet. Click "Add Customer" to get started.'}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((customer) => (
                      <tr key={customer.id}>
                        <td className="font-semibold text-ink-900">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center text-sm font-bold">
                              {customer.name.charAt(0).toUpperCase()}
                            </div>
                            {customer.name}
                          </div>
                        </td>
                        <td>{customer.company || '—'}</td>
                        <td>{customer.email}</td>
                        <td>{customer.phone || '—'}</td>
                        <td className="!text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => openEditModal(customer)} className="btn btn-ghost btn-sm">Edit</button>
                            <button onClick={() => handleDelete(customer.id)} className="btn btn-sm text-rose-600 bg-rose-50 hover:bg-rose-100">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/60 backdrop-blur-sm">
            <div className="card max-w-md w-full max-h-[90vh] overflow-y-auto animate-fade-up">
              <div className="p-7">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-display text-xl font-bold text-ink-900">
                    {editingCustomer ? 'Edit Customer' : 'Add Customer'}
                  </h2>
                  <button onClick={() => { setShowModal(false); setEditingCustomer(null); }}
                    className="text-ink-400 hover:text-ink-700 rounded-lg p-1.5 hover:bg-ink-50">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="label">Name *</label>
                    <input type="text" name="name" value={formData.name} required
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input" placeholder="Jane Smith" />
                  </div>
                  <div>
                    <label className="label">Email</label>
                    <input id="email" name="email" type="email" required value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input" placeholder="admin@coltranetechpaint.com" />
                  </div>
                  <div>
                    <label className="label">Phone</label>
                    <input id="phone" name="phone" type="tel" required value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="input" placeholder="(555) 123-4567" />
                  </div>
                  <div>
                    <label className="label">Company</label>
                    <input type="text" name="company" value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="input" />
                  </div>
                  <div>
                    <label className="label">Address</label>
                    <textarea name="address" value={formData.address} rows={3}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="input" />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button type="button"
                      onClick={() => { setShowModal(false); setEditingCustomer(null); }}
                      className="btn btn-ghost btn-md">Cancel</button>
                    <button type="submit" disabled={saving} className="btn btn-primary btn-md disabled:opacity-50">
                      {saving ? 'Saving…' : 'Save'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
