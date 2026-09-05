'use client';

import { useState } from 'react';
import { PackagePlus, ArrowUpRight, ArrowDownLeft, Search, AlertCircle, Plus, Check } from 'lucide-react';
import { formatRupiah } from '@/lib/utils/currency';
import { Product } from '@/types';

const initialProducts: Product[] = [
  { id: '1', user_id: 'u1', sku: 'BRG-001', name: 'Beras Pandan Wangi 5kg', category: 'Sembako', buy_price: 62000, sell_price: 75000, stock: 3, min_stock: 5, unit: 'sak', created_at: '', updated_at: '' },
  { id: '2', user_id: 'u1', sku: 'BRG-002', name: 'Minyak Goreng 2L', category: 'Sembako', buy_price: 28000, sell_price: 34000, stock: 2, min_stock: 10, unit: 'pouch', created_at: '', updated_at: '' },
  { id: '3', user_id: 'u1', sku: 'BRG-003', name: 'Gula Pasir 1kg', category: 'Sembako', buy_price: 14000, sell_price: 17500, stock: 25, min_stock: 10, unit: 'kg', created_at: '', updated_at: '' },
  { id: '4', user_id: 'u1', sku: 'BRG-004', name: 'Telur Ayam 1kg', category: 'Sembako', buy_price: 24000, sell_price: 29000, stock: 4, min_stock: 8, unit: 'kg', created_at: '', updated_at: '' },
];

