import { 
  Warehouse, 
  LayoutDashboard, 
  Boxes, 
  FileText, 
  BarChart3, 
  Search, 
  LogIn, 
  LogOut, 
  ArrowLeftRight, 
  FastForward,
  Users 
} from 'lucide-react';

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Panel główny', icon: LayoutDashboard },
  { id: 'inventory', label: 'Inwentarz', icon: Boxes },
  { id: 'documents', label: 'Dokumenty', icon: FileText },
  { id: 'contractors', label: 'Kontrahenci', icon: Users },
  { id: 'reports', label: 'Raporty', icon: BarChart3 },
];

export const ACTION_CARDS = [
  {
    id: 'pz',
    code: 'PZ',
    title: 'Przyjęcie zewnętrzne',
    icon: LogIn,
    variant: 'primary',
  },
  {
    id: 'wz',
    code: 'WZ',
    title: 'Wydanie zewnętrzne',
    icon: LogOut,
    variant: 'primary',
  },
  {
    id: 'zw',
    code: 'ZW',
    title: 'Zwrot wewnętrzny',
    icon: ArrowLeftRight,
    variant: 'secondary',
  },
  {
    id: 'rw',
    code: 'RW',
    title: 'Rozchód wewnętrzny',
    icon: FastForward,
    variant: 'secondary',
  },
];

export const RECENT_DOCUMENTS = [
  // ... existing documents ...
  {
    id: 'PZ/2023/001',
    type: 'PZ',
    date: 'Paź 24, 2023',
    status: 'Zakończone',
    responsible: {
      name: 'Michael Scott',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&q=80',
    },
  },
  {
    id: 'WZ/2023/042',
    type: 'WZ',
    date: 'Paź 24, 2023',
    status: 'Szkic',
    responsible: {
      name: 'Pam Beesly',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&q=80',
    },
  },
  {
    id: 'RW/2023/011',
    type: 'RW',
    date: 'Paź 23, 2023',
    status: 'Zakończone',
    responsible: {
      name: 'Dwight Schrute',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&q=80',
    },
  },
  {
    id: 'PZ/2023/002',
    type: 'PZ',
    date: 'Paź 23, 2023',
    status: 'Szkic',
    responsible: {
      name: 'Jim Halpert',
      initials: 'JH',
    },
  },
  {
    id: 'ZW/2023/005',
    type: 'ZW',
    date: 'Paź 22, 2023',
    status: 'Zakończone',
    responsible: {
      name: 'Angela Martin',
      initials: 'AM',
    },
  },
];

export const INVENTORY_ITEMS = [
  { id: 'SKU-001', name: 'Paleta Drewniana Euro', quantity: 450, unit: 'szt', location: 'A-01-04' },
  { id: 'SKU-002', name: 'Karton Klapowy 40x40x40', quantity: 1200, unit: 'szt', location: 'B-04-12' },
  { id: 'SKU-003', name: 'Folia Stretch 2.5kg', quantity: 85, unit: 'rol', location: 'C-02-01' },
  { id: 'SKU-004', name: 'Taśma Pakowa Brązowa', quantity: 240, unit: 'rol', location: 'C-02-05' },
  { id: 'SKU-005', name: 'Wózek Widłowy Akumulator', quantity: 2, unit: 'szt', location: 'G-01-01' },
];

export const REPORT_DATA = [
  { name: 'Pon', pz: 4000, wz: 2400 },
  { name: 'Wt', pz: 3000, wz: 1398 },
  { name: 'Śr', pz: 2000, wz: 9800 },
  { name: 'Czw', pz: 2780, wz: 3908 },
  { name: 'Pt', pz: 1890, wz: 4800 },
  { name: 'Sob', pz: 2390, wz: 3800 },
  { name: 'Ndz', pz: 3490, wz: 4300 },
];

export const CONTRACTORS = [
  { id: 'K-001', name: 'Logistyka Polska Sp. z o.o.', nip: '5213456789', city: 'Warszawa', type: 'Dostawca' },
  { id: 'K-002', name: 'Trans-Port S.A.', nip: '7781234567', city: 'Gdańsk', type: 'Przewoźnik' },
  { id: 'K-003', name: 'Eko-Paczka Sp. j.', nip: '6469876543', city: 'Wrocław', type: 'Odbiorca' },
  { id: 'K-004', name: 'Magazyn Centralny', nip: '1234567890', city: 'Łódź', type: 'Wewnętrzny' },
];

export const API_URL = import.meta.env.VITE_API_URL || 'https://simple-wms.onrender.com';