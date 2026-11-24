'use client';

import React from 'react';
import Link from 'next/link';
import { LifeBuoy } from 'lucide-react';

export default function FloatingHelpButton() {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Link
        href="/crisis"
        className="flex items-center gap-2 bg-[#D97706] hover:bg-amber-700 text-white font-medium px-4 py-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-amber-300"
        aria-label="Ayuda inmediata y apoyo en crisis"
      >
        <LifeBuoy className="w-5 h-5 animate-pulse" />
        <span className="text-xs sm:text-sm font-semibold">Hablar con un psicólogo ahora</span>
      </Link>
    </div>
  );
}