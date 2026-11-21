import nodemailer from 'nodemailer';
import { DailySummary } from '@/types';
import { formatRupiah } from '@/lib/utils/currency';

interface SendReportEmailParams {
  to: string | string[];
  storeName?: string;
  periode: string;
  summary: DailySummary;
  excelBuffer?: Buffer;
  pdfBuffer?: Buffer;
}

export function getMailerTransporter() {
  // 1. Resend via SMTP
  if (process.env.RESEND_API_KEY) {
    return nodemailer.createTransport({
      host: 'smtp.resend.com',
      port: 465,
      secure: true,
      auth: {
        user: 'resend',
        pass: process.env.RESEND_API_KEY,
      },
    });
  }

  // 2. Gmail SMTP
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  // 3. Custom SMTP
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true' || Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  return null;
}

export async function sendDailyReportEmail({
  to,
  storeName = 'Toko Berkah Utama',
  periode,
  summary,
  excelBuffer,
  pdfBuffer,
}: SendReportEmailParams) {
  const transporter = getMailerTransporter();

  if (!transporter) {
    throw new Error(
      'Konfigurasi email belum disetel. Tambahkan EMAIL_USER & EMAIL_PASS (Gmail) atau RESEND_API_KEY di Environment Variables.'
    );
  }

  const recipients = Array.isArray(to) ? to.join(', ') : to;
  const fromAddress = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'no-reply@keuangan-toko.com';

  const attachments: { filename: string; content: Buffer }[] = [];
  const safeDate = periode.replace(/[\/\s:]/g, '_');

  if (excelBuffer) {
    attachments.push({
      filename: `Laporan_Harian_${safeDate}.xlsx`,
      content: excelBuffer,
    });
  }

  if (pdfBuffer) {
    attachments.push({
      filename: `Laporan_Harian_${safeDate}.pdf`,
      content: pdfBuffer,
    });
  }

  const netProfit = summary.totalIncome - summary.totalExpense;
  const profitColor = netProfit >= 0 ? '#16a34a' : '#dc2626';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }
        .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
        .header { background: #0f172a; padding: 28px 24px; color: #ffffff; text-align: center; }
        .header h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
        .header p { margin: 6px 0 0; font-size: 13px; color: #94a3b8; }
        .content { padding: 24px; }
        .summary-box { background: #f1f5f9; border-radius: 12px; padding: 18px; margin-bottom: 20px; }
        .summary-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #cbd5e1; font-size: 14px; }
        .summary-row:last-child { border-bottom: none; font-weight: bold; font-size: 15px; }
        .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 700; background: #dcfce7; color: #15803d; }
        .attachments-info { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 14px; margin-top: 16px; font-size: 13px; color: #1e40af; }
        .footer { text-align: center; padding: 20px; font-size: 11px; color: #94a3b8; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>${storeName.toUpperCase()}</h1>
          <p>Laporan Rekapitulasi Keuangan & Stok Harian</p>
        </div>
        <div class="content">
          <p style="font-size: 14px; margin-top: 0;">Halo,</p>
          <p style="font-size: 14px; color: #475569;">Berikut adalah rekapitulasi transaksi keuangan dan inventaris toko Anda untuk tanggal <strong>${periode}</strong>:</p>
          
          <div class="summary-box">
            <div class="summary-row">
              <span>Saldo Awal Kas:</span>
              <strong>${formatRupiah(summary.openingBalance)}</strong>
            </div>
            <div class="summary-row">
              <span style="color: #16a34a;">+ Total Pemasukan:</span>
              <strong style="color: #16a34a;">${formatRupiah(summary.totalIncome)}</strong>
            </div>
            <div class="summary-row">
              <span style="color: #dc2626;">- Total Pengeluaran:</span>
              <strong style="color: #dc2626;">${formatRupiah(summary.totalExpense)}</strong>
            </div>
            <div class="summary-row">
              <span>Selisih (Laba/Rugi Bersih):</span>
              <strong style="color: ${profitColor};">${formatRupiah(netProfit)}</strong>
            </div>
            <div class="summary-row" style="padding-top: 12px; margin-top: 4px; border-top: 2px solid #94a3b8;">
              <span style="font-weight: 800;">Saldo Akhir Kas:</span>
              <span style="font-weight: 800; color: #0f172a;">${formatRupiah(summary.closingBalance)}</span>
            </div>
          </div>

          <div class="attachments-info">
            📎 <strong>Lampiran Laporan Telah Disertakan:</strong><br/>
            1. <strong>Laporan_Harian.pdf</strong> (Format cetak siap cetak dokumen resmi A4)<br/>
            2. <strong>Laporan_Harian.xlsx</strong> (File Excel berisi 2 sheet: Buku Kas Transaksi & Stok Inventaris)
          </div>

          <p style="font-size: 12px; color: #64748b; margin-top: 20px; line-height: 1.5;">
            Laporan ini dikirim secara otomatis oleh sistem Keuangan Toko. Silakan periksa lampiran file pada email ini untuk rincian detail setiap transaksi.
          </p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} ${storeName}. Dikirim secara otomatis.
        </div>
      </div>
    </body>
    </html>
  `;

  const info = await transporter.sendMail({
    from: `"${storeName}" <${fromAddress}>`,
    to: recipients,
    subject: `📊 [Laporan Harian] ${storeName} - ${periode}`,
    html: htmlContent,
    attachments,
  });

  return info;
}
