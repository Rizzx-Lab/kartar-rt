'use client';

import { useState, useEffect } from 'react';
import { getUsers, createUser, updateUser, deleteUser, resetUserPwa } from '@/lib/admin-api';
import { useAuth } from '@/contexts/AuthContext';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

interface UserFormData {
  name: string;
  email: string;
  role: string;
  password: string;
}

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({ name: '', email: '', role: 'admin', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [errors, setErrors] = useState<Partial<UserFormData>>({});
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    const response = await getUsers();
    if (response.success && response.data) {
      setUsers(response.data);
    }
    setIsLoading(false);
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', role: 'admin', password: '' });
    setErrors({});
    setShowModal(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email, role: user.role, password: '' });
    setErrors({});
    setShowModal(true);
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<UserFormData> = {};
    if (!formData.name.trim()) newErrors.name = 'Nama harus diisi';
    if (!formData.email.trim()) newErrors.email = 'Email harus diisi';
    else if (!formData.email.includes('@')) newErrors.email = 'Format email tidak valid';
    if (!editingUser && !formData.password) newErrors.password = 'Password harus diisi untuk user baru';
    if (formData.password && formData.password.length < 6) newErrors.password = 'Password minimal 6 karakter';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    const payload = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
      ...(formData.password && { password: formData.password }),
    };
    let response;
    if (editingUser) {
      response = await updateUser(editingUser.id, payload);
    } else {
      response = await createUser(payload);
    }
    if (response.success) {
      setShowModal(false);
      fetchUsers();
    } else {
      alert(response.message || 'Terjadi kesalahan');
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Yakin ingin menghapus user ini? Aksi ini tidak dapat dibatalkan.')) {
      const response = await deleteUser(id);
      if (response.success) {
        fetchUsers();
      } else {
        alert(response.message || 'Gagal menghapus');
      }
    }
  };

  const handleResetPwa = async (userId: number, userName: string) => {
    if (confirm(`Reset status PWA untuk ${userName}?`)) {
      const success = await resetUserPwa(userId);
      if (success) {
        setToast({ message: `Status PWA ${userName} berhasil direset.`, type: 'success' });
        setTimeout(() => setToast(null), 3000);
      } else {
        setToast({ message: `Gagal mereset status PWA untuk ${userName}.`, type: 'error' });
        setTimeout(() => setToast(null), 3000);
      }
    }
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-800">Kelola Users</h1>
          <p className="text-gray-500 text-sm">Kelola akun admin website</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-gold-500 hover:bg-gold-600 text-navy-900 font-medium rounded-lg transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah User
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <input
          type="text"
          placeholder="Cari user..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-4 border-b border-gray-100 focus:ring-2 focus:ring-gold-500 focus:border-gold-500 rounded-t-xl"
        />

        {isLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4 border-b border-gray-100 last:border-0">
                <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <>
            {/* Mobile Card List - hanya tampil di mobile */}
            <div className="md:hidden divide-y divide-gray-100">
              {filtered.map((user) => (
                <div key={user.id} className="p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-navy-800 rounded-full flex items-center justify-center text-white font-medium text-sm shrink-0">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-navy-800 text-sm truncate">{user.name}</p>
                      <p className="text-gray-500 text-xs truncate">{user.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          user.role === 'super_admin'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {user.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                        </span>
                        <span className="text-gray-400 text-xs">
                          {new Date(user.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openEditModal(user)}
                      className="p-2 text-gold-600 hover:bg-gold-50 rounded-lg transition-colors"
                      title="Edit user"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Hapus user"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m-7-3V5a2 2 0 012-2h3.5" />
                      </svg>
                    </button>
                    {user?.role === 'super_admin' && (
                      <button
                        onClick={() => handleResetPwa(user.id, user.name)}
                        className="p-2 text-purple-500 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Reset PWA"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table - hanya tampil di desktop */}
            <table className="hidden md:table w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Bergabung</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-navy-800 rounded-full flex items-center justify-center text-white font-medium text-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-navy-800">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        user.role === 'super_admin'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {user.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {new Date(user.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openEditModal(user)}
                        className="p-2 text-gold-600 hover:bg-gold-50 rounded-lg transition-colors"
                        title="Edit user"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus user"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m-7-3V5a2 2 0 012-2h3.5" />
                        </svg>
                      </button>
                      {user?.role === 'super_admin' && (
                        <button
                          onClick={() => handleResetPwa(user.id, user.name)}
                          className="p-2 text-purple-500 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Reset PWA"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <div className="p-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 10H9m6 0a6 6 0 11-12 0 6 6 0 0112 0z" />
            </svg>
            <p className="text-gray-500">User tidak ditemukan.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-navy-800">
                {editingUser ? 'Edit User' : 'Tambah User Baru'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-colors ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nama lengkap"
                />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-colors ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="user@example.com"
                />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-colors"
                >
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password {editingUser && '(kosongkan jika tidak diubah)'}
                  {!editingUser && <span className="text-red-500"> *</span>}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-colors ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Minimal 6 karakter"
                />
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-gold-500 hover:bg-gold-600 text-navy-900 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 ${
            toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}
        >
          {toast.type === 'success' ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}
    </div>
  );
}