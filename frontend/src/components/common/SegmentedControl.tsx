import React from 'react';

export interface SegmentedControlItem<T extends string = string> {
  id: T;
  label: string;
  number?: string | number;
  icon?: React.ComponentType<{ size?: number; className?: string; color?: string }>;
  subtitle?: string;
  badge?: string | number;
  disabled?: boolean;
}

export interface SegmentedControlProps<T extends string = string> {
  items: SegmentedControlItem<T>[];
  activeId: T;
  onChange: (id: T) => void;
  className?: string;
  style?: React.CSSProperties;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export function SegmentedControl<T extends string = string>({
  items,
  activeId,
  onChange,
  className = '',
  style,
  size = 'md',
  fullWidth = false,
}: SegmentedControlProps<T>) {
  const getPadding = () => {
    switch (size) {
      case 'sm':
        return '6px 14px';
      case 'lg':
        return '10px 22px';
      case 'md':
      default:
        return '8px 18px';
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'sm':
        return '12px';
      case 'lg':
        return '14px';
      case 'md':
      default:
        return '13px';
    }
  };

  return (
    <div
      className={`segmented-control-scroll-wrapper ${className}`}
      style={{
        maxWidth: '100%',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        padding: '2px 0 4px',
        ...style,
      }}
    >
      <div
        role="tablist"
        className="segmented-control-container"
        style={{
          display: fullWidth ? 'grid' : 'inline-flex',
          gridAutoFlow: fullWidth ? 'column' : undefined,
          gridAutoColumns: fullWidth ? '1fr' : undefined,
          alignItems: 'center',
          backgroundColor: '#F0F5FD',
          border: '1px solid #D0E2FB',
          borderRadius: '9999px',
          padding: '4px',
          gap: '2px',
          boxShadow: 'inset 0 1px 2px rgba(29, 43, 66, 0.04)',
          minWidth: 'fit-content',
        }}
      >
        {items.map((item, index) => {
          const isActive = activeId === item.id;
          const Icon = item.icon;

          return (
            <React.Fragment key={item.id}>
              {/* Optional divider between inactive adjacent items */}
              {index > 0 && !isActive && activeId !== items[index - 1]?.id && (
                <div
                  className="segmented-divider"
                  style={{
                    width: '1px',
                    height: '16px',
                    backgroundColor: '#D6E4F8',
                    alignSelf: 'center',
                    flexShrink: 0,
                  }}
                />
              )}

              <button
                type="button"
                role="tab"
                aria-selected={isActive}
                disabled={item.disabled}
                onClick={() => {
                  if (!item.disabled) {
                    onChange(item.id);
                  }
                }}
                className={`segmented-control-item ${isActive ? 'active' : ''}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: getPadding(),
                  borderRadius: '9999px',
                  fontSize: getFontSize(),
                  fontWeight: isActive ? 700 : 600,
                  border: 'none',
                  outline: 'none',
                  cursor: item.disabled ? 'not-allowed' : 'pointer',
                  backgroundColor: isActive ? '#3A74C2' : 'transparent',
                  color: isActive ? '#FFFFFF' : '#1D2B42',
                  boxShadow: isActive ? '0 2px 6px rgba(58, 116, 194, 0.28)' : 'none',
                  transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
                  whiteSpace: 'nowrap',
                  opacity: item.disabled ? 0.5 : 1,
                  userSelect: 'none',
                  flex: fullWidth ? 1 : undefined,
                }}
                onMouseEnter={(e) => {
                  if (!isActive && !item.disabled) {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.85)';
                    e.currentTarget.style.color = '#3A74C2';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive && !item.disabled) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#1D2B42';
                  }
                }}
              >
                {/* Optional Index or Number Bubble */}
                {item.number !== undefined && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: isActive ? 'rgba(255, 255, 255, 0.24)' : '#E2EAF5',
                      color: isActive ? '#FFFFFF' : '#3A74C2',
                      fontSize: '11px',
                      fontWeight: 800,
                      flexShrink: 0,
                    }}
                  >
                    {item.number}
                  </span>
                )}

                {/* Optional Icon */}
                {Icon && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isActive ? '#FFFFFF' : '#3A74C2',
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />
                  </span>
                )}

                {/* Main Label */}
                <span>{item.label}</span>

                {/* Optional Subtitle */}
                {item.subtitle && (
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 500,
                      opacity: isActive ? 0.88 : 0.65,
                      marginLeft: '2px',
                    }}
                  >
                    ({item.subtitle})
                  </span>
                )}

                {/* Optional Counter or Badge */}
                {item.badge !== undefined && (
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 800,
                      padding: '2px 7px',
                      borderRadius: '9999px',
                      backgroundColor: isActive ? 'rgba(255, 255, 255, 0.28)' : '#E2EAF5',
                      color: isActive ? '#FFFFFF' : '#39527B',
                      marginLeft: '4px',
                      flexShrink: 0,
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            </React.Fragment>
          );
        })}
      </div>

      <style>{`
        .segmented-control-scroll-wrapper::-webkit-scrollbar {
          height: 4px;
        }
        .segmented-control-scroll-wrapper::-webkit-scrollbar-thumb {
          background-color: #D6E4F8;
          border-radius: 4px;
        }
        .segmented-control-scroll-wrapper::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style>
    </div>
  );
}
