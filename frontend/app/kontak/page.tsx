import { Metadata } from 'next';
import { getContactInfo } from '@/lib/api';
import { ContactContent } from '@/components/ui/contact-content';

// ISR - Revalidate every 5 minutes
export const revalidate = 300;

// SEO Metadata
export const metadata: Metadata = {
  title: 'Kontak',
  description: 'Hubungi Karang Taruna Armalo Eluf untuk pertanyaan dan partisipasi.',
};

interface ContactInfo {
  address: string;
  phone: string;
  email: string | null;
  maps_embed: string | null;
}

// Server Component - Data fetched at build/request time
async function getContactData(): Promise<ContactInfo> {
  try {
    const response = await getContactInfo();
    if (response.success && response.data) {
      return response.data;
    }
  } catch (error) {
    console.error('Error fetching contact:', error);
  }

  // Default fallback
  return {
    address: 'Jl. Manukan Lor 3F RT 06 RW 12, Surabaya',
    phone: '081234567890',
    email: 'kontak@armaloeluf.id',
    maps_embed: null,
  };
}

export default async function ContactPage() {
  const contactInfo = await getContactData();

  return<ContactContent contactInfo={contactInfo} />;
}