'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Phone,
  MessageCircle,
  Video,
  Send,
  X,
  ArrowLeft,
  ShieldAlert,
  Wind,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { LINEAS_EMERGENCIA_CHILE } from '@/lib/crisis';

interface MensajeChat {
  id: string;
  remitente: 'usuario' | 'psicologo' | 'sistema';
  texto: string;
  hora: string;
}

const RESPUESTAS_SIMULADAS = [
  'Hola, estoy aquí contigo. Respira hondo y dime, ¿qué es lo que más te abruma en este momento?',
  'Te escucho con atención y sin juicios. No estás solo o sola en esto.',
  'Vamos a ir paso a paso. Intenta exhalar lentamente mientras me cuentas cómo te sientes.',
  'Es completamente válido sentirse así ante una situación difícil. Estoy para acompañarte.',
  '¿Te gustaría que hagamos un breve ejercicio de respiración juntos para calmar un poco la tensión?',
];

export default function CrisisPage() {
  const { usuarioActual, psicologos, crearSolicitudCrisis } = useApp();

  const [alias, setAlias] = useState('');
  const [enChat, setEnChat] = useState(false);
  const [enVideo, setEnVideo] = useState(false);
  const [estadoConexion, setEstadoConexion] = useState<'inactivo' | 'conectando' | 'conectado'>('inactivo');
  const [psicologoAsignado, setPsicologoAsignado] = useState<string>('');

  const [mensajes, setMensajes] = useState<MensajeChat[]>([]);
  const [inputMensaje, setInputMensaje] = useState('');
  const [mostrarModalEmergencia, setMostrarModalEmergencia] = useState(false);

  const mensajesEndRef = useRef<HTMLDivElement>(null);

  const psicologosDisponibles = psicologos.filter((p) => p.disponibleAhoraCrisis);

  useEffect(() => {
    if (usuarioActual) {
      setAlias(usuarioActual.nombre);
    }
  }, [usuarioActual]);

  useEffect(() => {
    mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  const iniciarConexion = () => {
    setEstadoConexion('conectando');
    setEnChat(true);

    const psiElegido =
      psicologosDisponibles.length > 0
        ? psicologosDisponibles[Math.floor(Math.random() * psicologosDisponibles.length)]
        : null;

    const nombrePsi = psiElegido ? psiElegido.nombre : 'Psicólogo Voluntario de Turno';
    setPsicologoAsignado(nombrePsi);

    if (psiElegido) {
      crearSolicitudCrisis(alias.trim() || usuarioActual?.nombre || 'Anónimo', psiElegido.id);
    }

    setTimeout(() => {
      setEstadoConexion('conectado');
      const horaActual = new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
      setMensajes([
        {
          id: '1',
          remitente: 'sistema',
          texto: `Conectado de forma segura con ${nombrePsi}.`,
          hora: horaActual,
        },
        {
          id: '2',
          remitente: 'psicologo',
          texto: `Hola ${alias || usuarioActual?.nombre || 'amigo/a'}, gracias por escribir. Estoy aquí para escucharte y apoyarte en este momento. ¿Cómo te sientes?`,
          hora: horaActual,
        },
      ]);
    }, 2500);
  };

  const enviarMensaje = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMensaje.trim()) return;

    const horaActual = new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
    const nuevoMsg: MensajeChat = {
      id: Date.now().toString(),
      remitente: 'usuario',
      texto: inputMensaje.trim(),
      hora: horaActual,
    };

    setMensajes((prev) => [...prev, nuevoMsg]);
    setInputMensaje('');

    setTimeout(() => {
      const respuestaTexto =
        RESPUESTAS_SIMULADAS[Math.floor(Math.random() * RESPUESTAS_SIMULADAS.length)];
      const horaRespuesta = new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
      setMensajes((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          remitente: 'psicologo',
          texto: respuestaTexto,
          hora: horaRespuesta,
        },
      ]);
    }, 1500);
  };

  const terminarChat = () => {
    setEnChat(false);
    setEnVideo(false);
    setEstadoConexion('inactivo');
    setMensajes([]);
  };

  return (
    <div className="min-h-screen bg-[#F6FFF8] text-[#2F3E3B] flex flex-col">
      <header className="bg-white border-b border-[#A4C3B2]/30 px-4 sm:px-8 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[#52796F] hover:text-[#2F3E3B]">
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al inicio</span>
          </Link>
          <span className="text-xs font-medium text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            Apoyo Psicológico Inmediato y Gratuito
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8 space-y-8">
        {/* 1. Bloque Destacado de Líneas de Emergencia (OBLIGATORIO PRIMERO) */}
        <section className="bg-amber-50/80 border-2 border-amber-300 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-bold text-amber-900">
                Si estás en peligro inmediato, llama a emergencias
              </h1>
              <p className="text-xs sm:text-sm text-amber-800 leading-relaxed">
                Este espacio es de contención voluntaria. Si tu vida o la de alguien más corre peligro urgente, por favor comunícate de inmediato con las líneas oficiales de ayuda en Chile.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {LINEAS_EMERGENCIA_CHILE.map((linea) => (
              <div key={linea.id} className="bg-white border border-amber-200 rounded-2xl p-4 flex flex-col justify-between shadow-xs">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-amber-900">{linea.nombre}</span>
                  <p className="text-[11px] text-[#526360]">{linea.descripcion}</p>
                </div>
                <div className="pt-3 mt-3 border-t border-amber-100 flex items-center justify-between">
                  <span className="text-xs text-[#687A76]">{linea.disponibilidad}</span>
                  <a
                    href={`tel:${linea.numero.replace(/\s+/g, '')}`}
                    className="inline-flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow-xs"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{linea.numero}</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 2. Sección de Conexión con Psicólogos Voluntarios (Debajo de las líneas de emergencia) */}
        {!enChat ? (
          <section className="bg-white border border-[#A4C3B2]/40 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 text-center">
            <div className="max-w-lg mx-auto space-y-3">
              <h2 className="text-xl sm:text-2xl font-semibold text-[#2F3E3B]">
                Habla con un psicólogo voluntario ahora
              </h2>
              <p className="text-xs sm:text-sm text-[#526360] leading-relaxed">
                Contamos con profesionales dispuestos a brindarte escucha activa y contención emocional gratuita en este instante.
              </p>
            </div>

            {/* Cuántos psicólogos voluntarios están disponibles ahora */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#6B9080]/15 text-[#52796F] text-xs font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span>
                {psicologosDisponibles.length} psicólogo{psicologosDisponibles.length === 1 ? '' : 's'} voluntario{psicologosDisponibles.length === 1 ? '' : 's'} disponible{psicologosDisponibles.length === 1 ? '' : 's'} ahora
              </span>
            </div>

            {!usuarioActual && (
              <div className="max-w-xs mx-auto space-y-1 pt-2 text-left">
                <label htmlFor="alias-crisis" className="block text-xs font-medium text-[#2F3E3B]">
                  Tu alias o nombre (opcional)
                </label>
                <input
                  id="alias-crisis"
                  type="text"
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  placeholder="Ej. Anónimo o Camila"
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#A4C3B2]/60 bg-[#FAFAFA] text-xs text-[#2F3E3B]"
                />
              </div>
            )}

            <div className="pt-2">
              {psicologosDisponibles.length > 0 ? (
                <button
                  type="button"
                  onClick={iniciarConexion}
                  className="inline-flex items-center gap-2 bg-[#6B9080] hover:bg-[#5A7B6C] text-white font-medium px-8 py-3.5 rounded-2xl text-sm shadow-sm transition"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Conectar con un psicólogo</span>
                </button>
              ) : (
                <div className="max-w-md mx-auto p-5 bg-[#EAF4F4] rounded-2xl border border-[#A4C3B2]/30 space-y-3">
                  <p className="text-xs sm:text-sm text-[#2F3E3B] font-medium">
                    En este momento no hay psicólogos voluntarios en línea.
                  </p>
                  <p className="text-xs text-[#526360]">
                    Te invitamos a utilizar las líneas de emergencia superiores o realizar un ejercicio de respiración consciente.
                  </p>
                  <div className="pt-2">
                    <Link
                      href="/"
                      className="inline-flex items-center gap-2 bg-[#6B9080] text-white text-xs font-medium px-4 py-2 rounded-xl"
                    >
                      <Wind className="w-4 h-4" />
                      <span>Ir a inicio y respiración guiada</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </section>
        ) : (
          /* 3. Sala de Chat / Videollamada Simulada con requerimientos exactos */
          <section className="bg-white border border-[#A4C3B2]/40 rounded-3xl shadow-lg overflow-hidden flex flex-col h-[600px]">
            <div className="px-6 py-4 bg-[#F6FFF8] border-b border-[#A4C3B2]/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#6B9080]/20 text-[#6B9080] flex items-center justify-center font-semibold">
                  {psicologoAsignado.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#2F3E3B]">{psicologoAsignado}</h3>
                  <span className="text-[11px] text-emerald-700 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    {estadoConexion === 'conectado' ? 'En línea (Sesión protegida)' : 'Conectando...'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEnVideo(!enVideo)}
                  className="flex items-center gap-1.5 text-xs bg-[#EAF4F4] hover:bg-[#D9EBEB] text-[#52796F] px-3.5 py-2 rounded-2xl transition font-medium"
                >
                  <Video className="w-4 h-4" />
                  <span>{enVideo ? 'Volver al chat' : 'Cambiar a videollamada'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMostrarModalEmergencia(true)}
                  className="flex items-center gap-1.5 text-xs bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-3.5 py-2 rounded-2xl transition font-medium"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Necesito ayuda urgente</span>
                </button>

                <button
                  type="button"
                  onClick={terminarChat}
                  className="text-xs bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-700 px-3.5 py-2 rounded-2xl transition font-medium"
                >
                  Terminar chat
                </button>
              </div>
            </div>

            {/* Aviso permanente visible */}
            <div className="bg-amber-50/90 border-b border-amber-200 px-4 py-2 text-center text-[11px] text-amber-900 font-medium">
              ⚠️ Modo demostración: las respuestas son simuladas, no hay un profesional real al otro lado.
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#FAFAFA]">
              {estadoConexion === 'conectando' ? (
                <div className="h-full flex flex-col items-center justify-center space-y-3">
                  <div className="w-10 h-10 border-4 border-[#6B9080] border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-[#526360] font-medium">Conectando con un profesional...</p>
                </div>
              ) : enVideo ? (
                <div className="h-full flex flex-col items-center justify-center bg-[#2F3E3B] rounded-2xl text-white p-6 space-y-4">
                  <div className="w-24 h-24 rounded-full bg-[#6B9080]/40 flex items-center justify-center text-3xl font-semibold">
                    {psicologoAsignado.charAt(0)}
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-sm font-semibold">{psicologoAsignado}</p>
                    <p className="text-xs text-emerald-400">Videollamada segura en curso (Simulada)</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEnVideo(false)}
                    className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs rounded-xl font-medium transition"
                  >
                    Finalizar videollamada
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {mensajes.map((msg) => {
                    if (msg.remitente === 'sistema') {
                      return (
                        <div key={msg.id} className="text-center my-2">
                          <span className="text-[11px] bg-[#EAF4F4] text-[#52796F] px-3 py-1 rounded-full border border-[#A4C3B2]/30">
                            {msg.texto}
                          </span>
                        </div>
                      );
                    }

                    const esUsuario = msg.remitente === 'usuario';
                    return (
                      <div key={msg.id} className={`flex ${esUsuario ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-md rounded-2xl px-4 py-3 text-xs sm:text-sm space-y-1 ${
                            esUsuario
                              ? 'bg-[#6B9080] text-white rounded-br-sm'
                              : 'bg-white border border-[#A4C3B2]/40 text-[#2F3E3B] rounded-bl-sm shadow-xs'
                          }`}
                        >
                          <p className="leading-relaxed">{msg.texto}</p>
                          <span className={`block text-[10px] text-right ${esUsuario ? 'text-[#EAF4F4]/80' : 'text-[#687A76]'}`}>
                            {msg.hora}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={mensajesEndRef} />
                </div>
              )}
            </div>

            {!enVideo && estadoConexion === 'conectado' && (
              <form onSubmit={enviarMensaje} className="p-4 bg-white border-t border-[#A4C3B2]/30 flex items-center gap-2">
                <input
                  type="text"
                  value={inputMensaje}
                  onChange={(e) => setInputMensaje(e.target.value)}
                  placeholder="Escribe tu mensaje con tranquilidad..."
                  className="flex-1 px-4 py-3 rounded-2xl border border-[#A4C3B2]/60 bg-[#FAFAFA] text-xs sm:text-sm text-[#2F3E3B] focus:outline-none focus:ring-2 focus:ring-[#6B9080]"
                />
                <button
                  type="submit"
                  aria-label="Enviar mensaje"
                  className="p-3 rounded-2xl bg-[#6B9080] hover:bg-[#5A7B6C] text-white transition shadow-sm"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            )}
          </section>
        )}
      </main>

      {/* Modal Ayuda Urgente */}
      {mostrarModalEmergencia && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2F3E3B]/50 backdrop-blur-sm">
          <div className="bg-white border border-amber-300 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-amber-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <span>Líneas de Emergencia Oficiales</span>
              </h2>
              <button onClick={() => setMostrarModalEmergencia(false)} aria-label="Cerrar modal" className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              {LINEAS_EMERGENCIA_CHILE.map((l) => (
                <div key={l.id} className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-amber-900">{l.nombre}</p>
                    <p className="text-[11px] text-[#526360]">{l.numero}</p>
                  </div>
                  <a
                    href={`tel:${l.numero.replace(/\s+/g, '')}`}
                    className="bg-amber-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs"
                  >
                    Llamar
                  </a>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setMostrarModalEmergencia(false)}
              className="w-full py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-medium text-[#2F3E3B]"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      <footer className="bg-white py-8 px-4 sm:px-6 border-t border-[#A4C3B2]/30 text-center text-xs text-[#687A76] mt-auto">
        <p>© 2026 Calma. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}