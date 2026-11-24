'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  Usuario,
  Paciente,
  Psicologo,
  Cita,
  RegistroAnimo,
  NotaClinica,
  SolicitudCrisis,
  EstadoVerificacion,
} from '@/lib/types';
import { storageService } from '@/lib/storageService';

export interface DatosRegistroPaciente {
  nombre: string;
  correo: string;
  password: string;
  motivosConsulta: string[];
}

export interface DatosRegistroPsicologo {
  nombre: string;
  correo: string;
  password: string;
  numeroRegistro: string;
  especialidades: string[];
  biografia: string;
  tarifa?: number;
  estadoVerificacion: EstadoVerificacion;
}

interface AppContextType {
  cargando: boolean;
  usuarioActual: Usuario | null;
  pacientes: Paciente[];
  psicologos: Psicologo[];
  citas: Cita[];
  registrosAnimo: RegistroAnimo[];
  notasClinicas: NotaClinica[];
  solicitudesCrisis: SolicitudCrisis[];
  login: (correo: string, password: string) => { ok: boolean; error?: string; usuario?: Usuario };
  logout: () => void;
  registrarPaciente: (datos: DatosRegistroPaciente) => { ok: boolean; error?: string; usuario?: Paciente };
  registrarPsicologo: (datos: DatosRegistroPsicologo) => { ok: boolean; error?: string; usuario?: Psicologo };
  agregarCita: (nuevaCita: Omit<Cita, 'id'>) => Cita;
  actualizarEstadoCita: (citaId: string, estado: Cita['estado']) => void;
  cancelarCita: (citaId: string, quien: 'paciente' | 'psicologo', motivo?: string) => void;
  agregarRegistroAnimo: (registro: Omit<RegistroAnimo, 'id' | 'fecha'>) => RegistroAnimo;
  agregarNotaClinica: (nota: Omit<NotaClinica, 'id'>) => NotaClinica;
  guardarPsicologos: (psicologos: Psicologo[]) => void;
  crearSolicitudCrisis: (pacienteNombre: string, psicologoId: string) => SolicitudCrisis;
  actualizarEstadoSolicitudCrisis: (solicitudId: string, estado: SolicitudCrisis['estado']) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [cargando, setCargando] = useState(true);
  const [usuarioActual, setUsuarioActual] = useState<Usuario | null>(null);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [psicologos, setPsicologos] = useState<Psicologo[]>([]);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [registrosAnimo, setRegistrosAnimo] = useState<RegistroAnimo[]>([]);
  const [notasClinicas, setNotasClinicas] = useState<NotaClinica[]>([]);
  const [solicitudesCrisis, setSolicitudesCrisis] = useState<SolicitudCrisis[]>([]);

  useEffect(() => {
    const estado = storageService.inicializarDatos();
    setUsuarioActual(estado.sesionActual);
    setPacientes(estado.pacientes);
    setPsicologos(estado.psicologos);
    setCitas(estado.citas);
    setRegistrosAnimo(estado.registrosAnimo);
    setNotasClinicas(estado.notasClinicas);
    
    const crisisGuardadas = localStorage.getItem('calma_solicitudes_crisis');
    if (crisisGuardadas) {
      try { setSolicitudesCrisis(JSON.parse(crisisGuardadas)); } catch {}
    }
    
    setCargando(false);
  }, []);

  const login = (correo: string, password: string) => {
    const correoNormalizado = correo.trim().toLowerCase();

    const pacienteEncontrado = pacientes.find(
      (p) => p.correo.toLowerCase() === correoNormalizado && p.password === password
    );
    if (pacienteEncontrado) {
      setUsuarioActual(pacienteEncontrado);
      storageService.guardarSesion(pacienteEncontrado);
      return { ok: true, usuario: pacienteEncontrado };
    }

    const psicologoEncontrado = psicologos.find(
      (psi) => psi.correo.toLowerCase() === correoNormalizado && psi.password === password
    );
    if (psicologoEncontrado) {
      setUsuarioActual(psicologoEncontrado);
      storageService.guardarSesion(psicologoEncontrado);
      return { ok: true, usuario: psicologoEncontrado };
    }

    return {
      ok: false,
      error: 'El correo o la contraseña no coinciden con nuestros registros.',
    };
  };

