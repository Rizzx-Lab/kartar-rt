'use client';

import { useState } from 'react';
import { submitContact } from '@/lib/api';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle,
  MessageCircle,
  Navigation,
} from 'lucide-react';

interface ContactInfo {
  address: string;
  phone: string;
  email: string | null;
  maps_embed: string | null;
}

interface ContactContentProps {
  contactInfo: ContactInfo;
}

export function ContactContent({ contactInfo }: ContactContentProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await submitContact({
        name: formData.name,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        message: formData.message,
      });

      if (response.success) {
        setIsSubmitted(true);
        setFormData({ name: '', email: '', phone: '', message: '' });
        setTimeout(() => setIsSubmitted(false), 5000);
      } else {
        setError(response.message || 'Gagal mengirim pesan.');
      }
    } catch (err) {
      console.error('Error submitting contact:', err);
      setError('Gagal mengirim pesan. Silakan coba lagi.');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <section className="bg-navy-900 pt-24 pb-14 md:pt-28 md:pb-20 relative overflow-hidden">
        <div className="absolute top-10 right-10 w-72 h-72 bg-gold-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-navy-500/30 rounded-full blur-3xl" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 text-gold-500 text-sm font-semibold mb-4 uppercase tracking-wider">
              <span className="w-8 h-px bg-gold-500" />
              Hubungi Kami
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              Tetap Terhubung
            </h1>
            <p className="text-gray-300 text-base md:text-lg leading-relaxed">
              Punya pertanyaan, saran, atau ingin berpartisipasi dalam kegiatan kami?
              Jangan ragu untuk menghubungi.
</p>
          </div>
        </div>
      </section>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 mx-4 mt-4 rounded-lg max-w-6xl mx-auto">
          {error}
        </div>
      )}

      {/* Main Content */}
      <section className="py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Contact Info - Left Side */}
            <div className="lg:col-span-2">
              <h2 className="text-lg font-bold text-navy-900 mb-5">
                Informasi Kami
              </h2>

              <div className="space-y-4">
                {/* Address */}
                <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gold-500/10 rounded-xl flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-gold-600" />
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Alamat</span>
                      <p className="text-navy-900 font-semibold mt-1">{contactInfo.address}</p>
                    </div>
                  </div>
                </div>

                {/* Phone */}
                <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Telepon</span>
                      <a
                        href={`tel:${contactInfo.phone}`}
                        className="text-navy-900 font-semibold mt-1 block hover:text-gold-600 transition-colors"
                      >
                        {contactInfo.phone}
                      </a>
                    </div>
                  </div>
                </div>

                {/* WhatsApp CTA */}
                <a
                  href={`https://wa.me/${contactInfo.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-emerald-500 hover:bg-emerald-600 rounded-xl p-5 shadow-sm transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0 animate-pulse">
                      <MessageCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <span className="text-white/80 text-sm font-medium">Chat WhatsApp</span>
                      <p className="text-white font-bold mt-0.5">Hubungi via WhatsApp</p>
                    </div>
                    <Navigation className="w-5 h-5 text-white/70 ml-auto" />
                  </div>
                </a>

                {/* Email */}
                {contactInfo.email && (
                  <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center shrink-0">
                        <Mail className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email</span>
                        <a
                          href={`mailto:${contactInfo.email}`}
                          className="text-navy-900 font-semibold mt-1 block hover:text-gold-600 transition-colors"
                        >
                          {contactInfo.email}
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Operating Hours */}
                <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Jam Operasional</span>
                      <p className="text-navy-900 font-semibold mt-1">Senin - Sabtu</p>
                      <p className="text-gray-600 text-sm">08.00 - 17.00 WIB</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map */}
              <div className="mt-6">
                <h3 className="text-sm font-bold text-navy-900 mb-3">
                  Lokasi Kami
                </h3>
                <div className="aspect-video bg-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <iframe
                    src={contactInfo.maps_embed || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3957.4!2d112.6677!3d-7.2575!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sJl.+Manukan+Lor+3F+RT+06+RW+12+Surabaya!5e0!3m2!1sid!2sid!4v1"}
                    className="w-full h-full border-0"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
            </div>

            {/* Contact Form - Right Side */}
            <div className="lg:col-span-3">
              <h2 className="text-lg font-bold text-navy-900 mb-5">
                Kirim Pesan
              </h2>

              {isSubmitted ? (
                <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold text-navy-900 mb-2">
                    Pesan Terkirim!
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Terima kasih telah menghubungi kami. Pesan Anda telah diterima dan akan segera direspons.
                  </p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="px-6 py-2.5 bg-navy-900 hover:bg-navy-800 text-white font-medium rounded-full transition-colors"
                  >
                    Kirim Pesan Lagi
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="bg-white rounded-2xl p-6 md:p-8 shadow-sm"
                >
                  <div className="space-y-5">
                    {/* Name */}
                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold text-navy-900 mb-2">
                        Nama Lengkap <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all bg-gray-50 focus:bg-white"
                        placeholder="Nama Anda"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-navy-900 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all bg-gray-50 focus:bg-white"
                        placeholder="email@contoh.com"
                      />
                      <p className="text-xs text-gray-500 mt-1">Opsional</p>
                    </div>

                    {/* Phone */}
                    <div>
                      <label htmlFor="phone" className="block text-sm font-semibold text-navy-900 mb-2">
                        Nomor WhatsApp
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all bg-gray-50 focus:bg-white"
                        placeholder="08xxxxxxxxxx"
                      />
                      <p className="text-xs text-gray-500 mt-1">Opsional, untuk respons lebih cepat</p>
                    </div>

                    {/* Message */}
                    <div>
                      <label htmlFor="message" className="block text-sm font-semibold text-navy-900 mb-2">
                        Pesan <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        required
                        rows={6}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all resize-none bg-gray-50 focus:bg-white"
                        placeholder="Tulis pesan Anda di sini..."
                      />
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-navy-900 hover:bg-navy-800 text-white font-semibold rounded-xl transition-all disabled:opacity-60"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Mengirim...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Kirim Pesan
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-xs text-gray-500 text-center mt-4">
                    Kami akan merespons pesan Anda secepat mungkin.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}