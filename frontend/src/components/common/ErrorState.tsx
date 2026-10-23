import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  apiEndpoint?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Unable to Load BIS Data',
  message = 'Failed to connect to the backend service endpoint. Please check network availability and try again.',
  onRetry,
  apiEndpoint,
}) => {
  return (
    <div
      className="card"
      style={{
        padding: '36px 24px',
        textAlign: 'center',
        backgroundColor: '#FFFFFF',
        border: '1px solid #FECACA',
        borderRadius: '10px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: '#FEF2F2',
          color: '#DC2626',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '12px',
        }}
      >
        <AlertCircle size={26} />
      </div>

      <h3
        style={{
          fontSize: '16px',
          fontWeight: 700,
          color: '#991B1B',
          marginBottom: '6px',
        }}
      >
        {title}
      </h3>

      <p
        style={{
          fontSize: '13px',
          color: '#64748B',
          maxWidth: '460px',
          lineHeight: 1.5,
          marginBottom: '16px',
        }}
      >
        {message}
      </p>

      {apiEndpoint && (
        <div
          style={{
            fontFamily: 'monospace',
            fontSize: '11px',
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            padding: '4px 10px',
            borderRadius: '4px',
            color: '#64748B',
            marginBottom: '16px',
          }}
        >
          Endpoint: {apiEndpoint}
        </div>
      )}

      {onRetry && (
        <button
          onClick={onRetry}
          className="btn btn-secondary btn-sm"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            borderColor: '#CBD5E1',
          }}
        >
          <RefreshCw size={13} />
          Retry Connection
        </button>
      )}
    </div>
  );
};
