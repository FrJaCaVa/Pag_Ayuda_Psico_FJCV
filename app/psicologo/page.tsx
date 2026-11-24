'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  CalendarDays,
  LogOut,
  CheckCircle2,
  XCircle,
  Video,
  MessageCircle,
  FileText,
  ShieldCheck,
  HeartHandshake,
  Plus,
  Trash2,
  AlertCircle,
  Ban,
  X,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Cita } from '@/lib/types';
import { obtenerEstadoTemporalCita, formatearTiempoRestante, formatearFechaLarga } from '@/lib/citasUtils';

export default function PsicologoDashboardPage() {
  const router = useRouter();
  const {
    usuarioActual,
    cargando,
    logout,
    citas,
    actualizarEstadoCita,
    cancelarCita,
    notasClinicas,
    agregarNotaClinica,
    pacientes,
    psicologos,
    guardarPsicologos,
    solicitudesCrisis,
    actualizarEstadoSolicitudCrisis,
  } = useApp();

  const [pestanaActiva, setPestanaActiva] = useState<'citas' | 'crisis_solicitudes' | 'pacientes' | 'notas' | 'crisis'>('citas');

  // Reloj dinámico para actualizar el estado temporal sin recargar
  const [ahora, setAhora] = useState<Date | null>(null);

  useEffect(() => {
    setAhora(new Date());
    const intervalo = setInterval(() => {
      setAhora(new Date());
    }, 30000); // Cada 30 segundos
    return () => clearInterval(intervalo);
  }, []);

  const [pacienteSeleccionadoId, setPacienteSeleccionadoId] = useState('');
  const [tituloNota, setTituloNota] = useState('');
  const [contenidoNota, setContenidoNota] = useState('');
  const [notaGuardadaExito, setNotaGuardadaExito] = useState(false);

  const [citaACancelarPsico, setCitaACancelarPsico] = useState<Cita | null>(null);
  const [motivoCancelacionPsico, setMotivoCancelacionPsico] = useState('');

  const [voluntarioCrisis, setVoluntarioCrisis] = useState(false);
  const [disponibleAhoraCrisis, setDisponibleAhoraCrisis] = useState(false);
  const [turnosCrisis, setTurnosCrisis] = useState<string[]>([]);
  const [nuevoDia, setNuevoDia] = useState('Lunes');
  const [nuevoHorario, setNuevoHorario] = useState('08:00 - 14:00');
  const [crisisGuardadaExito, setCrisisGuardadaExito] = useState(false);

  useEffect(() => {
    if (!cargando) {
      if (!usuarioActual || usuarioActual.rol !== 'psicologo') {
        router.push('/login');
      } else {
        const psiActual = psicologos.find((p) => p.id === usuarioActual.id);
        if (psiActual) {
          setVoluntarioCrisis(psiActual.voluntarioCrisis || false);
          setDisponibleAhoraCrisis(psiActual.disponibleAhoraCrisis || false);
          setTurnosCrisis(psiActual.turnosCrisis || []);
        }
      }
    }
  }, [usuarioActual, cargando, router, psicologos]);

  if (cargando || !usuarioActual || usuarioActual.rol !== 'psicologo') {
    return (
      <div className="min-h-screen bg-[#F6FFF8] flex items-center justify-center text-[#526360]">
        <p className="animate-pulse">Cargando panel profesional...</p>
      </div>
    );
  }

  const psiActualObjeto = psicologos.find((p) => p.id === usuarioActual.id);
  const estaVerificado = psiActualObjeto?.estadoVerificacion === 'Verificado';

  const misCitas = citas.filter((c) => c.psicologoId === usuarioActual.id);
  const citasActivas = misCitas.filter((c) => c.estado !== 'cancelada');
  const citasCanceladas = misCitas.filter((c) => c.estado === 'cancelada');

  const misNotas = notasClinicas.filter((n) => n.psicologoId === usuarioActual.id);
  const misSolicitudesCrisis = solicitudesCrisis.filter((s) => s.psicologoId === usuarioActual.id);

  const pacientesIdsAtendidos = Array.from(new Set(citasActivas.map((c) => c.pacienteId)));
  const misPacientes = pacientes.filter((p) => pacientesIdsAtendidos.includes(p.id));

  const handleGuardarNota = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pacienteSeleccionadoId || !tituloNota.trim() || !contenidoNota.trim()) return;

    agregarNotaClinica({
      psicologoId: usuarioActual.id,
      pacienteId: pacienteSeleccionadoId,
      fecha: new Date().toISOString(),
      titulo: tituloNota.trim(),
      contenido: contenidoNota.trim(),
      privada: true,
    });

    setTituloNota('');
    setContenidoNota('');
    setNotaGuardadaExito(true);
    setTimeout(() => setNotaGuardadaExito(false), 3000);
  };

  const handleConfirmarCancelacionPsico = () => {
    if (!citaACancelarPsico) return;
    cancelarCita(citaACancelarPsico.id, 'psicologo', motivoCancelacionPsico);
    setCitaACancelarPsico(null);
    setMotivoCancelacionPsico('');
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

  const agregarTurno = () => {
    const turnoStr = `${nuevoDia} ${nuevoHorario}`;
    if (!turnosCrisis.includes(turnoStr)) {
      const actualizados = [...turnosCrisis, turnoStr];
      setTurnosCrisis(actualizados);
      actualizarPerfilCrisis(voluntarioCrisis, disponibleAhoraCrisis, actualizados);
    }
  };

  const eliminarTurno = (turnoStr: string) => {
    const actualizados = turnosCrisis.filter((t) => t !== turnoStr);
    setTurnosCrisis(actualizados);
    actualizarPerfilCrisis(voluntarioCrisis, disponibleAhoraCrisis, actualizados);
  };

  const actualizarPerfilCrisis = (vol: boolean, disp: boolean, turnos: string[]) => {
    if (!estaVerificado) return;

    const psicologosActualizados = psicologos.map((psi) => {
      if (psi.id === usuarioActual.id) {
        return {
          ...psi,
          voluntarioCrisis: vol,
          disponibleAhoraCrisis: disp,
          turnosCrisis: turnos,
        };
      }
      return psi;
    });

    guardarPsicologos(psicologosActualizados);
    setCrisisGuardadaExito(true);
    setTimeout(() => setCrisisGuardadaExito(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#F6FFF8] text-[#2F3E3B] flex flex-col">
      <header className="bg-white border-b border-[#A4C3B2]/30 px-4 sm:px-8 py-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-12 h-12 rounded-2xl bg-[#6B9080]/15 text-[#6B9080] flex items-center justify-center font-semibold text-lg shrink-0">
              {usuarioActual.nombre.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-[#2F3E3B] truncate">
                  {usuarioActual.nombre}
                </h1>
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                    estaVerificado
                      ? 'text-emerald-800 bg-emerald-50 border-emerald-200'
                      : 'text-amber-800 bg-amber-50 border-amber-200'
                  }`}
                >
                  <ShieldCheck className="w-3 h-3" /> {psiActualObjeto?.estadoVerificacion || 'Verificado'}
                </span>
              </div>
              <p className="text-xs text-[#526360]">Panel Profesional de Psicología</p>
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

      <div className="bg-[#EAF4F4]/50 border-b border-[#A4C3B2]/30 px-4 sm:px-8 overflow-x-auto">
        <div className="max-w-6xl mx-auto flex gap-2 py-3 min-w-max">
          <button
            type="button"
            onClick={() => setPestanaActiva('citas')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-medium transition ${
              pestanaActiva === 'citas' ? 'bg-[#6B9080] text-white shadow-sm' : 'text-[#526360] hover:bg-white/60'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>Agenda y Solicitudes ({citasActivas.length})</span>
          </button>
          {disponibleAhoraCrisis && (
            <button
              type="button"
              onClick={() => setPestanaActiva('crisis_solicitudes')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-medium transition relative ${
                pestanaActiva === 'crisis_solicitudes' ? 'bg-amber-600 text-white shadow-sm' : 'bg-amber-50 text-amber-900 border border-amber-200'
              }`}
            >
              <AlertCircle className="w-4 h-4 animate-bounce" />
              <span>Solicitudes de crisis ({misSolicitudesCrisis.filter(s => s.estado === 'esperando').length})</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setPestanaActiva('crisis')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-medium transition ${
              pestanaActiva === 'crisis' ? 'bg-[#6B9080] text-white shadow-sm' : 'text-[#526360] hover:bg-white/60'
            }`}
          >
            <HeartHandshake className="w-4 h-4" />
            <span>Configurar Apoyo en Crisis</span>
          </button>
          <button
            type="button"
            onClick={() => setPestanaActiva('pacientes')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-medium transition ${
              pestanaActiva === 'pacientes' ? 'bg-[#6B9080] text-white shadow-sm' : 'text-[#526360] hover:bg-white/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Mis Pacientes ({misPacientes.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setPestanaActiva('notas')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-medium transition ${
              pestanaActiva === 'notas' ? 'bg-[#6B9080] text-white shadow-sm' : 'text-[#526360] hover:bg-white/60'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Notas Clínicas</span>
          </button>
        </div>
      </div>

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 space-y-6">
        {pestanaActiva === 'citas' && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-[#2F3E3B]">Agenda y Solicitudes Activas</h2>
              {citasActivas.length === 0 ? (
                <div className="bg-white border border-[#A4C3B2]/30 rounded-3xl p-8 text-center text-xs text-[#687A76]">
                  No hay solicitudes ni citas activas agendadas aún.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {citasActivas.map((cita) => {
                    const esPendiente = cita.estado === 'pendiente';
                    const esConfirmada = cita.estado === 'confirmada';
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
                                Pendiente de aprobación
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

                          <h3 className="text-base font-semibold text-[#2F3E3B]">Paciente: {cita.pacienteNombre}</h3>
                          <p className="text-xs text-[#526360] capitalize">
                            📅 {fechaLargaFormateada}, {cita.hora} hrs. {cita.motivo ? `• Motivo: ${cita.motivo}` : ''}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                          {esPendiente ? (
                            <>
                              <button
                                type="button"
                                onClick={() => actualizarEstadoCita(cita.id, 'confirmada')}
                                className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium px-3.5 py-2 rounded-2xl transition shadow-sm"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Aceptar</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => actualizarEstadoCita(cita.id, 'rechazada')}
                                className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-medium px-3.5 py-2 rounded-2xl transition"
                              >
                                <XCircle className="w-4 h-4" />
                                <span>Rechazar</span>
                              </button>
                            </>
                          ) : esConfirmada ? (
                            <div className="flex flex-col items-end gap-1 w-full sm:w-auto">
                              <div className="flex items-center gap-2 w-full sm:w-auto">
                                <button
                                  type="button"
                                  disabled={estadoTemporal === 'proxima' || estadoTemporal === 'finalizada'}
                                  aria-disabled={estadoTemporal === 'proxima' || estadoTemporal === 'finalizada'}
                                  onClick={() => {
                                    if (estadoTemporal === 'en_curso') {
                                      alert(
                                        modalidad === 'chat'
                                          ? `Abriendo chat seguro con ${cita.pacienteNombre}...`
                                          : `Iniciando sala de videollamada con ${cita.pacienteNombre}...`
                                      );
                                    }
                                  }}
                                  className={`flex items-center gap-2 text-xs font-medium px-4 py-2.5 rounded-2xl transition shadow-sm ${
                                    estadoTemporal === 'proxima' || estadoTemporal === 'finalizada'
                                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none border border-gray-300'
                                      : 'bg-[#6B9080] hover:bg-[#5A7B6C] text-white'
                                  }`}
                                >
                                  {modalidad === 'chat' ? <MessageCircle className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                                  <span>{modalidad === 'chat' ? 'Iniciar chat' : 'Iniciar videollamada'}</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setCitaACancelarPsico(cita)}
                                  className="flex items-center gap-1.5 text-xs text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-3.5 py-2.5 rounded-2xl transition font-medium"
                                >
                                  <Ban className="w-4 h-4" />
                                  <span>Cancelar cita</span>
                                </button>
                              </div>

                              {estadoTemporal === 'proxima' && (
                                <span className="text-[11px] text-[#687A76]">
                                  Se habilita 10 minutos antes de la hora ({tiempoRestanteStr})
                                </span>
                              )}
                            </div>
                          ) : null}
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
                      cita.canceladaPor === 'paciente' ? 'Cancelada por el paciente' : 'Cancelada por ti';
                    const fechaLargaFormateada = formatearFechaLarga(cita.fecha);

                    return (
                      <div key={cita.id} className="bg-gray-50 border border-gray-200 rounded-3xl p-5 shadow-xs space-y-2 opacity-85">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-red-50 text-red-800 border border-red-200">
                            {quienCanceloTexto}
                          </span>
                        </div>
                        <h3 className="text-base font-semibold text-[#2F3E3B]">Paciente: {cita.pacienteNombre}</h3>
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

        {citaACancelarPsico && (
          <div role="dialog" aria-modal="true" aria-label="Modal de confirmación de cancelación" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2F3E3B]/50 backdrop-blur-sm">
            <div className="bg-white border border-[#A4C3B2]/50 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-[#2F3E3B]">Cancelar sesión</h2>
                <button onClick={() => setCitaACancelarPsico(null)} aria-label="Cerrar modal" className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
              </div>

              <p className="text-xs sm:text-sm text-[#2F3E3B] font-medium">
                ¿Seguro que quieres cancelar esta sesión?
              </p>

              {esMenosDe24Horas(citaACancelarPsico.fecha, citaACancelarPsico.hora) && (
                <div role="alert" className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-2xl">
                  ⚠️ Faltan menos de 24 horas. Se notificará al paciente sobre la cancelación de este horario.
                </div>
              )}

              <div className="space-y-1">
                <label htmlFor="motivo-cancelacion-psicologo" className="block text-xs font-medium text-[#2F3E3B]">Motivo (opcional)</label>
                <textarea
                  id="motivo-cancelacion-psicologo"
                  rows={3}
                  value={motivoCancelacionPsico}
                  onChange={(e) => setMotivoCancelacionPsico(e.target.value)}
                  placeholder="Escribe el motivo de la cancelación..."
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-[#A4C3B2]/60 bg-[#FAFAFA] text-xs text-[#2F3E3B]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCitaACancelarPsico(null)}
                  className="px-4 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-xs font-medium text-[#2F3E3B] transition"
                >
                  Volver
                </button>
                <button
                  type="button"
                  onClick={handleConfirmarCancelacionPsico}
                  className="px-4 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-medium transition shadow-sm"
                >
                  Sí, cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {pestanaActiva === 'crisis_solicitudes' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-[#2F3E3B]">Solicitudes de Crisis Entrantes</h2>
            {misSolicitudesCrisis.length === 0 ? (
              <div className="bg-white border border-[#A4C3B2]/30 rounded-3xl p-8 text-center text-xs text-[#687A76]">
                No hay solicitudes de crisis pendientes en este momento.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {misSolicitudesCrisis.map((sol) => (
                  <div key={sol.id} className="bg-amber-50/50 border border-amber-300 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                        {sol.estado === 'esperando' ? 'Esperando atención' : 'Atendido'}
                      </span>
                      <h3 className="text-base font-bold text-[#2F3E3B]">Paciente: {sol.pacienteNombre}</h3>
                      <p className="text-xs text-[#526360]">Solicitud recibida para contención inmediata.</p>
                    </div>
                    <div>
                      {sol.estado === 'esperando' ? (
                        <button
                          type="button"
                          onClick={() => {
                            actualizarEstadoSolicitudCrisis(sol.id, 'atendiendo');
                            alert(`Atendiendo solicitud de crisis de ${sol.pacienteNombre}...`);
                          }}
                          className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-5 py-2.5 rounded-2xl transition shadow-sm"
                        >
                          Atender
                        </button>
                      ) : (
                        <span className="text-xs text-emerald-700 font-semibold">En atención</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {pestanaActiva === 'crisis' && (
          <div className="space-y-6 max-w-2xl">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-[#2F3E3B]">Apoyo en Crisis y Primeros Auxilios Psicológicos</h2>
              <p className="text-xs text-[#526360]">
                Participa como voluntario para brindar contención emocional gratuita a personas que lo necesiten urgentemente.
              </p>
            </div>

            {!estaVerificado && (
              <div role="alert" className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Tu perfil se encuentra actualmente <strong>En revisión</strong>. Para activar tu participación como voluntario de crisis y recibir solicitudes, tu cuenta debe estar verificada.
                </span>
              </div>
            )}

            {crisisGuardadaExito && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>¡Cambios de apoyo en crisis guardados con éxito!</span>
              </div>
            )}

            <div className="bg-white border border-[#A4C3B2]/40 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-5 border-b border-[#A4C3B2]/30">
                <div className="space-y-0.5">
                  <span className="text-sm font-semibold text-[#2F3E3B]">Participar como voluntario de crisis</span>
                  <p className="text-xs text-[#526360]">Habilita tu perfil para recibir solicitudes de apoyo gratuito.</p>
                </div>
                <button
                  type="button"
                  disabled={!estaVerificado}
                  onClick={() => {
                    const nuevoVal = !voluntarioCrisis;
                    setVoluntarioCrisis(nuevoVal);
                    if (!nuevoVal) setDisponibleAhoraCrisis(false);
                    actualizarPerfilCrisis(nuevoVal, nuevoVal ? disponibleAhoraCrisis : false, turnosCrisis);
                  }}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition ${
                    !estaVerificado ? 'opacity-50 cursor-not-allowed bg-gray-200' : voluntarioCrisis ? 'bg-[#6B9080]' : 'bg-gray-300'
                  }`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${voluntarioCrisis ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between pb-5 border-b border-[#A4C3B2]/30">
                <div className="space-y-0.5">
                  <span className="text-sm font-semibold text-[#2F3E3B]">Estoy disponible ahora</span>
                  <p className="text-xs text-[#526360]">Indica que estás conectado para recibir solicitudes de crisis en este momento.</p>
                </div>
                <button
                  type="button"
                  disabled={!estaVerificado || !voluntarioCrisis}
                  onClick={() => {
                    const nuevoDisp = !disponibleAhoraCrisis;
                    setDisponibleAhoraCrisis(nuevoDisp);
                    actualizarPerfilCrisis(voluntarioCrisis, nuevoDisp, turnosCrisis);
                  }}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition ${
                    !estaVerificado || !voluntarioCrisis ? 'opacity-50 cursor-not-allowed bg-gray-200' : disponibleAhoraCrisis ? 'bg-emerald-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${disponibleAhoraCrisis ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="space-y-3">
                <span className="block text-sm font-semibold text-[#2F3E3B]">Tus turnos asignados</span>
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    disabled={!estaVerificado || !voluntarioCrisis}
                    value={nuevoDia}
                    onChange={(e) => setNuevoDia(e.target.value)}
                    aria-label="Selecciona el día de la semana"
                    className="px-3 py-2 rounded-2xl border border-[#A4C3B2]/60 bg-[#FAFAFA] text-xs text-[#2F3E3B]"
                  >
                    <option value="Lunes">Lunes</option>
                    <option value="Martes">Martes</option>
                    <option value="Miércoles">Miércoles</option>
                    <option value="Jueves">Jueves</option>
                    <option value="Viernes">Viernes</option>
                    <option value="Sábado">Sábado</option>
                    <option value="Domingo">Domingo</option>
                  </select>
                  <input
                    type="text"
                    disabled={!estaVerificado || !voluntarioCrisis}
                    value={nuevoHorario}
                    onChange={(e) => setNuevoHorario(e.target.value)}
                    placeholder="Ej. 00:00 - 06:00"
                    className="flex-1 px-3 py-2 rounded-2xl border border-[#A4C3B2]/60 bg-[#FAFAFA] text-xs text-[#2F3E3B]"
                  />
                  <button
                    type="button"
                    disabled={!estaVerificado || !voluntarioCrisis}
                    onClick={agregarTurno}
                    className="flex items-center justify-center gap-1 bg-[#6B9080] hover:bg-[#5A7B6C] disabled:opacity-50 text-white text-xs font-medium px-4 py-2 rounded-2xl transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Agregar turno</span>
                  </button>
                </div>

                <div className="space-y-2 pt-2">
                  {turnosCrisis.length === 0 ? (
                    <p className="text-xs text-[#687A76]">No tienes turnos registrados.</p>
                  ) : (
                    turnosCrisis.map((t, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-[#F6FFF8] border border-[#A4C3B2]/30 rounded-2xl text-xs">
                        <span className="font-medium text-[#2F3E3B]">{t}</span>
                        <button type="button" onClick={() => eliminarTurno(t)} className="text-red-600 hover:text-red-800 p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {pestanaActiva === 'pacientes' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-[#2F3E3B]">Pacientes Atendidos</h2>
            {misPacientes.length === 0 ? (
              <div className="bg-white border border-[#A4C3B2]/30 rounded-3xl p-8 text-center text-xs text-[#687A76]">
                Aún no tienes pacientes activos con citas confirmadas.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {misPacientes.map((pac) => (
                  <div key={pac.id} className="bg-white border border-[#A4C3B2]/40 rounded-3xl p-5 shadow-sm space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#6B9080]/15 text-[#6B9080] flex items-center justify-center font-semibold text-sm">
                        {pac.nombre.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-[#2F3E3B]">{pac.nombre}</h3>
                        <p className="text-xs text-[#526360]">{pac.correo}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {pestanaActiva === 'notas' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-white border border-[#A4C3B2]/40 rounded-3xl p-6 shadow-sm space-y-6">
              <h2 className="text-base font-semibold text-[#2F3E3B]">Nueva Nota Clínica</h2>
              {notaGuardadaExito && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>¡Nota clínica guardada!</span>
                </div>
              )}
              <form onSubmit={handleGuardarNota} className="space-y-4">
                <div>
                  <label htmlFor="paciente-nota-select" className="block text-xs font-medium text-[#2F3E3B] mb-1">Paciente</label>
                  <select
                    id="paciente-nota-select"
                    required
                    value={pacienteSeleccionadoId}
                    onChange={(e) => setPacienteSeleccionadoId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-[#A4C3B2]/60 bg-[#FAFAFA] text-xs text-[#2F3E3B]"
                  >
                    <option value="">Selecciona un paciente</option>
                    {misPacientes.map((p) => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="titulo-nota-input" className="block text-xs font-medium text-[#2F3E3B] mb-1">Título de la nota</label>
                  <input
                    id="titulo-nota-input"
                    type="text"
                    required
                    value={tituloNota}
                    onChange={(e) => setTituloNota(e.target.value)}
                    placeholder="Ej. Avance en regulación de ansiedad"
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-[#A4C3B2]/60 bg-[#FAFAFA] text-xs text-[#2F3E3B]"
                  />
                </div>
                <div>
                  <label htmlFor="contenido-nota-textarea" className="block text-xs font-medium text-[#2F3E3B] mb-1">Contenido confidencial</label>
                  <textarea
                    id="contenido-nota-textarea"
                    rows={4}
                    required
                    value={contenidoNota}
                    onChange={(e) => setContenidoNota(e.target.value)}
                    placeholder="Observaciones clínicas..."
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-[#A4C3B2]/60 bg-[#FAFAFA] text-xs text-[#2F3E3B]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-[#6B9080] hover:bg-[#5A7B6C] text-white font-medium text-xs shadow-sm"
                >
                  Guardar nota
                </button>
              </form>
            </div>
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-lg font-semibold text-[#2F3E3B]">Notas Clínicas Registradas</h2>
              {misNotas.length === 0 ? (
                <div className="bg-white border border-[#A4C3B2]/30 rounded-3xl p-8 text-center text-xs text-[#687A76]">
                  No hay notas clínicas guardadas.
                </div>
              ) : (
                misNotas.map((nota) => {
                  const pacienteAsociado = pacientes.find((p) => p.id === nota.pacienteId);
                  let fechaFormateada = 'Sin fecha';
                  if (nota.fecha) {
                    try {
                      fechaFormateada = new Date(nota.fecha).toLocaleString('es-CL', {
                        dateStyle: 'full',
                        timeStyle: 'short',
                      });
                    } catch {
                      fechaFormateada = nota.fecha;
                    }
                  }

                  return (
                    <div key={nota.id} className="bg-white border border-[#A4C3B2]/40 rounded-3xl p-5 shadow-sm space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <h3 className="text-sm font-semibold text-[#2F3E3B]">{nota.titulo}</h3>
                        <span className="text-[11px] text-[#687A76] capitalize">{fechaFormateada}</span>
                      </div>
                      <p className="text-xs font-medium text-[#52796F]">
                        Paciente: {pacienteAsociado ? pacienteAsociado.nombre : 'Desconocido'}
                      </p>
                      <p className="text-xs text-[#526360] whitespace-pre-wrap">{nota.contenido}</p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}