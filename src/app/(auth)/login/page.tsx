'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Store, Mail, Lock, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const cleanEmail = email.toLowerCase().trim();

    // 1. Coba verifikasi dengan Supabase Auth jika terkonfigurasi
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (data?.user) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('userProfile', JSON.stringify({
            fullName: data.user.user_metadata?.full_name || cleanEmail.split('@')[0],
            storeName: data.user.user_metadata?.store_name || 'Toko Utama',
            email: cleanEmail,
          }));
        }
        router.push('/dashboard');
        return;
      }

      if (error && !error.message.includes('fetch')) {
        setErrorMsg(error.message || 'Login gagal. Periksa kembali email & password Anda.');
        setLoading(false);
        return;
      }
    } catch (err) {
      console.warn('Supabase auth notice:', err);
    }

    // 2. Verifikasi Daftar Akun Terdaftar (Lokal / Demo Mode)
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('registeredUsers');
      const list: any[] = raw ? JSON.parse(raw) : [];

      const userMatch = list.find((u) => u.email.toLowerCase() === cleanEmail);

      if (!userMatch) {
        setErrorMsg('Email belum terdaftar! Silakan klik "Daftar Akun Baru" terlebih dahulu.');
        setLoading(false);
        return;
      }

      if (userMatch.password && userMatch.password !== password) {
        setErrorMsg('Kata sandi (password) salah. Periksa kembali password Anda.');
        setLoading(false);
        return;
      }

      // Akun valid! Simpan profil aktif & masuk dashboard
      localStorage.setItem('userProfile', JSON.stringify({
        fullName: userMatch.fullName,
        storeName: userMatch.storeName,
        email: userMatch.email,
      }));

      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-brand-600 text-white rounded-2xl shadow-lg shadow-brand-500/30">
            <Store className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Kas & Inventaris Toko</h1>
          <p className="text-xs text-slate-500">Masuk untuk mengelola keuangan & stok barang Anda</p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Toko</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@tokomu.com"
                className="w-full pl-10 pr-4 py-3 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Kata Sandi</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-bold text-xs rounded-xl shadow-lg shadow-brand-600/30 transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Memproses...' : 'Masuk ke Dashboard'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 text-center border-t border-slate-100">
          <p className="text-xs text-slate-600">
            Belum punya akun?{' '}
            <Link href="/register" className="font-bold text-brand-600 hover:underline">
              Daftar Akun Baru
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
