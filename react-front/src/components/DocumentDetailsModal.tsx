import React, { useRef } from 'react';
import { X, Printer, Calendar, User, Package, Hash } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Document } from '../types';

interface DocumentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document | null;
}

export const DocumentDetailsModal = ({ isOpen, onClose, document }: DocumentDetailsModalProps) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = document ? new Date(document.created_at).toLocaleString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }) : '';

  const getDocFullTitle = (type: string) => {
    switch (type) {
      case 'PZ': return 'Przyjęcie Zewnętrzne';
      case 'WZ': return 'Wydanie Zewnętrzne';
      case 'ZW': return 'Zwrot Wewnętrzny';
      case 'PW': return 'Przychód Wewnętrzny';
      case 'RW': return 'Rozchód Wewnętrzny';
      default: return 'Dokument';
    }
  };

  const getDocLabel = (type: string) => {
    switch (type) {
      case 'PZ': return 'Przyjęcie (PZ)';
      case 'WZ': return 'Wydanie (WZ)';
      case 'ZW': return 'Zwrot Wewnętrzny (ZW)';
      case 'PW': return 'Przychód Wewnętrzny (PW)';
      case 'RW': return 'Rozchód Wewnętrzny (RW)';
      default: return type;
    }
  };

  return (
    <Modal isOpen={isOpen && !!document} onClose={onClose} title={`Szczegóły dokumentu #${document?.id || ''}`} size="xl">
      {document && (
        <div className="space-y-6 print:space-y-0 print:bg-white">
          {/* Przycisk Drukowania - Ukryty na wydruku */}
          <div className="flex justify-end gap-3 print:hidden">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-xl shadow-sm hover:bg-secondary/90 transition-all"
            >
              <Printer size={18} />
              <span className="font-bold text-sm">Drukuj</span>
            </button>
          </div>

          {/* ZAWARTOŚĆ DRUKOWANA */}
          <div ref={printRef} className="print:p-[15mm] print:text-black print:bg-white print:min-h-screen">
            
            {/* Nagłówek Dokumentu */}
            <div className="hidden print:block mb-10 border-b-[3px] border-black pb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-black text-black tracking-tight">Simple WMS</h1>
                  <p className="text-sm font-medium text-gray-800">Global Logistics Solution</p>
                </div>
                <div className="text-right">
                  <h2 className="text-2xl font-bold uppercase">{getDocFullTitle(document.type)}</h2>
                  <p className="text-lg font-mono font-bold mt-1">Nr: {document.type}/{document.id}/{new Date(document.created_at).getFullYear()}</p>
                </div>
              </div>
            </div>

            {/* Informacje o Kliencie i Dacie */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 print:grid-cols-2 print:gap-12">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-surface-container-low rounded-lg text-primary print:hidden">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-on-surface-variant print:text-gray-500 uppercase tracking-widest">Data wystawienia</p>
                    <p className="font-medium print:font-semibold print:text-black">{formattedDate}</p>
                  </div>
                </div>
                
                {/* SEKCJA KONTRAHENTA Z NIP */}
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-surface-container-low rounded-lg text-primary print:hidden">
                    <User size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-on-surface-variant print:text-gray-500 uppercase tracking-widest">Kontrahent</p>
                    <p className="font-bold text-lg print:text-black">{document.contractor_name || 'Dokument wewnętrzny'}</p>
                    {document.contractor_nip && (
                      <p className="text-sm text-on-surface-variant print:text-black mt-0.5">
                        NIP: <span className="font-mono font-semibold">{document.contractor_nip}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-surface-container-low rounded-lg text-primary print:hidden">
                    <Hash size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-on-surface-variant print:text-gray-500 uppercase tracking-widest">Typ dokumentu</p>
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold uppercase print:px-0 print:bg-transparent print:text-black print:text-base
                      ${(document.type === 'PZ' || document.type === 'ZW' || document.type === 'PW') ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}
                    `}>
                      {getDocLabel(document.type)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabela Pozycji */}
            <div className="border border-outline-variant rounded-2xl overflow-hidden print:border-none print:rounded-none">
              <table className="w-full text-left border-collapse print:border-y-2 print:border-black">
                <thead className="bg-surface-container-low text-[10px] font-bold text-on-surface-variant uppercase tracking-widest border-b border-outline-variant print:bg-transparent print:border-black print:border-b-2 print:text-black print:text-xs">
                  <tr>
                    <th className="px-4 py-3 print:px-2">LP</th>
                    <th className="px-4 py-3 print:px-2">SKU</th>
                    <th className="px-4 py-3 print:px-2 text-right">Ilość</th>
                    <th className="px-4 py-3 print:px-2 text-center">Jm</th>
                    <th className="px-4 py-3 print:px-2 text-right">Cena jedn.</th>
                    <th className="px-4 py-3 print:px-2 text-right">Wartość</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant print:divide-black/20">
                  {document.items.map((item, idx) => {
                    const itemValue = (item.unit_price || 0) * item.quantity;
                    return (
                      <tr key={idx} className="text-sm print:text-base print:text-black">
                        <td className="px-4 py-3 print:px-2 text-on-surface-variant print:text-black">{idx + 1}</td>
                        <td className="px-4 py-3 print:px-2 font-mono font-bold text-primary print:text-black">{item.product.sku}</td>
                        <td className="px-4 py-3 print:px-2 text-right font-bold">{item.quantity}</td>
                        <td className="px-4 py-3 print:px-2 text-center text-on-surface-variant print:text-black">{item.product.unit}</td>
                        <td className="px-4 py-3 print:px-2 text-right">{(item.unit_price || 0).toFixed(2)} zł</td>
                        <td className="px-4 py-3 print:px-2 text-right font-bold">{itemValue.toFixed(2)} zł</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-surface-container-low/50 font-bold border-t border-outline-variant print:bg-transparent print:border-black print:border-t-2 print:text-black print:text-base">
                  <tr>
                    <td colSpan={5} className="px-4 py-4 print:px-2 text-right uppercase text-[10px] tracking-widest print:text-xs">Suma całkowita:</td>
                    <td className="px-4 py-4 print:px-2 text-right text-primary print:text-black text-lg">
                      {document.items.reduce((sum, item) => sum + ((item.unit_price || 0) * item.quantity), 0).toFixed(2)} zł
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Stopka z Podpisami */}
            <div className="hidden print:grid grid-cols-2 gap-24 mt-24 text-center text-sm print:text-black">
              <div>
                <div className="border-t border-black pt-4 mx-8">
                  <p className="font-bold">Odebrał</p>
                  <p className="text-[10px] text-gray-500 mt-10">(data i czytelny podpis)</p>
                </div>
              </div>
              <div>
                <div className="border-t border-black pt-4 mx-8">
                  <p className="font-bold">Wystawił</p>
                  <p className="text-xs mt-1 font-semibold">{document.created_by || 'System WMS'}</p>
                  <p className="text-[10px] text-gray-500 mt-6">(pieczęć i podpis)</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 flex print:hidden">
            <button 
              onClick={onClose} 
              className="w-full px-4 py-2 bg-surface-container-high text-on-surface font-bold rounded-xl text-sm"
            >
              Zamknij
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};