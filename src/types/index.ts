export type TransactionType = 'pemasukan' | 'pengeluaran';
export type TransactionSource = 'manual' | 'restock_inventory' | 'sale_inventory';
export type LogType = 'in' | 'out';

export interface Profile {
  id: string;
  full_name: string | null;
  store_name: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  user_id: string;
  sku: string | null;
  name: string;
  category: string;
  buy_price: number;
  sell_price: number;
  stock: number;
  min_stock: number;
  unit: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  category: string;
  amount: number;
  description: string | null;
  date: string; // YYYY-MM-DD
  source: TransactionSource;
  created_at: string;
}

export interface InventoryLog {
  id: string;
  user_id: string;
  product_id: string;
  type: LogType;
  qty: number;
  unit_price: number;
  total_price: number;
  notes: string | null;
  transaction_id: string | null;
  date: string;
  created_at: string;
  products?: Product;
}

export interface DailySummary {
  openingBalance: number;    // Saldo Kas Awal (sebelum tanggal dipilih/hari ini)
  totalIncome: number;       // Total Pemasukan Hari Ini
  totalExpense: number;      // Total Pengeluaran Hari Ini
  closingBalance: number;    // Saldo Kas Akhir (Awal + Pemasukan - Pengeluaran)
}

export interface ChartDataPoint {
  date: string;
  pemasukan: number;
  pengeluaran: number;
}
