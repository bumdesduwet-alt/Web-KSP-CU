export interface CompressedImageResult {
  dataUrl: string;
  originalBytes: number;
  compressedBytes: number;
  width: number;
  height: number;
}

export interface VideoProcessResult {
  mediaDataUrl: string | null;
  thumbnailDataUrl: string | null;
  originalBytes: number;
  compressedBytes: number | null;
  tooLargeForDirectStorage: boolean;
  reason?: string;
}

export function formatBytesIndonesian(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(1).replace('.', ',')} MB`;
}

export function extractYoutubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url.trim());
    if (parsed.hostname.includes('youtu.be')) {
      const id = parsed.pathname.split('/').filter(Boolean)[0];
      return id || null;
    }
    if (parsed.hostname.includes('youtube.com')) {
      const v = parsed.searchParams.get('v');
      if (v) return v;
      const parts = parsed.pathname.split('/').filter(Boolean);
      if ((parts[0] === 'embed' || parts[0] === 'shorts') && parts[1]) {
        return parts[1];
      }
    }
  } catch {
    return null;
  }
  return null;
}

export function getYoutubeThumbnailUrl(url: string): string | null {
  const id = extractYoutubeVideoId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Gagal membaca file gambar.'));
    img.src = src;
  });
}

function canvasToCompressedDataUrl(
  source: CanvasImageSource,
  srcWidth: number,
  srcHeight: number,
  maxDimension: number,
  maxChars: number
): { dataUrl: string; width: number; height: number } {
  const dimensionSteps = [maxDimension, Math.min(maxDimension, 720), 540, 400];
  const qualitySteps = [0.82, 0.72, 0.62, 0.5, 0.4];

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Peramban tidak mendukung kompresi gambar.');
  }

  let bestDataUrl = '';
  let bestWidth = srcWidth;
  let bestHeight = srcHeight;

  for (const dim of dimensionSteps) {
    const scale = Math.min(1, dim / Math.max(srcWidth, srcHeight, 1));
    const width = Math.max(1, Math.round(srcWidth * scale));
    const height = Math.max(1, Math.round(srcHeight * scale));
    canvas.width = width;
    canvas.height = height;

    // Fill white background so transparent PNGs convert cleanly to JPEG
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(source, 0, 0, width, height);

    for (const quality of qualitySteps) {
      const candidate = canvas.toDataURL('image/jpeg', quality);
      bestDataUrl = candidate;
      bestWidth = width;
      bestHeight = height;
      if (candidate.length <= maxChars) {
        return { dataUrl: candidate, width, height };
      }
    }
  }

  return { dataUrl: bestDataUrl, width: bestWidth, height: bestHeight };
}

export async function compressImageFile(
  file: File,
  options?: { maxDimension?: number; maxChars?: number }
): Promise<CompressedImageResult> {
  if (!file.type.startsWith('image/')) {
    throw new Error('File yang dipilih bukan gambar.');
  }

  const maxDimension = options?.maxDimension ?? 960;
  const maxChars = options?.maxChars ?? 135000;
  const objectUrl = URL.createObjectURL(file);

  try {
    const img = await loadImageElement(objectUrl);
    const { dataUrl, width, height } = canvasToCompressedDataUrl(
      img,
      img.naturalWidth || img.width,
      img.naturalHeight || img.height,
      maxDimension,
      maxChars
    );

    if (dataUrl.length > maxChars) {
      throw new Error(
        'Ukuran gambar masih terlalu besar setelah kompresi. Gunakan gambar lain yang lebih ringan.'
      );
    }

    const base64Part = dataUrl.split(',')[1] || '';
    const compressedBytes = Math.round((base64Part.length * 3) / 4);

    return {
      dataUrl,
      originalBytes: file.size,
      compressedBytes,
      width,
      height,
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function fileToDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Gagal membaca file video.'));
    reader.readAsDataURL(file);
  });
}

async function extractThumbnailFromVideoElement(
  video: HTMLVideoElement
): Promise<string | null> {
  try {
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 360;
    const { dataUrl } = canvasToCompressedDataUrl(
      video,
      width,
      height,
      720,
      95000
    );
    return dataUrl;
  } catch {
    return null;
  }
}

export async function processVideoFile(
  file: File,
  options?: { maxDirectBytes?: number; maxChars?: number }
): Promise<VideoProcessResult> {
  if (!file.type.startsWith('video/')) {
    throw new Error('File yang dipilih bukan video.');
  }

  const maxDirectBytes = options?.maxDirectBytes ?? 420 * 1024;
  const maxChars = options?.maxChars ?? 600000;
  const objectUrl = URL.createObjectURL(file);

  try {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    video.src = objectUrl;

    await new Promise<void>((resolve, reject) => {
      const timeout = window.setTimeout(
        () => reject(new Error('Waktu memuat metadata video habis.')),
        8000
      );
      video.onloadeddata = () => {
        window.clearTimeout(timeout);
        resolve();
      };
      video.onerror = () => {
        window.clearTimeout(timeout);
        reject(new Error('Format video tidak dapat dibaca oleh peramban ini.'));
      };
    });

    // Seek slightly forward to capture a representative thumbnail frame
    const seekTarget =
      Number.isFinite(video.duration) && video.duration > 0.6 ? 0.5 : 0;
    if (seekTarget > 0) {
      await new Promise<void>((resolve) => {
        const timer = window.setTimeout(() => resolve(), 2500);
        video.onseeked = () => {
          window.clearTimeout(timer);
          resolve();
        };
        video.currentTime = seekTarget;
      });
    }

    const thumbnailDataUrl = await extractThumbnailFromVideoElement(video);

    if (file.size <= maxDirectBytes) {
      const dataUrl = await fileToDataUrl(file);
      if (dataUrl.length <= maxChars) {
        return {
          mediaDataUrl: dataUrl,
          thumbnailDataUrl,
          originalBytes: file.size,
          compressedBytes: file.size,
          tooLargeForDirectStorage: false,
        };
      }
    }

    // For short videos (<= 10 seconds) under 12MB, attempt lightweight canvas+MediaRecorder compression
    const canCompress =
      typeof MediaRecorder !== 'undefined' &&
      typeof HTMLCanvasElement !== 'undefined' &&
      Number.isFinite(video.duration) &&
      video.duration > 0 &&
      video.duration <= 10 &&
      file.size <= 12 * 1024 * 1024;

    if (canCompress) {
      const compressedBlob = await tryCompressShortVideo(video);
      if (compressedBlob && compressedBlob.size <= maxDirectBytes) {
        const dataUrl = await fileToDataUrl(compressedBlob);
        if (dataUrl.length <= maxChars) {
          return {
            mediaDataUrl: dataUrl,
            thumbnailDataUrl,
            originalBytes: file.size,
            compressedBytes: compressedBlob.size,
            tooLargeForDirectStorage: false,
          };
        }
      }
    }

    return {
      mediaDataUrl: null,
      thumbnailDataUrl,
      originalBytes: file.size,
      compressedBytes: null,
      tooLargeForDirectStorage: true,
      reason:
        'Video berukuran besar melebihi batas simpan langsung (420 KB). Thumbnail foto sudah otomatis dibuat; untuk video penuh, unggah ke YouTube atau Google Drive lalu tempel URL-nya.',
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function tryCompressShortVideo(
  video: HTMLVideoElement
): Promise<Blob | null> {
  try {
    const srcW = video.videoWidth || 640;
    const srcH = video.videoHeight || 360;
    const scale = Math.min(1, 480 / Math.max(srcW, srcH, 1));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(2, Math.round(srcW * scale));
    canvas.height = Math.max(2, Math.round(srcH * scale));
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp8')
      ? 'video/webm;codecs=vp8'
      : MediaRecorder.isTypeSupported('video/webm')
        ? 'video/webm'
        : '';
    if (!mimeType) return null;

    const stream = canvas.captureStream(15);
    const recorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: 260000,
    });
    const chunks: BlobPart[] = [];
    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };

    video.currentTime = 0;
    let rafId = 0;
    const drawFrame = () => {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      if (!video.paused && !video.ended) {
        rafId = requestAnimationFrame(drawFrame);
      }
    };

    const finished = new Promise<Blob | null>((resolve) => {
      const safetyTimer = window.setTimeout(() => {
        cancelAnimationFrame(rafId);
        if (recorder.state !== 'inactive') recorder.stop();
      }, 12000);

      recorder.onstop = () => {
        window.clearTimeout(safetyTimer);
        cancelAnimationFrame(rafId);
        resolve(chunks.length > 0 ? new Blob(chunks, { type: mimeType }) : null);
      };
    });

    recorder.start(250);
    await video.play();
    drawFrame();

    video.onended = () => {
      if (recorder.state !== 'inactive') recorder.stop();
    };

    return await finished;
  } catch {
    return null;
  }
}
