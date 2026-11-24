import {
  Paciente,
  Psicologo,
  Cita,
  RegistroAnimo,
  NotaClinica,
  Usuario,
} from './types';
import {
  PSICOLOGOS_MOCK,
  CITAS_INICIALES_MOCK,
  REGISTROS_ANIMO_MOCK,
  NOTAS_CLINICAS_MOCK,
} from './mockData';

const KEYS = {
  SESION: 'calma_sesion_actual',
  PACIENTES: 'calma_pacientes',
  PSICOLOGOS: 'calma_psicologos',
  CITAS: 'calma_citas',
  ANIMOS: 'calma_registros_animo',
  NOTAS: 'calma_notas_clinicas',
};

export interface EstadoPersistencia {
  sesionActual: Usuario | null;
  pacientes: Paciente[];
  psicologos: Psicologo[];
  citas: Cita[];
  registrosAnimo: RegistroAnimo[];
  notasClinicas: NotaClinica[];
}

export const storageService = {
  inicializarDatos(): EstadoPersistencia {
    if (typeof window === 'undefined') {
      return {
        sesionActual: null,
        pacientes: [],
        psicologos: PSICOLOGOS_MOCK,
        citas: CITAS_INICIALES_MOCK,
        registrosAnimo: REGISTROS_ANIMO_MOCK,
        notasClinicas: NOTAS_CLINICAS_MOCK,
      };
    }

    const pacientesGuardados = localStorage.getItem(KEYS.PACIENTES);
    const psicologosGuardados = localStorage.getItem(KEYS.PSICOLOGOS);
    const citasGuardadas = localStorage.getItem(KEYS.CITAS);
    const animosGuardados = localStorage.getItem(KEYS.ANIMOS);
    const notasGuardadas = localStorage.getItem(KEYS.NOTAS);
    const sesionGuardada = localStorage.getItem(KEYS.SESION);

    const pacientes: Paciente[] = pacientesGuardados
      ? JSON.parse(pacientesGuardados)
      : [];

    const psicologos: Psicologo[] = psicologosGuardados
      ? JSON.parse(psicologosGuardados)
      : PSICOLOGOS_MOCK;

    const citas: Cita[] = citasGuardadas
      ? JSON.parse(citasGuardadas)
      : CITAS_INICIALES_MOCK;

    const registrosAnimo: RegistroAnimo[] = animosGuardados
      ? JSON.parse(animosGuardados)
      : REGISTROS_ANIMO_MOCK;

    const notasClinicas: NotaClinica[] = notasGuardadas
      ? JSON.parse(notasGuardadas)
      : NOTAS_CLINICAS_MOCK;

    const sesionActual: Usuario | null = sesionGuardada
      ? JSON.parse(sesionGuardada)
      : null;

    if (!pacientesGuardados) localStorage.setItem(KEYS.PACIENTES, JSON.stringify(pacientes));
    if (!psicologosGuardados) localStorage.setItem(KEYS.PSICOLOGOS, JSON.stringify(psicologos));
    if (!citasGuardadas) localStorage.setItem(KEYS.CITAS, JSON.stringify(citas));
    if (!animosGuardados) localStorage.setItem(KEYS.ANIMOS, JSON.stringify(registrosAnimo));
    if (!notasGuardadas) localStorage.setItem(KEYS.NOTAS, JSON.stringify(notasClinicas));

    return {
      sesionActual,
      pacientes,
      psicologos,
      citas,
      registrosAnimo,
      notasClinicas,
    };
  },

  guardarSesion(usuario: Usuario | null): void {
    if (typeof window === 'undefined') return;
    if (usuario) {
      localStorage.setItem(KEYS.SESION, JSON.stringify(usuario));
    } else {
      localStorage.removeItem(KEYS.SESION);
    }
  },

  guardarPacientes(pacientes: Paciente[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(KEYS.PACIENTES, JSON.stringify(pacientes));
  },

  guardarPsicologos(psicologos: Psicologo[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(KEYS.PSICOLOGOS, JSON.stringify(psicologos));
  },

  guardarCitas(citas: Cita[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(KEYS.CITAS, JSON.stringify(citas));
  },

  guardarRegistrosAnimo(registros: RegistroAnimo[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(KEYS.ANIMOS, JSON.stringify(registros));
  },

  guardarNotasClinicas(notas: NotaClinica[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(KEYS.NOTAS, JSON.stringify(notas));
  },
};