'use client';

import { useState } from 'react';
import { Search, Calendar, Filter, PlusCircle, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { formatRupiah } from '@/lib/utils/currency';
import { formatDateIndonesian } from '@/lib/utils/date';
import { ExportButtons } from '@/components/export/export-buttons';
import { mockProducts } from '@/lib/utils/mock-data';
import { Transaction } from '@/types';

const initialTransactions: Transaction[] = [
  { id: 't1', user_id: 'u1', type: 'pemasukan', category: 'Penjualan Barang', amount: 350000, description: 'Penjualan sembako harian', date: '2026-09-04', source: 'sale_inventory', created_at: '' },
  { id: 't2', user_id: 'u1', type: 'pengeluaran', category: 'Pembelian Stok Barang', amount: 120000, description: 'Restock Minyak Goreng', date: '2026-09-04', source: 'restock_inventory', created_at: '' },
  { id: 't3', user_id: 'u1', type: 'pengeluaran', category: 'Operasional', amount: 50000, description: 'Bayar Listrik Toko', date: '2026-09-04', source: 'manual', created_at: '' },
  { id: 't4', user_id: 'u1', type: 'pemasukan', category: 'Penjualan Barang', amount: 540000, description: 'Penjualan grosir beras 10 sak', date: '2026-09-03', source: 'sale_inventory', created_at: '' },
  { id: 't5', user_id: 'u1', type: 'pengeluaran', category: 'Sewa Tempat', amount: 500000, description: 'Sewa ruko bulanan', date: '2026-09-01', source: 'manual', created_at: '' },
];

export default function BukuKasPage() {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'pemasukan' | 'pengeluaran'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Form modal/card state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newType, setNewType] = useState<'pemasukan' | 'pengeluaran'>('pemasukan');
  const [newCategory, setNewCategory] = useState('Penjualan');
  const [newAmount, setNewAmount] = useState(0);
  const [newDescription, setNewDescription] = useState('');

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAmount <= 0) return;

    const newTrans: Transaction = {
      id: `t_${Date.now()}`,
      user_id: 'u1',
      type: newType,
      category: newCategory,
      amount: Number(newAmount),
      description: newDescription,
      date: new Date().toISOString().slice(0, 10),
      source: 'manual',
      created_at: new Date().toISOString(),
    };

    setTransactions([newTrans, ...transactions]);
    setShowAddForm(false);
    setNewAmount(0);
    setNewDescription('');
  };

  const filteredTransactions = transactions.filter((t) => {
    const matchSearch =
      t.category.toLowerCase().includes(search.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(search.toLowerCase()));
    const matchType = filterType === 'all' || t.type === filterType;
    const matchDateStart = !startDate || t.date >= startDate;
    const matchDateEnd = !endDate || t.date <= endDate;

    return matchSearch && matchType && matchDateStart && matchDateEnd;
  });

  const totalIncome = filteredTransactions
    .filter((t) => t.type === 'pemasukan')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter((t) => t.type === 'pengeluaran')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Buku Kas & Riwayat Transaksi</h1>
          <p className="text-sm text-slate-500">Catat transaksi pemasukan/pengeluaran manual & ekspor laporan.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tambah Transaksi</span>
          </button>

          <ExportButtons
            transactions={filteredTransactions}
            products={mockProducts}
            summary={{
              openingBalance: 2450000,
              totalIncome,
              totalExpense,
              closingBalance: 2450000 + totalIncome - totalExpense,
            }}
            storeName="Toko Berkah Utama"
          />
        </div>
      </div>

      {/* Form Card Tambah Transaksi */}
      {showAddForm && (
        <div className="bg-white p-5 rounded-2xl border border-brand-200 shadow-md">
          <h3 className="font-bold text-slate-800 text-base mb-3">Form Catat Transaksi Manual</h3>
          <form onSubmit={handleAddTransaction} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Tipe Transaksi</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
              >
                <option value="pemasukan">Pemasukan (Kas Masuk)</option>
                <option value="pengeluaran">Pengeluaran (Kas Keluar)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Kategori</label>
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Contoh: Operasional / Sewa"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Jumlah (Rp)</label>
              <input
                type="number"
                value={newAmount}
                onChange={(e) => setNewAmount(Number(e.target.value))}
                placeholder="0"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Keterangan</label>
              <input
                type="text"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Detail catatan"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-4 flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-slate-100 text-slate-600 font-semibold text-xs rounded-xl hover:bg-slate-200"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-brand-600 text-white font-semibold text-xs rounded-xl hover:bg-brand-700 shadow-sm"
              >
                Simpan Transaksi
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Ringkasan Filter & Total */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-emerald-50 border border-emerald-200/70 p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ArrowDownCircle className="w-8 h-8 text-emerald-600" />
            <div>
              <p className="text-xs text-emerald-800 font-medium">Total Pemasukan (Filtered)</p>
              <p className="text-xl font-bold text-emerald-700">{formatRupiah(totalIncome)}</p>
            </div>
          </div>
        </div>

        <div className="bg-rose-50 border border-rose-200/70 p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ArrowUpCircle className="w-8 h-8 text-rose-600" />
            <div>
              <p className="text-xs text-rose-800 font-medium">Total Pengeluaran (Filtered)</p>
              <p className="text-xl font-bold text-rose-700">{formatRupiah(totalExpense)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Bar: Search, Type Filter, Date Range */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari transaksi..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Filter Type */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                filterType === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setFilterType('pemasukan')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                filterType === 'pemasukan' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500'
              }`}
            >
              Masuk
            </button>
            <button
              onClick={() => setFilterType('pengeluaran')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                filterType === 'pengeluaran' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-500'
              }`}
            >
              Keluar
            </button>
          </div>

          {/* Date Range Inputs */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2 py-1.5 border border-slate-300 rounded-xl outline-none"
            />
            <span>s/d</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2 py-1.5 border border-slate-300 rounded-xl outline-none"
            />
          </div>
        </div>
      </div>

      {/* Tabel Transaksi Keuangan */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                <th className="p-3.5">Tanggal</th>
                <th className="p-3.5">Tipe</th>
                <th className="p-3.5">Kategori</th>
                <th className="p-3.5 text-right">Jumlah</th>
                <th className="p-3.5">Keterangan</th>
                <th className="p-3.5">Sumber</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    Tidak ada transaksi yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="p-3.5 font-medium text-slate-700">{formatDateIndonesian(t.date)}</td>
                    <td className="p-3.5">
                      {t.type === 'pemasukan' ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          PEMASUKAN
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px]">
                          PENGELUARAN
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 font-semibold text-slate-800">{t.category}</td>
                    <td
                      className={`p-3.5 text-right font-extrabold ${
                        t.type === 'pemasukan' ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {formatRupiah(t.amount)}
                    </td>
                    <td className="p-3.5 text-slate-600">{t.description || '-'}</td>
                    <td className="p-3.5 text-slate-400 font-mono text-[11px]">{t.source}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
