'use client';

import { Wallet, TrendingUp, TrendingDown, Landmark } from 'lucide-react';
import { formatRupiah } from '@/lib/utils/currency';
import { DailySummary } from '@/types';

interface DailySummaryCardsProps {
  summary: DailySummary;
}

export function DailySummaryCards({ summary }: DailySummaryCardsProps) {
  const cards = [
    {
      title: 'Saldo Kas Awal',
      subtitle: 'Kalkulasi s/d Kemarin',
      amount: summary.openingBalance,
      icon: Wallet,
      iconBg: 'bg-blue-50 text-blue-600 border-blue-200',
      borderAccent: 'border-l-blue-500',
      textColor: 'text-slate-900',
    },
    {
      title: 'Pemasukan Hari Ini',
      subtitle: 'Total Kas Masuk',
      amount: summary.totalIncome,
      icon: TrendingUp,
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      borderAccent: 'border-l-emerald-500',
      textColor: 'text-emerald-600',
    },
    {
      title: 'Pengeluaran Hari Ini',
      subtitle: 'Total Kas Keluar',
      amount: summary.totalExpense,
      icon: TrendingDown,
      iconBg: 'bg-rose-50 text-rose-600 border-rose-200',
      borderAccent: 'border-l-rose-500',
      textColor: 'text-rose-600',
    },
    {
      title: 'Saldo Kas Akhir',
      subtitle: 'Awal + Masuk - Keluar',
      amount: summary.closingBalance,
      icon: Landmark,
      iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-200',
      borderAccent: 'border-l-indigo-500',
      textColor: 'text-indigo-700 font-extrabold',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 border-l-4 ${card.borderAccent}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {card.title}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">{card.subtitle}</p>
              </div>
              <div className={`p-2.5 rounded-xl border ${card.iconBg}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-2">
              <span className={`text-xl sm:text-2xl tracking-tight font-bold ${card.textColor}`}>
                {formatRupiah(card.amount)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
