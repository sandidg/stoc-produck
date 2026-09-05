'use client';

import { useState } from 'react';
import { FileSpreadsheet, FileText } from 'lucide-react';
import { Transaction, Product, DailySummary } from '@/types';
import { exportFinancialReportToExcel } from '@/lib/utils/excel-exporter';
import { exportFinancialReportToPDF } from '@/lib/utils/pdf-exporter';

interface ExportButtonsProps {
  transactions: Transaction[];
  products: Product[];
  summary?: DailySummary;
  storeName?: string;
}

export function ExportButtons({ transactions, products, summary, storeName = 'Toko Berkah Utama' }: ExportButtonsProps) {
  const [loading, setLoading] = useState(false);

  const handleExportExcel = () => {
    setLoading(true);
    try {
      exportFinancialReportToExcel({
        transactions,
        products,
        summary,
        storeName,
        filename: `Laporan_Keuangan_${new Date().toISOString().slice(0, 10)}.xlsx`,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    setLoading(true);
    try {
      exportFinancialReportToPDF({
        storeName,
        transactions,
        summary,
        filename: `Laporan_Keuangan_${new Date().toISOString().slice(0, 10)}.pdf`,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        onClick={handleExportExcel}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium text-xs sm:text-sm rounded-xl shadow-sm transition-all duration-150 disabled:opacity-50"
      >
        <FileSpreadsheet className="w-4 h-4" />
        <span>Export to Excel</span>
      </button>

      <button
        onClick={handleExportPDF}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition-all duration-150 disabled:opacity-50"
      >
        <FileText className="w-4 h-4" />
        <span>Export to PDF</span>
      </button>
    </div>
  );
}
