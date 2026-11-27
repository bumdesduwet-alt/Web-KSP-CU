import React, { useEffect, useState } from 'react';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { Check, Plus, Star, Trash2, X } from 'lucide-react';
import { MediaInputField } from '../../components/MediaInputField';
import { ASSET_IMAGES } from '../../data/initialCooperativeData';
import { useSiteData } from '../../context/SiteDataContext';
import {
  db,
  handleFirestoreError,
  OperationType,
  slugify,
} from '../../lib/firebase';
import {
  CooperativeProduct,
  MemberProduct,
  MemberProductSubmission,
} from '../../types';

export const AdminCoopProductsTab: React.FC = () => {
  const { refreshPublicData } = useSiteData();
  const [products, setProducts] = useState<CooperativeProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    category: 'simpanan' as 'simpanan' | 'pinjaman',
    subType: 'Simpanan Pokok',
    name: '',
    imageUrl: ASSET_IMAGES.savingsLedger,
    description: '',
    requirements: '',
    terms: '',
    benefits: '',
    isPublished: true,
    sortOrder: 1,
  });

  const loadAll = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'cooperativeProducts'));
      const list = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }) as CooperativeProduct)
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      setProducts(list);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'cooperativeProducts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAll();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm({
      category: 'simpanan',
      subType: 'Simpanan Pokok',
      name: '',
      imageUrl: ASSET_IMAGES.savingsLedger,
      description: '',
      requirements: '',
      terms: '',
      benefits: '',
      isPublished: true,
      sortOrder: products.length + 1,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const docId = editingId || `coop-${Date.now()}`;
      if (editingId) {
        const existing = products.find((p) => p.id === editingId);
        await setDoc(doc(db, 'cooperativeProducts', docId), {
          ...form,
          sortOrder: Number(form.sortOrder) || 1,
          createdAt: existing?.createdAt || serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else {
        await setDoc(doc(db, 'cooperativeProducts', docId), {
          ...form,
          sortOrder: Number(form.sortOrder) || 1,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      resetForm();
      await loadAll();
      await refreshPublicData();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'cooperativeProducts');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'cooperativeProducts', id));
      await loadAll();
      await refreshPublicData();
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.DELETE,
        `cooperativeProducts/${id}`
      );
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h2 className="font-serif text-2xl font-semibold text-navy-900">
          Kelola Produk Simpanan & Pinjaman
        </h2>
        <p className="text-sm text-slate-600">
          Isi dan perbarui deskripsi, persyaratan, ketentuan resmi, dan manfaat produk sesuai kebijakan koperasi.
        </p>
      </div>

      <form
        onSubmit={handleSave}
        className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4"
      >
        <h3 className="text-base font-semibold text-navy-900">
          {editingId ? 'Edit Produk Koperasi' : 'Tambah Produk Koperasi Baru'}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Kategori Utama
            </label>
            <select
              value={form.category}
              onChange={(e) =>
                setForm({
                  ...form,
                  category: e.target.value as 'simpanan' | 'pinjaman',
                })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
            >
              <option value="simpanan">Produk Simpanan</option>
              <option value="pinjaman">Produk Pinjaman</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Jenis Produk (Mis. Simpanan Pokok)
            </label>
            <input
              type="text"
              required
              maxLength={80}
              value={form.subType}
              onChange={(e) => setForm({ ...form, subType: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Urutan Tampil
            </label>
            <input
              type="number"
              value={form.sortOrder}
              onChange={(e) =>
                setForm({ ...form, sortOrder: Number(e.target.value) })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Produk *
            </label>
            <input
              type="text"
              required
              maxLength={120}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <MediaInputField
              label="Foto / Ilustrasi Produk"
              mode="image"
              value={form.imageUrl}
              onChange={(nextUrl) => setForm({ ...form, imageUrl: nextUrl })}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Deskripsi Produk *
          </label>
          <textarea
            rows={2}
            required
            maxLength={2500}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Persyaratan
            </label>
            <textarea
              rows={3}
              maxLength={2000}
              value={form.requirements}
              onChange={(e) =>
                setForm({ ...form, requirements: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ketentuan Kebijakan Resmi
            </label>
            <textarea
              rows={3}
              maxLength={2000}
              value={form.terms}
              onChange={(e) => setForm({ ...form, terms: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Informasi Manfaat
            </label>
            <textarea
              rows={3}
              maxLength={2000}
              value={form.benefits}
              onChange={(e) => setForm({ ...form, benefits: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <label className="flex items-center gap-2 text-xs font-semibold text-navy-900">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) =>
                setForm({ ...form, isPublished: e.target.checked })
              }
            />
            <span>Publikasikan di Website</span>
          </label>
          <div className="flex gap-2">
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-slate-300 text-xs font-semibold rounded-lg"
              >
                Batal Edit
              </button>
            )}
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-navy-900 text-white text-xs font-semibold rounded-lg hover:bg-navy-800"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{editingId ? 'Perbarui Produk' : 'Simpan Produk'}</span>
            </button>
          </div>
        </div>
      </form>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
        <h3 className="text-base font-semibold text-navy-900">
          Daftar Produk Koperasi ({products.length})
        </h3>
        {loading ? (
          <p className="text-sm text-slate-500">Memuat...</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {products.map((prod) => (
              <div
                key={prod.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <p className="text-xs font-semibold text-gold-600">
                    {prod.category === 'simpanan' ? 'Simpanan' : 'Pinjaman'} ·{' '}
                    {prod.subType} ·{' '}
                    {prod.isPublished ? 'Tayang' : 'Draft'}
                  </p>
                  <p className="text-sm font-semibold text-navy-900">
                    {prod.name}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(prod.id);
                      setForm({
                        category: prod.category,
                        subType: prod.subType,
                        name: prod.name,
                        imageUrl: prod.imageUrl,
                        description: prod.description,
                        requirements: prod.requirements,
                        terms: prod.terms,
                        benefits: prod.benefits,
                        isPublished: prod.isPublished,
                        sortOrder: prod.sortOrder,
                      });
                    }}
                    className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-50"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(prod.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                    aria-label="Hapus produk"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const AdminMemberProductsTab: React.FC = () => {
  const { memberCategories, refreshPublicData } = useSiteData();
  const [products, setProducts] = useState<MemberProduct[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    category: memberCategories[0]?.name || 'Kuliner & Olahan Pangan',
    price: 0,
    unit: 'pcs',
    imageUrl: ASSET_IMAGES.batikCraft,
    ownerName: '',
    businessName: '',
    description: '',
    location: 'Gayamharjo, Prambanan, Sleman',
    whatsappNumber: '6281227005572',
    isFeatured: false,
    status: 'approved' as MemberProduct['status'],
  });

  const loadProducts = async () => {
    try {
      const snap = await getDocs(collection(db, 'memberProducts'));
      const list = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }) as MemberProduct)
        .sort(
          (a, b) =>
            (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0)
        );
      setProducts(list);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'memberProducts');
    }
  };

  useEffect(() => {
    void loadProducts();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newCategoryName.trim();
    if (clean.length < 2) return;
    try {
      const catId = `cat-${Date.now()}`;
      await setDoc(doc(db, 'memberCategories', catId), {
        name: clean,
        slug: slugify(clean),
        sortOrder: memberCategories.length + 1,
        createdAt: serverTimestamp(),
      });
      setNewCategoryName('');
      await refreshPublicData();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'memberCategories');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'memberCategories', id));
      await refreshPublicData();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `memberCategories/${id}`);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const docId = editingId || `mprod-${Date.now()}`;
      const existing = editingId
        ? products.find((p) => p.id === editingId)
        : null;
      await setDoc(doc(db, 'memberProducts', docId), {
        ...form,
        price: Number(form.price) || 0,
        createdAt: existing?.createdAt || serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setEditingId(null);
      setForm({
        name: '',
        category: memberCategories[0]?.name || 'Kuliner & Olahan Pangan',
        price: 0,
        unit: 'pcs',
        imageUrl: ASSET_IMAGES.batikCraft,
        ownerName: '',
        businessName: '',
        description: '',
        location: 'Gayamharjo, Prambanan, Sleman',
        whatsappNumber: '6281227005572',
        isFeatured: false,
        status: 'approved',
      });
      await loadProducts();
      await refreshPublicData();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'memberProducts');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'memberProducts', id));
      await loadProducts();
      await refreshPublicData();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `memberProducts/${id}`);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Kelola Kategori Produk Anggota */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <h2 className="font-serif text-xl font-semibold text-navy-900">
          Kategori Produk Anggota
        </h2>
        <form onSubmit={handleAddCategory} className="flex gap-2">
          <input
            type="text"
            required
            maxLength={80}
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Tambah kategori baru (mis. Herbal & Jamu)"
            className="flex-1 px-3.5 py-2 border border-slate-300 rounded-lg text-sm"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-navy-900 text-white text-xs font-semibold rounded-lg hover:bg-navy-800"
          >
            Tambah Kategori
          </button>
        </form>
        <div className="flex flex-wrap gap-2">
          {memberCategories.map((cat) => (
            <div
              key={cat.id}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
            >
              <span>{cat.name}</span>
              <button
                type="button"
                onClick={() => void handleDeleteCategory(cat.id)}
                className="text-slate-400 hover:text-red-600"
                aria-label={`Hapus ${cat.name}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Form Tambah / Edit Produk Anggota */}
      <form
        onSubmit={handleSaveProduct}
        className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4"
      >
        <h2 className="font-serif text-xl font-semibold text-navy-900">
          {editingId ? 'Edit Produk Anggota' : 'Tambah Produk Anggota'}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Produk *
            </label>
            <input
              type="text"
              required
              maxLength={140}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Kategori *
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
            >
              {memberCategories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Status Tampil
            </label>
            <select
              value={form.status}
              onChange={(e) =>
                setForm({
                  ...form,
                  status: e.target.value as MemberProduct['status'],
                })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
            >
              <option value="approved">Disetujui (Tampil Publik)</option>
              <option value="hidden">Disembunyikan</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Harga (Rp) *
            </label>
            <input
              type="number"
              required
              min={0}
              value={form.price}
              onChange={(e) =>
                setForm({ ...form, price: Number(e.target.value) })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Satuan *
            </label>
            <input
              type="text"
              required
              maxLength={40}
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Pemilik Anggota *
            </label>
            <input
              type="text"
              required
              maxLength={120}
              value={form.ownerName}
              onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Usaha
            </label>
            <input
              type="text"
              maxLength={140}
              value={form.businessName}
              onChange={(e) =>
                setForm({ ...form, businessName: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Lokasi Penjual *
            </label>
            <input
              type="text"
              required
              maxLength={160}
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              WhatsApp Penjual *
            </label>
            <input
              type="text"
              required
              maxLength={25}
              value={form.whatsappNumber}
              onChange={(e) =>
                setForm({ ...form, whatsappNumber: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
            />
          </div>
        </div>

        <MediaInputField
          label="Foto Produk Anggota"
          mode="image"
          value={form.imageUrl}
          onChange={(nextUrl) => setForm({ ...form, imageUrl: nextUrl })}
        />

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Deskripsi Produk *
          </label>
          <textarea
            rows={2}
            required
            maxLength={2500}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <label className="flex items-center gap-2 text-xs font-semibold text-navy-900">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) =>
                setForm({ ...form, isFeatured: e.target.checked })
              }
            />
            <span>Tampilkan sebagai Produk Unggulan di Beranda</span>
          </label>
          <div className="flex gap-2">
            {editingId && (
              <button
                type="button"
                onClick={() => setEditingId(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold"
              >
                Batal
              </button>
            )}
            <button
              type="submit"
              className="px-5 py-2 bg-navy-900 text-white text-xs font-semibold rounded-lg hover:bg-navy-800"
            >
              {editingId ? 'Perbarui Produk' : 'Simpan Produk Anggota'}
            </button>
          </div>
        </div>
      </form>

      {/* List Produk Anggota */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
        <h3 className="text-base font-semibold text-navy-900">
          Daftar Produk Anggota ({products.length})
        </h3>
        <div className="divide-y divide-slate-100">
          {products.map((p) => (
            <div
              key={p.id}
              className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <p className="text-xs text-slate-500">
                  <span className="font-semibold text-gold-600">
                    {p.category}
                  </span>{' '}
                  · {p.ownerName} ·{' '}
                  <span className="font-semibold">
                    {p.status === 'approved' ? 'Tayang' : 'Disembunyikan'}
                  </span>
                </p>
                <p className="text-sm font-semibold text-navy-900 flex items-center gap-1.5">
                  <span>{p.name}</span>
                  {p.isFeatured && (
                    <Star className="w-3.5 h-3.5 text-gold-500 fill-current" />
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold text-navy-900 mr-2 tabular-nums">
                  Rp {p.price.toLocaleString('id-ID')}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(p.id);
                    setForm({
                      name: p.name,
                      category: p.category,
                      price: p.price,
                      unit: p.unit,
                      imageUrl: p.imageUrl,
                      ownerName: p.ownerName,
                      businessName: p.businessName,
                      description: p.description,
                      location: p.location,
                      whatsappNumber: p.whatsappNumber,
                      isFeatured: p.isFeatured,
                      status: p.status,
                    });
                  }}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-50"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => void handleDeleteProduct(p.id)}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                  aria-label="Hapus"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const AdminProductSubmissionsTab: React.FC = () => {
  const { refreshPublicData } = useSiteData();
  const [submissions, setSubmissions] = useState<MemberProductSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'memberProductSubmissions'));
      const list = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }) as MemberProductSubmission)
        .sort(
          (a, b) =>
            (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0)
        );
      setSubmissions(list);
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.LIST,
        'memberProductSubmissions'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSubmissions();
  }, []);

  const handleApproveAndPublish = async (sub: MemberProductSubmission) => {
    try {
      const productId = `mprod-${Date.now()}`;
      await setDoc(doc(db, 'memberProducts', productId), {
        name: sub.productName,
        category: sub.category,
        price: sub.price,
        unit: sub.unit,
        imageUrl: sub.imageUrl || ASSET_IMAGES.javaneseCoffee,
        ownerName: sub.ownerName,
        businessName: sub.businessName,
        description: sub.description,
        location: sub.location,
        whatsappNumber: sub.whatsappNumber,
        isFeatured: false,
        status: 'approved',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      await updateDoc(doc(db, 'memberProductSubmissions', sub.id), {
        status: 'approved',
      });
      await loadSubmissions();
      await refreshPublicData();
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.WRITE,
        `memberProductSubmissions/${sub.id}`
      );
    }
  };

  const handleReject = async (id: string) => {
    try {
      await updateDoc(doc(db, 'memberProductSubmissions', id), {
        status: 'rejected',
      });
      await loadSubmissions();
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.UPDATE,
        `memberProductSubmissions/${id}`
      );
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'memberProductSubmissions', id));
      await loadSubmissions();
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.DELETE,
        `memberProductSubmissions/${id}`
      );
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="font-serif text-2xl font-semibold text-navy-900">
          Antrean Pendaftaran Produk Anggota ({submissions.length})
        </h2>
        <p className="text-sm text-slate-600">
          Tinjau data anggota yang mendaftarkan usahanya. Klik Setujui & Tayangkan untuk langsung mempublikasikan ke Marketplace Anggota.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Memuat data pendaftaran...</p>
      ) : submissions.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-sm text-slate-500">
          Belum ada pendaftaran produk anggota yang masuk.
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((sub) => (
            <div
              key={sub.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-gold-600">
                    {sub.category} · Status: {sub.status.toUpperCase()}
                  </p>
                  <h3 className="text-base font-semibold text-navy-900">
                    {sub.productName}
                  </h3>
                  <p className="text-xs text-slate-600">
                    Anggota: {sub.ownerName}{' '}
                    {sub.businessName ? `(${sub.businessName})` : ''} · WA:{' '}
                    <span className="font-mono">{sub.whatsappNumber}</span> ·{' '}
                    {sub.location}
                  </p>
                </div>
                <p className="font-mono text-sm font-semibold text-navy-900 tabular-nums">
                  Rp {sub.price.toLocaleString('id-ID')} / {sub.unit}
                </p>
              </div>
              <p className="text-sm text-slate-700">{sub.description}</p>
              <div className="flex flex-wrap justify-end gap-2 pt-2 border-t border-slate-100">
                {sub.status === 'pending' && (
                  <>
                    <button
                      type="button"
                      onClick={() => void handleApproveAndPublish(sub)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 text-white text-xs font-semibold rounded-lg hover:bg-emerald-800"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Setujui & Tayangkan</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleReject(sub.id)}
                      className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50"
                    >
                      Tolak
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => void handleDelete(sub.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  aria-label="Hapus"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
