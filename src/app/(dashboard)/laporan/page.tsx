'use client';

import { useState } from 'react';
import { Calendar as CalendarIcon, TrendingUp, TrendingDown, DollarSign, FileSpreadsheet, FileText, Filter } from 'lucide-react';
import { formatRupiah } from '@/lib/utils/currency';
import { formatDateIndonesian } from '@/lib/utils/date';
import { exportFinancialReportToExcel } from '@/lib/utils/excel-exporter';
import { exportFinancialReportToPDF } from '@/lib/utils/pdf-exporter';
import { Transaction, Product } from '@/types';

import { mockProducts, mockTransactions } from '@/lib/utils/mock-data';

export default function LaporanPage() {
  const [periodType, setPeriodType] = useState<'harian' | 'bulanan' | 'tahunan'>('bulanan');
  const [selectedDate, setSelectedDate] = useState('2026-09-04');
  const [selectedMonth, setSelectedMonth] = useState('2026-09');
  const [selectedYear, setSelectedYear] = useState('2026');

  // Filter transaksi berdasarkan periode
  const filteredTransactions = mockTransactions.filter((t) => {
    if (periodType === 'harian') {
      return t.date === selectedDate;
    } else if (periodType === 'bulanan') {
      return t.date.startsWith(selectedMonth);
    } else if (periodType === 'tahunan') {
      return t.date.startsWith(selectedYear);
    }
    return true;
  });

  const totalIncome = filteredTransactions
    .filter((t) => t.type === 'pemasukan')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter((t) => t.type === 'pengeluaran')
    .reduce((sum, t) => sum + t.amount, 0);

  const netProfit = totalIncome - totalExpense;

  const getPeriodeString = () => {
    if (periodType === 'harian') return formatDateIndonesian(selectedDate);
    if (periodType === 'bulanan') return `Bulan ${selectedMonth}`;
    return `Tahun ${selectedYear}`;
  };

  // Handler Export (Tepat 1 File Excel berisi 2 sheet)
  const handleExportExcel = () => {
    exportFinancialReportToExcel({
      transactions: filteredTransactions,
      products: mockProducts,
      summary: {
        openingBalance: 0,
        totalIncome,
        totalExpense,
        closingBalance: netProfit,
      },
      storeName: 'Toko Berkah Utama',
      periode: getPeriodeString(),
      filename: `Laporan_${periodType.toUpperCase()}_${new Date().toISOString().slice(0, 10)}.xlsx`,
    });
  };

  const handleExportPDF = () => {
    exportFinancialReportToPDF({
      storeName: 'Toko Berkah Utama',
      periode: getPeriodeString(),
      summary: {
        openingBalance: 0,
        totalIncome,
        totalExpense,
        closingBalance: netProfit,
      },
      transactions: filteredTransactions,
      filename: `Laporan_${periodType.toUpperCase()}_${new Date().toISOString().slice(0, 10)}.pdf`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Periode */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Laporan Keuangan</h1>
          <p className="text-sm text-slate-500">Pilih periode laporan (Harian, Bulanan, atau Tahunan) dan unduh data.</p>
        </div>

        {/* Tab Selection: Harian / Bulanan / Tahunan */}
        <div className="flex items-center gap-1.5 bg-slate-200/70 p-1.5 rounded-2xl w-fit">
          <button
            onClick={() => setPeriodType('harian')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              periodType === 'harian' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Laporan Harian
          </button>
          <button
            onClick={() => setPeriodType('bulanan')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              periodType === 'bulanan' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Laporan Bulanan
          </button>
          <button
            onClick={() => setPeriodType('tahunan')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              periodType === 'tahunan' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Laporan Tahunan
          </button>
        </div>
      </div>

      {/* Control Bar: Selector Tanggal/Bulan/Tahun & Tombol Export */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="p-2.5 bg-brand-50 text-brand-600 rounded-xl border border-brand-200">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Filter {periodType === 'harian' ? 'Tanggal' : periodType === 'bulanan' ? 'Bulan & Tahun' : 'Tahun'}
            </label>
            {periodType === 'harian' && (
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="mt-0.5 px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-brand-500"
              />
            )}
            {periodType === 'bulanan' && (
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="mt-0.5 px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-brand-500"
              />
            )}
            {periodType === 'tahunan' && (
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="mt-0.5 px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="2026">Tahun 2026</option>
                <option value="2025">Tahun 2025</option>
                <option value="2024">Tahun 2024</option>
              </select>
            )}
          </div>
        </div>

        {/* Tombol Export (Button Only) */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export to Excel</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition-all"
          >
            <FileText className="w-4 h-4" />
            <span>Export to PDF</span>
          </button>
        </div>
      </div>

      {/* Financial Summary Cards untuk Periode Terpilih */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Pemasukan</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <span className="text-xl sm:text-2xl font-bold text-emerald-600">{formatRupiah(totalIncome)}</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Pengeluaran</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <span className="text-xl sm:text-2xl font-bold text-rose-600">{formatRupiah(totalExpense)}</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-indigo-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Laba Bersih Periode Ini</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <span className={`text-xl sm:text-2xl font-extrabold ${netProfit >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
            {formatRupiah(netProfit)}
          </span>
        </div>
      </div>

      {/* Tabel Data Laporan Periode Terpilih */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm">
            Rincian Transaksi ({filteredTransactions.length} Transaksi)
          </h3>
          <span className="text-xs font-medium text-slate-500">
            Periode: {periodType.toUpperCase()}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/70 text-slate-700 font-bold border-b border-slate-200">
                <th className="p-3.5">Tanggal</th>
                <th className="p-3.5">Tipe Transaksi</th>
                <th className="p-3.5">Kategori</th>
                <th className="p-3.5 text-right">Jumlah (Rp)</th>
                <th className="p-3.5">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    Tidak ada data transaksi pada periode ini.
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
                      className={`p-3.5 text-right font-bold ${
                        t.type === 'pemasukan' ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {formatRupiah(t.amount)}
                    </td>
                    <td className="p-3.5 text-slate-600">{t.description || '-'}</td>
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
