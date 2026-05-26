export interface Product {
  id: number;
  sku: string;
  name: string;
  type: string;
  unit: string;
  stock_quantity: number;
  purchase_price: number;
  selling_price: number;
}

export interface DocumentItem {
  product_id: number;
  quantity: number;
  unit_price: number;
  product: {
    sku: string;
    name: string;
    unit: string;
  };
}

export interface Document {
  id: number;
  type: 'PZ' | 'WZ' | 'ZW' | 'RW' | 'PW';
  contractor_name?: string;
  contractor_id?: number | null;
  created_at: string;
  created_by?: string;
  items: DocumentItem[];
}

export interface Contractor {
  id: number;
  name: string;
  nip: string | null;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}
