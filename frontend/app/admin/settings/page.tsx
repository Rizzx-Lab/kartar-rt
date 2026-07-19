'use client';

import { useState, useEffect } from 'react';
import { getSettings, updateSettings } from '@/lib/admin-api';

interface Settings {
  site_name: string;
  site_tagline: string;
  address: string;
  phone: string;
  email: string;
  whatsapp: string;
  instagram: string;
  facebook: string;
  about_image: string | null;
  about_title: string;
  about_description: string;
  about_quote: string;
  show_testimonials: boolean;
  testimonials_auto_scroll: boolean;
  gallery_auto_scroll: boolean;
  gallery_scroll_speed: number;
}

// Initialize with default values for new fields
const getInitialSettings = () => ({
  site_name: '',
  site_tagline: '',
  address: '',
  phone: '',
  email: '',
  whatsapp: '',
  instagram: '',
  facebook: '',
  about_image: null as string | null,
  about_title: '',
  about_description: '',
  about_quote: '',
  show_testimonials: true,
  testimonials_auto_scroll: true,
  gallery_auto_scroll: true,
  gallery_scroll_speed: 30,
});

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Partial<Settings>>(getInitialSettings());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aboutImagePreview, setAboutImagePreview] = useState<string | null>(null);
  const [aboutImageFile, setAboutImageFile] = useState<File | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    const response = await getSettings();
    if (response.success && response.data) {
      // Merge with initial settings to ensure all fields exist
      setSettings({ ...getInitialSettings(), ...response.data });
      // Set about image preview if exists
      if (response.data.about_image) {
        setAboutImagePreview(response.data.about_image);
      }
    } else {
      setSettings(getInitialSettings());
    }
    setIsLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      // Create FormData for file upload
      const formData = new FormData();

      // List of all field keys to always include
      const fieldKeys = [
        'site_name', 'site_tagline', 'address', 'phone', 'email',
        'whatsapp', 'instagram', 'facebook',
        'about_title', 'about_description', 'about_quote',
        'show_testimonials', 'gallery_auto_scroll', 'gallery_scroll_speed'
      ];

      // Add all text settings
      fieldKeys.forEach(key => {
        const value = settings[key as keyof typeof settings];
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      // Add image file if changed
      if (aboutImageFile) {
        formData.append('about_image', aboutImageFile);
        console.log('Uploading image:', aboutImageFile.name, aboutImageFile.size, 'bytes');
      }

      console.log('Saving settings with FormData, about_title:', settings.about_title);
      const response = await updateSettings(formData, aboutImageFile !== null);
      console.log('Response:', response);

      if (response.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        // Fetch ulang data dari server untuk sinkronisasi
        const freshData = await getSettings();
        if (freshData.success && freshData.data) {
          setSettings({ ...getInitialSettings(), ...freshData.data });
          if (freshData.data.about_image) {
            setAboutImagePreview(freshData.data.about_image);
          }
          setAboutImageFile(null);
        }
      } else {
        console.log('Save failed:', response.message);
        setError(response.message || 'Gagal menyimpan pengaturan.');
      }
    } catch (err) {
      console.error('Save error:', err);
      setError('Terjadi kesalahan saat menyimpan.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-48 bg-gray-200 animate-pulse rounded mb-2" />
          <div className="h-4 w-32 bg-gray-200 animate-pulse rounded" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm space-y-4">
              <div className="h-6 w-48 bg-gray-200 animate-pulse rounded" />
              <div className="space-y-3">
                <div className="h-4 w-full bg-gray-200 animate-pulse rounded" />
                <div className="h-10 bg-gray-200 animate-pulse rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-800">Pengaturan</h1>
        <p className="text-gray-500 text-sm">Kelola pengaturan website</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Site Info */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-gold-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-navy-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="font-semibold text-navy-800">Informasi Website</h2>
                <p className="text-xs text-gray-500">Pengaturan umum website</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Website</label>
                <input
                  type="text"
                  value={settings.site_name || ''}
                  onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tagline</label>
                <input
                  type="text"
                  value={settings.site_tagline || ''}
                  onChange={(e) => setSettings({ ...settings, site_tagline: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* About / Siapa Kami Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h2 className="font-semibold text-navy-800">Tentang Kami</h2>
                <p className="text-xs text-gray-500">Pengaturan section "Siapa Kami" di halaman Tentang</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* About Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Foto Siapa Kami</label>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {aboutImagePreview || settings.about_image ? (
                      <div className="relative">
                        <img
                          src={aboutImagePreview || settings.about_image || ''}
                          alt="About Preview"
                          className="w-32 h-32 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setAboutImagePreview(null);
                            setAboutImageFile(null);
                            setSettings({ ...settings, about_image: null });
                          }}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setAboutImageFile(file);
                          setAboutImagePreview(URL.createObjectURL(file));
                        }
                      }}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gold-50 file:text-navy-900 hover:file:bg-gold-100"
                    />
                    <p className="mt-1 text-xs text-gray-500">PNG, JPG, atau WEBP. Maksimal 2MB.</p>
                  </div>
                </div>
              </div>

              {/* About Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Judul</label>
                <input
                  type="text"
                  value={settings.about_title || ''}
                  onChange={(e) => setSettings({ ...settings, about_title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-colors"
                  placeholder="Contoh: Armalo Eluf"
                />
              </div>

              {/* About Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label>
                <textarea
                  value={settings.about_description || ''}
                  onChange={(e) => setSettings({ ...settings, about_description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 resize-none transition-colors"
                  placeholder="Deskripsi tentang organisasi..."
                />
              </div>

              {/* About Quote */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kutipan</label>
                <input
                  type="text"
                  value={settings.about_quote || ''}
                  onChange={(e) => setSettings({ ...settings, about_quote: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-colors"
                  placeholder="Contoh: Sederhana tempat kami, tapi besar semangat kami."
                />
              </div>
            </div>
          </div>

          
          {/* Contact Info */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="font-semibold text-navy-800">Informasi Kontak</h2>
                <p className="text-xs text-gray-500">Kontak yang ditampilkan di website</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Alamat</label>
                <input
                  type="text"
                  value={settings.address || ''}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-colors"
                  placeholder="Jalan, Kota, Provinsi"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Telepon</label>
                <input
                  type="text"
                  value={settings.phone || ''}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-colors"
                  placeholder="+62 XXX XXX XXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={settings.email || ''}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-colors"
                  placeholder="contact@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp</label>
                <input
                  type="text"
                  value={settings.whatsapp || ''}
                  onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                  placeholder="62xxxxxxxxxx"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-pink-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              <div>
                <h2 className="font-semibold text-navy-800">Media Sosial</h2>
                <p className="text-xs text-gray-500">Link media sosial organisasi</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
                <input
                  type="text"
                  value={settings.instagram || ''}
                  onChange={(e) => setSettings({ ...settings, instagram: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-colors"
                  placeholder="https://instagram.com/username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Facebook</label>
                <input
                  type="text"
                  value={settings.facebook || ''}
                  onChange={(e) => setSettings({ ...settings, facebook: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-colors"
                  placeholder="https://facebook.com/username"
                />
              </div>
            </div>
          </div>

          {/* Website Display Settings */}
          <div className="bg-white rounded-xl p-6 shadow-sm lg:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              </div>
              <div>
                <h2 className="font-semibold text-navy-800">Pengaturan Tampilan</h2>
                <p className="text-xs text-gray-500">Kontrol elemen yang ditampilkan di website</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Toggle: Show Testimonials */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">Tampilkan Testimoni</p>
                  <p className="text-xs text-gray-500 mt-1">Section testimoni di halaman utama</p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    // Konversi ke boolean dengan aman
                    const currentValue = settings.show_testimonials === true;
                    const newValue = !currentValue;

                    // Update state dulu (optimistic update)
                    setSettings({ ...settings, show_testimonials: newValue });

                    // Auto-save ke backend
                    const response = await updateSettings({ show_testimonials: newValue });
                    if (response.success) {
                      setSaved(true);
                      setTimeout(() => setSaved(false), 3000);
                    }
                  }}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    settings.show_testimonials === true ? 'bg-gold-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      settings.show_testimonials === true ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Toggle: Gallery Auto Scroll */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">Auto Scroll Galeri</p>
                  <p className="text-xs text-gray-500 mt-1">Foto galeri auto scroll ke atas</p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    // Konversi ke boolean dengan aman
                    const currentValue = settings.gallery_auto_scroll !== false;
                    const newValue = !currentValue;

                    // Update state dulu (optimistic update)
                    setSettings({ ...settings, gallery_auto_scroll: newValue });

                    // Auto-save ke backend
                    const response = await updateSettings({ gallery_auto_scroll: newValue });
                    if (response.success) {
                      setSaved(true);
                      setTimeout(() => setSaved(false), 3000);
                    }
                  }}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    settings.gallery_auto_scroll !== false ? 'bg-gold-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      settings.gallery_auto_scroll !== false ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Gallery Scroll Speed */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium text-gray-800">Kecepatan Scroll Galeri</p>
                    <p className="text-xs text-gray-500 mt-1">Dalam detik (30 = normal, 60 = lambat, 15 = cepat)</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="10"
                    max="60"
                    value={settings.gallery_scroll_speed || 30}
                    onChange={(e) => setSettings({ ...settings, gallery_scroll_speed: parseInt(e.target.value) })}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="w-12 text-center font-medium text-gray-800">
                    {settings.gallery_scroll_speed || 30}s
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm">{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Save Button */}
        <div className="flex items-center justify-end gap-4">
          {saved && (
            <span className="text-green-600 text-sm font-medium flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Tersimpan!
            </span>
          )}
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4m-1 5m1-5a1 1 0 11-2 0 1 1 0 012 0zm0 5a1 1 0 11-2 0 1 1 0 012 0z" />
            </svg>
            {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </form>
    </div>
  );
}