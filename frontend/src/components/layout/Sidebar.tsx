import React from 'react';
import { BisLogo } from '../common/BisLogo';
import {
  LayoutDashboard,
  BotMessageSquare,
  BookOpen,
  Split,
  Award,
  Scale,
  FlaskConical,
  Gem,
  Store,
  ShieldCheck,
  FileSearch,
  CheckSquare,
  Server,
  PhoneCall,
  MapPin,
  Camera,
  Calculator,
  Cpu,
  CheckCircle,
  ShieldAlert,
} from 'lucide-react';
import { NavRoute } from '../../types';

interface SidebarProps {
  currentRoute: NavRoute;
  onNavigate: (route: NavRoute) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  id: NavRoute;
  label: string;
  sublabel: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: string;
  matchRoutes?: string[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  onNavigate,
  isMobileOpen,
  onCloseMobile,
}) => {
  // Navigation structure organized per Section 4 of specifications
  const navigationSections: NavSection[] = [
    {
      title: 'DASHBOARD',
      items: [
        {
          id: '/',
          label: 'Home',
          sublabel: 'Overview & Services',
          icon: LayoutDashboard,
          matchRoutes: ['/', 'dashboard'],
        },
      ],
    },
    {
      title: 'DISCOVER',
      items: [
        {
          id: '/standards',
          label: 'Standards Explorer',
          sublabel: 'IS Catalogue & Clauses',
          icon: BookOpen,
          matchRoutes: ['/standards', 'standards', 'standards-explorer', '/standards/search'],
        },
        {
          id: '/qco-regulations',
          label: 'QCO Explorer',
          sublabel: 'Mandatory Orders',
          icon: Scale,
          badge: 'QCO',
          matchRoutes: ['/qco-regulations', 'qco-regulations'],
        },
        {
          id: '/product-to-standard',
          label: 'Product → Standard',
          sublabel: 'Find Applicable Standards',
          icon: Split,
          matchRoutes: ['/product-to-standard', 'product-to-standard'],
        },
      ],
    },
    {
      title: 'CERTIFICATION',
      items: [
        {
          id: '/certification/schemes',
          label: 'Certification Schemes',
          sublabel: 'Schemes & Certification Information',
          icon: Award,
          matchRoutes: ['/certification/schemes', '/certification', 'certification'],
        },
        {
          id: '/certification/mapping',
          label: 'Certification Mapping',
          sublabel: 'Product → Certification Route',
          icon: CheckCircle,
          matchRoutes: ['/certification/mapping', '/certification/roadmap', '/certification/checklist'],
        },
      ],
    },
    {
      title: 'VERIFY',
      items: [
        {
          id: '/verify/huid',
          label: 'HUID Verification',
          sublabel: '6-Digit Hallmark Trace',
          icon: Gem,
          matchRoutes: ['/verify/huid', '/verify', 'verification-suite', '/verification-suite', 'verify'],
        },
        {
          id: '/verify/licence',
          label: 'BIS Licence Verification',
          sublabel: 'CM/L Number Check',
          icon: ShieldCheck,
          matchRoutes: ['/verify/licence'],
        },
        {
          id: '/verify/crs',
          label: 'R-Number Verification',
          sublabel: 'CRS Electronics Registry',
          icon: Cpu,
          matchRoutes: ['/verify/crs'],
        },
      ],
    },
    {
      title: 'HALLMARKING',
      items: [
        {
          id: '/hallmarking/centres',
          label: 'Hallmarking Centres',
          sublabel: 'Recognized AHC Finder',
          icon: MapPin,
          matchRoutes: ['/hallmarking/centres', '/hallmarking', 'hallmarking', 'hallmarking-jewellery'],
        },
        {
          id: '/hallmarking/scanner',
          label: 'Hallmark Scanner',
          sublabel: 'Optical Mark Inspector',
          icon: Camera,
          matchRoutes: ['/hallmarking/scanner'],
        },
        {
          id: '/hallmarking/purity',
          label: 'Purity Calculator',
          sublabel: 'IS 1417 Karat Gold Math',
          icon: Calculator,
          matchRoutes: ['/hallmarking/purity'],
        },
      ],
    },
    {
      title: 'DIRECTORY',
      items: [
        {
          id: '/laboratories',
          label: 'Testing Laboratories',
          sublabel: 'Accredited Lab Directory',
          icon: FlaskConical,
          matchRoutes: ['/laboratories', 'laboratories', 'testing-laboratories', '/testing-laboratories'],
        },
        {
          id: '/licensed-jewellers',
          label: 'Licensed Jewellers',
          sublabel: 'Registered Outlets',
          icon: Store,
          matchRoutes: ['/licensed-jewellers', 'licensed-jewellers'],
        },
      ],
    },
    {
      title: 'ANALYZE',
      items: [
        {
          id: '/document-image-lab',
          label: 'Document & Image Lab',
          sublabel: 'Assay Report Explainer',
          icon: FileSearch,
          matchRoutes: [
            '/document-image-lab',
            'document-image-lab',
            'documents-analysis',
            '/document-analysis',
            '/image-analysis',
            '/label-scanner',
            '/assay-explainer',
            '/hallmarking/assay',
          ],
        },
        {
          id: '/compliance-gap',
          label: 'Compliance Gap Analysis',
          sublabel: 'Requirements vs Evidence',
          icon: CheckSquare,
          matchRoutes: ['/compliance-gap', 'compliance-gap'],
        },
      ],
    },
    {
      title: 'AI',
      items: [
        {
          id: '/chat',
          label: 'AI Assistant',
          sublabel: 'Conversational Standards RAG',
          icon: BotMessageSquare,
          badge: 'AI',
          matchRoutes: ['/chat', 'chat', 'ai-assistant', '/ai-assistant'],
        },
      ],
    },
    {
      title: 'GRIEVANCE & CITIZEN',
      items: [
        {
          id: '/whistleblower',
          label: 'Whistleblower Grievance',
          sublabel: 'Report Counterfeits & Fraud',
          icon: ShieldAlert,
          matchRoutes: ['/whistleblower', 'whistleblower'],
        },
      ],
    },
    {
      title: 'ADMIN',
      items: [
        {
          id: '/admin',
          label: 'Admin Dashboard',
          sublabel: 'Health, Sync, Gap & Review',
          icon: Server,
          badge: 'Staff',
          matchRoutes: ['/admin', 'admin', 'admin-dashboard', '/admin/health', '/admin/sync', '/admin/gap-report', '/admin/review'],
        },
      ],
    },
  ];

  const handleItemClick = (route: NavRoute) => {
    onNavigate(route);
    onCloseMobile();
  };

  const isItemActive = (item: NavItem): boolean => {
    if (currentRoute === item.id) return true;
    if (item.matchRoutes && item.matchRoutes.includes(String(currentRoute))) {
      return true;
    }
    return false;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(29, 43, 66, 0.7)',
            backdropFilter: 'blur(3px)',
            zIndex: 95,
          }}
        />
      )}

      {/* Main Sidebar Shell */}
      <aside
        className={`app-sidebar ${isMobileOpen ? 'open' : ''}`}
        style={{
          width: 'var(--sidebar-width)',
          backgroundColor: '#39527B',
          color: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          borderRight: '1px solid #2A3C5B',
          zIndex: 96,
          height: '100vh',
          position: 'sticky',
          top: 0,
        }}
      >
        {/* Sidebar Header / Brand - Per Section 9 */}
        <div
          style={{
            padding: '18px 18px 14px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            onClick={() => handleItemClick('/')}
            style={{
              width: '38px',
              height: '38px',
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
              overflow: 'hidden',
              cursor: 'pointer',
            }}
          >
            <BisLogo size={24} />
          </div>
          <div onClick={() => handleItemClick('/')} style={{ cursor: 'pointer' }}>
            <div
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '16px',
                fontWeight: 800,
                color: '#FFFFFF',
                letterSpacing: '-0.01em',
              }}
            >
              BIS Parakh
            </div>
            <div style={{ fontSize: '11px', color: '#92BBF8', fontWeight: 500 }}>
              National Standards Portal
            </div>
          </div>
        </div>

        {/* Scrollable Nav Items */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '14px 10px',
          }}
        >
          {navigationSections.map((section) => (
            <div key={section.title} style={{ marginBottom: '16px' }}>
              <div
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  color: '#92BBF8',
                  textTransform: 'uppercase',
                  padding: '0 12px',
                  marginBottom: '6px',
                }}
              >
                {section.title}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {section.items.map((item) => {
                  const isActive = isItemActive(item);
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item.id)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        textAlign: 'left',
                        backgroundColor: isActive ? '#4A6999' : 'transparent',
                        color: '#FFFFFF',
                        transition: 'all 0.15s ease',
                        boxShadow: isActive ? '0 2px 8px rgba(0, 0, 0, 0.18)' : 'none',
                        border: isActive ? '1px solid rgba(146, 187, 248, 0.35)' : '1px solid transparent',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                        <div
                          style={{
                            color: isActive ? '#FFFFFF' : '#92BBF8',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <Icon size={16} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: '12.5px',
                              fontWeight: isActive ? 700 : 500,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              color: '#FFFFFF',
                            }}
                          >
                            {item.label}
                          </div>
                          <div
                            style={{
                              fontSize: '10px',
                              color: isActive ? '#E2EAF5' : 'rgba(226, 234, 245, 0.65)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {item.sublabel}
                          </div>
                        </div>
                      </div>

                      {item.badge && (
                        <span
                          style={{
                            fontSize: '9px',
                            fontWeight: 700,
                            padding: '1px 5px',
                            borderRadius: '8px',
                            backgroundColor: isActive ? '#2A3C5B' : '#2A3C5B',
                            color: '#92BBF8',
                            border: '1px solid rgba(146, 187, 248, 0.3)',
                            marginLeft: '4px',
                            flexShrink: 0,
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Footer - Helpline / Official metadata - Per Section 10 */}
        <div
          style={{
            padding: '12px 14px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            backgroundColor: '#2A3C5B',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px',
            }}
          >
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                backgroundColor: 'rgba(146, 187, 248, 0.15)',
                color: '#92BBF8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PhoneCall size={13} />
            </div>
            <div>
              <div style={{ fontSize: '10.5px', color: '#92BBF8', fontWeight: 600 }}>
                National Toll-Free Helpline
              </div>
              <div style={{ fontSize: '12px', color: '#FFFFFF', fontWeight: 700 }}>
                1800-11-8004
              </div>
            </div>
          </div>
        </div>
      </aside>

      <style>{`
        .app-sidebar {
          position: fixed !important;
          top: 0;
          bottom: 0;
          left: 0;
          width: var(--sidebar-width);
          transform: translateX(-100%);
          transition: transform 0.25s ease-in-out;
          box-shadow: 0 0 30px rgba(0, 0, 0, 0.4);
          z-index: 1000 !important;
        }
        .app-sidebar.open {
          transform: translateX(0);
        }
      `}</style>
    </>
  );
};
