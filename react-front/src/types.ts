export interface DocumentItem {
  product_id: number;
  quantity: number;
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
