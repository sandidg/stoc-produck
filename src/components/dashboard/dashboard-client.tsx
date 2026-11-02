'use client';

import { useState, useEffect } from 'react';
import { DailySummaryCards } from '@/components/dashboard/daily-summary-cards';
import { FinancialTrendChart } from '@/components/dashboard/financial-trend-chart';
import { LowStockAlert } from '@/components/dashboard/low-stock-alert';
import { ExportButtons } from '@/components/export/export-buttons';
import { ChartDataPoint, Transaction, DailySummary } from '@/types';
import { mockProducts, mockTransactions } from '@/lib/utils/mock-data';

const OPENING_BALANCE = 2450000;

const mockChartData: ChartDataPoint[] = [
  { date: '01 Sep', pemasukan: 420000, pengeluaran: 150000 },
  { date: '02 Sep', pemasukan: 580000, pengeluaran: 300000 },
  { date: '03 Sep', pemasukan: 540000, pengeluaran: 180000 },
  { date: '04 Sep', pemasukan: 350000, pengeluaran: 170000 },
];

// Transaksi awal yang sama dengan buku-kas/page.tsx
const initialTransactions: Transaction[] = [
  { id: 't1', user_id: 'u1', type: 'pemasukan', category: 'Penjualan Barang', amount: 350000, description: 'Penjualan sembako harian', date: '2026-09-04', source: 'sale_inventory', created_at: '' },
  { id: 't2', user_id: 'u1', type: 'pengeluaran', category: 'Pembelian Stok Barang', amount: 120000, description: 'Restock Minyak Goreng', date: '2026-09-04', source: 'restock_inventory', created_at: '' },
  { id: 't3', user_id: 'u1', type: 'pengeluaran', category: 'Operasional', amount: 50000, description: 'Bayar Listrik Toko', date: '2026-09-04', source: 'manual', created_at: '' },
  { id: 't4', user_id: 'u1', type: 'pemasukan', category: 'Penjualan Barang', amount: 540000, description: 'Penjualan grosir beras 10 sak', date: '2026-09-03', source: 'sale_inventory', created_at: '' },
  { id: 't5', user_id: 'u1', type: 'pengeluaran', category: 'Sewa Tempat', amount: 500000, description: 'Sewa ruko bulanan', date: '2026-09-01', source: 'manual', created_at: '' },
];

export function DashboardClient() {
  const [summary, setSummary] = useState<DailySummary>({
    openingBalance: OPENING_BALANCE,
    totalIncome: 0,
    totalExpense: 0,
    closingBalance: OPENING_BALANCE,
  });

  const [liveTransactions, setLiveTransactions] = useState<Transaction[]>(mockTransactions);

  const recalcFromStorage = () => {
    const saved = localStorage.getItem('cashbookTransactions');
    let transactions: Transaction[] = initialTransactions;

    if (saved) {
      try {
        transactions = JSON.parse(saved);
      } catch (e) {
        transactions = initialTransactions;
      }
    }

    setLiveTransactions(transactions);

    // Hitung total pemasukan & pengeluaran dari semua transaksi
    const totalIncome = transactions
      .filter((t) => t.type === 'pemasukan')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter((t) => t.type === 'pengeluaran')
      .reduce((sum, t) => sum + t.amount, 0);

    setSummary({
      openingBalance: OPENING_BALANCE,
      totalIncome,
      totalExpense,
      closingBalance: OPENING_BALANCE + totalIncome - totalExpense,
    });
  };

  useEffect(() => {
    // Hitung pertama kali saat komponen mount
    recalcFromStorage();

    // Update otomatis saat localStorage berubah (antar tab)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'cashbookTransactions') recalcFromStorage();
    };

    // Update otomatis saat user kembali ke tab/window dashboard
    const handleFocus = () => recalcFromStorage();

    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', handleFocus);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      {/* Title & Quick Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Dashboard Keuangan</h1>
          <p className="text-sm text-slate-500">Ringkasan kas harian dan kondisi inventaris toko Anda.</p>
        </div>

        {/* Export Buttons */}
        <ExportButtons
          transactions={liveTransactions}
          products={mockProducts}
          summary={summary}
          storeName="Toko Berkah Utama"
        />
      </div>

      {/* 1. Ringkasan Keuangan Harian Cards — dihitung dari localStorage */}
      <DailySummaryCards summary={summary} />

      {/* 2. Charts & Low Stock Warning Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recharts Trend Chart (2 Kolom di Desktop) */}
        <div className="lg:col-span-2">
          <FinancialTrendChart data={mockChartData} />
        </div>

        {/* Low Stock Alert (1 Kolom di Desktop) */}
        <div className="lg:col-span-1">
          <LowStockAlert products={mockProducts} />
        </div>
      </div>
    </div>
  );
}
