'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Leaf,
  User,
  Stethoscope,
  Lock,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { RolUsuario, EstadoVerificacion } from '@/lib/types';
import { MOTIVOS_CONSULTA_OPCIONES, ESPECIALIDADES_OPCIONES } from '@/lib/mockData';

export default function RegistroPage() {
  const router = useRouter();
  const { registrarPaciente, registrarPsicologo } = useApp();

  const [rol, setRol] = useState<RolUsuario>('paciente');
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');

  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmarPassword, setMostrarConfirmarPassword] = useState(false);

  const [motivosSeleccionados, setMotivosSeleccionados] = useState<string[]>([]);
  const [numeroRegistro, setNumeroRegistro] = useState('');
  const [especialidadesSeleccionadas, setEspecialidadesSeleccionadas] = useState<string[]>([]);
  const [biografia, setBiografia] = useState('');
  const [tarifa, setTarifa] = useState('');
  const [modoAtencion, setModoAtencion] = useState<'pago' | 'crisis' | 'ambas'>('pago');
  const [estadoVerificacion] = useState<EstadoVerificacion>('Verificado');

  const [errorGeneral, setErrorGeneral] = useState('');
  const [errores, setErrores] = useState<Record<string, string>>({});

  const toggleItem = (lista: string[], setLista: (v: string[]) => void, item: string) => {
    if (lista.includes(item)) {
      setLista(lista.filter((i) => i !== item));
    } else {
      setLista([...lista, item]);
    }
  };

  const handleConfirmarChange = (val: string) => {
    setConfirmarPassword(val);
    if (val && val !== password) {
      setErrores((prev) => ({ ...prev, confirmarPassword: 'Las contraseñas no coinciden' }));
    } else {
      setErrores((prev) => {
        const copy = { ...prev };
        delete copy.confirmarPassword;
        return copy;
      });
    }
  };

  const validar = () => {
    const nuevosErrores: Record<string, string> = {};
    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!nombre.trim()) {
      nuevosErrores.nombre = 'Indica tu nombre o alias.';
    }
    if (!correo.trim()) {
      nuevosErrores.correo = 'El correo es obligatorio.';
    } else if (!regexCorreo.test(correo)) {
      nuevosErrores.correo = 'Correo no válido.';
    }

    if (!password) {
      nuevosErrores.password = 'La contraseña es obligatoria.';
    } else if (password.length < 8) {
      nuevosErrores.password = 'La contraseña debe tener mínimo 8 caracteres.';
    }

    if (!confirmarPassword) {
      nuevosErrores.confirmarPassword = 'Confirma tu contraseña.';
    } else if (confirmarPassword !== password) {
      nuevosErrores.confirmarPassword = 'Las contraseñas no coinciden';
    }

    if (rol === 'paciente') {
      if (motivosSeleccionados.length === 0) {
        nuevosErrores.motivos = 'Selecciona al menos un motivo.';
      }
    } else {
      if (!numeroRegistro.trim()) nuevosErrores.numeroRegistro = 'Requerido.';
      if (especialidadesSeleccionadas.length === 0) nuevosErrores.especialidades = 'Requerido.';
      if (!biografia.trim()) nuevosErrores.biografia = 'Requerido.';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorGeneral('');

    if (!validar()) return;

    if (rol === 'paciente') {
      const res = registrarPaciente({
        nombre,
        correo,
        password,
        motivosConsulta: motivosSeleccionados,
      });
      if (!res.ok) {
        setErrorGeneral(res.error || 'Error al registrar.');
        return;
      }
      router.push('/paciente');
    } else {
      const voluntarioCrisis = modoAtencion === 'crisis' || modoAtencion === 'ambas';
      const res = registrarPsicologo({
        nombre,
        correo,
        password,
        numeroRegistro,
        especialidades: especialidadesSeleccionadas,
        biografia,
        tarifa: modoAtencion === 'crisis' ? undefined : (tarifa ? Number(tarifa) : undefined),
        estadoVerificacion,
        voluntarioCrisis,
        turnosCrisis: voluntarioCrisis ? ['Turno general disponible'] : [],
        disponibleAhoraCrisis: false,
      });
      if (!res.ok) {
        setErrorGeneral(res.error || 'Error al registrar.');
        return;
      }
      router.push('/psicologo');
    }
  };

  return (
    <main className="min-h-[calc(100vh-72px)] py-8 sm:py-12 px-4 sm:px-6 flex items-center justify-center bg-gradient-to-b from-[#F6FFF8] via-[#FAFAFA] to-[#EAF4F4]">
      <div className="w-full max-w-5xl bg-white/95 backdrop-blur-sm border border-[#A4C3B2]/35 rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">
        <div className="pt-8 sm:pt-12 pb-8 px-6 sm:px-10 flex flex-col justify-center">
          <div className="space-y-2 text-center lg:text-left mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#6B9080]/15 text-[#6B9080]">
              <Leaf className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#2F3E3B]">
              Crea tu cuenta
            </h1>
            <p className="text-xs sm:text-sm text-[#526360]">
              Elige cómo deseas participar en nuestra comunidad.
            </p>
          </div>

          <div role="tablist" className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-[#F6FFF8] border border-[#A4C3B2]/40 mb-6">
            <button
              type="button"
              role="tab"
              aria-selected={rol === 'paciente'}
              onClick={() => setRol('paciente')}
              className={`py-2 px-3 rounded-xl text-xs font-medium transition flex items-center justify-center gap-2 ${
                rol === 'paciente' ? 'bg-[#6B9080] text-white shadow-sm' : 'text-[#526360]'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Paciente</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={rol === 'psicologo'}
              onClick={() => setRol('psicologo')}
              className={`py-2 px-3 rounded-xl text-xs font-medium transition flex items-center justify-center gap-2 ${
                rol === 'psicologo' ? 'bg-[#6B9080] text-white shadow-sm' : 'text-[#526360]'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Psicólogo/a</span>
            </button>
          </div>

          {errorGeneral && (
            <div role="alert" className="flex items-start gap-2 p-3 rounded-xl bg-red-50 text-red-800 text-xs mb-4">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorGeneral}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="nombre" className="block text-xs font-medium text-[#2F3E3B]">
                {rol === 'paciente' ? 'Nombre o alias' : 'Nombre profesional completo'}
              </label>
              <input
                id="nombre"
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder={rol === 'paciente' ? 'Ej. Camila' : 'Ej. Ps. Andrea Morales'}
                className="w-full px-4 py-2.5 rounded-2xl border border-[#A4C3B2]/60 bg-[#FAFAFA] text-xs text-[#2F3E3B] focus:outline-none focus:ring-2 focus:ring-[#6B9080]"
              />
              {errores.nombre && <p className="text-[11px] text-red-600 mt-1">{errores.nombre}</p>}
            </div>

            <div className="space-y-1">
              <label htmlFor="correo" className="block text-xs font-medium text-[#2F3E3B]">Correo electrónico</label>
              <input
                id="correo"
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="correo@ejemplo.com"
                className="w-full px-4 py-2.5 rounded-2xl border border-[#A4C3B2]/60 bg-[#FAFAFA] text-xs text-[#2F3E3B] focus:outline-none focus:ring-2 focus:ring-[#6B9080]"
              />
              {errores.correo && <p className="text-[11px] text-red-600 mt-1">{errores.correo}</p>}
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="block text-xs font-medium text-[#2F3E3B]">Contraseña</label>
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
              {errores.password && <p className="text-[11px] text-red-600 mt-1">{errores.password}</p>}
            </div>

            <div className="space-y-1">
              <label htmlFor="confirmarPassword" className="block text-xs font-medium text-[#2F3E3B]">Confirmar contraseña</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#6B9080] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="confirmarPassword"
                  type={mostrarConfirmarPassword ? 'text' : 'password'}
                  value={confirmarPassword}
                  onChange={(e) => handleConfirmarChange(e.target.value)}
                  placeholder="Repite tu contraseña"
                  className="w-full pl-10 pr-11 py-2.5 rounded-2xl border border-[#A4C3B2]/60 bg-[#FAFAFA] text-xs text-[#2F3E3B] focus:outline-none focus:ring-2 focus:ring-[#6B9080]"
                />
                <button
                  type="button"
                  onClick={() => setMostrarConfirmarPassword(!mostrarConfirmarPassword)}
                  aria-label={mostrarConfirmarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#687A76] hover:text-[#2F3E3B] focus:outline-none focus:ring-2 focus:ring-[#6B9080] rounded-lg p-1"
                >
                  {mostrarConfirmarPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errores.confirmarPassword && <p className="text-[11px] text-red-600 mt-1">{errores.confirmarPassword}</p>}
            </div>

            {rol === 'paciente' ? (
              <div className="space-y-2 pt-2 border-t border-[#A4C3B2]/25">
                <span className="block text-xs font-medium text-[#2F3E3B]">¿Qué te gustaría conversar?</span>
                <div className="flex flex-wrap gap-1.5">
                  {MOTIVOS_CONSULTA_OPCIONES.map((motivo) => {
                    const activo = motivosSeleccionados.includes(motivo);
                    return (
                      <button
                        key={motivo}
                        type="button"
                        onClick={() => toggleItem(motivosSeleccionados, setMotivosSeleccionados, motivo)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
                          activo ? 'bg-[#6B9080] text-white border-[#6B9080]' : 'bg-[#F6FFF8] text-[#2F3E3B] border-[#A4C3B2]/50'
                        }`}
                      >
                        {activo && <Check className="w-3 h-3 inline mr-1" />}
                        {motivo}
                      </button>
                    );
                  })}
                </div>
                {errores.motivos && <p className="text-[11px] text-red-600 mt-1">{errores.motivos}</p>}
              </div>
            ) : (
              <div className="space-y-4 pt-2 border-t border-[#A4C3B2]/25">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#2F3E3B]">N° Registro profesional</label>
                    <input
                      type="text"
                      value={numeroRegistro}
                      onChange={(e) => setNumeroRegistro(e.target.value)}
                      placeholder="Ej. PSI-45890"
                      className="w-full px-4 py-2.5 rounded-2xl border border-[#A4C3B2]/60 bg-[#FAFAFA] text-xs text-[#2F3E3B]"
                    />
                  </div>
                  {modoAtencion !== 'crisis' && (
                    <div>
                      <label className="block text-xs font-medium text-[#2F3E3B]">Tarifa sesión (opcional)</label>
                      <input
                        type="number"
                        value={tarifa}
                        onChange={(e) => setTarifa(e.target.value)}
                        placeholder="Ej. 35000"
                        className="w-full px-4 py-2.5 rounded-2xl border border-[#A4C3B2]/60 bg-[#FAFAFA] text-xs text-[#2F3E3B]"
                      />
                    </div>
                  )}
                </div>

                {/* Pregunta sobre cómo quiere atender */}
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-[#2F3E3B]">¿Cómo quieres atender?</label>
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      type="button"
                      onClick={() => setModoAtencion('pago')}
                      className={`p-3 rounded-2xl text-left border text-xs transition ${
                        modoAtencion === 'pago' ? 'bg-[#6B9080]/15 border-[#6B9080] font-medium text-[#2F3E3B]' : 'bg-[#FAFAFA] border-[#A4C3B2]/40 text-[#526360]'
                      }`}
                    >
                      <span className="block font-semibold">Solo sesiones con tarifa</span>
                      <span className="text-[11px] text-[#687A76]">Atención psicológica regular agendada con tarifa profesional.</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setModoAtencion('crisis')}
                      className={`p-3 rounded-2xl text-left border text-xs transition ${
                        modoAtencion === 'crisis' ? 'bg-[#6B9080]/15 border-[#6B9080] font-medium text-[#2F3E3B]' : 'bg-[#FAFAFA] border-[#A4C3B2]/40 text-[#526360]'
                      }`}
                    >
                      <span className="block font-semibold">Solo apoyo en crisis (gratuito)</span>
                      <span className="text-[11px] text-[#687A76]">El apoyo en crisis es gratuito y se realiza por chat o videollamada para contención urgente.</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setModoAtencion('ambas')}
                      className={`p-3 rounded-2xl text-left border text-xs transition ${
                        modoAtencion === 'ambas' ? 'bg-[#6B9080]/15 border-[#6B9080] font-medium text-[#2F3E3B]' : 'bg-[#FAFAFA] border-[#A4C3B2]/40 text-[#526360]'
                      }`}
                    >
                      <span className="block font-semibold">Ambas</span>
                      <span className="text-[11px] text-[#687A76]">Combina sesiones particulares con turnos voluntarios de apoyo en crisis gratuito.</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="block text-xs font-medium text-[#2F3E3B]">Especialidades</span>
                  <div className="flex flex-wrap gap-1.5">
                    {ESPECIALIDADES_OPCIONES.map((esp) => {
                      const activa = especialidadesSeleccionadas.includes(esp);
                      return (
                        <button
                          key={esp}
                          type="button"
                          onClick={() => toggleItem(especialidadesSeleccionadas, setEspecialidadesSeleccionadas, esp)}
                          className={`px-2.5 py-1 rounded-xl text-[11px] font-medium border transition ${
                            activa ? 'bg-[#6B9080] text-white border-[#6B9080]' : 'bg-[#F6FFF8] text-[#2F3E3B] border-[#A4C3B2]/50'
                          }`}
                        >
                          {esp}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#2F3E3B]">Biografía breve</label>
                  <textarea
                    rows={2}
                    value={biografia}
                    onChange={(e) => setBiografia(e.target.value)}
                    placeholder="Cuéntale a tus pacientes sobre tu enfoque..."
                    className="w-full px-4 py-2 rounded-2xl border border-[#A4C3B2]/60 bg-[#FAFAFA] text-xs text-[#2F3E3B]"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-2xl bg-[#6B9080] hover:bg-[#5A7B6C] text-white font-medium text-xs sm:text-sm shadow-sm transition mt-2"
            >
              {rol === 'paciente' ? 'Crear cuenta de paciente' : 'Registrar perfil profesional'}
            </button>
          </form>

          <p className="text-center text-xs text-[#526360] mt-6">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="font-medium text-[#52796F] underline">
              Inicia sesión aquí
            </Link>
          </p>
        </div>

        <div className="hidden lg:block relative bg-[#EAF4F4]">
          <div className="sticky top-24 h-[calc(100vh-8rem)] min-h-[500px] w-full">
            <Image
              src="/images/login.jpg"
              alt="Espacio sereno que invita al registro y la confianza en la plataforma"
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