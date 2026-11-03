import React, { useState } from 'react';

export interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

export function ImageWithFallback({
  src,
  alt,
  className,
  fallbackSrc,
  ...rest
}: ImageWithFallbackProps) {
  const [didError, setDidError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    setDidError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  if (didError && !fallbackSrc) {
    return (
      <div className={`relative flex items-center justify-center bg-muted/60 text-muted-foreground ${className ?? ''}`}>
        <div className="flex flex-col items-center justify-center p-4 text-center">
          <svg className="w-10 h-10 mb-2 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" />
            <circle cx="8.5" cy="8.5" r="1.5" strokeWidth="2" />
            <path strokeWidth="2" d="M21 15l-5-5L5 21" />
          </svg>
          <span className="text-xs opacity-60">{alt || 'Image unavailable'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className ?? ''}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-muted/40 animate-pulse" />
      )}
      <img
        src={didError && fallbackSrc ? fallbackSrc : src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        onError={handleError}
        onLoad={handleLoad}
        {...rest}
      />
    </div>
  );
}

export default ImageWithFallback;
