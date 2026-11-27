import React, { useRef, useState } from 'react';
import {
  Camera,
  CheckCircle2,
  Image as ImageIcon,
  Link2,
  Loader2,
  Trash2,
  Upload,
  Video,
} from 'lucide-react';
import { ASSET_IMAGES } from '../data/initialCooperativeData';
import {
  compressImageFile,
  formatBytesIndonesian,
  getYoutubeThumbnailUrl,
  processVideoFile,
} from '../lib/mediaCompression';

export const PRESET_COOPERATIVE_PHOTOS = [
  { label: 'Foto Kantor Koperasi', url: ASSET_IMAGES.heroOffice },
  { label: 'Foto Pertemuan Anggota', url: ASSET_IMAGES.communityMeeting },
  { label: 'Foto Bazar UMKM', url: ASSET_IMAGES.communityBazaar },
  { label: 'Foto Kerajinan & Batik', url: ASSET_IMAGES.batikCraft },
  { label: 'Foto Kopi & Pangan UMKM', url: ASSET_IMAGES.javaneseCoffee },
  { label: 'Foto Simpanan & Buku Kas', url: ASSET_IMAGES.savingsLedger },
];

interface MediaInputFieldProps {
  label: string;
  mode?: 'image' | 'video';
  value: string;
  onChange: (nextValue: string) => void;
  onThumbnailDetected?: (thumbUrl: string) => void;
  placeholder?: string;
  required?: boolean;
  showPresets?: boolean;
  compact?: boolean;
  maxImageChars?: number;
  helperText?: string;
}

