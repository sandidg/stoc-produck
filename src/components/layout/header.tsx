'use client';

import { Calendar, UserCircle, LogOut } from 'lucide-react';
import { formatDateIndonesian } from '@/lib/utils/date';
import { createClient } from '@/lib/supabase/client';

interface HeaderProps {
  storeName?: string;
  userEmail?: string;
}

export function Header({ storeName = 'Toko Berkah Utama', userEmail = 'user@example.com' }: HeaderProps) {
  const today = formatDateIndonesian(new Date());
  const supabase = createClient();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      window.location.href = '/login';
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-4 md:px-8 py-3.5 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <div>
          <h2 className="font-bold text-slate-800 text-base md:text-lg leading-tight">{storeName}</h2>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
            <Calendar className="w-3.5 h-3.5 text-brand-600" />
            <span>{today}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex flex-col text-right">
          <span className="text-xs font-semibold text-slate-700">{userEmail}</span>
          <span className="text-[10px] text-brand-600 font-medium bg-brand-50 px-2 py-0.5 rounded-full inline-block">Pemilik Toko</span>
        </div>
        
        <button
          onClick={handleLogout}
          title="Keluar dari Aplikasi"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs rounded-xl border border-rose-200 transition-all shadow-sm active:scale-95"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar</span>
        </button>
      </div>
    </header>
  );
}
