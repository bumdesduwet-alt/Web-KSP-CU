import React, { useState } from 'react';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
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

export const ContactPage: React.FC = () => {
  const { siteSettings } = useSiteData();

  const [senderName, setSenderName] = useState('');
  const [senderContact, setSenderContact] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const mapQuery = encodeURIComponent(
    siteSettings.address ||
      'Jali, Gayamharjo, Prambanan, Sleman, Yogyakarta 55572'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return;

    setFormError(null);
    const cleanName = sanitizePlainText(senderName);
    const cleanContact = sanitizePlainText(senderContact);
    const cleanSubject = sanitizePlainText(subject);
    const cleanMessage = sanitizePlainText(message);

    if (cleanName.length < 2 || cleanName.length > FIELD_LIMITS.NAME_MAX) {
      setFormError('Nama pengirim minimal 2 karakter.');
      return;
    }
    if (cleanContact.length < 4 || cleanContact.length > FIELD_LIMITS.NAME_MAX) {
      setFormError('Cantumkan nomor WhatsApp atau email yang dapat dihubungi.');
      return;
    }
    if (cleanSubject.length < 2 || cleanSubject.length > FIELD_LIMITS.SHORT_TEXT_MAX) {
      setFormError('Perihal pesan minimal 2 karakter.');
      return;
    }
    if (cleanMessage.length < 5 || cleanMessage.length > FIELD_LIMITS.MESSAGE_MAX) {
      setFormError('Isi pesan minimal 5 karakter.');
      return;
    }

    setSubmitting(true);
    try {
      const msgId = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      await setDoc(doc(db, 'contactMessages', msgId), {
        senderName: cleanName,
        senderContact: cleanContact,
        subject: cleanSubject,
        message: cleanMessage,
        status: 'baru',
        createdAt: serverTimestamp(),
      });
      setSenderName('');
      setSenderContact('');
      setSubject('');
      setMessage('');
      setSubmitted(true);
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.CREATE, 'contactMessages');
      } catch {
        setFormError(
          'Gagal mengirim pesan. Pastikan tidak menggunakan karakter < atau >.'
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
            Kantor Pelayanan & Komunikasi Resmi
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-white mb-3">
            Hubungi {siteSettings.cooperativeName}
          </h1>
          <p className="text-base text-slate-200 max-w-2xl leading-relaxed">
            Kunjungi kantor kami di Gayamharjo, Prambanan, Sleman atau kirimkan pesan langsung kepada tim pengurus dan pengelola pelayanan.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 space-y-7">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Contact Information */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
              <div>
                <p className="text-xs font-semibold text-gold-600 mb-1">
                  Identitas Lembaga
                </p>
                <h2 className="font-serif text-2xl font-semibold text-navy-900">
                  {siteSettings.cooperativeName}
                </h2>
              </div>

              <div className="space-y-4 text-sm text-slate-700 pt-2 border-t border-slate-100">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gold-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-navy-900">Alamat Kantor</p>
                    <p className="text-slate-600 leading-relaxed">
                      {siteSettings.address}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gold-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-navy-900">
                      WhatsApp Resmi
                    </p>
                    <a
                      href={formatWhatsappHref(
                        siteSettings.whatsappNumber,
                        `Halo Pengurus ${siteSettings.cooperativeName}, saya ingin bertanya mengenai layanan koperasi.`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-navy-800 hover:text-gold-600 tabular-nums"
                    >
                      +{siteSettings.whatsappNumber.replace(/[^0-9]/g, '')}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gold-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-navy-900">Email Resmi</p>
                    <a
                      href={`mailto:${siteSettings.email}`}
                      className="text-navy-800 hover:text-gold-600 break-all"
                    >
                      {siteSettings.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gold-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-navy-900">Jam Pelayanan</p>
                    <p className="text-slate-600">
                      {siteSettings.serviceHours}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-3">
                <p className="text-xs font-semibold text-slate-500">
                  Media Sosial Resmi
                </p>
                <div className="flex flex-wrap gap-3 text-xs font-semibold">
                  {siteSettings.socialLinks?.instagram && (
                    <a
                      href={siteSettings.socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-lg border border-slate-200 text-navy-900 hover:bg-slate-50"
                    >
                      Instagram
                    </a>
                  )}
                  {siteSettings.socialLinks?.facebook && (
                    <a
                      href={siteSettings.socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-lg border border-slate-200 text-navy-900 hover:bg-slate-50"
                    >
                      Facebook
                    </a>
                  )}
                  {siteSettings.socialLinks?.youtube && (
                    <a
                      href={siteSettings.socialLinks.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-lg border border-slate-200 text-navy-900 hover:bg-slate-50"
                    >
                      YouTube
                    </a>
                  )}
                </div>
              </div>

              <a
                href={formatWhatsappHref(
                  siteSettings.whatsappNumber,
                  `Halo Pengurus ${siteSettings.cooperativeName}, saya ingin berkonsultasi mengenai layanan koperasi.`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 bg-navy-900 text-white text-sm font-semibold rounded-lg hover:bg-navy-800 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat WhatsApp Sekarang</span>
              </a>
            </div>
          </div>

          {/* Message Form */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6">
            <h2 className="font-serif text-2xl font-semibold text-navy-900 mb-2">
              Kirim Pesan ke Pengurus
            </h2>
            <p className="text-sm text-slate-600 mb-6">
              Sampaikan pertanyaan, saran, maupun permintaan informasi layanan melalui formulir berikut.
            </p>

            {submitted ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center space-y-3">
                <CheckCircle2 className="w-9 h-9 text-emerald-700 mx-auto" />
                <h3 className="text-lg font-semibold text-emerald-950">
                  Pesan Berhasil Terkirim
                </h3>
                <p className="text-sm text-emerald-800 max-w-md mx-auto">
                  Terima kasih telah menghubungi {siteSettings.cooperativeName}. Pengurus kami akan membaca dan menindaklanjuti pesan Anda.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="px-4 py-2 bg-emerald-800 text-white text-xs font-semibold rounded-lg"
                >
                  Kirim Pesan Lainnya
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  name="org_website"
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Nama Anda *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={120}
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      placeholder="Nama lengkap"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Nomor WhatsApp / Email *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={120}
                      value={senderContact}
                      onChange={(e) => setSenderContact(e.target.value)}
                      placeholder="0812xxxxxxxx / email@anda.com"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Perihal Pesan *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={160}
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Contoh: Informasi pendaftaran anggota atau produk simpanan"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Isi Pesan *
                  </label>
                  <textarea
                    required
                    rows={5}
                    maxLength={2000}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tuliskan pesan Anda secara jelas..."
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-700"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-navy-900 text-white text-sm font-semibold rounded-lg hover:bg-navy-800 disabled:opacity-60 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Mengirim...' : 'Kirim Pesan'}</span>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Google Maps Embed */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-serif text-xl font-semibold text-navy-900">
                Peta Lokasi Kantor Pelayanan
              </h2>
              <p className="text-xs text-slate-600">{siteSettings.address}</p>
            </div>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-300 text-navy-900 text-xs font-semibold rounded-lg hover:bg-slate-50 whitespace-nowrap shrink-0"
            >
              <span>Buka di Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
          <div className="w-full h-80 sm:h-96 bg-slate-100">
            <iframe
              title="Peta Lokasi KSP CU Argomanunggal Santosa"
              src={`https://maps.google.com/maps?q=${mapQuery}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
              className="w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </div>
  );
};
