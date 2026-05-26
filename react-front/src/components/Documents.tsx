import React, { useState, useEffect } from 'react';
import { FileText, Plus, ArrowUpRight, ArrowDownLeft, Calendar, User } from 'lucide-react';
import { motion } from 'motion/react';
import { NewDocumentModal } from './NewDocumentModal';
import { DocumentDetailsModal } from './DocumentDetailsModal';
import { Pagination } from './ui/Pagination';
import { Document } from '../types';

export const Documents = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const fetchDocuments = async (page: number = 1, isCancelled: () => boolean = () => false) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/documents?page=${page}&page_size=${pageSize}`);
      if (res.ok) {
        const data = await res.json();
        if (isCancelled()) return;
        setDocuments(data.items);
        setTotalItems(data.total);
        setCurrentPage(data.page);
      }
    } catch (err) {
      if (!isCancelled()) {
        console.error('Błąd pobierania dokumentów:', err);
      }
    } finally {
      if (!isCancelled()) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    let cancelled = false;
    fetchDocuments(currentPage, () => cancelled);
    return () => {
      cancelled = true;
    };
  }, [currentPage]);

  const handleDocClick = (doc: Document) => {
    setSelectedDoc(doc);
    setIsDetailsOpen(true);
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-on-surface tracking-tight">Dokumenty</h2>
          <p className="text-on-surface-variant">Zarządzaj dokumentami PZ, WZ, PW, ZW i RW.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl shadow-lg hover:shadow-primary/20 transition-all"
        >
          <Plus size={20} />
          <span className="font-bold text-sm">Nowy dokument</span>
        </button>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-10 text-on-surface-variant text-sm font-medium">Ładowanie dokumentów...</div>
        ) : documents.length === 0 ? (
          <div className="text-center py-10 bg-surface-container-lowest border border-dashed border-outline rounded-2xl">
            <p className="text-on-surface-variant">Brak dokumentów w bazie.</p>
          </div>
        ) : (
          documents.map((doc, idx) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => handleDocClick(doc)}
              className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 hover:border-primary/50 transition-colors cursor-pointer group"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${
                    (doc.type === 'PZ' || doc.type === 'ZW' || doc.type === 'PW') ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {(doc.type === 'PZ' || doc.type === 'ZW' || doc.type === 'PW') ? <ArrowDownLeft size={24} /> : <ArrowUpRight size={24} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-primary">{doc.type}/{doc.id}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        (doc.type === 'PZ' || doc.type === 'ZW' || doc.type === 'PW') ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {doc.type === 'PZ' ? 'Przyjęcie' : 
                         doc.type === 'WZ' ? 'Wydanie' : 
                         doc.type === 'ZW' ? 'Zwrot Wewnętrzny' : 
                         doc.type === 'PW' ? 'Przyjęcie Wewnętrzne' : 
                         'Rozchód Wewnętrzny'}
                      </span>
                    </div>
                    <h3 className="font-bold text-on-surface">{doc.contractor_name || 'Dokument wewnętrzny'}</h3>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6 text-sm text-on-surface-variant">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    {new Date(doc.created_at).toLocaleDateString('pl-PL')}
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText size={16} />
                    {doc.items?.length || 0} pozycji
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
      />

      <NewDocumentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => fetchDocuments(currentPage, () => false)}
      />

      <DocumentDetailsModal 
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        document={selectedDoc}
      />
    </div>
  );
};