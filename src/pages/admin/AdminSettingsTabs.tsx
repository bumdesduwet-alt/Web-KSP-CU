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
import { Plus, Save, Trash2 } from 'lucide-react';
import { MediaInputField } from '../../components/MediaInputField';
import { useSiteData } from '../../context/SiteDataContext';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import {
  BoardMember,
  CooperativeProfile,
  JoinGuide,
  JoinInquiry,
  SiteSettings,
} from '../../types';

export const AdminHomeSettingsTab: React.FC = () => {
  const { siteSettings, refreshPublicData } = useSiteData();
  const [form, setForm] = useState<SiteSettings>(siteSettings);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    setForm(siteSettings);
  }, [siteSettings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setNotice(null);
    try {
      await setDoc(doc(db, 'siteSettings', 'main'), {
        cooperativeName: form.cooperativeName.trim(),
        tagline: form.tagline.trim(),
        welcomeTitle: form.welcomeTitle.trim(),
        welcomeMessage: form.welcomeMessage.trim(),
        heroImageUrl: form.heroImageUrl.trim(),
        importantAnnouncement: form.importantAnnouncement.trim(),
        showAnnouncement: Boolean(form.showAnnouncement),
        address: form.address.trim(),
        whatsappNumber: form.whatsappNumber.trim(),
        email: form.email.trim(),
        serviceHours: form.serviceHours.trim(),
        socialLinks: {
          instagram: form.socialLinks?.instagram?.trim() || '',
          facebook: form.socialLinks?.facebook?.trim() || '',
          youtube: form.socialLinks?.youtube?.trim() || '',
        },
        stats: form.stats.slice(0, 6),
        updatedAt: serverTimestamp(),
      });
      await refreshPublicData();
      setNotice('Pengaturan beranda, kontak, dan statistik berhasil disimpan.');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'siteSettings/main');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-navy-900">
            Pengaturan Beranda, Kontak & Statistik
          </h2>
          <p className="text-sm text-slate-600">
            Perbarui teks sambutan, pengumuman penting, statistik perkembangan koperasi, nomor WhatsApp, dan tautan media sosial.
          </p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy-900 text-white text-sm font-semibold rounded-lg hover:bg-navy-800 disabled:opacity-60"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
        </button>
      </div>

      {notice && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-900">
          {notice}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <h3 className="text-base font-semibold text-navy-900 border-b border-slate-100 pb-3">
          Identitas & Hero Beranda
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Koperasi
            </label>
            <input
              type="text"
              required
              maxLength={120}
              value={form.cooperativeName}
              onChange={(e) =>
                setForm({ ...form, cooperativeName: e.target.value })
              }
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tagline Resmi
            </label>
            <input
              type="text"
              required
              maxLength={220}
              value={form.tagline}
              onChange={(e) => setForm({ ...form, tagline: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Judul Sambutan Hero
          </label>
          <input
            type="text"
            required
            maxLength={180}
            value={form.welcomeTitle}
            onChange={(e) => setForm({ ...form, welcomeTitle: e.target.value })}
            className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Kalimat Pengenalan Koperasi
          </label>
          <textarea
            rows={3}
            required
            maxLength={1500}
            value={form.welcomeMessage}
            onChange={(e) =>
              setForm({ ...form, welcomeMessage: e.target.value })
            }
            className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm"
          />
        </div>

        <MediaInputField
          label="Foto Utama Hero Beranda"
          mode="image"
          value={form.heroImageUrl}
          onChange={(nextUrl) => setForm({ ...form, heroImageUrl: nextUrl })}
          helperText="Pilih foto kantor bawaan, ambil foto, upload file (otomatis terkompres), atau tempel URL siap pakai."
        />

        <div className="pt-2 border-t border-slate-100 space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium text-navy-900">
            <input
              type="checkbox"
              checked={form.showAnnouncement}
              onChange={(e) =>
                setForm({ ...form, showAnnouncement: e.target.checked })
              }
              className="rounded border-slate-300"
            />
            <span>Tampilkan Bilah Pengumuman Penting di Atas Website</span>
          </label>
          <input
            type="text"
            maxLength={500}
            value={form.importantAnnouncement}
            onChange={(e) =>
              setForm({ ...form, importantAnnouncement: e.target.value })
            }
            placeholder="Isi pengumuman singkat..."
            className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm"
          />
        </div>
      </div>

      {/* Statistik Perkembangan Koperasi */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-semibold text-navy-900">
            Statistik Perkembangan Koperasi (Maks. 6)
          </h3>
          {form.stats.length < 6 && (
            <button
              type="button"
              onClick={() =>
                setForm({
                  ...form,
                  stats: [
                    ...form.stats,
                    { label: 'Indikator Baru', value: '0', unit: 'Satuan', period: '2026' },
                  ],
                })
              }
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Statistik</span>
            </button>
          )}
        </div>

        <div className="space-y-3">
          {form.stats.map((st, idx) => (
            <div
              key={idx}
              className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center bg-slate-50 p-3 rounded-xl border border-slate-200"
            >
              <input
                type="text"
                placeholder="Label"
                value={st.label}
                onChange={(e) => {
                  const next = [...form.stats];
                  next[idx] = { ...st, label: e.target.value };
                  setForm({ ...form, stats: next });
                }}
                className="sm:col-span-3 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
              />
              <input
                type="text"
                placeholder="Angka / Nilai"
                value={st.value}
                onChange={(e) => {
                  const next = [...form.stats];
                  next[idx] = { ...st, value: e.target.value };
                  setForm({ ...form, stats: next });
                }}
                className="sm:col-span-2 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono"
              />
              <input
                type="text"
                placeholder="Satuan"
                value={st.unit}
                onChange={(e) => {
                  const next = [...form.stats];
                  next[idx] = { ...st, unit: e.target.value };
                  setForm({ ...form, stats: next });
                }}
                className="sm:col-span-3 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
              />
              <input
                type="text"
                placeholder="Keterangan periode"
                value={st.period}
                onChange={(e) => {
                  const next = [...form.stats];
                  next[idx] = { ...st, period: e.target.value };
                  setForm({ ...form, stats: next });
                }}
                className="sm:col-span-3 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
              />
              <button
                type="button"
                onClick={() =>
                  setForm({
                    ...form,
                    stats: form.stats.filter((_, i) => i !== idx),
                  })
                }
                aria-label="Hapus statistik"
                className="sm:col-span-1 p-2 text-red-600 hover:bg-red-50 rounded-lg justify-self-end"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Kontak Resmi & Media Sosial */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <h3 className="text-base font-semibold text-navy-900 border-b border-slate-100 pb-3">
          Kontak Resmi, Alamat & Media Sosial
        </h3>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Alamat Lengkap Kantor
          </label>
          <input
            type="text"
            required
            maxLength={300}
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nomor WhatsApp Resmi
            </label>
            <input
              type="text"
              required
              maxLength={25}
              value={form.whatsappNumber}
              onChange={(e) =>
                setForm({ ...form, whatsappNumber: e.target.value })
              }
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Resmi
            </label>
            <input
              type="email"
              maxLength={120}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Jam Pelayanan
            </label>
            <input
              type="text"
              maxLength={220}
              value={form.serviceHours}
              onChange={(e) =>
                setForm({ ...form, serviceHours: e.target.value })
              }
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tautan Instagram
            </label>
            <input
              type="url"
              maxLength={300}
              value={form.socialLinks?.instagram || ''}
              onChange={(e) =>
                setForm({
                  ...form,
                  socialLinks: {
                    ...form.socialLinks,
                    instagram: e.target.value,
                  },
                })
              }
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tautan Facebook
            </label>
            <input
              type="url"
              maxLength={300}
              value={form.socialLinks?.facebook || ''}
              onChange={(e) =>
                setForm({
                  ...form,
                  socialLinks: {
                    ...form.socialLinks,
                    facebook: e.target.value,
                  },
                })
              }
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tautan YouTube
            </label>
            <input
              type="url"
              maxLength={300}
              value={form.socialLinks?.youtube || ''}
              onChange={(e) =>
                setForm({
                  ...form,
                  socialLinks: {
                    ...form.socialLinks,
                    youtube: e.target.value,
                  },
                })
              }
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>
        </div>
      </div>
    </form>
  );
};

export const AdminProfileTab: React.FC = () => {
  const { cooperativeProfile, refreshPublicData } = useSiteData();
  const [form, setForm] = useState<CooperativeProfile>(cooperativeProfile);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    setForm(cooperativeProfile);
  }, [cooperativeProfile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setNotice(null);
    try {
      await setDoc(doc(db, 'cooperativeProfile', 'main'), {
        history: form.history.trim(),
        vision: form.vision.trim(),
        missions: form.missions.map((m) => m.trim()).filter(Boolean).slice(0, 12),
        values: form.values.slice(0, 10),
        principles: form.principles.map((p) => p.trim()).filter(Boolean).slice(0, 10),
        objectives: form.objectives.map((o) => o.trim()).filter(Boolean).slice(0, 10),
        orgStructureSummary: form.orgStructureSummary.trim(),
        officePhotos: form.officePhotos.map((p) => p.trim()).filter(Boolean).slice(0, 8),
        boardMembers: form.boardMembers.slice(0, 25),
        updatedAt: serverTimestamp(),
      });
      await refreshPublicData();
      setNotice('Profil koperasi dan susunan pengurus berhasil diperbarui.');
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.WRITE,
        'cooperativeProfile/main'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-navy-900">
            Kelola Profil Kami & Pengurus
          </h2>
          <p className="text-sm text-slate-600">
            Ubah sejarah, visi, misi, nilai, prinsip, tujuan, struktur organisasi, dan daftar pengurus/pengawas.
          </p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy-900 text-white text-sm font-semibold rounded-lg hover:bg-navy-800 disabled:opacity-60"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Menyimpan...' : 'Simpan Profil'}</span>
        </button>
      </div>

      {notice && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-900">
          {notice}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Sejarah Berdirinya Koperasi
          </label>
          <textarea
            rows={6}
            required
            maxLength={6000}
            value={form.history}
            onChange={(e) => setForm({ ...form, history: e.target.value })}
            className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Visi Koperasi
          </label>
          <textarea
            rows={2}
            required
            maxLength={1000}
            value={form.vision}
            onChange={(e) => setForm({ ...form, vision: e.target.value })}
            className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Misi Koperasi (satu poin per baris)
          </label>
          <textarea
            rows={4}
            value={form.missions.join('\n')}
            onChange={(e) =>
              setForm({ ...form, missions: e.target.value.split('\n') })
            }
            className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Prinsip Koperasi (satu poin per baris)
            </label>
            <textarea
              rows={4}
              value={form.principles.join('\n')}
              onChange={(e) =>
                setForm({ ...form, principles: e.target.value.split('\n') })
              }
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tujuan Koperasi (satu poin per baris)
            </label>
            <textarea
              rows={4}
              value={form.objectives.join('\n')}
              onChange={(e) =>
                setForm({ ...form, objectives: e.target.value.split('\n') })
              }
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Ringkasan Struktur Organisasi
          </label>
          <textarea
            rows={3}
            maxLength={2000}
            value={form.orgStructureSummary}
            onChange={(e) =>
              setForm({ ...form, orgStructureSummary: e.target.value })
            }
            className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm"
          />
        </div>
      </div>

      {/* Foto Kantor & Kegiatan Profil */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-semibold text-navy-900">
            Foto Kantor & Dokumentasi Profil (Maks. 8)
          </h3>
          {form.officePhotos.length < 8 && (
            <button
              type="button"
              onClick={() =>
                setForm({
                  ...form,
                  officePhotos: [...form.officePhotos, ''],
                })
              }
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Slot Foto</span>
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {form.officePhotos.map((photoUrl, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-navy-900">
                  Foto Profil #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setForm({
                      ...form,
                      officePhotos: form.officePhotos.filter(
                        (_, i) => i !== idx
                      ),
                    })
                  }
                  aria-label="Hapus foto profil"
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <MediaInputField
                label="Sumber Foto"
                mode="image"
                compact
                maxImageChars={100000}
                value={photoUrl}
                onChange={(nextUrl) => {
                  const next = [...form.officePhotos];
                  next[idx] = nextUrl;
                  setForm({ ...form, officePhotos: next });
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Pengurus & Pengawas */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-semibold text-navy-900">
            Daftar Pengurus, Pengawas & Pengelola
          </h3>
          <button
            type="button"
            onClick={() =>
              setForm({
                ...form,
                boardMembers: [
                  ...form.boardMembers,
                  {
                    name: '',
                    role: '',
                    group: 'Pengurus',
                    bio: '',
                  },
                ],
              })
            }
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Personel</span>
          </button>
        </div>

        <div className="space-y-4">
          {form.boardMembers.map((bm: BoardMember, idx: number) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Nama Lengkap"
                  value={bm.name}
                  onChange={(e) => {
                    const next = [...form.boardMembers];
                    next[idx] = { ...bm, name: e.target.value };
                    setForm({ ...form, boardMembers: next });
                  }}
                  className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                />
                <input
                  type="text"
                  placeholder="Jabatan (mis. Ketua Pengurus)"
                  value={bm.role}
                  onChange={(e) => {
                    const next = [...form.boardMembers];
                    next[idx] = { ...bm, role: e.target.value };
                    setForm({ ...form, boardMembers: next });
                  }}
                  className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                />
                <div className="flex gap-2">
                  <select
                    value={bm.group}
                    onChange={(e) => {
                      const next = [...form.boardMembers];
                      next[idx] = {
                        ...bm,
                        group: e.target.value as BoardMember['group'],
                      };
                      setForm({ ...form, boardMembers: next });
                    }}
                    className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="Pengurus">Pengurus</option>
                    <option value="Pengawas">Pengawas</option>
                    <option value="Pengelola">Pengelola</option>
                  </select>
                  <button
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        boardMembers: form.boardMembers.filter(
                          (_, i) => i !== idx
                        ),
                      })
                    }
                    aria-label="Hapus personel"
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <input
                type="text"
                placeholder="Ringkasan tugas / profil singkat"
                value={bm.bio}
                onChange={(e) => {
                  const next = [...form.boardMembers];
                  next[idx] = { ...bm, bio: e.target.value };
                  setForm({ ...form, boardMembers: next });
                }}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
              />
            </div>
          ))}
        </div>
      </div>
    </form>
  );
};

export const AdminJoinTab: React.FC = () => {
  const { joinGuide, refreshPublicData } = useSiteData();
  const [guideForm, setGuideForm] = useState<JoinGuide>(joinGuide);
  const [inquiries, setInquiries] = useState<JoinInquiry[]>([]);
  const [loadingInquiries, setLoadingInquiries] = useState(true);
  const [savingGuide, setSavingGuide] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    setGuideForm(joinGuide);
  }, [joinGuide]);

  const loadInquiries = async () => {
    setLoadingInquiries(true);
    try {
      const snap = await getDocs(collection(db, 'joinInquiries'));
      const list = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }) as JoinInquiry)
        .sort(
          (a, b) =>
            (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0)
        );
      setInquiries(list);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'joinInquiries');
    } finally {
      setLoadingInquiries(false);
    }
  };

  useEffect(() => {
    void loadInquiries();
  }, []);

  const handleSaveGuide = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingGuide(true);
    setNotice(null);
    try {
      await setDoc(doc(db, 'joinGuide', 'main'), {
        benefits: guideForm.benefits.map((s) => s.trim()).filter(Boolean).slice(0, 12),
        requirements: guideForm.requirements.map((s) => s.trim()).filter(Boolean).slice(0, 12),
        steps: guideForm.steps.slice(0, 10),
        documents: guideForm.documents.map((s) => s.trim()).filter(Boolean).slice(0, 12),
        contactPersonName: guideForm.contactPersonName.trim(),
        contactPersonRole: guideForm.contactPersonRole.trim(),
        contactWhatsapp: guideForm.contactWhatsapp.trim(),
        updatedAt: serverTimestamp(),
      });
      await refreshPublicData();
      setNotice('Informasi cara bergabung berhasil diperbarui.');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'joinGuide/main');
    } finally {
      setSavingGuide(false);
    }
  };

  const handleUpdateInquiryStatus = async (
    id: string,
    status: JoinInquiry['status'],
    adminNotes: string
  ) => {
    try {
      await updateDoc(doc(db, 'joinInquiries', id), { status, adminNotes });
      setInquiries((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status, adminNotes } : item
        )
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `joinInquiries/${id}`);
    }
  };

  const handleDeleteInquiry = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'joinInquiries', id));
      setInquiries((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `joinInquiries/${id}`);
    }
  };

  return (
    <div className="space-y-10 max-w-5xl">
      {/* Calon Anggota Masuk */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="font-serif text-xl font-semibold text-navy-900">
              Data Minat Calon Anggota ({inquiries.length})
            </h2>
            <p className="text-xs text-slate-600">
              Data pribadi calon anggota hanya dapat diakses oleh pengurus terverifikasi.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void loadInquiries()}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-50"
          >
            Muat Ulang
          </button>
        </div>

        {loadingInquiries ? (
          <p className="text-sm text-slate-500">Memuat data pendaftar...</p>
        ) : inquiries.length === 0 ? (
          <p className="text-sm text-slate-500">
            Belum ada formulir minat calon anggota yang masuk.
          </p>
        ) : (
          <div className="space-y-3">
            {inquiries.map((inq) => (
              <div
                key={inq.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-navy-900">
                      {inq.fullName} ·{' '}
                      <span className="font-mono text-xs text-navy-700">
                        {inq.phone}
                      </span>
                    </p>
                    <p className="text-xs text-slate-600">{inq.address}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={inq.status}
                      onChange={(e) =>
                        void handleUpdateInquiryStatus(
                          inq.id,
                          e.target.value as JoinInquiry['status'],
                          inq.adminNotes
                        )
                      }
                      className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                    >
                      <option value="baru">Baru</option>
                      <option value="dihubungi">Sudah Dihubungi</option>
                      <option value="selesai">Selesai / Terdaftar</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => void handleDeleteInquiry(inq.id)}
                      aria-label="Hapus pendaftaran"
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {inq.message && (
                  <p className="text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200">
                    "{inq.message}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Editor Panduan Cara Bergabung */}
      <form
        onSubmit={handleSaveGuide}
        className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3">
          <h2 className="font-serif text-xl font-semibold text-navy-900">
            Pengaturan Halaman Cara Bergabung
          </h2>
          <button
            type="submit"
            disabled={savingGuide}
            className="inline-flex items-center gap-2 px-5 py-2 bg-navy-900 text-white text-xs font-semibold rounded-lg hover:bg-navy-800 disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            <span>{savingGuide ? 'Menyimpan...' : 'Simpan Panduan'}</span>
          </button>
        </div>

        {notice && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
            {notice}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Keuntungan Menjadi Anggota (satu poin per baris)
            </label>
            <textarea
              rows={5}
              value={guideForm.benefits.join('\n')}
              onChange={(e) =>
                setGuideForm({
                  ...guideForm,
                  benefits: e.target.value.split('\n'),
                })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Persyaratan Keanggotaan (satu poin per baris)
            </label>
            <textarea
              rows={5}
              value={guideForm.requirements.join('\n')}
              onChange={(e) =>
                setGuideForm({
                  ...guideForm,
                  requirements: e.target.value.split('\n'),
                })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Dokumen yang Diperlukan (satu poin per baris)
          </label>
          <textarea
            rows={4}
            value={guideForm.documents.join('\n')}
            onChange={(e) =>
              setGuideForm({
                ...guideForm,
                documents: e.target.value.split('\n'),
              })
            }
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Kontak Pengurus
            </label>
            <input
              type="text"
              required
              value={guideForm.contactPersonName}
              onChange={(e) =>
                setGuideForm({
                  ...guideForm,
                  contactPersonName: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Jabatan Kontak
            </label>
            <input
              type="text"
              required
              value={guideForm.contactPersonRole}
              onChange={(e) =>
                setGuideForm({
                  ...guideForm,
                  contactPersonRole: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              WhatsApp Kontak Pengurus
            </label>
            <input
              type="text"
              required
              value={guideForm.contactWhatsapp}
              onChange={(e) =>
                setGuideForm({ ...guideForm, contactWhatsapp: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
            />
          </div>
        </div>
      </form>
    </div>
  );
};
