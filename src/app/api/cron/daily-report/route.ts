import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createFinancialWorkbook } from '@/lib/utils/excel-exporter';
import { createFinancialPDFDoc } from '@/lib/utils/pdf-exporter';
import { sendDailyReportEmail } from '@/lib/server/mailer';
import { formatDateIndonesian } from '@/lib/utils/date';
import { Product, Transaction } from '@/types';

export const dynamic = 'force-dynamic';

const INITIAL_BALANCE = 2450000;

export async function GET(request: Request) {
  return handleDailyReport(request);
}

export async function POST(request: Request) {
  return handleDailyReport(request);
}

async function handleDailyReport(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { success: false, error: 'Supabase credentials belum dikonfigurasi di Environment Variables.' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // 1. Dapatkan daftar email pengguna terdaftar dari tabel `profiles`
    const { data: profiles, error: profileErr } = await supabase.from('profiles').select('email, store_name, full_name');
    
    let recipientEmails: string[] = [];
    let defaultStoreName = 'Toko Berkah Utama';

    if (profiles && profiles.length > 0) {
      recipientEmails = profiles.map((p) => p.email).filter(Boolean);
      if (profiles[0].store_name) {
        defaultStoreName = profiles[0].store_name;
      }
    }

    // Jika ada email tambahan yang disetel via env variable REPORT_RECIPIENT_EMAIL
    if (process.env.REPORT_RECIPIENT_EMAIL) {
      const extra = process.env.REPORT_RECIPIENT_EMAIL.split(',').map((e) => e.trim());
      recipientEmails.push(...extra);
    }

    // Hilangkan duplikat email
    recipientEmails = Array.from(new Set(recipientEmails.map((e) => e.toLowerCase().trim())));

    if (recipientEmails.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Belum ada email penerima terdaftar. Daftarkan akun di website atau isi REPORT_RECIPIENT_EMAIL di Environment Variables.',
        },
        { status: 400 }
      );
    }

    // 2. Ambil data produk & transaksi dari Supabase
    const { data: dbProducts } = await supabase.from('products').select('*');
    const { data: dbTransactions } = await supabase.from('transactions').select('*');

    const products: Product[] = (dbProducts || []).map((p: any) => ({
      id: String(p.id),
      user_id: String(p.user_id || 'u1'),
      sku: p.sku || null,
      name: p.name,
      category: p.category || 'Umum',
      buy_price: Number(p.buy_price) || 0,
      sell_price: Number(p.sell_price) || 0,
      stock: Number(p.stock) || 0,
      min_stock: Number(p.min_stock) || 0,
      unit: p.unit || 'pcs',
      created_at: p.created_at || '',
      updated_at: p.updated_at || '',
    }));

    const allTransactions: Transaction[] = (dbTransactions || []).map((t: any) => ({
      id: String(t.id),
      user_id: String(t.user_id || 'u1'),
      type: t.type,
      category: t.category || 'Umum',
      amount: Number(t.amount) || 0,
      description: t.description || null,
      date: String(t.date),
      source: t.source || 'manual',
      created_at: t.created_at || '',
    }));

    // Tanggal hari ini (WIB / Local)
    const now = new Date();
    // Konversi ke format YYYY-MM-DD
    const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(now);
    const periodeIndo = formatDateIndonesian(now);

    // Filter transaksi hari ini
    const todayTransactions = allTransactions.filter((t) => t.date === todayStr);

    // Hitung saldo awal dinamis dari transaksi sebelum hari ini
    const openingBalance = allTransactions
      .filter((t) => t.date < todayStr)
      .reduce((sum, t) => sum + (t.type === 'pemasukan' ? t.amount : -t.amount), INITIAL_BALANCE);

    const totalIncome = todayTransactions
      .filter((t) => t.type === 'pemasukan')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = todayTransactions
      .filter((t) => t.type === 'pengeluaran')
      .reduce((sum, t) => sum + t.amount, 0);

    const summary = {
      openingBalance,
      totalIncome,
      totalExpense,
      closingBalance: openingBalance + totalIncome - totalExpense,
    };

    // 3. Buat file Excel Buffer
    const workbook = await createFinancialWorkbook({
      transactions: todayTransactions.length > 0 ? todayTransactions : allTransactions,
      products,
      summary,
      storeName: defaultStoreName,
      periode: periodeIndo,
    });
    const excelBuffer = Buffer.from(await workbook.xlsx.writeBuffer());

    // 4. Buat file PDF Buffer
    const pdfDoc = createFinancialPDFDoc({
      transactions: todayTransactions.length > 0 ? todayTransactions : allTransactions,
      summary,
      storeName: defaultStoreName,
      periode: periodeIndo,
    });
    const pdfBuffer = Buffer.from(pdfDoc.output('arraybuffer'));

    // 5. Kirim Email ke seluruh penerima
    const mailResult = await sendDailyReportEmail({
      to: recipientEmails,
      storeName: defaultStoreName,
      periode: periodeIndo,
      summary,
      excelBuffer,
      pdfBuffer,
    });

    return NextResponse.json({
      success: true,
      message: `Laporan keuangan harian berhasil dikirim ke: ${recipientEmails.join(', ')}`,
      recipients: recipientEmails,
      transactionsCount: todayTransactions.length,
      productsCount: products.length,
      mailMessageId: mailResult?.messageId,
    });
  } catch (error: any) {
    console.error('Error saat membuat/mengirim laporan harian:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Terjadi kesalahan saat memproses laporan harian.',
      },
      { status: 500 }
    );
  }
}
