import ExcelJS from 'exceljs';
import { Transaction, Product, DailySummary } from '@/types';
import { formatDateIndonesian } from './date';

interface ExportExcelParams {
  transactions: Transaction[];
  products?: Product[];
  summary?: DailySummary;
  storeName?: string;
  periode?: string;
  filename?: string;
}

/**
 * Ekspor Laporan Lengkap ke SATU FILE Excel (.xlsx) dengan 2 Sheet (Laporan Keuangan & Stok Barang)
 * Menggunakan ExcelJS untuk menambahkan border outline sel secara tegas pada seluruh tabel.
 */
export async function exportFinancialReportToExcel({
  transactions,
  products = [],
  summary,
  storeName = 'TOKO BERKAH UTAMA',
  periode = formatDateIndonesian(new Date()),
  filename = 'Laporan_Keuangan_Toko.xlsx',
}: ExportExcelParams) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = storeName;
  workbook.created = new Date();

  // Definisi border tipis hitam untuk outline sel
  const thinBorder: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } },
  };

  const currencyFormat = '"Rp "#,##0';

  // -------------------------------------------------------------
  // SHEET 1: LAPORAN KEUANGAN & RINCIAN TRANSAKSI
  // -------------------------------------------------------------
  const wsFinancial = workbook.addWorksheet('Laporan Keuangan', {
    views: [{ showGridLines: true }],
  });

  const totalPemasukan = transactions
    .filter((t) => t.type === 'pemasukan')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalPengeluaran = transactions
    .filter((t) => t.type === 'pengeluaran')
    .reduce((acc, t) => acc + t.amount, 0);

  const labaBersih = totalPemasukan - totalPengeluaran;

  const openingBal = summary?.openingBalance ?? 0;
  const incomeVal = summary?.totalIncome ?? totalPemasukan;
  const expenseVal = summary?.totalExpense ?? totalPengeluaran;
  const closingBal = summary?.closingBalance ?? (openingBal + incomeVal - expenseVal);

  // Header Judul
  wsFinancial.mergeCells('A1:G1');
  const titleCell1 = wsFinancial.getCell('A1');
  titleCell1.value = 'LAPORAN TRANSAKSI KEUANGAN & BUKU KAS';
  titleCell1.font = { bold: true, size: 14 };
  titleCell1.alignment = { horizontal: 'center' };

  wsFinancial.mergeCells('A2:G2');
  const titleCell2 = wsFinancial.getCell('A2');
  titleCell2.value = `Periode Laporan: ${periode}`;
  titleCell2.alignment = { horizontal: 'center' };

  wsFinancial.mergeCells('A3:G3');
  const titleCell3 = wsFinancial.getCell('A3');
  titleCell3.value = `Tanggal Cetak: ${formatDateIndonesian(new Date())}`;
  titleCell3.alignment = { horizontal: 'center' };

  // 1. RINGKASAN KEUANGAN HARIAN (Sesuai Gambar Acuan User)
  wsFinancial.mergeCells('A5:B5');
  for (let c = 1; c <= 2; c++) {
    const cell = wsFinancial.getCell(5, c);
    cell.border = thinBorder;
  }
  const rekapTitleCell = wsFinancial.getCell('A5');
  rekapTitleCell.value = '1. RINGKASAN KEUANGAN HARIAN';
  rekapTitleCell.font = { bold: true };

  // Header Tabel Ringkasan Keuangan
  const rekapHeader1 = wsFinancial.getCell('A6');
  rekapHeader1.value = 'Keterangan';
  rekapHeader1.font = { bold: true };
  rekapHeader1.border = thinBorder;

  const rekapHeader2 = wsFinancial.getCell('B6');
  rekapHeader2.value = 'Jumlah (Rp)';
  rekapHeader2.font = { bold: true };
  rekapHeader2.border = thinBorder;

  // Data Ringkasan Keuangan
  const rekapData: [string, number, boolean?][] = [
    ['Saldo Kas Awal', openingBal],
    ['Total Pemasukan Hari Ini', incomeVal],
    ['Total Pengeluaran Hari Ini', expenseVal],
    ['Saldo Kas Akhir', closingBal, true],
  ];

  rekapData.forEach((item, idx) => {
    const rowNum = 7 + idx;
    const c1 = wsFinancial.getCell(rowNum, 1);
    c1.value = item[0];
    c1.border = thinBorder;
    if (item[2]) c1.font = { bold: true };

    const c2 = wsFinancial.getCell(rowNum, 2);
    c2.value = item[1];
    c2.numFmt = currencyFormat;
    c2.border = thinBorder;
    if (item[2]) c2.font = { bold: true };
  });

  let currentRow = 12;

  // Grouping Stok berdasarkan Satuan Barang (ball, kardus, sak, pouch, kg, dll.)
  interface UnitGroup {
    unit: string;
    totalStock: number;
    items: string[];
  }

  const unitGroupMap: Record<string, UnitGroup> = {};
  if (products && products.length > 0) {
    products.forEach((p) => {
      const u = (p.unit || 'unit').trim();
      const uKey = u.toLowerCase();
      if (!unitGroupMap[uKey]) {
        unitGroupMap[uKey] = {
          unit: u,
          totalStock: 0,
          items: [],
        };
      }
      unitGroupMap[uKey].totalStock += p.stock || 0;
      unitGroupMap[uKey].items.push(`${p.name} (${p.stock} ${u})`);
    });
  }

  const unitGroups = Object.values(unitGroupMap);

  // 2. REKAPITULASI STOK BARANG PER SATUAN (Jika ada data produk)
  if (products && products.length > 0) {
    wsFinancial.mergeCells(`A${currentRow}:G${currentRow}`);
    for (let c = 1; c <= 7; c++) {
      const cell = wsFinancial.getCell(currentRow, c);
      cell.border = thinBorder;
    }
    const stockTitleCell = wsFinancial.getCell(`A${currentRow}`);
    stockTitleCell.value = '2. REKAPITULASI TOTAL STOK PER SATUAN BARANG';
    stockTitleCell.font = { bold: true };

    currentRow++;
    // Header Tabel Satuan
    wsFinancial.getCell(currentRow, 1).value = 'No';
    wsFinancial.getCell(currentRow, 1).font = { bold: true };
    wsFinancial.getCell(currentRow, 1).border = thinBorder;
    wsFinancial.getCell(currentRow, 1).alignment = { horizontal: 'center' };

    wsFinancial.getCell(currentRow, 2).value = 'Satuan Barang';
    wsFinancial.getCell(currentRow, 2).font = { bold: true };
    wsFinancial.getCell(currentRow, 2).border = thinBorder;
    wsFinancial.getCell(currentRow, 2).alignment = { horizontal: 'center' };

    wsFinancial.getCell(currentRow, 3).value = 'Total Jumlah Stok';
    wsFinancial.getCell(currentRow, 3).font = { bold: true };
    wsFinancial.getCell(currentRow, 3).border = thinBorder;
    wsFinancial.getCell(currentRow, 3).alignment = { horizontal: 'center' };

    wsFinancial.mergeCells(`D${currentRow}:G${currentRow}`);
    for (let c = 4; c <= 7; c++) {
      const cell = wsFinancial.getCell(currentRow, c);
      cell.border = thinBorder;
    }
    const rincianHeader = wsFinancial.getCell(currentRow, 4);
    rincianHeader.value = 'Rincian Nama Barang & Stok';
    rincianHeader.font = { bold: true };

    unitGroups.forEach((ug, idx) => {
      currentRow++;
      const rNo = wsFinancial.getCell(currentRow, 1);
      rNo.value = idx + 1;
      rNo.border = thinBorder;
      rNo.alignment = { horizontal: 'center' };

      const rUnit = wsFinancial.getCell(currentRow, 2);
      rUnit.value = ug.unit;
      rUnit.border = thinBorder;
      rUnit.alignment = { horizontal: 'center' };

      const rTotal = wsFinancial.getCell(currentRow, 3);
      rTotal.value = `${ug.totalStock} ${ug.unit}`;
      rTotal.border = thinBorder;
      rTotal.alignment = { horizontal: 'center' };

      wsFinancial.mergeCells(`D${currentRow}:G${currentRow}`);
      for (let c = 4; c <= 7; c++) {
        wsFinancial.getCell(currentRow, c).border = thinBorder;
      }
      const rItems = wsFinancial.getCell(currentRow, 4);
      rItems.value = ug.items.join(', ');
    });

    currentRow += 2;
  }

  // 3. TABEL RINCIAN TRANSAKSI KEUANGAN
  const sectionTitle = products && products.length > 0 ? '3. TABEL RINCIAN TRANSAKSI KEUANGAN' : '2. TABEL RINCIAN TRANSAKSI KEUANGAN';
  wsFinancial.mergeCells(`A${currentRow}:G${currentRow}`);
  for (let c = 1; c <= 7; c++) {
    const cell = wsFinancial.getCell(currentRow, c);
    cell.border = thinBorder;
  }
  const trTitleCell = wsFinancial.getCell(`A${currentRow}`);
  trTitleCell.value = sectionTitle;
  trTitleCell.font = { bold: true };

  currentRow++;
  const headers1 = ['No', 'Tanggal', 'Tipe Transaksi', 'Kategori', 'Jumlah (Rp)', 'Keterangan Catatan', 'Sumber Data'];
  headers1.forEach((h, idx) => {
    const cell = wsFinancial.getCell(currentRow, idx + 1);
    cell.value = h;
    cell.font = { bold: true };
    cell.border = thinBorder;
  });

  // Data Transaksi
  transactions.forEach((t, idx) => {
    const rowNum = currentRow + 1 + idx;
    const rowValues = [
      idx + 1,
      formatDateIndonesian(t.date),
      t.type === 'pemasukan' ? 'PEMASUKAN' : 'PENGELUARAN',
      t.category,
      t.amount,
      t.description || '-',
      t.source === 'manual' ? 'Manual' : t.source === 'restock_inventory' ? 'Restock Barang' : 'Penjualan Barang',
    ];

    rowValues.forEach((val, cIdx) => {
      const cell = wsFinancial.getCell(rowNum, cIdx + 1);
      cell.value = val;
      cell.border = thinBorder;

      if (cIdx === 4 && typeof val === 'number') {
        cell.numFmt = currencyFormat;
      }
    });
  });

  wsFinancial.columns = [
    { width: 8 },   // No
    { width: 22 },  // Tanggal
    { width: 18 },  // Tipe Transaksi
    { width: 25 },  // Kategori
    { width: 22 },  // Jumlah (Rp)
    { width: 42 },  // Keterangan
    { width: 22 },  // Sumber Data
  ];

  // -------------------------------------------------------------
  // SHEET 2: REKAPITULASI STOK BARANG INVENTARIS
  // -------------------------------------------------------------
  if (products && products.length > 0) {
    const wsProducts = workbook.addWorksheet('Stok Barang', {
      views: [{ showGridLines: true }],
    });

    // Judul Header (Sesuai Screenshot User)
    wsProducts.mergeCells('A1:J1');
    const pTitle1 = wsProducts.getCell('A1');
    pTitle1.value = 'REKAPITULASI MASTER STOK BARANG INVENTARIS';
    pTitle1.font = { bold: true, size: 14 };
    pTitle1.alignment = { horizontal: 'center' };

    wsProducts.mergeCells('A2:J2');
    const pTitle2 = wsProducts.getCell('A2');
    pTitle2.value = `Tanggal Cetak: ${formatDateIndonesian(new Date())}`;
    pTitle2.alignment = { horizontal: 'center' };

    // Sub-header Tabel Daftar Stok Barang
    wsProducts.mergeCells('A4:J4');
    for (let c = 1; c <= 10; c++) {
      const cell = wsProducts.getCell(4, c);
      cell.border = thinBorder;
    }
    const tableHeaderTitle = wsProducts.getCell('A4');
    tableHeaderTitle.value = 'DAFTAR STOK BARANG INVENTARIS';
    tableHeaderTitle.font = { bold: true };

    // Header Kolom Tabel
    const headersProd = [
      'No',
      'SKU / Kode',
      'Nama Barang',
      'Kategori',
      'Harga Beli (Rp)',
      'Harga Jual (Rp)',
      'Stok Saat Ini',
      'Batas Min Stok',
      'Satuan',
      'Status Stok',
    ];

    headersProd.forEach((h, idx) => {
      const cell = wsProducts.getCell(5, idx + 1);
      cell.value = h;
      cell.font = { bold: true };
      cell.border = thinBorder;

      if (idx === 0 || idx === 1 || idx === 6 || idx === 7 || idx === 8 || idx === 9) {
        cell.alignment = { horizontal: 'center' };
      } else if (idx === 4 || idx === 5) {
        cell.alignment = { horizontal: 'right' };
      }
    });

    // Data Produk (Menambahkan Satuan Barang pada Stok Saat Ini & Batas Min Stok)
    products.forEach((p, idx) => {
      const rowNum = 6 + idx;
      const pValues = [
        idx + 1,
        p.sku || '-',
        p.name,
        p.category,
        p.buy_price,
        p.sell_price,
        `${p.stock} ${p.unit}`,
        `${p.min_stock} ${p.unit}`,
        p.unit,
        p.stock <= p.min_stock ? 'PERINGATAN: STOK MENIPIS' : 'Stok Aman',
      ];

      pValues.forEach((val, cIdx) => {
        const cell = wsProducts.getCell(rowNum, cIdx + 1);
        cell.value = val;
        cell.border = thinBorder;

        // Alignment kolom
        if (cIdx === 0 || cIdx === 1 || cIdx === 6 || cIdx === 7 || cIdx === 8 || cIdx === 9) {
          cell.alignment = { horizontal: 'center' };
        } else if (cIdx === 4 || cIdx === 5) {
          cell.alignment = { horizontal: 'right' };
        }

        // Format angka untuk Harga Beli & Harga Jual
        if ((cIdx === 4 || cIdx === 5) && typeof val === 'number') {
          cell.numFmt = currencyFormat;
        }
      });
    });

    // Tabel Rekapitulasi Tambahan berdasarkan Satuan Barang di Sheet 2
    let pRow = 6 + products.length + 2;

    wsProducts.mergeCells(`A${pRow}:J${pRow}`);
    for (let c = 1; c <= 10; c++) {
      wsProducts.getCell(pRow, c).border = thinBorder;
    }
    const pUnitTitle = wsProducts.getCell(`A${pRow}`);
    pUnitTitle.value = 'TABEL REKAPITULASI TOTAL STOK PER SATUAN BARANG';
    pUnitTitle.font = { bold: true };

    pRow++;
    // Header Tabel Satuan Sheet 2
    wsProducts.getCell(pRow, 1).value = 'No';
    wsProducts.getCell(pRow, 1).font = { bold: true };
    wsProducts.getCell(pRow, 1).border = thinBorder;
    wsProducts.getCell(pRow, 1).alignment = { horizontal: 'center' };

    wsProducts.getCell(pRow, 2).value = 'Satuan Barang';
    wsProducts.getCell(pRow, 2).font = { bold: true };
    wsProducts.getCell(pRow, 2).border = thinBorder;
    wsProducts.getCell(pRow, 2).alignment = { horizontal: 'center' };

    wsProducts.mergeCells(`C${pRow}:D${pRow}`);
    for (let c = 3; c <= 4; c++) wsProducts.getCell(pRow, c).border = thinBorder;
    const pTotalHeader = wsProducts.getCell(pRow, 3);
    pTotalHeader.value = 'Total Jumlah Stok';
    pTotalHeader.font = { bold: true };
    pTotalHeader.alignment = { horizontal: 'center' };

    wsProducts.mergeCells(`E${pRow}:J${pRow}`);
    for (let c = 5; c <= 10; c++) wsProducts.getCell(pRow, c).border = thinBorder;
    const pRincianHeader = wsProducts.getCell(pRow, 5);
    pRincianHeader.value = 'Daftar Rincian Barang & Jumlah Stok';
    pRincianHeader.font = { bold: true };

    unitGroups.forEach((ug, idx) => {
      pRow++;
      const cell1 = wsProducts.getCell(pRow, 1);
      cell1.value = idx + 1;
      cell1.border = thinBorder;
      cell1.alignment = { horizontal: 'center' };

      const cell2 = wsProducts.getCell(pRow, 2);
      cell2.value = ug.unit;
      cell2.border = thinBorder;
      cell2.alignment = { horizontal: 'center' };

      wsProducts.mergeCells(`C${pRow}:D${pRow}`);
      for (let c = 3; c <= 4; c++) wsProducts.getCell(pRow, c).border = thinBorder;
      const cell3 = wsProducts.getCell(pRow, 3);
      cell3.value = `${ug.totalStock} ${ug.unit}`;
      cell3.border = thinBorder;
      cell3.alignment = { horizontal: 'center' };

      wsProducts.mergeCells(`E${pRow}:J${pRow}`);
      for (let c = 5; c <= 10; c++) wsProducts.getCell(pRow, c).border = thinBorder;
      const cell5 = wsProducts.getCell(pRow, 5);
      cell5.value = ug.items.join(', ');
      cell5.border = thinBorder;
    });

    wsProducts.columns = [
      { width: 8 },   // No
      { width: 14 },  // SKU / Kode
      { width: 32 },  // Nama Barang
      { width: 20 },  // Kategori
      { width: 20 },  // Harga Beli (Rp)
      { width: 20 },  // Harga Jual (Rp)
      { width: 15 },  // Stok Saat Ini
      { width: 15 },  // Batas Min Stok
      { width: 12 },  // Satuan
      { width: 28 },  // Status Stok
    ];
  }

  // Unduh File Excel di Browser
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.URL.revokeObjectURL(url);
}

