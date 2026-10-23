import React from 'react';
import { ShieldCheck, FileCheck, Sparkles, AlertCircle, HelpCircle } from 'lucide-react';
import { VerificationBadgeType } from '../../types';

interface StatusBadgeProps {
  type: VerificationBadgeType | 'MANDATORY' | 'VOLUNTARY' | 'ENFORCED' | 'OPERATIVE' | 'EXPIRED' | 'RECOGNIZED';
  label?: string;
  showIcon?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  type,
  label,
  showIcon = true,
  className = '',
}) => {
  switch (type) {
    case 'VERIFIED':
      return (
        <span className={`badge badge-verified ${className}`}>
          {showIcon && <ShieldCheck size={13} />}
          {label || 'BIS VERIFIED'}
        </span>
      );
    case 'SOURCE-BACKED':
      return (
        <span className={`badge badge-source ${className}`}>
          {showIcon && <FileCheck size={13} />}
          {label || 'SOURCE BACKED'}
        </span>
      );
    case 'AI-ASSISTED':
      return (
        <span className={`badge badge-ai ${className}`}>
          {showIcon && <Sparkles size={13} />}
          {label || 'AI ASSISTED'}
        </span>
      );
    case 'UNVERIFIED':
    case 'UNABLE_TO_VERIFY':
      return (
        <span className={`badge badge-warning ${className}`}>
          {showIcon && <AlertCircle size={13} />}
          {label || 'UNVERIFIED / NO BIS RECORD'}
        </span>
      );
    case 'MANDATORY':
    case 'ENFORCED':
      return (
        <span className={`badge badge-danger ${className}`}>
          {showIcon && <AlertCircle size={13} />}
          {label || 'MANDATORY (QCO)'}
        </span>
      );
    case 'VOLUNTARY':
      return (
        <span className={`badge badge-sky ${className}`}>
          {showIcon && <HelpCircle size={13} />}
          {label || 'VOLUNTARY'}
        </span>
      );
    case 'OPERATIVE':
    case 'RECOGNIZED':
      return (
        <span className={`badge badge-verified ${className}`}>
          {showIcon && <ShieldCheck size={13} />}
          {label || 'OPERATIVE'}
        </span>
      );
    case 'EXPIRED':
      return (
        <span className={`badge badge-danger ${className}`}>
          {showIcon && <AlertCircle size={13} />}
          {label || 'EXPIRED'}
        </span>
      );
    default:
      return (
        <span className={`badge badge-sky ${className}`}>
          {label || type}
        </span>
      );
  }
};