export default function InventarisPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'master' | 'masuk' | 'keluar'>('master');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form states untuk Barang Masuk / Keluar
  const [selectedProductId, setSelectedProductId] = useState(initialProducts[0]?.id || '');
  const [movementQty, setMovementQty] = useState(1);
  const [movementUnitPrice, setMovementUnitPrice] = useState(initialProducts[0]?.buy_price || 0);
  const [movementNotes, setMovementNotes] = useState('');

  // New Product Form state
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Sembako');
  const [newBuyPrice, setNewBuyPrice] = useState<number | ''>('');
  const [newSellPrice, setNewSellPrice] = useState<number | ''>('');
  const [newStock, setNewStock] = useState<number | ''>('');
  const [newMinStock, setNewMinStock] = useState<number | ''>(5);
  const [newUnit, setNewUnit] = useState('pcs');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;

    const newProd: Product = {
      id: Date.now().toString(),
      user_id: 'u1',
      sku: `BRG-00${products.length + 1}`,
      name: newName,
      category: newCategory,
      buy_price: Number(newBuyPrice) || 0,
      sell_price: Number(newSellPrice) || 0,
      stock: Number(newStock) || 0,
      min_stock: Number(newMinStock) || 0,
      unit: newUnit || 'pcs',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setProducts([newProd, ...products]);
    setNewName('');
    setNewBuyPrice('');
    setNewSellPrice('');
    setNewStock('');
    showToast('Barang baru berhasil ditambahkan!');
  };

  const handleStockMovement = (type: 'in' | 'out') => {
    const prod = products.find((p) => p.id === selectedProductId);
    if (!prod) return;

    if (type === 'out' && prod.stock < movementQty) {
      alert(`Stok tidak mencukupi! Sisa stok: ${prod.stock}`);
      return;
    }

    const updatedProducts = products.map((p) => {
      if (p.id === selectedProductId) {
        const newStockVal = type === 'in' ? p.stock + movementQty : p.stock - movementQty;
        return { ...p, stock: newStockVal };
      }
      return p;
    });

    setProducts(updatedProducts);
    const actionText = type === 'in' ? 'Barang Masuk (Restock)' : 'Barang Keluar (Penjualan)';
    showToast(`${actionText} berhasil dicatat! Total: ${formatRupiah(movementQty * movementUnitPrice)}`);
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Manajemen Inventaris</h1>
          <p className="text-sm text-slate-500">Kelola master barang, restock barang masuk, dan pencatatan barang keluar.</p>
        </div>

        {/* Action Tabs */}
        <div className="flex items-center gap-2 bg-slate-200/70 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('master')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'master' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Master Barang
          </button>
          <button
            onClick={() => setActiveTab('masuk')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
              activeTab === 'masuk' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5" /> Barang Masuk
          </button>
          <button
            onClick={() => setActiveTab('keluar')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
              activeTab === 'keluar' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" /> Barang Keluar
          </button>
        </div>
      </div>

      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div className="bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TAB 1: MASTER BARANG */}
      {activeTab === 'master' && (
        <div className="space-y-6">
          {/* Form Tambah Barang & Search */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form Tambah Produk */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2">
                <Plus className="w-4 h-4 text-brand-600" /> Tambah Barang Baru
              </h3>
              <form onSubmit={handleAddProduct} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Barang</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Contoh: Kain Katun Premium / Miyang"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Kategori</label>
                    <input
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder="Tekstil / Sembako"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Satuan Barang</label>
                    <input
                      type="text"
                      value={newUnit}
                      onChange={(e) => setNewUnit(e.target.value)}
                      placeholder="ball, kardus, sak, kg, pcs"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Stok Awal</label>
                    <input
                      type="number"
                      value={newStock}
                      onChange={(e) => setNewStock(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="0"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Stok Min. (Alert)</label>
                    <input
                      type="number"
                      value={newMinStock}
                      onChange={(e) => setNewMinStock(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="5"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Harga Beli (Rp)</label>
                    <input
                      type="number"
                      value={newBuyPrice}
                      onChange={(e) => setNewBuyPrice(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="0"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Harga Jual (Rp)</label>
                    <input
                      type="number"
                      value={newSellPrice}
                      onChange={(e) => setNewSellPrice(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="0"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl transition-all shadow-sm mt-2"
                >
                  Simpan Barang
                </button>
              </form>
            </div>

            {/* Tabel Master Barang */}
            <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
                <h3 className="font-bold text-slate-800 text-base">Daftar Stok Barang</h3>
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari nama atau kategori..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100/70 text-slate-600 font-bold border-b border-slate-200">
                      <th className="p-3">SKU / Nama</th>
                      <th className="p-3">Kategori</th>
                      <th className="p-3 text-right">Harga Beli</th>
                      <th className="p-3 text-right">Harga Jual</th>
                      <th className="p-3 text-center">Stok</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProducts.map((p) => {
                      const isLow = p.stock <= p.min_stock;
                      return (
                        <tr key={p.id} className="hover:bg-slate-50">
                          <td className="p-3">
                            <span className="font-bold text-slate-800 block">{p.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{p.sku}</span>
                          </td>
                          <td className="p-3 text-slate-600">{p.category}</td>
                          <td className="p-3 text-right font-medium text-slate-700">{formatRupiah(p.buy_price)}</td>
                          <td className="p-3 text-right font-bold text-emerald-600">{formatRupiah(p.sell_price)}</td>
                          <td className="p-3 text-center font-bold text-slate-800">{p.stock} {p.unit}</td>
                          <td className="p-3 text-center">
                            {isLow ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                                <AlertCircle className="w-3 h-3" /> Menipis
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-medium">
                                Aman
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2 & 3: FORM BARANG MASUK / KELUAR */}
      {(activeTab === 'masuk' || activeTab === 'keluar') && (
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className={`p-3 rounded-xl text-white ${activeTab === 'masuk' ? 'bg-emerald-600' : 'bg-rose-600'}`}>
              {activeTab === 'masuk' ? <ArrowDownLeft className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-lg">
                {activeTab === 'masuk' ? 'Form Restock Barang Masuk' : 'Form Barang Keluar (Penjualan)'}
              </h2>
              <p className="text-xs text-slate-500">
                {activeTab === 'masuk'
                  ? 'Stok barang akan otomatis bertambah & tercatat sebagai pengeluaran di Buku Kas.'
                  : 'Stok barang akan otomatis berkurang & tercatat sebagai pemasukan di Buku Kas.'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Pilih Barang</label>
              <select
                value={selectedProductId}
                onChange={(e) => {
                  setSelectedProductId(e.target.value);
                  const prod = products.find((p) => p.id === e.target.value);
                  if (prod) {
                    setMovementUnitPrice(activeTab === 'masuk' ? prod.buy_price : prod.sell_price);
                  }
                }}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Stok Saat Ini: {p.stock} {p.unit})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Jumlah (Qty)</label>
                <input
                  type="number"
                  min="1"
                  value={movementQty}
                  onChange={(e) => setMovementQty(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {activeTab === 'masuk' ? 'Harga Beli Satuan (Rp)' : 'Harga Jual Satuan (Rp)'}
                </label>
                <input
                  type="number"
                  value={movementUnitPrice}
                  onChange={(e) => setMovementUnitPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Catatan Keterangan</label>
              <input
                type="text"
                value={movementNotes}
                onChange={(e) => setMovementNotes(e.target.value)}
                placeholder="Contoh: Pembelian dari Supplier A / Penjualan ke Pelanggan B"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center my-2">
              <span className="text-xs font-semibold text-slate-600">Total Nilai Transaksi:</span>
              <span className={`text-base font-extrabold ${activeTab === 'masuk' ? 'text-rose-600' : 'text-emerald-600'}`}>
                {formatRupiah(movementQty * movementUnitPrice)}
              </span>
            </div>

            <button
              onClick={() => handleStockMovement(activeTab === 'masuk' ? 'in' : 'out')}
              className={`w-full py-3 text-white font-bold text-xs rounded-xl shadow-md transition-all ${
                activeTab === 'masuk' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {activeTab === 'masuk' ? 'Proses Restock Barang' : 'Proses Penjualan Barang'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
