export interface LineaEmergencia {
  id: string;
  nombre: string;
  numero: string;
  descripcion: string;
  disponibilidad: string;
}

export const LINEAS_EMERGENCIA_CHILE: LineaEmergencia[] = [
  {
    id: '1',
    nombre: 'Salud Responde (MINSAL)',
    numero: '600 360 7777',
    descripcion: 'Orientación médica telefónica 24/7, incluyendo salud mental.',
    disponibilidad: '24 horas, todos los días',
  },
  {
    id: '2',
    nombre: 'Fono Prevención Suicidio',
    numero: '*4141',
    descripcion: 'Línea gratuita de ayuda y prevención del suicidio.',
    disponibilidad: '24 horas, todos los días',
  },
  {
    id: '3',
    nombre: 'Carabineros de Chile',
    numero: '133',
    descripcion: 'Emergencias policiales y peligro inmediato.',
    disponibilidad: '24 horas',
  },
  {
    id: '4',
    nombre: 'SAMU (Ambulancia)',
    numero: '131',
    descripcion: 'Atención médica de urgencia prehospitalaria.',
    disponibilidad: '24 horas',
  },
];

// Alias export requerido por retrocompatibilidad si algún componente lo importa
export const LINEAS_CRISIS_CHILE = LINEAS_EMERGENCIA_CHILE;