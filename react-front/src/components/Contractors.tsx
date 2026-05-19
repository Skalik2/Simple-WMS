import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Building2, CreditCard, MoreVertical, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { Modal } from './ui/Modal';
import { Pagination } from './ui/Pagination';

interface Contractor {
  id: number;
  name: string;
  nip: string | null;
}

export const Contractors = () => {
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Pobieranie kontrahentów
  const fetchContractors = async (page: number = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/contractors?page=${page}&page_size=${pageSize}`);
      if (res.ok) {
        const data = await res.json();
        setContractors(data.items);
        setTotalItems(data.total);
        setCurrentPage(data.page);
      }
    } catch (err) {
      console.error('Błąd pobierania kontrahentów:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContractors(currentPage);
  }, [currentPage]);

  // Obsługa dodawania nowego kontrahenta
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const res = await fetch('/api/contractors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          nip: formData.get('nip') || null,
        })
      });

      if (res.ok) {
        await fetchContractors(currentPage);
        setIsModalOpen(false);
      } else {
        alert("Błąd podczas dodawania kontrahenta.");
      }
    } catch (err) {
      console.error(err);
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
                <button className="text-on-surface-variant hover:text-on-surface p-1">
                  <MoreVertical size={20} />
                </button>
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

      {/* Modal dodawania */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Nowy kontrahent"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest pl-1">Nazwa firmy</label>
            <input 
              name="name" 
              type="text" 
              required 
              placeholder="np. Logistyka Polska Sp. z o.o." 
              className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary/20" 
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest pl-1">NIP</label>
            <input 
              name="nip" 
              type="text" 
              placeholder="1234567890" 
              className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary/20" 
            />
          </div>
          <div className="pt-4 flex gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 bg-surface-container-high text-on-surface font-bold rounded-xl text-sm">Anuluj</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-primary text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2">
              <Check size={16} /> Zapisz
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};