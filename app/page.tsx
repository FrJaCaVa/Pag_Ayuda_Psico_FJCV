import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Heart,
  Users,
  Sparkles,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 sm:py-20 px-4 sm:px-6 bg-gradient-to-b from-[#F6FFF8] via-[#FAFAFA] to-[#EAF4F4]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-[#6B9080]/15 text-[#52796F] px-4 py-2 rounded-full text-xs sm:text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              <span>Un espacio seguro y confidencial para tu bienestar</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-[#2F3E3B] leading-tight">
              Cuidar de tu salud mental <br />
              <span className="text-[#6B9080]">nunca fue tan cercano</span>
            </h1>

            <p className="text-base sm:text-lg text-[#526360] max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Conecta con psicólogos profesionales certificados. Agenda sesiones online, lleva un diario de
              emociones y avanza a tu propio ritmo en un entorno cálido y sin juicios.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="/registro"
                className="w-full sm:w-auto flex items-center justify-center gap-2 py-3.5 px-7 rounded-2xl bg-[#6B9080] hover:bg-[#5A7B6C] text-white font-medium shadow-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6B9080]"
              >
                <span>Busco apoyo psicológico</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>

              <Link
                href="/registro"
                className="w-full sm:w-auto flex items-center justify-center gap-2 py-3.5 px-7 rounded-2xl bg-white border border-[#A4C3B2] hover:bg-[#F6FFF8] text-[#2F3E3B] font-medium transition focus:outline-none focus:ring-2 focus:ring-[#6B9080]"
              >
                <Users className="w-4 h-4 text-[#6B9080]" aria-hidden="true" />
                <span>Soy profesional</span>
              </Link>
            </div>
          </div>

          <div className="relative w-full h-[320px] sm:h-[420px] rounded-3xl overflow-hidden shadow-lg border border-[#A4C3B2]/30">
            <Image
              src="/images/hero.jpg"
              alt="Persona en un ambiente tranquilo y luminoso recibiendo apoyo psicológico en línea"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      {/* Sección "Cómo funciona" en 3 pasos con imágenes */}
      <section className="py-20 px-4 sm:px-6 bg-white border-t border-[#A4C3B2]/20">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-semibold tracking-tight text-[#2F3E3B]">
              Cómo funciona Calma
            </h2>
            <p className="text-sm text-[#526360] max-w-md mx-auto">
              Tres simples pasos para comenzar tu proceso de acompañamiento psicológico.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#F6FFF8] border border-[#A4C3B2]/40 rounded-3xl p-6 space-y-5 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <div className="relative w-full h-48 rounded-2xl overflow-hidden shadow-sm">
                  <Image
                    src="/images/paso-1.jpg"
                    alt="Persona creando su cuenta de usuario en la plataforma digital"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="flex items-center gap-2 text-[#6B9080]">
                  <div className="w-8 h-8 rounded-xl bg-[#6B9080] text-white flex items-center justify-center font-semibold text-sm">
                    1
                  </div>
                  <h3 className="text-lg font-semibold text-[#2F3E3B]">Crea tu cuenta</h3>
                </div>
                <p className="text-sm text-[#526360] leading-relaxed">
                  Regístrate como paciente indicando tus motivos de consulta y preferencias en pocos segundos.
                </p>
              </div>
            </div>

            <div className="bg-[#F6FFF8] border border-[#A4C3B2]/40 rounded-3xl p-6 space-y-5 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <div className="relative w-full h-48 rounded-2xl overflow-hidden shadow-sm">
                  <Image
                    src="/images/paso-2.jpg"
                    alt="Explorando el directorio de psicólogos profesionales y verificados"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="flex items-center gap-2 text-[#6B9080]">
                  <div className="w-8 h-8 rounded-xl bg-[#6B9080] text-white flex items-center justify-center font-semibold text-sm">
                    2
                  </div>
                  <h3 className="text-lg font-semibold text-[#2F3E3B]">Elige un especialista</h3>
                </div>
                <p className="text-sm text-[#526360] leading-relaxed">
                  Explora perfiles verificados, especialidades, enfoques terapéuticos y horarios disponibles.
                </p>
              </div>
            </div>

            <div className="bg-[#F6FFF8] border border-[#A4C3B2]/40 rounded-3xl p-6 space-y-5 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <div className="relative w-full h-48 rounded-2xl overflow-hidden shadow-sm">
                  <Image
                    src="/images/paso-3.jpg"
                    alt="Paciente participando en una sesión de bienestar en línea"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="flex items-center gap-2 text-[#6B9080]">
                  <div className="w-8 h-8 rounded-xl bg-[#6B9080] text-white flex items-center justify-center font-semibold text-sm">
                    3
                  </div>
                  <h3 className="text-lg font-semibold text-[#2F3E3B]">Inicia tu sesión</h3>
                </div>
                <p className="text-sm text-[#526360] leading-relaxed">
                  Agenda tu cita en línea, conéctate mediante videollamada y lleva seguimiento de tu bienestar.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cierre */}
      <section className="py-16 px-4 sm:px-6 bg-[#EAF4F4]/50 border-t border-[#A4C3B2]/20 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#6B9080]/15 text-[#6B9080]">
            <Heart className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-semibold text-[#2F3E3B]">
            Un espacio creado para tu tranquilidad
          </h2>
          <p className="text-sm text-[#526360] leading-relaxed">
            Creemos que la salud mental debe ser accesible, humana y respetuosa de tus tiempos.
            Comienza hoy a dar el primer paso hacia tu bienestar.
          </p>
          <div className="pt-2">
            <Link
              href="/registro"
              className="inline-flex items-center gap-2 py-3 px-6 rounded-xl bg-[#6B9080] hover:bg-[#5A7B6C] text-white font-medium text-sm transition shadow-sm"
            >
              <span>Comenzar ahora</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Pie de página con año fijo 2026 */}
      <footer className="bg-white py-8 px-4 sm:px-6 border-t border-[#A4C3B2]/30 text-center text-xs text-[#687A76]">
        <p>© 2026 Calma. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}