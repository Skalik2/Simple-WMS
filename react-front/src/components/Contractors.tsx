import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Building2, CreditCard, MoreVertical, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { Modal } from './ui/Modal';
import { Pagination } from './ui/Pagination';
import { Contractor } from '../types';
import { API_URL } from '../constants';

export const Contractors = () => {
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContractor, setEditingContractor] = useState<Contractor | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9;

  // Pobieranie kontrahentów
  const fetchContractors = async (page: number = 1, isCancelled?: () => boolean) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/contractors?page=${page}&page_size=${pageSize}`);
      if (res.ok) {
        const data = await res.json();
        if (isCancelled && isCancelled()) return;
        setContractors(data.items);
        setTotalItems(data.total);
        setCurrentPage(data.page);
      }
    } catch (err) {
      if (isCancelled && isCancelled()) return;
      console.error('Błąd pobierania kontrahentów:', err);
    } finally {
      if (isCancelled && isCancelled()) return;
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    fetchContractors(currentPage, () => cancelled);
    return () => {
      cancelled = true;
    };
  }, [currentPage]);

  // Obsługa dodawania/edycji kontrahenta
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      nip: formData.get('nip') || null,
    };
    
    const url = editingContractor ? `${API_URL}/api/contractors/${editingContractor.id}` : `${API_URL}/api/contractors`;
    const method = editingContractor ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        await fetchContractors(currentPage);
        setIsModalOpen(false);
        setEditingContractor(null);
      } else {
        alert("Błąd podczas zapisywania kontrahenta.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Czy na pewno chcesz usunąć tego kontrahenta? Tej operacji nie można cofnąć.")) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/contractors/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        await fetchContractors(currentPage);
        setOpenMenuId(null);
      } else {
        const data = await res.json();
        alert(data.detail || "Błąd podczas usuwania kontrahenta.");
      }
    } catch (err) {
      console.error(err);
      alert("Wystąpił błąd sieciowy.");
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-on-surface tracking-tight">Kontrahenci</h2>
          <p className="text-on-surface-variant">Zarządzaj bazą dostawców i odbiorców.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl shadow-lg hover:shadow-primary/20 hover:scale-105 transition-all"
        >
          <Plus size={20} />
          <span className="font-bold text-sm">Dodaj kontrahenta</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-on-surface-variant">Ładowanie...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contractors.map((contractor, idx) => (
            <motion.div
              key={contractor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 hover:border-primary/50 transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-secondary-container text-on-secondary-container rounded-xl">
                  <Building2 size={24} />
                </div>
                <div className="relative">
                  <button 
                    onClick={() => setOpenMenuId(openMenuId === contractor.id ? null : contractor.id)}
                    className="text-on-surface-variant hover:text-on-surface p-1"
                  >
                    <MoreVertical size={20} />
                  </button>
                  {openMenuId === contractor.id && (
                    <div className="absolute right-0 mt-2 w-32 bg-surface-container-high border border-outline-variant rounded-xl shadow-lg z-10 py-1">
                      <button 
                        onClick={() => {
                          setEditingContractor(contractor);
                          setIsModalOpen(true);
                          setOpenMenuId(null);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container-highest transition-colors"
                      >
                        Edytuj
                      </button>
                      <button 
                        onClick={() => handleDelete(contractor.id)}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-600/10 transition-colors"
                      >
                        Usuń
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <h3 className="font-bold text-lg text-on-surface mb-1 group-hover:text-primary transition-colors">
                {contractor.name}
              </h3>
              
              <div className="space-y-2 mt-4">
                <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                  <CreditCard size={16} />
                  <span>NIP: {contractor.nip || 'Brak'}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && totalItems > pageSize && (
        <div className="mt-8">
          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Modal dodawania/edycji */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingContractor(null);
        }} 
        title={editingContractor ? "Edytuj kontrahenta" : "Nowy kontrahent"}
      >
        <form onSubmit={handleSubmit} className="space-y-4" key={editingContractor?.id || 'new'}>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest pl-1">Nazwa firmy</label>
            <input 
              name="name" 
              type="text" 
              required 
              defaultValue={editingContractor?.name || ''}
              placeholder="np. Logistyka Polska Sp. z o.o." 
              className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary/20" 
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest pl-1">NIP</label>
            <input 
              name="nip" 
              type="text" 
              defaultValue={editingContractor?.nip || ''}
              placeholder="1234567890" 
              className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary/20" 
            />
          </div>
          <div className="pt-4 flex gap-3">
            <button 
              type="button" 
              onClick={() => {
                setIsModalOpen(false);
                setEditingContractor(null);
              }} 
              className="flex-1 px-4 py-2 bg-surface-container-high text-on-surface font-bold rounded-xl text-sm"
            >
              Anuluj
            </button>
            <button type="submit" className="flex-1 px-4 py-2 bg-primary text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2">
              <Check size={16} /> Zapisz
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};