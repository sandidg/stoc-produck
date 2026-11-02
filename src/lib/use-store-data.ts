'use client';
import { useEffect, useState } from 'react';
import { Product, Transaction } from '@/types';
import { initialProducts, initialTransactions } from '@/lib/utils/initial-data';
const eventName = 'store-data-changed';
function read<T>(key: string, fallback: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    const value = JSON.parse(raw);
    return Array.isArray(value) ? value : fallback;
  } catch { return fallback; }
}
export function useStoreData() {
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const refresh = () => {
      setProducts(read('inventoryProducts', initialProducts));
      setTransactions(read('cashbookTransactions', initialTransactions));
      setReady(true);
    };
    refresh();
    window.addEventListener('storage', refresh);
    window.addEventListener(eventName, refresh);
    window.addEventListener('focus', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener(eventName, refresh);
      window.removeEventListener('focus', refresh);
    };
  }, []);
  const saveProducts = (value: Product[]) => {
    localStorage.setItem('inventoryProducts', JSON.stringify(value));
    setProducts(value);
    window.dispatchEvent(new Event(eventName));
  };
  const saveTransactions = (value: Transaction[]) => {
    localStorage.setItem('cashbookTransactions', JSON.stringify(value));
    setTransactions(value);
    window.dispatchEvent(new Event(eventName));
  };
  return { products, transactions, saveProducts, saveTransactions, ready };
}
