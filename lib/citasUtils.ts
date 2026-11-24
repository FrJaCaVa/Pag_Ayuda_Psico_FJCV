import { MINUTOS_ANTES, DURACION_SESION_MIN, MODO_PRUEBA_SESIONES } from './config';

export type EstadoTemporalCita = 'proxima' | 'en_curso' | 'finalizada';

export function obtenerEstadoTemporalCita(fecha: string, hora: string, ahora: Date): EstadoTemporalCita {
  if (MODO_PRUEBA_SESIONES) {
    return 'en_curso';
  }

  try {
    const [anio, mes, dia] = fecha.split('-').map(Number);
    const [horas, minutos] = hora.split(':').map(Number);

    const inicioCita = new Date(anio, mes - 1, dia, horas, minutos, 0, 0);
    const inicioVentana = new Date(inicioCita.getTime() - MINUTOS_ANTES * 60 * 1000);
    const finVentana = new Date(inicioCita.getTime() + DURACION_SESION_MIN * 60 * 1000);

    const tiempoActual = ahora.getTime();

    if (tiempoActual < inicioVentana.getTime()) {
      return 'proxima';
    } else if (tiempoActual >= inicioVentana.getTime() && tiempoActual <= finVentana.getTime()) {
      return 'en_curso';
    } else {
      return 'finalizada';
    }
  } catch {
    return 'proxima';
  }
}

export function formatearTiempoRestante(fecha: string, hora: string, ahora: Date): string {
  try {
    const [anio, mes, dia] = fecha.split('-').map(Number);
    const [horas, minutos] = hora.split(':').map(Number);
    const inicioCita = new Date(anio, mes - 1, dia, horas, minutos, 0, 0);
    const inicioVentana = new Date(inicioCita.getTime() - MINUTOS_ANTES * 60 * 1000);

    const diferenciaMs = inicioVentana.getTime() - ahora.getTime();
    if (diferenciaMs <= 0) return 'Se habilita ahora';

    const segundos = Math.floor(diferenciaMs / 1000);
    const minutosRestantes = Math.floor(segundos / 60);
    const horasRestantes = Math.floor(minutosRestantes / 60);
    const diasRestantes = Math.floor(horasRestantes / 24);

    if (diasRestantes > 0) {
      return `Faltan ${diasRestantes} ${diasRestantes === 1 ? 'día' : 'días'}`;
    } else if (horasRestantes > 0) {
      const minsMod = minutosRestantes % 60;
      return `Faltan ${horasRestantes} h ${minsMod} min`;
    } else {
      return `Faltan ${minutosRestantes} min`;
    }
  } catch {
    return 'Próximamente';
  }
}

export function formatearFechaLarga(fechaStr: string): string {
  try {
    const [anio, mes, dia] = fechaStr.split('-').map(Number);
    const fechaObj = new Date(anio, mes - 1, dia);
    return fechaObj.toLocaleDateString('es-CL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return fechaStr;
  }
}