'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { getOrganizationMembers, createMember, updateMember, deleteMember } from '@/lib/admin-api';
import { X, Upload, Trash2, Edit, Plus, User, GripVertical, Check } from 'lucide-react';

interface OrganizationMember {
  id: number;
  name: string;
  position: string;
  photo: string | null;
  is_active: boolean;
  order: number;
  created_at: string;
}

interface MemberFormData {
  name: string;
  position: string;
  photo: File | null;
  is_active: boolean;
  order: string;
}

// Default empty state
const defaultMembers: OrganizationMember[] = [];

const getImageUrl = (path: string | null): string | null => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return `http://localhost:8000/storage/${path}`;
};

async function triggerRevalidate() {
  try {
    await fetch('/api/revalidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: '/tentang-kami', tag: 'about' }),
    });
  } catch (revalidateError) {
    console.log('Revalidation failed, page will update in next ISR cycle');
  }
}

export default function AdminOrganizationPage() {
  const [members, setMembers] = useState<OrganizationMember[]>(defaultMembers);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState<OrganizationMember | null>(null);
  const [formData, setFormData] = useState<MemberFormData>({
    name: '',
    position: '',
    photo: null,
    is_active: true,
    order: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasFetched = useRef(false);

  const fetchMembers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getOrganizationMembers();
      if (response.success && response.data) {
        setMembers(response.data);
      }
    } catch (err) {
      console.error('Error fetching members:', err);
      setError('Gagal memuat data anggota');
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchMembers();
  }, [fetchMembers]);

  const openCreateModal = () => {
    setEditingMember(null);
    setPreviewPhoto(null);
    const nextOrder = members.length > 0 ? Math.max(...members.map(m => m.order)) + 1 : 1;
    setFormData({
      name: '',
      position: '',
      photo: null,
      is_active: true,
      order: String(nextOrder),
    });
    setShowModal(true);
  };

  const openEditModal = (member: OrganizationMember) => {
    setEditingMember(member);
    setPreviewPhoto(member.photo);
    setFormData({
      name: member.name,
      position: member.position,
      photo: null,
      is_active: member.is_active,
      order: String(member.order),
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingMember(null);
    setFormData({ name: '', position: '', photo: null, is_active: true, order: '' });
    setPreviewPhoto(null);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, photo: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const data = new FormData();
    data.append('name', formData.name);
    data.append('position', formData.position);
    data.append('is_active', formData.is_active ? '1' : '0');
    data.append('order', formData.order);
    if (formData.photo) {
      data.append('photo', formData.photo);
    }

    try {
      let response;
      if (editingMember) {
        response = await updateMember(editingMember.id, data);
      } else {
        response = await createMember(data);
      }

      if (response.success) {
        closeModal();
        fetchMembers();
        await triggerRevalidate();
      } else {
        alert(response.message || 'Terjadi kesalahan');
      }
    } catch (err) {
      console.error('Submit error:', err);
      alert('Terjadi kesalahan. Silakan coba lagi.');
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Yakin ingin menghapus anggota ini? Aksi ini tidak dapat dibatalkan.')) {
      try {
        const response = await deleteMember(id);
        if (response.success) {
          setMembers(prev => prev.filter(m => m.id !== id));
          await triggerRevalidate();
        } else {
          alert(response.message || 'Gagal menghapus');
        }
      } catch (err) {
        console.error('Delete error:', err);
        alert('Gagal menghapus anggota');
      }
    }
  };

  const handleToggleActive = async (member: OrganizationMember) => {
    const data = new FormData();
    data.append('name', member.name);
    data.append('position', member.position);
    data.append('is_active', member.is_active ? '0' : '1');
    data.append('order', String(member.order));
    data.append('_method', 'PUT');

    try {
      const response = await updateMember(member.id, data);
      if (response.success) {
        setMembers(prev =>
          prev.map(m => m.id === member.id ? { ...m, is_active: !m.is_active } : m)
        );
        await triggerRevalidate();
      }
    } catch (err) {
      console.error('Toggle error:', err);
    }
  };

  const filteredMembers = showActiveOnly
    ? members.filter(m => m.is_active)
    : members;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-800">Struktur Organisasi</h1>
          <p className="text-gray-500 text-sm">
            {filteredMembers.length} anggota {showActiveOnly ? 'aktif' : 'total'}
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-gold-500 hover:bg-gold-600 text-white font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tambah Anggota
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Filter Toggle */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => setShowActiveOnly(!showActiveOnly)}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              showActiveOnly ? 'bg-gold-500' : 'bg-gray-300'
            }`}
          >
            <div
              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                showActiveOnly ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </div>
          <span className="text-sm text-gray-700">Tampilkan hanya yang aktif</span>
        </label>
      </div>

      {/* Members Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-gray-200 rounded-full mb-4" />
                <div className="h-5 w-32 bg-gray-200 rounded mb-2" />
                <div className="h-4 w-24 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredMembers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              className={`bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all ${
                !member.is_active ? 'opacity-60' : ''
              }`}
            >
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  {getImageUrl(member.photo) ? (
                    <img
                      src={getImageUrl(member.photo)!}
                      alt={member.name}
                      className="w-20 h-20 rounded-full object-cover border-2 border-gray-100"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-100">
                      <User className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  {!member.is_active && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
                      <span className="text-white text-xs font-medium">Nonaktif</span>
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-navy-800 mb-1">{member.name}</h3>
                <p className="text-sm text-gray-500 mb-3">{member.position}</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(member)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleToggleActive(member)}
                    className={`p-2 rounded-lg transition-colors ${
                      member.is_active
                        ? 'text-amber-600 hover:bg-amber-50'
                        : 'text-green-600 hover:bg-green-50'
                    }`}
                    title={member.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                  >
                    {member.is_active ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(member.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl p-12 text-center">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Belum ada anggota organisasi</p>
          <button
            onClick={openCreateModal}
            className="mt-4 text-gold-600 hover:text-gold-700 font-medium"
          >
            + Tambah Anggota Baru
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={closeModal} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-navy-800">
                {editingMember ? 'Edit Anggota' : 'Tambah Anggota Baru'}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Photo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Foto</label>
                <div className="flex items-center gap-4">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors overflow-hidden border-2 border-dashed border-gray-300"
                  >
                    {previewPhoto ? (
                      <img src={previewPhoto} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Upload className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                  <div className="text-sm text-gray-500">
                    <p>Klik untuk upload foto</p>
                    <p className="text-xs mt-1">Format: JPG, PNG (maks. 2MB)</p>
                  </div>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                  placeholder="Masukkan nama"
                />
              </div>

              {/* Position */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jabatan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                  placeholder="Contoh: Ketua, Sekretaris, Bendahara"
                />
              </div>

              {/* Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Urutan</label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                  min="1"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                  placeholder="1"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-3">
                <div
                  onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                  className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${
                    formData.is_active ? 'bg-gold-500' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      formData.is_active ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </div>
                <span className="text-sm text-gray-700">
                  {formData.is_active ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-gold-500 text-white font-medium rounded-lg hover:bg-gold-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    editingMember ? 'Simpan Perubahan' : 'Tambah'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}