'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { getContacts, markContactRead, deleteContact } from '@/lib/admin-api';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { AdminPageHeader } from '@/components/admin/page-header';
import { AdminBadge } from '@/components/admin/status-badge';
import { AdminEmptyState } from '@/components/admin/empty-state';
import { useAdminToast } from '@/components/admin/admin-toast';
import { Mail, Phone, Clock, Check, X, Trash2, Search } from 'lucide-react';

interface Contact {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function AdminContactsPage() {
  const toast = useAdminToast();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: number | null }>({
    isOpen: false,
    id: null,
  });
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getContacts();
      if (response.success && response.data) {
        setContacts(response.data);
      }
    } catch (err) {
      console.error('Error fetching contacts:', err);
      setError('Gagal memuat pesan');
    }
    setIsLoading(false);
  };

  const handleViewDetail = (contact: Contact) => {
    setSelectedContact(contact);
    setShowDetailModal(true);
    if (!contact.is_read) {
      handleMarkRead(contact.id);
    }
  };

  const handleMarkRead = async (id: number) => {
    try {
      await markContactRead(id);
      // Update local state
      setContacts(prev =>
        prev.map(c => c.id === id ? { ...c, is_read: true } : c)
      );
      if (selectedContact?.id === id) {
        setSelectedContact(prev => prev ? { ...prev, is_read: true } : null);
      }
    } catch (err) {
      console.error('Error marking contact as read:', err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await deleteContact(id);
      if (response.success) {
        if (selectedContact?.id === id) {
          setShowDetailModal(false);
          setSelectedContact(null);
        }
        // Remove from local state
        setContacts(prev => prev.filter(c => c.id !== id));
        toast.success('Pesan berhasil dihapus');
      } else {
        toast.error(response.message || 'Gagal menghapus');
      }
    } catch (err) {
      console.error('Error deleting contact:', err);
      toast.error('Gagal menghapus pesan');
    }
    setDeleteModal({ isOpen: false, id: null });
  };

  // Memoized filtered contacts
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return contacts;
    const query = searchQuery.toLowerCase();
    return contacts.filter(c =>
      c.name.toLowerCase().includes(query) ||
      (c.email ? c.email.toLowerCase().includes(query) : false)
    );
  }, [contacts, searchQuery]);

  const unreadCount = useMemo(() =>
    contacts.filter(c => !c.is_read).length,
    [contacts]
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Pesan Kontak"
        subtitle={
          unreadCount > 0
            ? `${unreadCount} pesan belum dibaca`
            : 'Semua pesan sudah dibaca'
        }
        action={
          contacts.length > 0 ? (
            <span className="px-3 py-1 bg-gold-100 text-gold-700 text-sm font-medium rounded-full">
              {contacts.length} Pesan
            </span>
          ) : undefined
        }
      />

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
          <input
            type="text"
            placeholder="Cari pesan berdasarkan nama atau email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all text-sm outline-none"
          />
        </div>
      </div>

      {/* Messages */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl p-4 sm:p-5 shadow-sm animate-pulse">
              <div className="flex gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2 min-w-0">
                  <div className="h-5 bg-gray-200 rounded w-1/3" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((contact) => (
            <div
              key={contact.id}
              className={`bg-white rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all cursor-pointer ${
                !contact.is_read ? 'border-l-4 border-gold-500' : ''
              }`}
              onClick={() => handleViewDetail(contact)}
            >
              <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 font-semibold text-white ${
                    contact.is_read ? 'bg-gray-400' : 'bg-gold-500'
                  }`}
                >
                  {contact.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-semibold text-navy-800 truncate max-w-full">{contact.name}</h3>
                    {!contact.is_read && (
                      <AdminBadge tone="gold">
                        Baru
                      </AdminBadge>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-gray-500 mb-2">
                    {contact.email && (
                      <span className="flex items-center gap-1 min-w-0 max-w-full">
                        <Mail className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                        <span className="truncate">{contact.email}</span>
                      </span>
                    )}
                    {contact.phone && (
                      <span className="flex items-center gap-1 min-w-0 shrink-0">
                        <Phone className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                        <span>{contact.phone}</span>
                      </span>
                    )}
                    <span className="flex items-center gap-1 min-w-0 shrink-0">
                      <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      <span>
                        {new Date(contact.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-2 break-words">{contact.message}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 self-center sm:self-start">
                  {contact.is_read ? (
                    <Check className="w-5 h-5 text-green-500" aria-hidden="true" />
                  ) : (
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-gold-500 rounded-full" aria-hidden="true" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <AdminEmptyState
          icon={Mail}
          title={searchQuery ? 'Tidak ada pesan yang sesuai.' : 'Belum ada pesan masuk.'}
        />
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowDetailModal(false)}
            aria-hidden="true"
          />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="sticky top-0 z-10 bg-white px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-100 flex items-center justify-between gap-3 shrink-0">
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-bold text-navy-800 truncate">{selectedContact.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5 truncate">
                  {new Date(selectedContact.created_at).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                aria-label="Tutup"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 hover:bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 transition-colors shrink-0"
              >
                <X className="w-5 h-5 text-gray-500" aria-hidden="true" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-6 overflow-y-auto">
              {/* Contact Info */}
              <div className="space-y-3">
                <div>
                  <h4 className="text-xs font-semibold text-gray-700 uppercase mb-1">Email</h4>
                  {selectedContact.email ? (
                    <a
                      href={`mailto:${selectedContact.email}`}
                      className="text-navy-800 hover:text-gold-600 flex items-center gap-2 break-all focus:outline-none focus:underline"
                    >
                      <Mail className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span className="break-all">{selectedContact.email}</span>
                    </a>
                  ) : (
                    <span className="text-gray-400">Tidak ada</span>
                  )}
                </div>
                {selectedContact.phone && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-700 uppercase mb-1">Telepon</h4>
                    <a
                      href={`tel:${selectedContact.phone}`}
                      className="text-navy-800 hover:text-gold-600 flex items-center gap-2 break-all focus:outline-none focus:underline"
                    >
                      <Phone className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>{selectedContact.phone}</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200" />

              {/* Message */}
              <div>
                <h4 className="text-xs font-semibold text-gray-700 uppercase mb-3">Pesan</h4>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-gray-700 whitespace-pre-wrap break-words leading-relaxed">
                    {selectedContact.message}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="border-t border-gray-200 pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1 min-h-[44px] px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gold-500 transition-colors"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteModal({ isOpen: true, id: selectedContact.id })}
                  aria-label="Hapus pesan"
                  className="flex-1 min-h-[44px] px-4 py-2 bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Hapus Pesan"
        message="Yakin ingin menghapus pesan ini? Aksi ini tidak dapat dibatalkan."
        confirmText="Hapus"
        onConfirm={() => deleteModal.id && handleDelete(deleteModal.id)}
        onCancel={() => setDeleteModal({ isOpen: false, id: null })}
        danger
      />
    </div>
  );
}