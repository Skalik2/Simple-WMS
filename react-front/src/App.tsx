/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Warehouse, Menu, X } from 'lucide-react';
import { SignedIn, SignedOut, SignIn, UserButton, useUser } from '@clerk/clerk-react';

import { NAV_ITEMS } from './constants';
import { Dashboard } from './components/Dashboard';
import { Inventory } from './components/Inventory';
import { Documents } from './components/Documents';
import { Reports } from './components/Reports';
import { Contractors } from './components/Contractors';
import { NewDocumentModal } from './components/NewDocumentModal';

export default function App() {
  const [isSidebarOpen, setSidebarOpen] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const [isModalOpen, setModalOpen] = React.useState(false);
  const [selectedDocType, setSelectedDocType] = React.useState('PZ');

  // Pobranie informacji o zalogowanym użytkowniku (dla Sidebara/Topbara)
  const { user } = useUser();

  const openModal = (type: string = 'PZ') => {
    setSelectedDocType(type);
    setModalOpen(true);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard onActionClick={openModal} />;
      case 'inventory': return <Inventory />;
      case 'documents': return <Documents onNewClick={() => openModal('PZ')} />;
      case 'contractors': return <Contractors />;
      case 'reports': return <Reports />;
      default: return <Dashboard onActionClick={openModal} />;
    }
  };

  // Główny widok WMS widoczny tylko dla zalogowanych
  const mainLayout = (
    <div className="flex min-h-screen bg-background text-on-background">
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside 
        id="sidebar"
        className={`fixed left-0 top-0 h-full bg-surface-container-lowest border-r border-outline-variant z-50 transition-all duration-300 w-64 ${isSidebarOpen ? 'translate-x-0 shadow-2xl lg:shadow-none' : '-translate-x-full lg:translate-x-0 lg:w-20'}`}
      >
        <div className="p-6 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-primary-container rounded-lg flex items-center justify-center text-white shadow-sm">
              <Warehouse size={24} />
            </div>
            {(isSidebarOpen || !isSidebarOpen) && (
              <div 
                className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${isSidebarOpen ? 'w-auto opacity-100' : 'w-0 opacity-0 lg:hidden'}`}
              >
                <h1 className="font-bold text-lg text-primary">Simple WMS</h1>
                <p className="text-xs text-on-surface-variant font-medium tracking-tight">Warehouse system</p>
              </div>
            )}
          </div>
          {/* Mobile Close Button */}
          <button 
            onClick={() => setSidebarOpen(false)}
            className="p-2 hover:bg-surface-container-low rounded-lg text-on-surface-variant lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="px-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => {
                  setActiveTab(item.id);
                  if (window.innerWidth < 1024) setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all group ${
                  isActive 
                    ? 'bg-secondary-container/50 text-primary border-l-4 border-primary' 
                    : 'text-secondary hover:bg-surface-container-low'
                }`}
              >
                <item.icon size={20} className={isActive ? 'text-primary' : 'text-secondary'} />
                <span className={`font-semibold text-sm transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 lg:hidden'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        {/* Top Navbar */}
        <header id="topbar" className="h-16 sticky top-0 bg-surface-container-lowest/80 backdrop-blur-md border-b border-outline-variant px-6 flex items-center justify-between z-30">
          <div className="flex items-center gap-4 flex-1">
            <button 
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-surface-container-low rounded-lg text-on-surface-variant transition-colors"
            >
              <Menu size={20} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-on-surface">{user?.fullName || 'Użytkownik'}</p>
                <p className="text-xs text-on-surface-variant">Administrator</p>
              </div>
              {/* Dynamiczny avatar użytkownika Clerka z możliwością wylogowania */}
              <UserButton afterSignOutUrl="/"/>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      <NewDocumentModal 
        isOpen={isModalOpen} 
        onClose={() => setModalOpen(false)} 
        onSuccess={() => setModalOpen(false)}
        initialType={selectedDocType as any} 
      />
    </div>
  );

  return (
    <>
      {/* Pokazuje formularz logowania jeśli NIE ZALOGOWANY */}
      <SignedOut>
        <div className="min-h-screen flex items-center justify-center bg-surface-container-low">
          <SignIn />
        </div>
      </SignedOut>

      {/* Pokazuje strukturę aplikacji jeśli ZALOGOWANY */}
      <SignedIn>
        {mainLayout}
      </SignedIn>
    </>
  );
}