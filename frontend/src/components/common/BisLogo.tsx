import React from 'react';
import bisLogoImg from '../../assets/bis-logo.png';

interface BisLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  variant?: 'blue' | 'white';
}

export const BisLogo: React.FC<BisLogoProps> = ({
  size = 40,
  className = '',
  showText = false,
  variant = 'blue',
}) => {
  const isWhite = variant === 'white';
  const primaryColor = isWhite ? '#FFFFFF' : '#1D2B42';
  const accentColor = isWhite ? '#92BBF8' : '#3A74C2';

  // The official BIS logo is 902x653 (width/height ratio ~1.381)
  const height = size;
  const width = Math.round(size * (902 / 653));

  return (
    <div
      className={`bis-logo-container ${className}`}
      style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}
    >
      <img
        src={bisLogoImg}
        alt="Bureau of Indian Standards"
        width={width}
        height={height}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          objectFit: 'contain',
          display: 'block',
          flexShrink: 0,
        }}
      />

      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '16px',
                fontWeight: 800,
                color: primaryColor,
                letterSpacing: '-0.02em',
              }}
            >
              BIS
            </span>
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '16px',
                fontWeight: 700,
                color: accentColor,
                letterSpacing: '-0.01em',
              }}
            >
              Parakh
            </span>
          </div>
          <span
            style={{
              fontSize: '11px',
              color: isWhite ? '#E2EAF5' : '#64748B',
              fontWeight: 500,
            }}
          >
            National Standards Portal
          </span>
        </div>
      )}
    </div>
  );
};
