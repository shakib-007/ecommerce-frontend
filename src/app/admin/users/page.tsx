'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search, Users, UserCheck, UserX } from 'lucide-react';
import { adminApi } from '@/lib/api/admin';
import { formatDate } from '@/lib/utils';
import Spinner from '@/components/ui/Spinner';

export default function AdminUsersPage() {
  const [users,    setUsers]    = useState<any[]>([]);
  const [meta,     setMeta]     = useState<any>(null);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [page,     setPage]     = useState(1);
  const [toggling, setToggling] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getUsers({ search, page, per_page: 15 });
      setUsers(res.data);
      setMeta(res.meta);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    const timer = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  async function toggleStatus(userId: string) {
    setToggling(userId);
    try {
      const res = await adminApi.toggleUserStatus(userId);
      setUsers(prev =>
        prev.map(u =>
          u.id === userId ? { ...u, is_active: res.is_active } : u
        )
      );
    } catch (error: any) {
      alert(error.message || 'Failed to update user status.');
    } finally {
      setToggling(null);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Users</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {meta?.total ?? 0} customers total
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:border-black transition-colors"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Users size={36} className="text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">No users found.</p>
          </div>
        ) : (
          <>
            <div className="hidden sm:grid grid-cols-12 gap-4 px-5 py-3 border-b border-gray-100 text-xs font-medium text-gray-400 uppercase tracking-wider">
              <span className="col-span-4">User</span>
              <span className="col-span-3">Phone</span>
              <span className="col-span-2">Orders</span>
              <span className="col-span-2">Joined</span>
              <span className="col-span-1 text-right">Status</span>
            </div>

            <div className="divide-y divide-gray-50">
              {users.map(user => (
                <div
                  key={user.id}
                  className="grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-gray-50 transition-colors"
                >
                  {/* User */}
                  <div className="col-span-4 flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-semibold text-gray-600 shrink-0">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="col-span-3 hidden sm:block">
                    <p className="text-sm text-gray-600">
                      {user.phone ?? '—'}
                    </p>
                  </div>

                  {/* Orders count */}
                  <div className="col-span-2 hidden sm:block">
                    <p className="text-sm text-gray-600">
                      {user.orders_count ?? 0}
                    </p>
                  </div>

                  {/* Joined date */}
                  <div className="col-span-2 hidden sm:block">
                    <p className="text-sm text-gray-600">
                      {formatDate(user.created_at)}
                    </p>
                  </div>

                  {/* Toggle status */}
                  <div className="col-span-1 flex justify-end">
                    <button
                      onClick={() => toggleStatus(user.id)}
                      disabled={toggling === user.id}
                      title={user.is_active ? 'Deactivate user' : 'Activate user'}
                      className={`
                        p-1.5 rounded-lg transition-colors disabled:opacity-40
                        ${user.is_active
                          ? 'text-green-500 hover:bg-green-50'
                          : 'text-red-400 hover:bg-red-50'
                        }
                      `}
                    >
                      {user.is_active
                        ? <UserCheck size={16} />
                        : <UserX size={16} />
                      }
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 text-sm border border-gray-300 rounded-xl disabled:opacity-40 hover:bg-gray-50"
          >
            ← Prev
          </button>
          <span className="text-sm text-gray-500">
            {meta.current_page} / {meta.last_page}
          </span>
          <button
            onClick={() => setPage(p => Math.min(meta.last_page, p + 1))}
            disabled={page === meta.last_page}
            className="px-4 py-2 text-sm border border-gray-300 rounded-xl disabled:opacity-40 hover:bg-gray-50"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}