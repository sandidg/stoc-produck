import { DailySummaryCards } from '@/components/dashboard/daily-summary-cards';
import { FinancialTrendChart } from '@/components/dashboard/financial-trend-chart';
import { LowStockAlert } from '@/components/dashboard/low-stock-alert';
import { ExportButtons } from '@/components/export/export-buttons';
import { ChartDataPoint } from '@/types';
import { mockProducts, mockTransactions, mockSummary } from '@/lib/utils/mock-data';

const mockChartData: ChartDataPoint[] = [
  { date: '01 Sep', pemasukan: 420000, pengeluaran: 150000 },
  { date: '02 Sep', pemasukan: 580000, pengeluaran: 300000 },
  { date: '03 Sep', pemasukan: 540000, pengeluaran: 180000 },
  { date: '04 Sep', pemasukan: 350000, pengeluaran: 170000 },
];

export default function DashboardPage() {
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
          transactions={mockTransactions}
          products={mockProducts}
          summary={mockSummary}
          storeName="Toko Berkah Utama"
        />
      </div>

      {/* 1. Ringkasan Keuangan Harian Cards */}
      <DailySummaryCards summary={mockSummary} />

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
