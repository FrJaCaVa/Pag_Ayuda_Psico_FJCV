'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Leaf, Mail, Lock, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useApp();

  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState('');
  const [erroresCampo, setErroresCampo] = useState<{ correo?: string; password?: string }>({});

  const validarFormulario = () => {
    const nuevosErrores: { correo?: string; password?: string } = {};
    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!correo.trim()) {
      nuevosErrores.correo = 'Por favor, ingresa tu correo electrónico.';
    } else if (!regexCorreo.test(correo)) {
      nuevosErrores.correo = 'Ingresa un formato de correo válido.';
    }

    if (!password) {
      nuevosErrores.password = 'Por favor, ingresa tu contraseña.';
    } else if (password.length < 8) {
      nuevosErrores.password = 'La contraseña debe tener al menos 8 caracteres.';
    }

    setErroresCampo(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorGeneral('');

    if (!validarFormulario()) return;

    const resultado = login(correo, password);
    if (!resultado.ok || !resultado.usuario) {
      setErrorGeneral(resultado.error || 'No pudimos iniciar sesión.');
      return;
    }

    router.push(resultado.usuario.rol === 'paciente' ? '/paciente' : '/psicologo');
  };

  return (
    <main className="min-h-[calc(100vh-72px)] py-8 sm:py-12 px-4 sm:px-6 flex items-center justify-center bg-gradient-to-b from-[#F6FFF8] via-[#FAFAFA] to-[#EAF4F4]">
      <div className="w-full max-w-5xl bg-white/95 backdrop-blur-sm border border-[#A4C3B2]/35 rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">
        {/* Columna Izquierda: Formulario (sin altura fija ni scroll interno) */}
        <div className="pt-8 sm:pt-12 pb-8 px-6 sm:px-12 flex flex-col justify-center">
          <div className="space-y-2 text-center lg:text-left mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#6B9080]/15 text-[#6B9080] mb-1">
              <Leaf className="w-6 h-6" aria-hidden="true" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#2F3E3B]">
              Bienvenido de nuevo
            </h1>
            <p className="text-sm text-[#526360]">
              Ingresa a tu cuenta para continuar tu proceso.
            </p>
          </div>

          {errorGeneral && (
            <div role="alert" className="flex items-start gap-3 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs mb-4">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <span>{errorGeneral}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="correo" className="block text-xs font-medium text-[#2F3E3B]">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#6B9080] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="correo"
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="tu.correo@ejemplo.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#A4C3B2]/60 bg-[#FAFAFA] text-xs text-[#2F3E3B] focus:outline-none focus:ring-2 focus:ring-[#6B9080]"
                />
              </div>
              {erroresCampo.correo && <p className="text-[11px] text-red-600 mt-1">{erroresCampo.correo}</p>}
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="block text-xs font-medium text-[#2F3E3B]">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#6B9080] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="password"
                  type={mostrarPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className="w-full pl-10 pr-11 py-2.5 rounded-2xl border border-[#A4C3B2]/60 bg-[#FAFAFA] text-xs text-[#2F3E3B] focus:outline-none focus:ring-2 focus:ring-[#6B9080]"
                />
                <button
                  type="button"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#687A76] hover:text-[#2F3E3B] focus:outline-none focus:ring-2 focus:ring-[#6B9080] rounded-lg p-1"
                >
                  {mostrarPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {erroresCampo.password && <p className="text-[11px] text-red-600 mt-1">{erroresCampo.password}</p>}
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#6B9080] hover:bg-[#5A7B6C] text-white font-medium text-xs sm:text-sm shadow-sm transition mt-2"
            >
              <span>Iniciar sesión</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center text-xs text-[#526360] mt-6">
            ¿Aún no tienes cuenta?{' '}
            <Link href="/registro" className="font-medium text-[#52796F] underline underline-offset-4">
              Crea tu espacio aquí
            </Link>
          </p>
        </div>

        {/* Columna Derecha: Imagen lateral fija con sticky */}
        <div className="hidden lg:block relative bg-[#EAF4F4]">
          <div className="sticky top-24 h-[calc(100vh-8rem)] min-h-[500px] w-full">
            <Image
              src="/images/login.jpg"
              alt="Ambiente acogedor y profesional que transmite tranquilidad para el inicio de sesión"
              fill
              className="object-cover"
              sizes="50vw"
            />
          </div>
        </div>
      </div>
    </main>
  );
}