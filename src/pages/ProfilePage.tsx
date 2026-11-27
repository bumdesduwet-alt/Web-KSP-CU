import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, MapPin, ShieldCheck, Users } from 'lucide-react';
import { ResilientImage } from '../components/ResilientImage';
import { useSiteData } from '../context/SiteDataContext';

export const ProfilePage: React.FC = () => {
  const { cooperativeProfile, siteSettings } = useSiteData();

  const groupedBoard: Array<{
    group: 'Pengurus' | 'Pengawas' | 'Pengelola';
    title: string;
  }> = [
    { group: 'Pengurus', title: 'Susunan Pengurus Koperasi' },
    { group: 'Pengawas', title: 'Badan Pengawas' },
    { group: 'Pengelola', title: 'Tim Pengelola Pelayanan' },
  ];

  return (
    <div className="bg-slate-50">
      {/* Page Header */}
      <section className="bg-navy-900 text-white py-8 lg:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold text-gold-400 mb-2">
            Profil Resmi Koperasi
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-white mb-3">
            Mengenal {siteSettings.cooperativeName}
          </h1>
          <p className="text-base text-slate-200 max-w-3xl leading-relaxed">
            Lembaga keuangan koperasi kredit yang berakar dari semangat gotong royong masyarakat Gayamharjo, Prambanan, Sleman untuk kemandirian dan kesejahteraan anggota.
          </p>
        </div>
      </section>

      {/* Sejarah & Foto */}
      <section className="py-8 lg:py-10 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            <div className="lg:col-span-7 space-y-4">
              <p className="text-xs font-semibold text-gold-600">
                01. Sejarah Berdirinya Koperasi
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-navy-900">
                Akar Kebersamaan Masyarakat Gayamharjo
              </h2>
              <div className="space-y-4 text-slate-700 leading-relaxed whitespace-pre-line">
                {cooperativeProfile.history}
              </div>
            </div>

            <div className="lg:col-span-5 space-y-4">
              {cooperativeProfile.officePhotos.slice(0, 2).map((photo, idx) => (
                <div
                  key={idx}
                  className="aspect-[16/10] rounded-2xl overflow-hidden border border-slate-200"
                >
                  <ResilientImage
                    src={photo}
                    alt={`Dokumentasi kantor dan kegiatan ${siteSettings.cooperativeName} ${idx + 1}`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Visi & Misi */}
      <section className="py-8 lg:py-10 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 bg-navy-900 text-white rounded-2xl p-6">
              <p className="text-xs font-semibold text-gold-400 mb-2">
                02. Visi Koperasi
              </p>
              <h2 className="font-serif text-2xl font-semibold text-white mb-3">
                Arah Pandang Masa Depan
              </h2>
              <p className="text-base text-slate-100 leading-relaxed">
                "{cooperativeProfile.vision}"
              </p>
            </div>

            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6">
              <p className="text-xs font-semibold text-gold-600 mb-2">
                03. Misi Koperasi
              </p>
              <h2 className="font-serif text-2xl font-semibold text-navy-900 mb-4">
                Langkah Nyata Pemberdayaan
              </h2>
              <ul className="space-y-3">
                {cooperativeProfile.missions.map((mission, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-slate-700">
                    <CheckCircle2 className="w-5 h-5 text-gold-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{mission}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Nilai, Tujuan & Prinsip */}
      <section className="py-8 lg:py-10 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div>
            <p className="text-xs font-semibold text-gold-600 mb-2">
              04. Nilai-Nilai Dasar Credit Union
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-navy-900 mb-5">
              Nilai yang Menuntun Pelayanan Kami
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {cooperativeProfile.values.map((val, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-slate-50 border border-slate-200"
                >
                  <p className="font-mono text-xs font-semibold text-gold-600 mb-2">
                    0{idx + 1}
                  </p>
                  <h3 className="text-base font-semibold text-navy-900 mb-2">
                    {val.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {val.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2 text-navy-900 font-semibold mb-3">
                <ShieldCheck className="w-5 h-5 text-gold-600" />
                <h3 className="font-serif text-xl">Prinsip-Prinsip Koperasi</h3>
              </div>
              <ol className="space-y-2.5 text-sm text-slate-700 list-decimal pl-5">
                {cooperativeProfile.principles.map((p, idx) => (
                  <li key={idx} className="leading-relaxed pl-1">
                    {p}
                  </li>
                ))}
              </ol>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2 text-navy-900 font-semibold mb-3">
                <Users className="w-5 h-5 text-gold-600" />
                <h3 className="font-serif text-xl">Tujuan Koperasi</h3>
              </div>
              <ol className="space-y-2.5 text-sm text-slate-700 list-decimal pl-5">
                {cooperativeProfile.objectives.map((obj, idx) => (
                  <li key={idx} className="leading-relaxed pl-1">
                    {obj}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Struktur Organisasi & Pengurus */}
      <section className="py-8 lg:py-10 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-6">
            <p className="text-xs font-semibold text-gold-600 mb-2">
              05. Tata Kelola & Kepengurusan
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-navy-900 mb-2.5">
              Struktur Organisasi, Pengurus, dan Pengawas
            </h2>
            <p className="text-slate-600 leading-relaxed">
              {cooperativeProfile.orgStructureSummary}
            </p>
          </div>

          <div className="space-y-7">
            {groupedBoard.map(({ group, title }) => {
              const members = cooperativeProfile.boardMembers.filter(
                (m) => m.group === group
              );
              if (members.length === 0) return null;
              return (
                <div key={group}>
                  <h3 className="font-serif text-xl font-semibold text-navy-900 mb-3.5">
                    {title}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {members.map((member, idx) => (
                      <div
                        key={idx}
                        className="bg-white border border-slate-200 rounded-2xl p-5"
                      >
                        <p className="text-xs font-semibold text-gold-600 mb-1">
                          {member.role}
                        </p>
                        <h4 className="text-lg font-semibold text-navy-900 mb-2">
                          {member.name}
                        </h4>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {member.bio}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Alamat & Lokasi */}
          <div className="mt-8 bg-white border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <p className="text-xs font-semibold text-gold-600 mb-1">
                Kantor Pelayanan Resmi
              </p>
              <h3 className="font-serif text-xl font-semibold text-navy-900 mb-2">
                {siteSettings.cooperativeName}
              </h3>
              <p className="flex items-start gap-2 text-sm text-slate-600">
                <MapPin className="w-4 h-4 text-gold-600 shrink-0 mt-0.5" />
                <span>{siteSettings.address}</span>
              </p>
              <p className="text-xs text-slate-500 mt-1.5">
                {siteSettings.serviceHours}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/hubungi-kami"
                className="px-5 py-2.5 bg-navy-900 text-white text-sm font-semibold rounded-lg hover:bg-navy-800 transition-colors"
              >
                Lihat Peta & Kontak
              </Link>
              <Link
                to="/cara-bergabung"
                className="px-5 py-2.5 border border-slate-300 text-navy-900 text-sm font-semibold rounded-lg hover:bg-slate-100 transition-colors"
              >
                Cara Bergabung
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
