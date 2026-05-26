import React from 'react';

const SIZES = {
  sm: { box: 'w-8 h-8', img: 'w-6 h-6', title: 'text-sm', sub: 'text-[10px]' },
  md: { box: 'w-10 h-10', img: 'w-8 h-8', title: 'text-base', sub: 'text-[11px]' },
  lg: { box: 'w-14 h-14', img: 'w-11 h-11', title: 'text-xl', sub: 'text-xs' },
};

/** Abay Ride logo + wordmark — uses /logo.png from public */
export const BrandLogo = ({
  size = 'md',
  showText = true,
  subtitle = 'Admin Panel',
  variant = 'default',
  className = '',
}) => {
  const s = SIZES[size] || SIZES.md;
  const isLight = variant === 'light';

  return (
    <div className={`flex items-center gap-3 min-w-0 ${className}`}>
      <div
        className={`${s.box} rounded-2xl flex items-center justify-center shrink-0 overflow-hidden shadow-glow ${
          isLight
            ? 'bg-white/95 ring-2 ring-white/40'
            : 'bg-white dark:bg-dark-card ring-1 ring-gray-100 dark:ring-dark-border shadow-sm'
        }`}
      >
        <img src="/logo.png" alt="Abay Ride" className={`${s.img} object-contain`} />
      </div>
      {showText && (
        <div className="min-w-0">
          <p
            className={`${s.title} font-extrabold leading-tight truncate ${
              isLight ? 'text-white' : 'text-secondary dark:text-white'
            }`}
          >
            Abay Ride
          </p>
          {subtitle && (
            <p
              className={`${s.sub} font-semibold truncate ${
                isLight ? 'text-blue-100' : 'text-gray-400 dark:text-dark-muted'
              }`}
            >
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
