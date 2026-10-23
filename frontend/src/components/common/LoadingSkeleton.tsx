import React from 'react';

interface LoadingSkeletonProps {
  type?: 'card' | 'table' | 'text' | 'detail';
  count?: number;
  message?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  type = 'card',
  count = 3,
  message = 'Loading data from BIS service...',
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
      {message && (
        <div
          style={{
            fontSize: '12.5px',
            color: '#3A74C2',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#3A74C2',
              animation: 'pulse 1.2s infinite',
            }}
          />
          <span>{message}</span>
        </div>
      )}

      {type === 'table' && (
        <div
          style={{
            border: '1px solid #D6E4F8',
            borderRadius: '8px',
            overflow: 'hidden',
            backgroundColor: '#FFFFFF',
          }}
        >
          <div style={{ height: '42px', backgroundColor: '#F1F6FD', borderBottom: '1px solid #D6E4F8' }} />
          {Array.from({ length: count }).map((_, idx) => (
            <div
              key={idx}
              style={{
                height: '48px',
                borderBottom: idx === count - 1 ? 'none' : '1px solid #EDF3FB',
                display: 'flex',
                alignItems: 'center',
                padding: '0 16px',
                gap: '16px',
              }}
            >
              <div style={{ height: '14px', width: '25%', backgroundColor: '#E2EAF5', borderRadius: '4px' }} />
              <div style={{ height: '14px', width: '40%', backgroundColor: '#EDF3FB', borderRadius: '4px' }} />
              <div style={{ height: '14px', width: '15%', backgroundColor: '#E2EAF5', borderRadius: '4px' }} />
              <div style={{ height: '14px', width: '10%', backgroundColor: '#EDF3FB', borderRadius: '4px' }} />
            </div>
          ))}
        </div>
      )}

      {type === 'card' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {Array.from({ length: count }).map((_, idx) => (
            <div
              key={idx}
              className="card"
              style={{
                padding: '20px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #D6E4F8',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ width: '80px', height: '18px', backgroundColor: '#E2EAF5', borderRadius: '4px' }} />
                <div style={{ width: '60px', height: '18px', backgroundColor: '#EDF3FB', borderRadius: '4px' }} />
              </div>
              <div style={{ width: '75%', height: '18px', backgroundColor: '#CBD5E1', borderRadius: '4px' }} />
              <div style={{ width: '100%', height: '14px', backgroundColor: '#EDF3FB', borderRadius: '4px' }} />
              <div style={{ width: '90%', height: '14px', backgroundColor: '#EDF3FB', borderRadius: '4px' }} />
            </div>
          ))}
        </div>
      )}

      {type === 'detail' && (
        <div
          className="card"
          style={{
            padding: '24px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #D6E4F8',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          <div style={{ width: '40%', height: '24px', backgroundColor: '#CBD5E1', borderRadius: '4px' }} />
          <div style={{ width: '60%', height: '16px', backgroundColor: '#EDF3FB', borderRadius: '4px' }} />
          <div style={{ width: '100%', height: '80px', backgroundColor: '#F8FAFD', borderRadius: '6px' }} />
        </div>
      )}

      {type === 'text' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ width: '80%', height: '14px', backgroundColor: '#E2EAF5', borderRadius: '4px' }} />
          <div style={{ width: '60%', height: '14px', backgroundColor: '#EDF3FB', borderRadius: '4px' }} />
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
};
