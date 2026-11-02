import { Product, Transaction } from '@/types';
export const initialProducts: Product[] = [
  { id: '1', user_id: 'u1', sku: 'BRG-001', name: 'Beras Pandan Wangi 5kg', category: 'Sembako', buy_price: 62000, sell_price: 75000, stock: 3, min_stock: 5, unit: 'sak', created_at: '', updated_at: '' },
  { id: '2', user_id: 'u1', sku: 'BRG-002', name: 'Minyak Goreng 2L', category: 'Sembako', buy_price: 28000, sell_price: 34000, stock: 2, min_stock: 10, unit: 'pouch', created_at: '', updated_at: '' },
  { id: '3', user_id: 'u1', sku: 'BRG-003', name: 'Gula Pasir 1kg', category: 'Sembako', buy_price: 14000, sell_price: 17500, stock: 25, min_stock: 10, unit: 'kg', created_at: '', updated_at: '' },
  { id: '4', user_id: 'u1', sku: 'BRG-004', name: 'Telur Ayam 1kg', category: 'Sembako', buy_price: 24000, sell_price: 29000, stock: 4, min_stock: 8, unit: 'kg', created_at: '', updated_at: '' },
];
export const initialTransactions: Transaction[] = [];