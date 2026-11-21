'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Product, Transaction } from '@/types';
import { initialProducts, initialTransactions } from '@/lib/utils/initial-data';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

const eventName = 'store-data-changed';

function read<T>(key: string, fallback: T[]): T[] {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    const value = JSON.parse(raw);
    return Array.isArray(value) ? value : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('LocalStorage write error:', e);
  }
}

const cleanProduct = (p: Product): Record<string, any> => ({
  id: String(p.id),
  user_id: p.user_id || 'u1',
  sku: p.sku || null,
  name: p.name || 'Produk Tanpa Nama',
  category: p.category || 'Umum',
  buy_price: Number(p.buy_price) || 0,
  sell_price: Number(p.sell_price) || 0,
  stock: Number(p.stock) || 0,
  min_stock: Number(p.min_stock) || 0,
  unit: p.unit || 'pcs',
  created_at: p.created_at && p.created_at.trim() ? p.created_at : new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

const cleanTransaction = (t: Transaction): Record<string, any> => ({
  id: String(t.id),
  user_id: t.user_id || 'u1',
  type: t.type,
  category: t.category || 'Umum',
  amount: Number(t.amount) || 0,
  description: t.description || null,
  date: t.date || new Date().toISOString().slice(0, 10),
  source: t.source || 'manual',
  created_at: t.created_at && t.created_at.trim() ? t.created_at : new Date().toISOString(),
});

export function useStoreData() {
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [ready, setReady] = useState(false);

  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;
  const isConfigured = isSupabaseConfigured();

  // Membaca data dari cache lokal (localStorage)
  const refreshFromLocal = useCallback(() => {
    setProducts(read<Product>('inventoryProducts', initialProducts));
    setTransactions(read<Transaction>('cashbookTransactions', initialTransactions));
    setReady(true);
  }, []);

  // Fetch data dari Supabase
  const fetchFromSupabase = useCallback(async () => {
    if (!isConfigured) return;

    try {
      // 1. Ambil data produk
      const { data: dbProducts, error: prodErr } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (!prodErr && dbProducts) {
        if (dbProducts.length > 0) {
          const mapped: Product[] = dbProducts.map((p: any) => ({
            id: String(p.id),
            user_id: String(p.user_id || 'u1'),
            sku: p.sku || null,
            name: p.name,
            category: p.category || 'Umum',
            buy_price: Number(p.buy_price) || 0,
            sell_price: Number(p.sell_price) || 0,
            stock: Number(p.stock) || 0,
            min_stock: Number(p.min_stock) || 0,
            unit: p.unit || 'pcs',
            created_at: p.created_at || '',
            updated_at: p.updated_at || '',
          }));
          setProducts(mapped);
          write('inventoryProducts', mapped);
        } else {
          // Jika Supabase masih kosong, upload data awal dari localStorage ke Supabase
          const localProd = read<Product>('inventoryProducts', initialProducts);
          if (localProd.length > 0) {
            await supabase.from('products').upsert(localProd.map(cleanProduct));
          }
        }
      }

      // 2. Ambil data transaksi
      const { data: dbTransactions, error: transErr } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

      if (!transErr && dbTransactions) {
        if (dbTransactions.length > 0) {
          const mapped: Transaction[] = dbTransactions.map((t: any) => ({
            id: String(t.id),
            user_id: String(t.user_id || 'u1'),
            type: t.type,
            category: t.category || 'Umum',
            amount: Number(t.amount) || 0,
            description: t.description || null,
            date: String(t.date),
            source: t.source || 'manual',
            created_at: t.created_at || '',
          }));
          setTransactions(mapped);
          write('cashbookTransactions', mapped);
        } else {
          // Jika Supabase kosong dan ada transaksi lokal, upload
          const localTrans = read<Transaction>('cashbookTransactions', initialTransactions);
          if (localTrans.length > 0) {
            await supabase.from('transactions').upsert(localTrans.map(cleanTransaction));
          }
        }
      }
    } catch (err) {
      console.warn('Gagal sinkronisasi data dari Supabase, menggunakan data lokal:', err);
    }
  }, [isConfigured, supabase]);

  useEffect(() => {
    // 1. Tampilkan data dari localStorage segera agar UI tidak loading lama
    refreshFromLocal();

    // 2. Ambil data terbaru dari Supabase
    fetchFromSupabase();

    // 3. Event listeners untuk multi-tab & internal changes
    const onStorageChange = () => refreshFromLocal();
    const onCustomChange = () => refreshFromLocal();
    const onFocus = () => {
      refreshFromLocal();
      fetchFromSupabase();
    };

    window.addEventListener('storage', onStorageChange);
    window.addEventListener(eventName, onCustomChange);
    window.addEventListener('focus', onFocus);

    // 4. Realtime subscription Supabase (jika terkonfigurasi)
    let channel: any = null;
    if (isConfigured) {
      try {
        channel = supabase
          .channel('db-realtime-sync')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
            fetchFromSupabase();
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => {
            fetchFromSupabase();
          })
          .subscribe();
      } catch (e) {
        // Abaikan jika realtime belum aktif
      }
    }

    return () => {
      window.removeEventListener('storage', onStorageChange);
      window.removeEventListener(eventName, onCustomChange);
      window.removeEventListener('focus', onFocus);
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [refreshFromLocal, fetchFromSupabase, isConfigured, supabase]);

  // Simpan produk (Optimistic ke LocalStorage + Sync ke Supabase)
  const saveProducts = async (value: Product[]) => {
    const current = read<Product>('inventoryProducts', initialProducts);
    const currentIds = current.map((p) => String(p.id));
    const newIds = new Set(value.map((p) => String(p.id)));
    const deletedIds = currentIds.filter((id) => !newIds.has(id));

    // Update lokal & UI langsung
    write('inventoryProducts', value);
    setProducts(value);
    window.dispatchEvent(new Event(eventName));

    // Sync ke Supabase di background
    if (isConfigured) {
      try {
        if (deletedIds.length > 0) {
          await supabase.from('products').delete().in('id', deletedIds);
        }
        if (value.length > 0) {
          const payload = value.map(cleanProduct);
          const { error } = await supabase.from('products').upsert(payload);
          if (error) {
            console.error('Error saat menyimpan produk ke Supabase:', error.message);
          }
        }
      } catch (err) {
        console.error('Gagal menghubungi Supabase untuk simpan produk:', err);
      }
    }
  };

  // Simpan transaksi (Optimistic ke LocalStorage + Sync ke Supabase)
  const saveTransactions = async (value: Transaction[]) => {
    const current = read<Transaction>('cashbookTransactions', initialTransactions);
    const currentIds = current.map((t) => String(t.id));
    const newIds = new Set(value.map((t) => String(t.id)));
    const deletedIds = currentIds.filter((id) => !newIds.has(id));

    // Update lokal & UI langsung
    write('cashbookTransactions', value);
    setTransactions(value);
    window.dispatchEvent(new Event(eventName));

    // Sync ke Supabase di background
    if (isConfigured) {
      try {
        if (deletedIds.length > 0) {
          await supabase.from('transactions').delete().in('id', deletedIds);
        }
        if (value.length > 0) {
          const payload = value.map(cleanTransaction);
          const { error } = await supabase.from('transactions').upsert(payload);
          if (error) {
            console.error('Error saat menyimpan transaksi ke Supabase:', error.message);
          }
        }
      } catch (err) {
        console.error('Gagal menghubungi Supabase untuk simpan transaksi:', err);
      }
    }
  };

  return { products, transactions, saveProducts, saveTransactions, ready };
}
