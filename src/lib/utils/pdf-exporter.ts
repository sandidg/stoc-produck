import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Transaction, DailySummary } from '@/types';
import { formatRupiah } from './currency';
import { formatDateIndonesian } from './date';

interface ExportPDFOptions {
  storeName?: string;
  periode?: string;
  summary?: DailySummary;
  transactions: Transaction[];
  filename?: string;
}

/**
 * Ekspor Ringkasan Keuangan dan Transaksi ke PDF Siap Cetak A4
 */
export function exportFinancialReportToPDF({
  storeName = 'TOKO BERKAH UTAMA',
  periode = formatDateIndonesian(new Date()),
  summary,
  transactions,
  filename = 'Laporan_Keuangan.pdf',
}: ExportPDFOptions) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // 1. KOP HEADER LAPORAN (Nama Toko Sebagai Judul Utama)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(22, 163, 74); // Emerald Green 600
  doc.text(storeName.toUpperCase(), 14, 18);

  doc.setFontSize(11);
  doc.setTextColor(71, 85, 105); // Slate 600
  doc.setFont('helvetica', 'bold');
  doc.text('LAPORAN KEUANGAN & BUKU KAS', 14, 25);

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139); // Slate 500
  doc.text(`Periode Laporan: ${periode}`, 14, 31);

  // Garis Pemisah (Divider)
  doc.setLineWidth(0.6);
  doc.setDrawColor(22, 163, 74);
  doc.line(14, 35, 196, 35);

  let currentY = 42;

  // 2. TABEL RINGKASAN FINANSIAL
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(30, 41, 59);
  doc.text('I. RINGKASAN FINANSIAL', 14, currentY);

  currentY += 4;

  const totalIncome = transactions
    .filter((t) => t.type === 'pemasukan')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'pengeluaran')
    .reduce((sum, t) => sum + t.amount, 0);

  const netProfit = totalIncome - totalExpense;

  const summaryTableData = [
    ['Total Pemasukan (Kas Masuk)', formatRupiah(summary?.totalIncome ?? totalIncome)],
    ['Total Pengeluaran (Kas Keluar)', formatRupiah(summary?.totalExpense ?? totalExpense)],
    ['Laba / Bersih Periode Ini', formatRupiah(summary?.closingBalance ?? netProfit)],
  ];

  autoTable(doc, {
    startY: currentY,
    head: [['Keterangan Rekapitulasi', 'Jumlah (Rp)']],
    body: summaryTableData,
    theme: 'grid',
    headStyles: { fillColor: [22, 163, 74], textColor: 255, fontStyle: 'bold', fontSize: 9 },
    styles: { fontSize: 9, cellPadding: 2.5 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 110 },
      1: { halign: 'right', fontStyle: 'bold', cellWidth: 72 },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 1) {
        if (data.row.index === 0) data.cell.styles.textColor = [22, 163, 74];
        if (data.row.index === 1) data.cell.styles.textColor = [220, 38, 38];
        if (data.row.index === 2) data.cell.styles.textColor = [79, 70, 229];
      }
    },
  });

  // @ts-ignore
  currentY = doc.lastAutoTable.finalY + 10;

  // 3. TABEL RINCIAN TRANSAKSI
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(30, 41, 59);
  doc.text('II. RINCIAN TRANSAKSI KEUANGAN', 14, currentY);

  const tableRows = transactions.map((t, idx) => [
    (idx + 1).toString(),
    formatDateIndonesian(t.date),
    t.type === 'pemasukan' ? 'PEMASUKAN' : 'PENGELUARAN',
    t.category,
    formatRupiah(t.amount),
    t.description || '-',
  ]);

  autoTable(doc, {
    startY: currentY + 4,
    head: [['No', 'Tanggal', 'Tipe', 'Kategori', 'Jumlah (Rp)', 'Keterangan']],
    body: tableRows,
    theme: 'striped',
    headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: 'bold', fontSize: 8.5 },
    styles: { fontSize: 8.5, cellPadding: 2 },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { cellWidth: 28 },
      2: { fontStyle: 'bold', cellWidth: 28 },
      3: { cellWidth: 32 },
      4: { halign: 'right', fontStyle: 'bold', cellWidth: 34 },
      5: { cellWidth: 50 },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 2) {
        if (data.cell.raw === 'PEMASUKAN') {
          data.cell.styles.textColor = [22, 163, 74];
        } else {
          data.cell.styles.textColor = [220, 38, 38];
        }
      }
    },
  });

  // 4. FOOTER PENOMORAN HALAMAN & TANGGAL CETAK
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Dokumen Resmi ${storeName} | Dicetak pada ${new Date().toLocaleString('id-ID')} | Halaman ${i} dari ${pageCount}`,
      14,
      287
    );
  }

  doc.save(filename);
}
