import { Transaction } from '@/types';

export interface ParsedTransactionDetails {
  itemDetail: string;
  note: string;
}

/**
 * Memisahkan detail barang yang terjual/dibeli (Nama Barang & Qty) dan catatan keterangan transaksi.
 */
export function parseTransactionDetails(t: Transaction): ParsedTransactionDetails {
  const desc = (t.description || '').trim();

  if (!desc) {
    const isGoods =
      t.category.toLowerCase().includes('barang') ||
      t.source === 'sale_inventory' ||
      t.source === 'restock_inventory';
    return {
      itemDetail: isGoods ? 'Barang Toko' : '-',
      note: '-',
    };
  }

  // Pola 1: Pemisah titik tengah " • " (misal: "Minyak Goreng (2 pouch) • AFFILIATE")
  if (desc.includes(' • ')) {
    const parts = desc.split(' • ');
    return {
      itemDetail: parts[0].trim() || '-',
      note: parts.slice(1).join(' • ').trim() || '-',
    };
  }

  // Pola 2: Format memiliki tanda kurung kuantitas, misal "Beras Pandan Wangi (2 sak)"
  const hasQty = /\(.*?\)/.test(desc);
  if (hasQty) {
    return {
      itemDetail: desc,
      note: '-',
    };
  }

  // Pola 3: Jika transaksi penjualan atau pembelian barang inventaris
  const isGoodsCategory =
    t.category.toLowerCase().includes('barang') ||
    t.category.toLowerCase().includes('jual') ||
    t.category.toLowerCase().includes('beli') ||
    t.source === 'sale_inventory' ||
    t.source === 'restock_inventory';

  if (isGoodsCategory) {
    return {
      itemDetail: desc,
      note: '-',
    };
  }

  // Pola 4: Transaksi operasional umum (misal: "Bayar Listrik", "Sewa Ruko")
  return {
    itemDetail: '-',
    note: desc,
  };
}
