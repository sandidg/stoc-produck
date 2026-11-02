'use client';
import { DailySummaryCards } from '@/components/dashboard/daily-summary-cards';
import { FinancialTrendChart } from '@/components/dashboard/financial-trend-chart';
import { LowStockAlert } from '@/components/dashboard/low-stock-alert';
import { ExportButtons } from '@/components/export/export-buttons';
import { useStoreData } from '@/lib/use-store-data';
import { dailySummary, monthlyChart, localDate } from '@/lib/utils/store-summary';

export default function DashboardPage() {
  const { products, transactions, ready } = useStoreData();
  const today = localDate();
  const summary = dailySummary(transactions, today);
  const chartData = monthlyChart(transactions, today);
  if (!ready) return <p role="status">Memuat data toko...</p>;
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
          transactions={transactions.filter((t) => t.date === today)}
          products={products}
          summary={summary}
          storeName="Toko Berkah Utama"
        />
      </div>

      {/* 1. Ringkasan Keuangan Harian Cards */}
      <DailySummaryCards summary={summary} />

      {/* 2. Charts & Low Stock Warning Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recharts Trend Chart (2 Kolom di Desktop) */}
        <div className="lg:col-span-2">
          <FinancialTrendChart data={chartData} />
        </div>

        {/* Low Stock Alert (1 Kolom di Desktop) */}
        <div className="lg:col-span-1">
          <LowStockAlert products={products} />
        </div>
      </div>
    </div>
  );
}