  const logout = () => {
    setUsuarioActual(null);
    storageService.guardarSesion(null);
  };

  const correoExiste = (correo: string) => {
    const normalizado = correo.trim().toLowerCase();
    return (
      pacientes.some((p) => p.correo.toLowerCase() === normalizado) ||
      psicologos.some((psi) => psi.correo.toLowerCase() === normalizado)
    );
  };

  const registrarPaciente = (datos: DatosRegistroPaciente) => {
    if (correoExiste(datos.correo)) {
      return { ok: false, error: 'Ya existe una cuenta registrada con este correo electrónico.' };
    }

    const nuevoPaciente: Paciente = {
      id: `pac-${Date.now()}`,
      nombre: datos.nombre.trim(),
      correo: datos.correo.trim().toLowerCase(),
      password: datos.password,
      rol: 'paciente',
      motivosConsulta: datos.motivosConsulta,
      fechaCreacion: new Date().toISOString(),
    };

    const actualizados = [...pacientes, nuevoPaciente];
    setPacientes(actualizados);
    storageService.guardarPacientes(actualizados);

    setUsuarioActual(nuevoPaciente);
    storageService.guardarSesion(nuevoPaciente);

    return { ok: true, usuario: nuevoPaciente };
  };

  const registrarPsicologo = (datos: DatosRegistroPsicologo) => {
    if (correoExiste(datos.correo)) {
      return { ok: false, error: 'Ya existe una cuenta registrada con este correo electrónico.' };
    }

    const nuevoPsicologo: Psicologo = {
      id: `psi-${Date.now()}`,
      nombre: datos.nombre.trim(),
      correo: datos.correo.trim().toLowerCase(),
      password: datos.password,
      rol: 'psicologo',
      numeroRegistro: datos.numeroRegistro.trim(),
      especialidades: datos.especialidades,
      enfoque: 'Integrativo',
      biografia: datos.biografia.trim(),
      calificacion: 5.0,
      totalResenas: 0,
      tarifa: datos.tarifa,
      estadoVerificacion: datos.estadoVerificacion,
      disponibilidad: [
        { id: `disp-${Date.now()}-1`, diaSemana: 'Lunes', horas: ['10:00', '16:00'] },
      ],
      fechaCreacion: new Date().toISOString(),
      voluntarioCrisis: false,
      turnosCrisis: [],
      disponibleAhoraCrisis: false,
    };

    const actualizados = [...psicologos, nuevoPsicologo];
    setPsicologos(actualizados);
    storageService.guardarPsicologos(actualizados);

    setUsuarioActual(nuevoPsicologo);
    storageService.guardarSesion(nuevoPsicologo);

    return { ok: true, usuario: nuevoPsicologo };
  };

  const guardarPsicologosNuevos = (nuevosPsi: Psicologo[]) => {
    setPsicologos(nuevosPsi);
    storageService.guardarPsicologos(nuevosPsi);
  };

  const agregarCita = (nuevaCita: Omit<Cita, 'id'>): Cita => {
    const citaCreada: Cita = {
      ...nuevaCita,
      id: `cita-${Date.now()}`,
      modalidad: nuevaCita.modalidad || 'video',
    };
    const actualizadas = [...citas, citaCreada];
    setCitas(actualizadas);
    storageService.guardarCitas(actualizadas);
    return citaCreada;
  };

  const actualizarEstadoCita = (citaId: string, estado: Cita['estado']) => {
    const actualizadas = citas.map((c) => (c.id === citaId ? { ...c, estado } : c));
    setCitas(actualizadas);
    storageService.guardarCitas(actualizadas);
  };

