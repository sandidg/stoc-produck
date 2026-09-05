import { Product, Transaction, DailySummary } from '@/types';

export const mockProducts: Product[] = [
  { id: '1', user_id: 'u1', sku: 'BRG-001', name: 'Beras Pandan Wangi 5kg', category: 'Sembako', buy_price: 62000, sell_price: 75000, stock: 3, min_stock: 5, unit: 'sak', created_at: '', updated_at: '' },
  { id: '2', user_id: 'u1', sku: 'BRG-002', name: 'Minyak Goreng 2L', category: 'Sembako', buy_price: 28000, sell_price: 34000, stock: 2, min_stock: 10, unit: 'pouch', created_at: '', updated_at: '' },
  { id: '3', user_id: 'u1', sku: 'BRG-003', name: 'Gula Pasir 1kg', category: 'Sembako', buy_price: 14000, sell_price: 17500, stock: 25, min_stock: 10, unit: 'kg', created_at: '', updated_at: '' },
  { id: '4', user_id: 'u1', sku: 'BRG-004', name: 'Telur Ayam 1kg', category: 'Sembako', buy_price: 24000, sell_price: 29000, stock: 4, min_stock: 8, unit: 'kg', created_at: '', updated_at: '' },
  { id: '5', user_id: 'u1', sku: 'BRG-005', name: 'Kain Katun Premium', category: 'Tekstil', buy_price: 150000, sell_price: 200000, stock: 3, min_stock: 5, unit: 'ball', created_at: '', updated_at: '' },
  { id: '6', user_id: 'u1', sku: 'BRG-006', name: 'Miyang Instan Dus', category: 'Sembako', buy_price: 45000, sell_price: 55000, stock: 2, min_stock: 5, unit: 'kardus', created_at: '', updated_at: '' },
];

export const mockTransactions: Transaction[] = [
  { id: 't1', user_id: 'u1', type: 'pemasukan', category: 'Penjualan Barang', amount: 350000, description: 'Penjualan sembako harian', date: '2026-09-04', source: 'sale_inventory', created_at: '' },
  { id: 't2', user_id: 'u1', type: 'pengeluaran', category: 'Pembelian Stok Barang', amount: 120000, description: 'Restock Minyak Goreng', date: '2026-09-04', source: 'restock_inventory', created_at: '' },
  { id: 't3', user_id: 'u1', type: 'pengeluaran', category: 'Operasional', amount: 50000, description: 'Bayar Listrik Toko', date: '2026-09-04', source: 'manual', created_at: '' },
  { id: 't4', user_id: 'u1', type: 'pemasukan', category: 'Penjualan Barang', amount: 540000, description: 'Penjualan grosir beras 10 sak', date: '2026-09-03', source: 'sale_inventory', created_at: '' },
  { id: 't5', user_id: 'u1', type: 'pengeluaran', category: 'Sewa Tempat', amount: 500000, description: 'Sewa ruko bulanan', date: '2026-09-01', source: 'manual', created_at: '' },
  { id: 't6', user_id: 'u1', type: 'pemasukan', category: 'Penjualan Barang', amount: 1250000, description: 'Penjualan sembako bulanan', date: '2026-08-25', source: 'sale_inventory', created_at: '' },
];

export const mockSummary: DailySummary = {
  openingBalance: 2450000,
  totalIncome: 2140000,
  totalExpense: 670000,
  closingBalance: 2450000 + 2140000 - 670000,
};
