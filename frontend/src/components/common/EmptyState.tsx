import React from 'react';
import { LucideIcon, Inbox, Search } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  actionNode?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  actionText,
  onAction,
  actionNode,
}) => {
  return (
    <div
      className="card"
      style={{
        padding: '48px 24px',
        textAlign: 'center',
        backgroundColor: '#FFFFFF',
        border: '1px dashed #B8D1F2',
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
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          backgroundColor: '#F1F6FD',
          color: '#3A74C2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '14px',
          border: '1px solid #D6E4F8',
        }}
      >
        <Icon size={26} />
      </div>

      <h3
        style={{
          fontSize: '16px',
          fontWeight: 700,
          color: '#2A3C5B',
          marginBottom: '6px',
        }}
      >
        {title}
      </h3>

      <p
        style={{
          fontSize: '13px',
          color: '#64748B',
          maxWidth: '480px',
          lineHeight: 1.5,
          marginBottom: actionText || actionNode ? '18px' : 0,
        }}
      >
        {description}
      </p>

      {actionText && onAction && (
        <button onClick={onAction} className="btn btn-primary btn-sm">
          {actionText}
        </button>
      )}

      {actionNode}
    </div>
  );
};
