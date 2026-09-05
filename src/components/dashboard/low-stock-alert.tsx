'use client';

import Link from 'next/link';
import { AlertTriangle, ArrowRight, Package } from 'lucide-react';
import { Product } from '@/types';

interface LowStockAlertProps {
  products: Product[];
}

export function LowStockAlert({ products }: LowStockAlertProps) {
  const lowStockItems = products.filter((p) => p.stock <= p.min_stock);

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-xl border border-amber-200">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base">Peringatan Stok Menipis</h3>
            <p className="text-xs text-slate-500">{lowStockItems.length} Barang Perlu Restock</p>
          </div>
        </div>

        <Link
          href="/inventaris"
          className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
        >
          Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {lowStockItems.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400">
          <Package className="w-10 h-10 stroke-1 mb-2 text-slate-300" />
          <p className="text-sm font-medium text-slate-600">Semua Stok Aman</p>
          <p className="text-xs text-slate-400">Tidak ada barang di bawah batas minimum.</p>
        </div>
      ) : (
        <div className="space-y-3 flex-1 overflow-y-auto max-h-72 pr-1">
          {lowStockItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 bg-amber-50/50 border border-amber-200/60 rounded-xl text-xs"
            >
              <div className="space-y-0.5">
                <span className="font-semibold text-slate-800 text-sm block leading-tight">{item.name}</span>
                <span className="text-slate-500 font-mono text-[11px]">Kategori: {item.category}</span>
              </div>
              <div className="text-right">
                <span className="inline-block px-2 py-0.5 rounded-full bg-amber-500 text-white font-bold text-[11px]">
                  Sisa {item.stock} {item.unit}
                </span>
                <span className="block text-[10px] text-amber-700 font-medium mt-0.5">
                  Min: {item.min_stock} {item.unit}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
