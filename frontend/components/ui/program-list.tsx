'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calendar, Repeat, Clock, ArrowRight, Sparkles } from 'lucide-react';

interface Program {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  frequency: 'monthly' | 'yearly' | 'once' | 'irregular';
  cover_image: string | null;
  order: number;
}

const frequencyConfig = {
  monthly: {
    label: 'Bulanan',
    icon: Repeat,
    bgColor: 'bg-emerald-500',
    textColor: 'text-emerald-600',
  },
  yearly: {
    label: 'Tahunan',
    icon: Calendar,
    bgColor: 'bg-blue-500',
    textColor: 'text-blue-600',
  },
  once: {
    label: 'Sekali',
    icon: Sparkles,
    bgColor: 'bg-purple-500',
    textColor: 'text-purple-600',
  },
  irregular: {
    label: 'Tidak Rutin',
    icon: Clock,
    bgColor: 'bg-amber-500',
    textColor: 'text-amber-600',
  },
};

const getImageUrl = (path: string | null): string | null => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return `http://localhost:8000/storage/${path}`;
};

interface ProgramListProps {
  programs: Program[];
}

export function ProgramList({ programs }: ProgramListProps) {
  const [selectedFrequency, setSelectedFrequency] = useState('all');

  const filteredPrograms = selectedFrequency === 'all'
    ? programs
    : programs.filter(p => p.frequency === selectedFrequency);

  return (
    <div>
      <div className="bg-white border-b border-gray-100 shadow-sm" style={{ position: 'sticky', top: 0, zIndex: 30 }}>
        <div className="py-4 sm:py-5 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="text-sm font-semibold text-gray-700 mr-1 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filter:
              </span>
              {[
                { value: 'all', label: 'Semua' },
                { value: 'monthly', label: 'Bulanan' },
                { value: 'yearly', label: 'Tahunan' },
                { value: 'once', label: 'Sekali' },
                { value: 'irregular', label: 'Tidak Rutin' },
              ].map((filter) => {
                const isActive = selectedFrequency === filter.value;
                return (
                  <button
                    key={filter.value}
                    onClick={() => setSelectedFrequency(filter.value)}
                    className={`px-3 sm:px-5 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-navy-900 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <section className="py-10 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredPrograms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredPrograms.map((program) => {
                const freq = frequencyConfig[program.frequency];
                const Icon = freq.icon;
                const hasImage = getImageUrl(program.cover_image);

                return (
                  <Link key={program.id} href={`/kegiatan/${program.slug}`}>
                    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                      <div className="relative h-40 overflow-hidden">
                        {hasImage ? (
                          <img
                            src={getImageUrl(program.cover_image)!}
                            alt={program.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-navy-100 to-navy-200" />
                        )}
                        <div className="absolute inset-0 bg-navy-900/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-white font-semibold text-sm flex items-center gap-2">
                            Lihat Detail
                            <ArrowRight className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                      <div className="p-5 flex-1 flex flex-col -mt-2">
                        <div className={`inline-flex items-center gap-1.5 ${freq.bgColor} px-3 py-1 rounded-full self-start mb-3`}>
                          <Icon className="w-3 h-3 text-white" />
                          <span className="text-white text-xs font-semibold">{freq.label}</span>
                        </div>
                        <h3 className="font-bold text-navy-900 text-base mb-2 group-hover:text-gold-600 transition-colors">
                          {program.name}
                        </h3>
                        {program.description && (
                          <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 flex-1">
                            {program.description}
                          </p>
                        )}
                        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                          <span className={`text-xs font-medium ${freq.textColor}`}>
                            #{program.order}
                          </span>
                          <span className="text-gold-600 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                            Eksplorasi
                            <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-500">
                Tidak ada program{selectedFrequency !== 'all' ? ' dengan filter tersebut' : ''}.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
