'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { getContacts, markContactRead, deleteContact } from '@/lib/admin-api';
import { ConfirmModal } from '@/components/ui/confirm-modal';

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
      } else {
        alert(response.message || 'Gagal menghapus');
      }
    } catch (err) {
      console.error('Error deleting contact:', err);
      alert('Gagal menghapus pesan');
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-800">Pesan Kontak</h1>
          <p className="text-gray-500 text-sm">
            {unreadCount > 0
              ? `${unreadCount} pesan belum dibaca`
              : 'Semua pesan sudah dibaca'}
          </p>
        </div>
        {contacts.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-gold-100 text-gold-700 text-sm font-medium rounded-full">
              {contacts.length} Pesan
            </span>
          </div>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Cari pesan berdasarkan nama atau email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all"
          />
        </div>
      </div>

      {/* Messages */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl p-5 shadow-sm animate-pulse">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-xl" />
                <div className="flex-1 space-y-2">
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
              className={`bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer ${
                !contact.is_read ? 'border-l-4 border-gold-500' : ''
              }`}
              onClick={() => handleViewDetail(contact)}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-semibold text-white ${
                    contact.is_read ? 'bg-gray-400' : 'bg-gold-500'
                  }`}
                >
                  {contact.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-navy-800">{contact.name}</h3>
                    {!contact.is_read && (
                      <span className="px-2 py-1 bg-gold-500/10 text-gold-600 text-xs font-medium rounded-full">
                        Baru
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-2">
                    {contact.email && (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {contact.email}
                      </span>
                    )}
                    {contact.phone && (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 00.948.684l1.498 7.493a1 1 0 00.502.756l2.048 1.029a11.042 11.042 0 005.516-5.516l-1.029-2.048a1 1 0 00-.756-.502L7.684 5.28a1 1 0 00-.684-.948A2 2 0 005 3H5z" />
                        </svg>
                        {contact.phone}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {new Date(contact.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-2">{contact.message}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {contact.is_read ? (
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  ) : (
                    <div className="w-3 h-3 bg-gold-500 rounded-full" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl p-12 text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-500">
            {searchQuery ? 'Tidak ada pesan yang sesuai.' : 'Belum ada pesan masuk.'}
          </p>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDetailModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-navy-800">{selectedContact.name}</h3>
                <p className="text-xs text-gray-500 mt-1">
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
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Contact Info */}
              <div className="space-y-3">
                <div>
                  <h4 className="text-xs font-semibold text-gray-700 uppercase mb-1">Email</h4>
                  {selectedContact.email ? (
                    <a
                      href={`mailto:${selectedContact.email}`}
                      className="text-navy-800 hover:text-gold-600 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {selectedContact.email}
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
                      className="text-navy-800 hover:text-gold-600 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 00.948.684l1.498 7.493a1 1 0 00.502.756l2.048 1.029a11.042 11.042 0 005.516-5.516l-1.029-2.048a1 1 0 00-.756-.502L7.684 5.28a1 1 0 00-.684-.948A2 2 0 005 3H5z" />
                      </svg>
                      {selectedContact.phone}
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
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {selectedContact.message}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="border-t border-gray-200 pt-4 flex gap-3">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Tutup
                </button>
                <button
                  onClick={() => setDeleteModal({ isOpen: true, id: selectedContact.id })}
                  className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m-7-3V5a2 2 0 012-2h3.5" />
                  </svg>
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