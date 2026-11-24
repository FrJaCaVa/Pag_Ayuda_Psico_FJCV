'use client';

import React from 'react';
import Link from 'next/link';
import { Phone, X, AlertTriangle, MessageCircle, LifeBuoy } from 'lucide-react';
import { LINEAS_EMERGENCIA_CHILE } from '@/lib/crisis';

interface AyudaInmediataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AyudaInmediataModal({ isOpen, onClose }: AyudaInmediataModalProps) {
  if (!isOpen) return null;

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2F3E3B]/50 backdrop-blur-sm">
      <div className="bg-white border border-amber-300 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 bg-amber-50 border-b border-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-amber-900">Ayuda Inmediata</h2>
              <p className="text-[11px] text-amber-800">Líneas de emergencia y apoyo en crisis</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="text-amber-900/60 hover:text-amber-900 p-1.5 rounded-xl hover:bg-amber-100/50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {/* Botón destacado Hablar con un psicólogo ahora */}
          <div className="bg-[#6B9080]/15 border border-[#6B9080]/40 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-xs font-semibold text-[#2F3E3B] block">Chat con psicólogos voluntarios</span>
              <p className="text-[11px] text-[#526360]">Contención emocional gratuita y en tiempo real.</p>
            </div>
            <Link
              href="/crisis"
              onClick={onClose}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#6B9080] hover:bg-[#5A7B6C] text-white text-xs font-medium px-4 py-2.5 rounded-xl transition shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Hablar con un psicólogo ahora</span>
            </Link>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Si estás en peligro inmediato, llama a emergencias:</span>
            </div>

            <div className="space-y-3">
              {LINEAS_EMERGENCIA_CHILE.map((linea) => (
                <div key={linea.id} className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-amber-900">{linea.nombre}</span>
                    <p className="text-[11px] text-[#526360]">{linea.descripcion}</p>
                    <span className="text-[10px] text-[#687A76] block">{linea.disponibilidad}</span>
                  </div>
                  <a
                    href={`tel:${linea.numero.replace(/\s+/g, '')}`}
                    className="inline-flex items-center justify-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-xs shrink-0"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{linea.numero}</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 bg-[#FAFAFA] border-t border-[#A4C3B2]/30 text-center">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-xs font-medium text-[#2F3E3B] transition"
          >
            Entendido, cerrar
          </button>
        </div>
      </div>
    </div>
  );
}