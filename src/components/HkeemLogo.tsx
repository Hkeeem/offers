import React from 'react';

interface HkeemLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  className?: string;
  withGlow?: boolean;
}

const sizeClasses: Record<string, string> = {
  xs: 'w-7 h-7 rounded-lg',
  sm: 'w-9 h-9 rounded-xl',
  md: 'w-11 h-11 rounded-2xl',
  lg: 'w-14 h-14 rounded-2xl',
  xl: 'w-20 h-20 rounded-3xl',
  hero: 'w-24 h-24 sm:w-28 sm:h-28 rounded-3xl',
};

export const HkeemLogo: React.FC<HkeemLogoProps> = ({
  size = 'md',
  className = '',
  withGlow = false,
}) => {
  const containerClass = sizeClasses[size] || sizeClasses.md;

  return (
    <div
      className={`relative flex items-center justify-center shrink-0 select-none transition-transform group-hover:scale-105 ${containerClass} ${
        withGlow ? 'shadow-lg shadow-amber-500/20' : ''
      } ${className}`}
      style={{
        background: '#090a0d',
      }}
    >
      <img
        src="/h-icon.svg"
        alt="HkeeemAI - حكيم"
        className="w-full h-full object-contain rounded-inherit"
        referrerPolicy="no-referrer"
      />
    </div>
  );
};
