import React, { useEffect, useState } from 'react';
import { Landmark } from 'lucide-react';

interface ResilientImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
}

export const ResilientImage: React.FC<ResilientImageProps> = ({
  src,
  alt,
  className = 'w-full h-full object-cover',
  fallbackLabel,
}) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (!src || hasError) {
    return (
      <div
        role="img"
        aria-label={alt}
        className="w-full h-full bg-gradient-to-br from-navy-900 via-navy-800 to-slate-800 flex flex-col items-center justify-center p-6 text-center text-white"
      >
        <Landmark className="w-8 h-8 text-gold-400 mb-2 opacity-80" />
        <span className="text-xs font-medium text-slate-200 max-w-[200px] leading-snug">
          {fallbackLabel || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
};
