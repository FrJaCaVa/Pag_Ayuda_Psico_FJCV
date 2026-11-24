'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users,
  CalendarDays,
  Smile,
  LogOut,
  Calendar,
  Search,
  Filter,
  Star,
  CheckCircle2,
  Video,
  MessageCircle,
  X,
  LifeBuoy,
  Ban,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Psicologo, ModalidadCita, Cita } from '@/lib/types';
import { ESPECIALIDADES_OPCIONES } from '@/lib/mockData';
import { obtenerEstadoTemporalCita, formatearTiempoRestante, formatearFechaLarga } from '@/lib/citasUtils';

export default function PacienteDashboardPage() {
  const router = useRouter();
  const {
    usuarioActual,
    cargando,
    logout,
    psicologos,
    citas,
    registrosAnimo,
    agregarCita,
    agregarRegistroAnimo,
    cancelarCita,
  } = useApp();

  const [pestanaActiva, setPestanaActiva] = useState<'directorio' | 'citas' | 'animo'>('directorio');

  // Reloj dinámico para actualizar el estado temporal sin recargar
  const [ahora, setAhora] = useState<Date | null>(null);

  useEffect(() => {
    setAhora(new Date());
    const intervalo = setInterval(() => {
      setAhora(new Date());
    }, 30000); // Cada 30 segundos
    return () => clearInterval(intervalo);
  }, []);

  const [busqueda, setBusqueda] = useState('');
  const [especialidadFiltro, setEspecialidadFiltro] = useState('');

  const [psicologoSeleccionado, setPsicologoSeleccionado] = useState<Psicologo | null>(null);
  const [fechaCita, setFechaCita] = useState('');
  const [horaCita, setHoraCita] = useState('');
  const [modalidadCita, setModalidadCita] = useState<ModalidadCita>('video');
  const [motivoCita, setMotivoCita] = useState('');
  const [mensajeExitoCita, setMensajeExitoCita] = useState('');

  const [citaACancelar, setCitaACancelar] = useState<Cita | null>(null);
  const [motivoCancelacion, setMotivoCancelacion] = useState('');

  const [nivelAnimo, setNivelAnimo] = useState<1 | 2 | 3 | 4 | 5>(4);
  const [notaAnimo, setNotaAnimo] = useState('');
  const [guardadoAnimoExito, setGuardadoAnimoExito] = useState(false);

  useEffect(() => {
    if (!cargando) {
      if (!usuarioActual || usuarioActual.rol !== 'paciente') {
        router.push('/login');
      }
    }
  }, [usuarioActual, cargando, router]);

  if (cargando || !usuarioActual || usuarioActual.rol !== 'paciente') {
    return (
      <div className="min-h-screen bg-[#F6FFF8] flex items-center justify-center text-[#526360]">
        <p className="animate-pulse">Cargando tu espacio seguro...</p>
      </div>
    );
  }

  const psicologosFiltrados = psicologos.filter((psi) => {
    const coincideNombre = psi.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const coincideEsp = !especialidadFiltro || psi.especialidades.includes(especialidadFiltro);
    return coincideNombre && coincideEsp;
  });

  const misCitas = citas.filter((c) => c.pacienteId === usuarioActual.id);
  const citasActivas = misCitas.filter((c) => c.estado !== 'cancelada');
  const citasCanceladas = misCitas.filter((c) => c.estado === 'cancelada');

  const misAnimos = registrosAnimo
    .filter((a) => a.pacienteId === usuarioActual.id)
    .sort((a, b) => {
      const fechaA = a.fecha ? new Date(a.fecha).getTime() : 0;
      const fechaB = b.fecha ? new Date(b.fecha).getTime() : 0;
      return fechaB - fechaA;
    });

  const handleAgendarCitaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!psicologoSeleccionado || !fechaCita || !horaCita) return;

    agregarCita({
      pacienteId: usuarioActual.id,
      pacienteNombre: usuarioActual.nombre,
      psicologoId: psicologoSeleccionado.id,
      psicologoNombre: psicologoSeleccionado.nombre,
      fecha: fechaCita,
      hora: horaCita,
      modalidad: modalidadCita,
      estado: 'pendiente',
      motivo: motivoCita || 'Consulta general de bienestar',
    });

    setMensajeExitoCita('¡Solicitud de cita enviada! El profesional la revisará pronto.');
    setTimeout(() => {
      setMensajeExitoCita('');
      setPsicologoSeleccionado(null);
      setFechaCita('');
      setHoraCita('');
      setMotivoCita('');
      setPestanaActiva('citas');
    }, 1800);
  };

  const handleConfirmarCancelacion = () => {
    if (!citaACancelar) return;
    cancelarCita(citaACancelar.id, 'paciente', motivoCancelacion);
    setCitaACancelar(null);
    setMotivoCancelacion('');
  };

  const esMenosDe24Horas = (fechaStr: string, horaStr: string) => {
    try {
      const fechaCitaObj = new Date(`${fechaStr}T${horaStr}:00`);
      const ahoraObj = new Date();
      const diferenciaMs = fechaCitaObj.getTime() - ahoraObj.getTime();
      const horasRestantes = diferenciaMs / (1000 * 60 * 60);
      return horasRestantes > 0 && horasRestantes < 24;
    } catch {
      return false;
    }
  };

  const handleGuardarAnimo = (e: React.FormEvent) => {
    e.preventDefault();
    agregarRegistroAnimo({
      pacienteId: usuarioActual.id,
      nivel: nivelAnimo,
      emociones: ['Tranquilo'],
      notaPersonal: notaAnimo.trim() || undefined,
    });
    setNotaAnimo('');
    setGuardadoAnimoExito(true);
    setTimeout(() => setGuardadoAnimoExito(false), 3000);
  };

  const estadosAnimoConfig = [
    { nivel: 1, emoji: '😢', label: 'Muy bajo' },
    { nivel: 2, emoji: '🙁', label: 'Desanimado' },
    { nivel: 3, emoji: '😐', label: 'Neutral' },
    { nivel: 4, emoji: '🙂', label: 'Tranquilo' },
    { nivel: 5, emoji: '😊', label: 'Muy bien' },
  ];

  return (
    <div className="min-h-screen bg-[#F6FFF8] text-[#2F3E3B] flex flex-col">
      <header className="bg-white border-b border-[#A4C3B2]/30 px-4 sm:px-8 py-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-12 h-12 rounded-2xl bg-[#6B9080]/15 text-[#6B9080] flex items-center justify-center font-semibold text-lg shrink-0">
              {usuarioActual.nombre.charAt(0)}
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-[#2F3E3B] truncate">
                Hola, {usuarioActual.nombre}
              </h1>
              <p className="text-xs text-[#526360]">Tu espacio personal de bienestar</p>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="w-full sm:w-auto flex items-center justify-center gap-2 text-xs font-medium text-[#687A76] hover:text-red-700 bg-[#FAFAFA] border border-[#A4C3B2]/40 px-3.5 py-2 rounded-2xl transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </header>

      <div className="max-w-6xl w-full mx-auto px-4 sm:px-8 pt-6">
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-3xl p-5 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 mx-auto">
              <LifeBuoy className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold">Apoyo en crisis, gratis las 24 horas</h2>
              <p className="text-xs text-amber-100">Contención emocional inmediata por chat o videollamada con psicólogos voluntarios.</p>
            </div>
          </div>
          <Link
            href="/crisis"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-amber-900 hover:bg-amber-50 font-semibold text-xs px-5 py-3 rounded-2xl transition shadow-sm"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Hablar con un psicólogo ahora</span>
          </Link>
        </div>
      </div>

      <div className="bg-[#EAF4F4]/50 border-b border-[#A4C3B2]/30 px-4 sm:px-8 overflow-x-auto mt-6">
        <div className="max-w-6xl mx-auto flex gap-2 py-3 min-w-max">
          <button
            type="button"
            onClick={() => setPestanaActiva('directorio')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-medium transition ${
              pestanaActiva === 'directorio' ? 'bg-[#6B9080] text-white shadow-sm' : 'text-[#526360] hover:bg-white/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Directorio de Psicólogos</span>
          </button>
          <button
            type="button"
            onClick={() => setPestanaActiva('citas')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-medium transition ${
              pestanaActiva === 'citas' ? 'bg-[#6B9080] text-white shadow-sm' : 'text-[#526360] hover:bg-white/60'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>Mis Sesiones ({citasActivas.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setPestanaActiva('animo')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-medium transition ${
              pestanaActiva === 'animo' ? 'bg-[#6B9080] text-white shadow-sm' : 'text-[#526360] hover:bg-white/60'
            }`}
          >
            <Smile className="w-4 h-4" />
            <span>Diario Emocional</span>
          </button>
        </div>
      </div>

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 space-y-6">
        {pestanaActiva === 'directorio' && (
          <div className="space-y-6">
            <div className="bg-white border border-[#A4C3B2]/40 rounded-3xl p-4 sm:p-5 shadow-sm space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="relative sm:col-span-2">
                  <Search className="w-4 h-4 text-[#687A76] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar por nombre de especialista..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#A4C3B2]/60 bg-[#FAFAFA] text-xs sm:text-sm text-[#2F3E3B] focus:outline-none focus:ring-2 focus:ring-[#6B9080]"
                  />
                </div>
                <div className="relative">
                  <Filter className="w-4 h-4 text-[#687A76] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={especialidadFiltro}
                    onChange={(e) => setEspecialidadFiltro(e.target.value)}
                    aria-label="Filtrar por especialidad"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#A4C3B2]/60 bg-[#FAFAFA] text-xs sm:text-sm text-[#2F3E3B] focus:outline-none focus:ring-2 focus:ring-[#6B9080] appearance-none"
                  >
                    <option value="">Todas las especialidades</option>
                    {ESPECIALIDADES_OPCIONES.map((esp) => (
                      <option key={esp} value={esp}>{esp}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {psicologosFiltrados.map((psi) => (
                <div key={psi.id} className="bg-white border border-[#A4C3B2]/40 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3.5">
                      <div className="relative w-14 h-14 rounded-full overflow-hidden bg-[#6B9080]/15 text-[#6B9080] flex items-center justify-center font-semibold text-xl shrink-0 border border-[#A4C3B2]/30">
                        {psi.foto ? (
                          <Image
                            src={psi.foto}
                            alt={`Fotografía de perfil de ${psi.nombre}`}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        ) : (
                          <span>{psi.nombre.replace(/^(Dra\.|Ps\.)\s*/, '').charAt(0)}</span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-[#2F3E3B]">{psi.nombre}</h3>
                        <p className="text-xs text-[#526360]">{psi.enfoque}</p>
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md mt-1">
                          <Star className="w-3 h-3 fill-current" /> {psi.calificacion} ({psi.totalResenas} reseñas)
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-[#526360] line-clamp-2">{psi.biografia}</p>
                  </div>
                  <div className="pt-4 border-t border-[#A4C3B2]/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-[#2F3E3B]">
                      {psi.tarifa ? `$${psi.tarifa.toLocaleString('es-CL')} / sesión` : 'Tarifa a consultar'}
                    </p>
                    <button
                      type="button"
                      onClick={() => setPsicologoSeleccionado(psi)}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#6B9080] hover:bg-[#5A7B6C] text-white text-xs font-medium px-4 py-2.5 rounded-2xl transition shadow-sm"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Agendar cita</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {pestanaActiva === 'citas' && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-[#2F3E3B]">Mis Sesiones Activas</h2>
              {citasActivas.length === 0 ? (
                <div className="bg-white border border-[#A4C3B2]/30 rounded-3xl p-8 text-center text-xs text-[#687A76]">
                  No tienes citas activas registradas.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {citasActivas.map((cita) => {
                    const esConfirmada = cita.estado === 'confirmada';
                    const esPendiente = cita.estado === 'pendiente';
                    const modalidad = cita.modalidad || 'video';

                    const estadoTemporal = ahora ? obtenerEstadoTemporalCita(cita.fecha, cita.hora, ahora) : 'proxima';
                    const tiempoRestanteStr = ahora ? formatearTiempoRestante(cita.fecha, cita.hora, ahora) : '';
                    const fechaLargaFormateada = formatearFechaLarga(cita.fecha);

                    return (
                      <div
                        key={cita.id}
                        className="bg-white border border-[#A4C3B2]/40 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            {esPendiente && (
                              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                                Pendiente de confirmación
                              </span>
                            )}
                            {esConfirmada && estadoTemporal === 'en_curso' && (
                              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse">
                                En curso
                              </span>
                            )}
                            {esConfirmada && estadoTemporal === 'proxima' && (
                              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                                Confirmada
                              </span>
                            )}
                            {esConfirmada && estadoTemporal === 'finalizada' && (
                              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-300">
                                Sesión finalizada
                              </span>
                            )}
                            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-[#EAF4F4] text-[#52796F] border border-[#A4C3B2]/40 flex items-center gap-1">
                              {modalidad === 'chat' ? <MessageCircle className="w-3 h-3" /> : <Video className="w-3 h-3" />}
                              {modalidad === 'chat' ? 'Chat' : 'Videollamada'}
                            </span>
                          </div>

                          <h3 className="text-base font-semibold text-[#2F3E3B]">{cita.psicologoNombre}</h3>
                          <p className="text-xs text-[#526360] capitalize">
                            📅 {fechaLargaFormateada}, {cita.hora} hrs. {cita.motivo ? `• Motivo: ${cita.motivo}` : ''}
                          </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 w-full sm:w-auto justify-end">
                          {esConfirmada && estadoTemporal !== 'finalizada' && (
                            <div className="flex flex-col items-end gap-1 w-full sm:w-auto">
                              <button
                                type="button"
                                disabled={estadoTemporal === 'proxima'}
                                aria-disabled={estadoTemporal === 'proxima'}
                                onClick={() => {
                                  if (estadoTemporal === 'en_curso') {
                                    alert(
                                      modalidad === 'chat'
                                        ? `Abriendo chat seguro con ${cita.psicologoNombre}...`
                                        : `Conectando a la videollamada con ${cita.psicologoNombre}...`
                                    );
                                  }
                                }}
                                className={`w-full sm:w-auto flex items-center justify-center gap-2 text-xs font-medium px-4 py-2.5 rounded-2xl transition shadow-sm ${
                                  estadoTemporal === 'proxima'
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none border border-gray-300'
                                    : 'bg-[#6B9080] hover:bg-[#5A7B6C] text-white'
                                }`}
                              >
                                {modalidad === 'chat' ? <MessageCircle className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                                <span>{modalidad === 'chat' ? 'Unirse al chat' : 'Unirse a la videollamada'}</span>
                              </button>

                              {estadoTemporal === 'proxima' && (
                                <span className="text-[11px] text-[#687A76]">
                                  Se habilita 10 minutos antes de la hora ({tiempoRestanteStr})
                                </span>
                              )}
                            </div>
                          )}

                          {esConfirmada && estadoTemporal === 'finalizada' && (
                            <span className="text-xs text-[#687A76] italic bg-[#FAFAFA] px-3 py-2 rounded-2xl border border-[#A4C3B2]/30">
                              Sesión finalizada
                            </span>
                          )}

                          {(esPendiente || (esConfirmada && estadoTemporal !== 'finalizada')) && (
                            <button
                              type="button"
                              onClick={() => setCitaACancelar(cita)}
                              className="flex items-center gap-1.5 text-xs text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-3.5 py-2.5 rounded-2xl transition font-medium"
                            >
                              <Ban className="w-4 h-4" />
                              <span>Cancelar cita</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Citas Canceladas */}
            {citasCanceladas.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-[#A4C3B2]/30">
                <h2 className="text-base font-semibold text-[#687A76]">Historial de Citas Canceladas</h2>
                <div className="grid grid-cols-1 gap-4">
                  {citasCanceladas.map((cita) => {
                    let fechaCancelacionFormateada = '';
                    if (cita.fechaCancelacion) {
                      try {
                        fechaCancelacionFormateada = new Date(cita.fechaCancelacion).toLocaleString('es-CL', {
                          dateStyle: 'long',
                          timeStyle: 'short',
                        });
                      } catch {
                        fechaCancelacionFormateada = cita.fechaCancelacion;
                      }
                    }

                    const quienCanceloTexto =
                      cita.canceladaPor === 'paciente' ? 'Cancelada por ti' : 'Cancelada por el psicólogo/a';
                    const fechaLargaFormateada = formatearFechaLarga(cita.fecha);

                    return (
                      <div key={cita.id} className="bg-gray-50 border border-gray-200 rounded-3xl p-5 shadow-xs space-y-2 opacity-85">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-red-50 text-red-800 border border-red-200">
                            {quienCanceloTexto}
                          </span>
                        </div>
                        <h3 className="text-base font-semibold text-[#2F3E3B]">{cita.psicologoNombre}</h3>
                        <p className="text-xs text-[#526360] capitalize">
                          📅 {fechaLargaFormateada}, {cita.hora} hrs.
                        </p>
                        {cita.motivoCancelacion && (
                          <p className="text-xs text-[#687A76] italic">
                            Motivo: &quot;{cita.motivoCancelacion}&quot;
                          </p>
                        )}
                        {fechaCancelacionFormateada && (
                          <p className="text-[11px] text-[#687A76]">Cancelada el {fechaCancelacionFormateada}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {pestanaActiva === 'animo' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-white border border-[#A4C3B2]/40 rounded-3xl p-6 shadow-sm space-y-6">
              <h2 className="text-base font-semibold text-[#2F3E3B]">¿Cómo te sientes hoy?</h2>
              {guardadoAnimoExito && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>¡Registro guardado!</span>
                </div>
              )}
              <form onSubmit={handleGuardarAnimo} className="space-y-5">
                <div className="grid grid-cols-5 gap-1">
                  {estadosAnimoConfig.map((item) => (
                    <button
                      key={item.nivel}
                      type="button"
                      onClick={() => setNivelAnimo(item.nivel as any)}
                      className={`flex flex-col items-center gap-1 p-2 rounded-2xl border transition ${
                        nivelAnimo === item.nivel ? 'bg-[#6B9080]/15 border-[#6B9080]' : 'bg-[#FAFAFA] border-[#A4C3B2]/40'
                      }`}
                    >
                      <span className="text-xl sm:text-2xl">{item.emoji}</span>
                      <span className="text-[9px] sm:text-[10px] text-[#526360] truncate">{item.label}</span>
                    </button>
                  ))}
                </div>
                <textarea
                  rows={3}
                  value={notaAnimo}
                  onChange={(e) => setNotaAnimo(e.target.value)}
                  placeholder="Nota personal (opcional)..."
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-[#A4C3B2]/60 bg-[#FAFAFA] text-xs text-[#2F3E3B]"
                />
                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-[#6B9080] hover:bg-[#5A7B6C] text-white font-medium text-xs shadow-sm"
                >
                  Guardar registro
                </button>
              </form>
            </div>
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-lg font-semibold text-[#2F3E3B]">Tus registros anteriores</h2>
              {misAnimos.length === 0 ? (
                <div className="bg-white border border-[#A4C3B2]/30 rounded-3xl p-8 text-center text-xs text-[#687A76]">
                  Aún no tienes registros en tu diario emocional.
                </div>
              ) : (
                misAnimos.map((reg) => {
                  const cfg = estadosAnimoConfig.find((e) => e.nivel === reg.nivel) || estadosAnimoConfig[3];
                  
                  let fechaFormateada = 'Sin fecha';
                  if (reg.fecha) {
                    try {
                      fechaFormateada = new Date(reg.fecha).toLocaleString('es-CL', {
                        dateStyle: 'full',
                        timeStyle: 'short',
                      });
                    } catch {
                      fechaFormateada = reg.fecha;
                    }
                  }

                  return (
                    <div key={reg.id} className="bg-white border border-[#A4C3B2]/40 rounded-3xl p-5 flex items-start gap-4 shadow-sm">
                      <span className="text-2xl mt-0.5">{cfg.emoji}</span>
                      <div className="space-y-1 flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                          <p className="text-sm font-semibold text-[#2F3E3B]">{cfg.label}</p>
                          <span className="text-[11px] text-[#687A76] capitalize">{fechaFormateada}</span>
                        </div>
                        {reg.notaPersonal && <p className="text-xs text-[#526360]">{reg.notaPersonal}</p>}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </main>

      {citaACancelar && (
        <div role="dialog" aria-modal="true" aria-label="Modal de confirmación de cancelación" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2F3E3B]/50 backdrop-blur-sm">
          <div className="bg-white border border-[#A4C3B2]/50 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-[#2F3E3B]">Cancelar sesión</h2>
              <button onClick={() => setCitaACancelar(null)} aria-label="Cerrar modal" className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            
            <p className="text-xs sm:text-sm text-[#2F3E3B] font-medium">
              ¿Seguro que quieres cancelar esta sesión?
            </p>

            {esMenosDe24Horas(citaACancelar.fecha, citaACancelar.hora) && (
              <div role="alert" className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-2xl">
                ⚠️ Faltan menos de 24 horas. Si puedes, avisa con anticipación para que otra persona use ese horario.
              </div>
            )}

            <div className="space-y-1">
              <label htmlFor="motivo-cancelacion-paciente" className="block text-xs font-medium text-[#2F3E3B]">Motivo (opcional)</label>
              <textarea
                id="motivo-cancelacion-paciente"
                rows={3}
                value={motivoCancelacion}
                onChange={(e) => setMotivoCancelacion(e.target.value)}
                placeholder="Escribe el motivo de la cancelación..."
                className="w-full px-3.5 py-2.5 rounded-2xl border border-[#A4C3B2]/60 bg-[#FAFAFA] text-xs text-[#2F3E3B]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCitaACancelar(null)}
                className="px-4 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-xs font-medium text-[#2F3E3B] transition"
              >
                Volver
              </button>
              <button
                type="button"
                onClick={handleConfirmarCancelacion}
                className="px-4 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-medium transition shadow-sm"
              >
                Sí, cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {psicologoSeleccionado && (
        <div role="dialog" aria-modal="true" aria-label="Modal de agendamiento de cita" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2F3E3B]/50 backdrop-blur-sm">
          <div className="bg-white border border-[#A4C3B2]/50 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-[#A4C3B2]/30 flex items-center justify-between bg-[#F6FFF8]">
              <h2 className="text-base font-semibold text-[#2F3E3B] truncate pr-2">Agendar con {psicologoSeleccionado.nombre}</h2>
              <button onClick={() => setPsicologoSeleccionado(null)} aria-label="Cerrar modal" className="shrink-0"><X className="w-5 h-5" /></button>
            </div>
            {mensajeExitoCita ? (
              <div className="p-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <p className="text-sm font-semibold text-[#2F3E3B]">{mensajeExitoCita}</p>
              </div>
            ) : (
              <form onSubmit={handleAgendarCitaSubmit} className="p-6 space-y-4 overflow-y-auto">
                <div>
                  <label htmlFor="fecha-cita-input" className="block text-xs font-medium text-[#2F3E3B]">Fecha</label>
                  <input
                    id="fecha-cita-input"
                    type="date"
                    required
                    value={fechaCita}
                    onChange={(e) => setFechaCita(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#A4C3B2]/60 bg-[#FAFAFA] text-xs text-[#2F3E3B]"
                  />
                </div>
                <div>
                  <label htmlFor="hora-cita-select" className="block text-xs font-medium text-[#2F3E3B]">Hora</label>
                  <select
                    id="hora-cita-select"
                    required
                    value={horaCita}
                    onChange={(e) => setHoraCita(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#A4C3B2]/60 bg-[#FAFAFA] text-xs text-[#2F3E3B]"
                  >
                    <option value="">Selecciona horario</option>
                    {psicologoSeleccionado.disponibilidad.flatMap((d) => d.horas).map((h, i) => (
                      <option key={i} value={h}>{h} hrs.</option>
                    ))}
                  </select>
                </div>
                <div>
                  <span className="block text-xs font-medium text-[#2F3E3B]">Modalidad de sesión</span>
                  <div className="grid grid-cols-2 gap-3 mt-1">
                    <button
                      type="button"
                      onClick={() => setModalidadCita('video')}
                      className={`py-2 px-3 rounded-2xl text-xs font-medium border flex items-center justify-center gap-2 ${
                        modalidadCita === 'video' ? 'bg-[#6B9080] text-white border-[#6B9080]' : 'bg-[#FAFAFA] text-[#2F3E3B] border-[#A4C3B2]/40'
                      }`}
                    >
                      <Video className="w-4 h-4" />
                      <span>Videollamada</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalidadCita('chat')}
                      className={`py-2 px-3 rounded-2xl text-xs font-medium border flex items-center justify-center gap-2 ${
                        modalidadCita === 'chat' ? 'bg-[#6B9080] text-white border-[#6B9080]' : 'bg-[#FAFAFA] text-[#2F3E3B] border-[#A4C3B2]/40'
                      }`}
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Chat</span>
                    </button>
                  </div>
                </div>
                <div>
                  <label htmlFor="motivo-cita-input" className="block text-xs font-medium text-[#2F3E3B]">Motivo breve (opcional)</label>
                  <input
                    id="motivo-cita-input"
                    type="text"
                    value={motivoCita}
                    onChange={(e) => setMotivoCita(e.target.value)}
                    placeholder="Ej. Ansiedad"
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#A4C3B2]/60 bg-[#FAFAFA] text-xs text-[#2F3E3B]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-[#6B9080] hover:bg-[#5A7B6C] text-white text-xs font-medium shadow-sm transition"
                >
                  Enviar solicitud de cita
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}