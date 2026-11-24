'use client';

import React from 'react';
import Link from 'next/link';
import { Leaf } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function Navbar() {
  const { usuarioActual, logout } = useApp();

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (usuarioActual) {
      e.preventDefault();
      logout();
      // Recarga completa a la página de inicio para evitar que el guard detecte
      // la falta de sesión y redirija a /login antes de completar la navegación.
      window.location.href = '/';
    }
  };

  const ariaLabelLogo = usuarioActual
    ? 'Calma, cerrar sesión e ir al inicio'
    : 'Calma, ir al inicio';

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#A4C3B2]/30 px-4 sm:px-8 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Logo con manejo de cierre de sesión y redirección segura a / */}
        <Link
          href="/"
          onClick={handleLogoClick}
          aria-label={ariaLabelLogo}
          className="flex items-center gap-2.5 group focus:outline-none focus:ring-2 focus:ring-[#6B9080] rounded-2xl p-1"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#6B9080]/15 text-[#6B9080] flex items-center justify-center group-hover:bg-[#6B9080]/25 transition">
            <Leaf className="w-5 h-5" />
          </div>
          <span className="text-xl font-semibold tracking-tight text-[#2F3E3B]">
            Calma
          </span>
        </Link>

        {/* Acciones de navegación */}
        <nav className="flex items-center gap-3">
          {usuarioActual ? (
            <Link
              href={usuarioActual.rol === 'paciente' ? '/paciente' : '/psicologo'}
              className="px-4 py-2 rounded-2xl bg-[#6B9080] hover:bg-[#5A7B6C] text-white text-xs sm:text-sm font-medium transition shadow-sm"
            >
              Mi Panel
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 rounded-2xl text-xs sm:text-sm font-medium text-[#526360] hover:text-[#2F3E3B] hover:bg-[#F6FFF8] transition"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/registro"
                className="px-4 py-2 rounded-2xl bg-[#6B9080] hover:bg-[#5A7B6C] text-white text-xs sm:text-sm font-medium transition shadow-sm"
              >
                Registrarse
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}