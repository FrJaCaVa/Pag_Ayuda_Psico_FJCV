export type RolUsuario = 'paciente' | 'psicologo';

export type EstadoVerificacion = 'Verificado' | 'En revisión';

export type EstadoCita = 'pendiente' | 'confirmada' | 'rechazada' | 'completada' | 'cancelada';

export type ModalidadCita = 'chat' | 'video';

export interface Disponibilidad {
  id: string;
  diaSemana: 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado';
  horas: string[];
}

export interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  password?: string;
  rol: RolUsuario;
  avatarUrl?: string;
  fechaCreacion: string;
}

export interface Paciente extends Usuario {
  rol: 'paciente';
  motivosConsulta: string[];
}

export interface Psicologo extends Usuario {
  rol: 'psicologo';
  numeroRegistro: string;
  especialidades: string[];
  enfoque: string;
  biografia: string;
  calificacion: number;
  totalResenas: number;
  tarifa?: number;
  estadoVerificacion: EstadoVerificacion;
  disponibilidad: Disponibilidad[];
  foto?: string;
  voluntarioCrisis?: boolean;
  turnosCrisis?: string[];
  disponibleAhoraCrisis?: boolean;
}

export interface Cita {
  id: string;
  pacienteId: string;
  pacienteNombre: string;
  psicologoId: string;
  psicologoNombre: string;
  fecha: string; // YYYY-MM-DD
  hora: string; // HH:mm
  modalidad: ModalidadCita;
  estado: EstadoCita;
  motivo?: string;
  canceladaPor?: 'paciente' | 'psicologo';
  motivoCancelacion?: string;
  fechaCancelacion?: string;
}

export interface SolicitudCrisis {
  id: string;
  pacienteNombre: string;
  psicologoId: string;
  estado: 'esperando' | 'atendiendo' | 'finalizado';
  fechaInicio: string;
}

export interface RegistroAnimo {
  id: string;
  pacienteId: string;
  fecha: string;
  nivel: 1 | 2 | 3 | 4 | 5;
  emociones: string[];
  notaPersonal?: string;
}

export interface NotaClinica {
  id: string;
  citaId?: string;
  psicologoId: string;
  pacienteId: string;
  fecha: string;
  titulo: string;
  contenido: string;
  privada: boolean;
}