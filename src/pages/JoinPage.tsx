import React, { useState } from 'react';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import {
  CheckCircle2,
  FileCheck,
  MessageCircle,
  UserPlus,
} from 'lucide-react';
import { useSiteData } from '../context/SiteDataContext';
import {
  db,
  FIELD_LIMITS,
  formatWhatsappHref,
  handleFirestoreError,
  OperationType,
  sanitizePlainText,
} from '../lib/firebase';

export const JoinPage: React.FC = () => {
  const { joinGuide, siteSettings } = useSiteData();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return;

    setFormError(null);
    const cleanName = sanitizePlainText(fullName);
    const cleanPhone = phone.trim();
    const cleanAddress = sanitizePlainText(address);
    const cleanMessage = sanitizePlainText(message);

    if (cleanName.length < 2 || cleanName.length > FIELD_LIMITS.NAME_MAX) {
      setFormError('Nama lengkap minimal 2 karakter.');
      return;
    }
    if (
      !FIELD_LIMITS.PHONE_REGEX.test(cleanPhone) ||
      cleanPhone.length < FIELD_LIMITS.PHONE_MIN
    ) {
      setFormError('Masukkan nomor HP/WhatsApp yang valid (minimal 8 digit).');
      return;
    }
    if (cleanAddress.length < 5 || cleanAddress.length > FIELD_LIMITS.ADDRESS_MAX) {
      setFormError('Alamat lengkap minimal 5 karakter.');
      return;
    }

    setSubmitting(true);
    try {
      const inquiryId = `join-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      await setDoc(doc(db, 'joinInquiries', inquiryId), {
        fullName: cleanName,
        phone: cleanPhone,
        address: cleanAddress,
        message: cleanMessage,
        status: 'baru',
        adminNotes: '',
        createdAt: serverTimestamp(),
      });
      setFullName('');
      setPhone('');
      setAddress('');
      setMessage('');
      setSubmitted(true);
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.CREATE, 'joinInquiries');
      } catch {
        setFormError(
          'Gagal mengirim formulir pendaftaran. Mohon periksa isian Anda dan coba lagi.'
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header */}
      <section className="bg-navy-900 text-white py-8 lg:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold text-gold-400 mb-2">
            Keanggotaan Koperasi
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-white mb-3">
            Cara Bergabung Menjadi Anggota
          </h1>
          <p className="text-base text-slate-200 max-w-3xl leading-relaxed">
            Bergabunglah bersama keluarga besar {siteSettings.cooperativeName} untuk mengakses layanan simpan pinjam berbasis pendidikan, solidaritas, serta pendampingan usaha mikro.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 space-y-7">
        {/* Keuntungan & Persyaratan */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <p className="text-xs font-semibold text-gold-600 mb-2">
              01. Manfaat Keanggotaan
            </p>
            <h2 className="font-serif text-2xl font-semibold text-navy-900 mb-4">
              Keuntungan Menjadi Anggota
            </h2>
            <ul className="space-y-3">
              {joinGuide.benefits.map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 text-sm text-slate-700"
                >
                  <CheckCircle2 className="w-5 h-5 text-gold-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <p className="text-xs font-semibold text-gold-600 mb-2">
              02. Ketentuan Umum
            </p>
            <h2 className="font-serif text-2xl font-semibold text-navy-900 mb-4">
              Persyaratan Keanggotaan
            </h2>
            <ul className="space-y-3">
              {joinGuide.requirements.map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 text-sm text-slate-700"
                >
                  <FileCheck className="w-5 h-5 text-navy-700 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Tahapan Pendaftaran */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <p className="text-xs font-semibold text-gold-600 mb-2">
            03. Alur Resmi
          </p>
          <h2 className="font-serif text-2xl font-semibold text-navy-900 mb-4">
            Tahapan Pendaftaran Anggota Baru
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {joinGuide.steps.map((step) => (
              <div
                key={step.stepNumber}
                className="p-5 rounded-xl bg-slate-50 border border-slate-200"
              >
                <p className="font-mono text-xl font-semibold text-gold-600 mb-2 tabular-nums">
                  0{step.stepNumber}
                </p>
                <h3 className="text-base font-semibold text-navy-900 mb-1.5">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Dokumen + Kontak Pengurus + Formulir Minat */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <p className="text-xs font-semibold text-gold-600 mb-2">
                04. Berkas Administrasi
              </p>
              <h2 className="font-serif text-xl font-semibold text-navy-900 mb-4">
                Dokumen yang Diperlukan
              </h2>
              <ul className="space-y-2.5 text-sm text-slate-700 list-disc pl-5">
                {joinGuide.documents.map((docItem, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {docItem}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-navy-900 text-white rounded-2xl p-6 sm:p-7 space-y-4">
              <div>
                <p className="text-xs font-semibold text-gold-400 mb-1">
                  Informasi Kontak Pengurus
                </p>
                <h3 className="font-serif text-xl font-semibold text-white">
                  {joinGuide.contactPersonName}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  {joinGuide.contactPersonRole}
                </p>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed">
                Ingin bertanya lebih lanjut sebelum mendaftar? Hubungi pengurus kami secara langsung melalui WhatsApp resmi.
              </p>
              <a
                href={formatWhatsappHref(
                  joinGuide.contactWhatsapp || siteSettings.whatsappNumber,
                  `Halo ${joinGuide.contactPersonName}, saya tertarik untuk bergabung menjadi anggota ${siteSettings.cooperativeName}. Mohon informasi jadwal orientasi anggota baru.`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 bg-gold-500 text-navy-950 text-sm font-semibold rounded-lg hover:bg-gold-400 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Hubungi Pengurus via WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Formulir Minat Menjadi Anggota */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6">
            <div className="flex items-center gap-2.5 mb-2">
              <UserPlus className="w-5 h-5 text-gold-600" />
              <h2 className="font-serif text-2xl font-semibold text-navy-900">
                Formulir Minat Menjadi Anggota
              </h2>
            </div>
            <p className="text-sm text-slate-600 mb-6">
              Data Anda disimpan secara aman dan hanya dapat diakses oleh pengurus resmi koperasi untuk menindaklanjuti pendaftaran Anda.
            </p>

            {submitted ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center space-y-3">
                <CheckCircle2 className="w-9 h-9 text-emerald-700 mx-auto" />
                <h3 className="text-lg font-semibold text-emerald-950">
                  Formulir Pendaftaran Minat Diterima
                </h3>
                <p className="text-sm text-emerald-800 max-w-md mx-auto">
                  Terima kasih telah mendaftarkan minat Anda. Pengurus koperasi akan segera menghubungi nomor WhatsApp Anda untuk informasi orientasi anggota baru.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="px-4 py-2 bg-emerald-800 text-white text-xs font-semibold rounded-lg"
                >
                  Kirim Pendaftaran Lainnya
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  name="company_ref"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                  className="hidden"
                  aria-hidden="true"
                />

                {formError && (
                  <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-800">
                    {formError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={120}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Masukkan nama lengkap sesuai KTP"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Nomor HP / WhatsApp Aktif *
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={25}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Contoh: 0812xxxxxxxx"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-navy-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Alamat Domisili *
                  </label>
                  <textarea
                    required
                    rows={2}
                    maxLength={300}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Dusun, Kalurahan, Kapanewon/Kecamatan, Kabupaten"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Pesan atau Pertanyaan (Opsional)
                  </label>
                  <textarea
                    rows={3}
                    maxLength={1500}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Sampaikan pertanyaan atau waktu terbaik untuk dihubungi..."
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-700"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto px-6 py-3 bg-navy-900 text-white text-sm font-semibold rounded-lg hover:bg-navy-800 disabled:opacity-60 transition-colors"
                >
                  {submitting
                    ? 'Menyimpan Pendaftaran...'
                    : 'Kirim Minat Menjadi Anggota'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
