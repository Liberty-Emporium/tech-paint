'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Document {
  id: string;
  name: string;
  type: 'estimate' | 'contract' | 'invoice' | 'other';
  status: 'draft' | 'sent' | 'signed' | 'completed' | 'voided';
  mimeType: string;
  fileSize: number;
  filePath: string;
  estimateId?: string;
  createdAt: string;
}

const statusStyles: Record<string, string> = {
  draft: 'badge-gray', sent: 'badge-blue', signed: 'badge-green',
  completed: 'badge-purple', voided: 'badge-red',
};
const typeIcons: Record<string, string> = { estimate: '📋', contract: '📄', invoice: '💰', other: '📎' };

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/documents');
        if (res.ok) setDocuments(await res.json());
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const filtered = documents.filter((doc) =>
    (filterType === 'all' || doc.type === filterType) &&
    (doc.name.toLowerCase().includes(search.toLowerCase()) ||
     doc.id.toLowerCase().includes(search.toLowerCase()) ||
     doc.estimateId?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-ink-50 pt-24 px-4 sm:px-6 lg:px-8 pb-16">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 animate-fade-up">
          <div>
            <span className="section-eyebrow">Vault</span>
            <h1 className="mt-3 font-display text-3xl sm:text-4xl font-extrabold text-ink-950">Documents</h1>
            <p className="mt-1.5 text-ink-600">Manage your estimates, contracts, and signed documents</p>
          </div>
          <Link href="/estimates/new" className="btn btn-primary btn-md">
            + New Estimate
          </Link>
        </div>

        {/* Search & filter */}
        <div className="card p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <svg className="w-4 h-4 text-ink-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input type="text" placeholder="Search documents…" value={search} onChange={(e) => setSearch(e.target.value)} className="input !pl-10" />
            </div>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="input sm:!w-48">
              <option value="all">All Types</option>
              <option value="estimate">Estimates</option>
              <option value="contract">Contracts</option>
              <option value="invoice">Invoices</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Documents table */}
        <div className="card overflow-hidden">
          {loading ? (
            <div className="py-16 text-center"><div className="inline-block w-8 h-8 border-[3px] border-brand-100 border-t-brand-600 rounded-full animate-spin" /></div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <div className="text-5xl mb-4">📁</div>
              <p className="font-display text-lg font-bold text-ink-900 mb-1">No documents found</p>
              <p className="text-sm text-ink-500">Create an estimate to generate documents</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table-shell">
                <thead>
                  <tr>
                    <th>Document</th>
                    <th>Type</th>
                    <th>Related Estimate</th>
                    <th>Size</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th className="!text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((doc) => (
                    <tr key={doc.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-ink-50 flex items-center justify-center text-xl">{typeIcons[doc.type] || '📎'}</div>
                          <div>
                            <p className="font-semibold text-ink-900">{doc.name}</p>
                            <p className="text-xs text-ink-400">{doc.mimeType}</p>
                          </div>
                        </div>
                      </td>
                      <td><span className="badge-gray">{doc.type.charAt(0).toUpperCase() + doc.type.slice(1)}</span></td>
                      <td>
                        {doc.estimateId ? (
                          <Link href={`/estimates/${doc.estimateId}`} className="text-brand-600 hover:text-brand-700 font-medium">{doc.estimateId}</Link>
                        ) : <span className="text-ink-400">—</span>}
                      </td>
                      <td>{formatFileSize(doc.fileSize)}</td>
                      <td><span className={statusStyles[doc.status] || 'badge-gray'}>{doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}</span></td>
                      <td>{formatDate(doc.createdAt)}</td>
                      <td className="!text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a href={doc.filePath} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">View</a>
                          {doc.filePath.endsWith('.pdf') && (
                            <a href={doc.filePath} download className="btn btn-soft btn-sm">Download</a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
