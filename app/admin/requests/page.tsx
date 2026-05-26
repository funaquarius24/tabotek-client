'use client';

import { useState, useEffect } from 'react';
import Pagination from '@/components/admin/Pagination';

interface AuthorRequest {
  _id: string;
  userId: string;
  userEmail: string;
  userName: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<AuthorRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: pageSize.toString() });
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);

      const res = await fetch(`/api/admin/author-requests?${params}`);
      if (!res.ok) throw new Error('Failed to fetch requests');
      const data = await res.json();
      setRequests(data.requests || []);
      if (data.pagination) {
        setTotal(data.pagination.total);
        setTotalPages(data.pagination.totalPages);
      }
    } catch {
      setError('Failed to load requests. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [page, pageSize, search, statusFilter]);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    setActionLoading(id);
    setSuccessMessage(null);
    try {
      const res = await fetch(`/api/admin/author-requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error('Failed to update request');
      setSuccessMessage(`Request ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
      fetchRequests();
    } catch {
      setError('Failed to update request');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Requests</h1>
          <p className="text-gray-600 mt-2">Manage user requests that need your attention.</p>
        </div>
      </div>

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg px-4 py-3">{successMessage}</div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg px-4 py-3">{error}</div>
      )}

      <div className="flex flex-wrap gap-4 bg-white rounded-xl shadow-md p-4 items-center">
        <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search by name or email..." className="px-4 py-2 border border-gray-300 rounded-lg text-sm w-64" />
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📨</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No requests</h3>
            <p className="text-gray-500">There are no requests matching your criteria.</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-200">
              {requests.map((request) => (
                <div key={request._id} className="p-6 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-lg font-semibold text-blue-700">{request.userName.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{request.userName}</p>
                        <p className="text-sm text-gray-500">{request.userEmail}</p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                      <span>Requested {new Date(request.createdAt).toLocaleDateString()}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        request.status === 'approved' ? 'bg-green-100 text-green-800' :
                        request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>{request.status}</span>
                    </div>
                  </div>
                  {request.status === 'pending' ? (
                    <div className="flex items-center gap-3 ml-4">
                      <button onClick={() => handleAction(request._id, 'reject')} disabled={actionLoading === request._id} className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg disabled:opacity-50">
                        {actionLoading === request._id ? '...' : 'Reject'}
                      </button>
                      <button onClick={() => handleAction(request._id, 'approve')} disabled={actionLoading === request._id} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50">
                        {actionLoading === request._id ? '...' : 'Approve'}
                      </button>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400 ml-4 italic">{request.status === 'approved' ? 'Approved' : 'Rejected'}</span>
                  )}
                </div>
              ))}
            </div>
            <Pagination page={page} totalPages={totalPages} total={total} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={s => { setPageSize(s); setPage(1); }} />
          </>
        )}
      </div>
    </div>
  );
}