export const MediaInputField: React.FC<MediaInputFieldProps> = ({
  label,
  mode = 'image',
  value,
  onChange,
  onThumbnailDetected,
  placeholder,
  required = false,
  showPresets = true,
  compact = false,
  maxImageChars = 135000,
  helperText,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isDataUrl = value.startsWith('data:');

  const estimateDataUrlSize = (dataUrl: string) => {
    const base64 = dataUrl.split(',')[1] || '';
    return formatBytesIndonesian(Math.round((base64.length * 3) / 4));
  };

  const handleImageSelected = async (file?: File) => {
    if (!file) return;
    setProcessing(true);
    setErrorMessage(null);
    setStatusMessage(null);
    try {
      const result = await compressImageFile(file, {
        maxDimension: compact ? 760 : 960,
        maxChars: maxImageChars,
      });
      onChange(result.dataUrl);
      setStatusMessage(
        `Foto dikompres otomatis (${formatBytesIndonesian(result.originalBytes)} → ${formatBytesIndonesian(result.compressedBytes)})`
      );
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Gagal memproses file foto.'
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleVideoSelected = async (file?: File) => {
    if (!file) return;
    setProcessing(true);
    setErrorMessage(null);
    setStatusMessage(null);
    try {
      const result = await processVideoFile(file);
      if (result.thumbnailDataUrl && onThumbnailDetected) {
        onThumbnailDetected(result.thumbnailDataUrl);
      }
      if (result.mediaDataUrl) {
        onChange(result.mediaDataUrl);
        setStatusMessage(
          result.compressedBytes && result.compressedBytes < result.originalBytes
            ? `Video dikompres (${formatBytesIndonesian(result.originalBytes)} → ${formatBytesIndonesian(result.compressedBytes)}) & thumbnail siap.`
            : `Video siap (${formatBytesIndonesian(result.originalBytes)}) & thumbnail otomatis dibuat.`
        );
      } else {
        setErrorMessage(
          result.reason ||
            'Video melebihi batas simpan langsung (420 KB). Tempel URL YouTube atau Google Drive di atas.'
        );
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Gagal memproses file video.'
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleUrlInputChange = (nextUrl: string) => {
    setErrorMessage(null);
    setStatusMessage(null);
    onChange(nextUrl);
    if (mode === 'video' && onThumbnailDetected) {
      const ytThumb = getYoutubeThumbnailUrl(nextUrl);
      if (ytThumb) {
        onThumbnailDetected(ytThumb);
        setStatusMessage('Thumbnail YouTube terdeteksi otomatis.');
      }
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-slate-700">
        {label} {required ? '*' : ''}
      </label>

      {isDataUrl ? (
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-950">
          <div className="flex items-center gap-2 min-w-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span className="font-medium truncate">
              {mode === 'video'
                ? `File video terkompresi (${estimateDataUrlSize(value)})`
                : `Foto terkompresi siap pakai (${estimateDataUrlSize(value)})`}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              onChange('');
              setStatusMessage(null);
              setErrorMessage(null);
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-emerald-300 rounded text-xs font-semibold text-slate-700 hover:bg-slate-50 shrink-0"
          >
            <Trash2 className="w-3 h-3" />
            <span>Ganti ke URL</span>
          </button>
        </div>
      ) : (
        <div className="relative">
          <Link2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            required={required}
            maxLength={1500}
            value={value}
            onChange={(e) => handleUrlInputChange(e.target.value)}
            placeholder={
              placeholder ||
              (mode === 'video'
                ? 'Tempel URL YouTube / Shorts / Google Drive / MP4 siap pakai'
                : 'Tempel URL foto siap pakai (https://...) atau gunakan tombol di bawah')
            }
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-navy-700"
          />
        </div>
      )}

      {/* Action Buttons: Kamera Foto / Upload File Kompres / URL Siap Pakai */}
      <div className="flex flex-wrap items-center gap-2">
        {mode === 'image' && (
          <>
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                void handleImageSelected(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
            <button
              type="button"
              disabled={processing}
              onClick={() => cameraInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-navy-900 text-white text-xs font-semibold rounded-lg hover:bg-navy-800 disabled:opacity-60 transition-colors"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Ambil Foto</span>
            </button>
          </>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={mode === 'video' ? 'video/mp4,video/webm,video/*' : 'image/*'}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (mode === 'video') {
              void handleVideoSelected(f);
            } else {
              void handleImageSelected(f);
            }
            e.target.value = '';
          }}
        />
        <button
          type="button"
          disabled={processing}
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-navy-800 text-navy-900 bg-white text-xs font-semibold rounded-lg hover:bg-slate-50 disabled:opacity-60 transition-colors"
        >
          {processing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : mode === 'video' ? (
            <Video className="w-3.5 h-3.5" />
          ) : (
            <Upload className="w-3.5 h-3.5" />
          )}
          <span>
            {processing
              ? 'Mengompres...'
              : mode === 'video'
                ? 'Upload Video (Kompres)'
                : 'Upload File (Kompres)'}
          </span>
        </button>

        {mode === 'image' && showPresets && (
          <div className="inline-flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-slate-500 hidden sm:inline" />
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  setErrorMessage(null);
                  setStatusMessage('Foto bawaan siap pakai dipilih.');
                  onChange(e.target.value);
                }
              }}
              aria-label="Pilih foto siap pakai"
              className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-medium bg-white text-slate-700"
            >
              <option value="">URL / Foto Siap Pakai...</option>
              {PRESET_COOPERATIVE_PHOTOS.map((p) => (
                <option key={p.label} value={p.url}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Preview */}
      {value && mode === 'image' && (
        <div className="flex items-center gap-3 pt-1">
          <img
            src={value}
            alt="Pratinjau media"
            referrerPolicy="no-referrer"
            className="w-16 h-12 rounded-lg object-cover border border-slate-200 bg-slate-100 shrink-0"
          />
          <p className="text-xs text-slate-500">
            Pratinjau foto aktif siap ditampilkan di website.
          </p>
        </div>
      )}

      {helperText && (
        <p className="text-xs text-slate-500">{helperText}</p>
      )}

      {statusMessage && (
        <p className="text-xs text-emerald-700 font-medium">{statusMessage}</p>
      )}

      {errorMessage && (
        <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-2.5 py-1.5">
          {errorMessage}
        </p>
      )}
    </div>
  );
};