  const cancelarCita = (citaId: string, quien: 'paciente' | 'psicologo', motivo?: string) => {
    const citaA = citas.find((c) => c.id === citaId);
    if (!citaA) return;

    // Actualiza el estado de la cita
    const actualizadas = citas.map((c) => {
      if (c.id === citaId) {
        return {
          ...c,
          estado: 'cancelada' as const,
          canceladaPor: quien,
          motivoCancelacion: motivo?.trim() || undefined,
          fechaCancelacion: new Date().toISOString(),
        };
      }
      return c;
    });

    setCitas(actualizadas);
    storageService.guardarCitas(actualizadas);

    // Libera el horario en la agenda del psicólogo para que vuelva a estar disponible
    const psicologosActualizados = psicologos.map((psi) => {
      if (psi.id === citaA.psiId || psi.id === citaA.psicologoId) {
        // Busca si ya existe la disponibilidad para ese día o agrega la hora liberada
        const fechaObj = new Date(`${citaA.fecha}T00:00:00`);
        const diasSemanaMap = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'] as const;
        const nombreDia = diasSemanaMap[fechaObj.getDay()];

        let encontradoDia = false;
        const nuevaDisponibilidad = psi.disponibilidad.map((d) => {
          if (d.diaSemana === nombreDia) {
            encontradoDia = true;
            if (!d.horas.includes(citaA.hora)) {
              return { ...d, horas: [...d.horas, citaA.hora].sort() };
            }
          }
          return d;
        });

        if (!encontradoDia && nombreDia !== 'Domingo') {
          nuevaDisponibilidad.push({
            id: `disp-lib-${Date.now()}`,
            diaSemana: nombreDia as any,
            horas: [citaA.hora],
          });
        }

        return { ...psi, disponibilidad: nuevaDisponibilidad };
      }
      return psi;
    });

    setPsicologos(psicologosActualizados);
    storageService.guardarPsicologos(psicologosActualizados);
  };

  const agregarRegistroAnimo = (registro: Omit<RegistroAnimo, 'id' | 'fecha'>): RegistroAnimo => {
    const nuevoRegistro: RegistroAnimo = {
      ...registro,
      id: `animo-${Date.now()}`,
      fecha: new Date().toISOString(),
    };
    const actualizados = [nuevoRegistro, ...registrosAnimo];
    setRegistrosAnimo(actualizados);
    storageService.guardarRegistrosAnimo(actualizados);
    return nuevoRegistro;
  };

  const agregarNotaClinica = (nota: Omit<NotaClinica, 'id'>): NotaClinica => {
    const nuevaNota: NotaClinica = {
      ...nota,
      id: `nota-${Date.now()}`,
    };
    const actualizadas = [nuevaNota, ...notasClinicas];
    setNotasClinicas(actualizadas);
    storageService.guardarNotasClinicas(actualizadas);
    return nuevaNota;
  };

  const crearSolicitudCrisis = (pacienteNombre: string, psicologoId: string): SolicitudCrisis => {
    const nueva: SolicitudCrisis = {
      id: `sol-${Date.now()}`,
      pacienteNombre,
      psicologoId,
      estado: 'esperando',
      fechaInicio: new Date().toISOString(),
    };
    const actualizadas = [nueva, ...solicitudesCrisis];
    setSolicitudesCrisis(actualizadas);
    if (typeof window !== 'undefined') {
      localStorage.setItem('calma_solicitudes_crisis', JSON.stringify(actualizadas));
    }
    return nueva;
  };

  const actualizarEstadoSolicitudCrisis = (solicitudId: string, estado: SolicitudCrisis['estado']) => {
    const actualizadas = solicitudesCrisis.map((s) => (s.id === solicitudId ? { ...s, estado } : s));
    setSolicitudesCrisis(actualizadas);
    if (typeof window !== 'undefined') {
      localStorage.setItem('calma_solicitudes_crisis', JSON.stringify(actualizadas));
    }
  };

  return (
    <AppContext.Provider
      value={{
        cargando,
        usuarioActual,
        pacientes,
        psicologos,
        citas,
        registrosAnimo,
        notasClinicas,
        solicitudesCrisis,
        login,
        logout,
        registrarPaciente,
        registrarPsicologo,
        agregarCita,
        actualizarEstadoCita,
        cancelarCita,
        agregarRegistroAnimo,
        agregarNotaClinica,
        guardarPsicologos: guardarPsicologosNuevos,
        crearSolicitudCrisis,
        actualizarEstadoSolicitudCrisis,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe utilizarse dentro de un AppProvider');
  }
  return context;
}