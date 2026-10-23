import React, { useState, useEffect } from 'react';
import {
  Search,
  Bell,
  HelpCircle,
  Menu,
  X,
  User,
  ExternalLink,
  ShieldAlert,
  ChevronDown,
  Phone,
  Mail,
  Building2,
  LogOut,
} from 'lucide-react';
import { NavRoute, Language, NavigationPayload } from '../../types';
import { BisLogo } from '../common/BisLogo';
import { authApi } from '../../api/auth';
import { getAuthToken } from '../../api/client';
import { UserResponse } from '../../types/api';

interface HeaderProps {
  currentRoute: NavRoute;
  onNavigate: (route: NavRoute, payload?: NavigationPayload) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  isMobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRoute,
  onNavigate,
  language,
  onLanguageChange,
  isMobileMenuOpen,
  onToggleMobileMenu,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState<'signin' | 'register' | null>(null);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<UserResponse | null>(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [registerRole, setRegisterRole] = useState<'CONSUMER' | 'INDUSTRY'>('CONSUMER');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      authApi.getMe().then(user => {
        setCurrentUser(user);
      }).catch(() => {
        authApi.logout();
        setCurrentUser(null);
      });
    }
  }, []);

  useEffect(() => {
    const onUnauthorized = () => {
      setCurrentUser(null);
      setAuthError('Your session has expired. Please sign in again.');
      setShowAuthModal('signin');
    };
    window.addEventListener('auth:unauthorized', onUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', onUnauthorized);
  }, []);

  useEffect(() => {
    if (
      currentRoute === '/login' ||
      currentRoute === 'login' ||
      (typeof window !== 'undefined' && window.location.pathname === '/login')
    ) {
      setShowAuthModal('signin');
    }
  }, [currentRoute]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const query = searchQuery.trim().toLowerCase();

    if (query.includes('huid') || query.includes('gold') || query.includes('hallmark')) {
      onNavigate('/hallmarking', { search: query });
    } else if (query.includes('lab') || query.includes('test')) {
      onNavigate('/laboratories', { search: query });
    } else if (query.includes('qco') || query.includes('mandat')) {
      onNavigate('/qco-regulations', { search: query });
    } else if (query.includes('certif') || query.includes('isi') || query.includes('scheme')) {
      onNavigate('/certification', { search: query });
    } else if (query.includes('product') || query.includes('bottle') || query.includes('toy')) {
      onNavigate('/product-to-standard', { search: query });
    } else {
      onNavigate('/standards', query);
    }
    setSearchQuery('');
  };

  return (
    <>
      {/* Top Institutional Metadata Bar */}
      <div
        style={{
          backgroundColor: '#1D2B42',
          color: '#E2EAF5',
          fontSize: '11.5px',
          padding: '5px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          width: '100%',
        }}
      >

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: '#E2EAF5', fontWeight: 500 }}>
            BIS CARE Helpline: <strong style={{ color: '#FFFFFF', fontWeight: 600 }}>1800-11-8004</strong>
          </span>
          <span style={{ color: 'rgba(255, 255, 255, 0.25)' }}>|</span>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              padding: '2px 8px',
              borderRadius: '4px',
              border: '1px solid rgba(255, 255, 255, 0.18)',
            }}
          >
            <span style={{ fontSize: '12px' }}>🌐</span>
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value as Language)}
              aria-label="Select Language"
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                fontSize: '11.5px',
                fontWeight: 600,
                color: '#FFFFFF',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="en" style={{ color: '#1E293B', backgroundColor: '#FFFFFF' }}>English (English)</option>
              <option value="hi" style={{ color: '#1E293B', backgroundColor: '#FFFFFF' }}>हिंदी (Hindi)</option>
              <option value="ta" style={{ color: '#1E293B', backgroundColor: '#FFFFFF' }}>தமிழ் (Tamil)</option>
              <option value="bn" style={{ color: '#1E293B', backgroundColor: '#FFFFFF' }}>বাংলা (Bengali)</option>
              <option value="mr" style={{ color: '#1E293B', backgroundColor: '#FFFFFF' }}>मराठी (Marathi)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Primary Sticky Top Navigation Bar matching reference layout */}
      <header
        style={{
          height: '70px',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #D6E4F8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 28px',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 2px 8px rgba(30, 41, 59, 0.04)',
        }}
      >
        {/* LEFT SIDE: BIS Logo & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={onToggleMobileMenu}
            aria-label="Toggle Navigation Menu"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px',
              borderRadius: '8px',
              backgroundColor: isMobileMenuOpen ? '#EAF2FE' : '#F8FAFD',
              border: '1px solid #D6E4F8',
              color: '#1D2B42',
              cursor: 'pointer',
            }}
            className="menu-drawer-toggle"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div
            onClick={() => onNavigate('/')}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
          >
            <BisLogo size={36} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '18px',
                    fontWeight: 800,
                    color: '#1D2B42',
                    letterSpacing: '-0.02em',
                  }}
                >
                  BIS
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#3A74C2',
                    letterSpacing: '-0.01em',
                  }}
                >
                  Parakh
                </span>
              </div>
              <span style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 500, lineHeight: 1.1 }}>
                National Standards Portal
              </span>
            </div>
          </div>
        </div>

        {/* CENTER: Large Global Search Bar */}
        <div
          className="header-center-container"
          style={{
            display: 'flex',
            alignItems: 'center',
            flex: 1,
            maxWidth: '560px',
            margin: '0 24px',
          }}
        >
          {/* Global Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            style={{
              position: 'relative',
              width: '100%',
            }}
          >
            <Search
              size={17}
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#3A74C2',
              }}
            />
            <input
              type="text"
              placeholder="Search IS numbers, products, HUID, labs, QCOs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                height: '42px',
                paddingLeft: '40px',
                paddingRight: '14px',
                fontSize: '13.5px',
                backgroundColor: '#F8FAFD',
                border: '1px solid #D0E2FB',
                borderRadius: '24px',
                color: '#1E293B',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)',
              }}
            />
          </form>
        </div>

        {/* RIGHT SIDE: Action Icons + Sign In & Register Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          {/* Quick Search Button */}
          <button
            onClick={() => onNavigate('/standards')}
            title="Catalogue Search"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: '#F8FAFD',
              border: '1px solid #D6E4F8',
              color: '#39527B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Search size={18} />
          </button>

          {/* Notifications Bell */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              title="Notifications"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: showNotifications ? '#EAF2FE' : '#F8FAFD',
                border: '1px solid #D6E4F8',
                color: '#39527B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              <Bell size={18} />
              <span
                style={{
                  position: 'absolute',
                  top: '7px',
                  right: '7px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#3A74C2',
                }}
              />
            </button>

            {showNotifications && (
              <div
                className="card"
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '48px',
                  width: '330px',
                  zIndex: 120,
                  boxShadow: 'var(--shadow-lg)',
                  padding: '14px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #D6E4F8',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid #E2EAF5',
                    paddingBottom: '8px',
                    marginBottom: '10px',
                  }}
                >
                  <strong style={{ fontSize: '13px', color: '#1D2B42' }}>
                    Gazette & Regulatory Alerts
                  </strong>
                  <span style={{ fontSize: '11px', color: '#3A74C2', fontWeight: 700 }}>
                    2 Updates
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                  <div
                    onClick={() => {
                      setShowNotifications(false);
                      onNavigate('/qco-regulations');
                    }}
                    style={{
                      padding: '10px',
                      backgroundColor: '#F8FAFD',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      borderLeft: '3px solid #3A74C2',
                    }}
                  >
                    <div style={{ fontWeight: 700, color: '#1E293B' }}>Potable Water Bottles QCO Enforced</div>
                    <div style={{ color: '#64748B', fontSize: '11.5px', marginTop: '2px' }}>
                      Mandatory ISI Mark certification under IS 17526.
                    </div>
                  </div>
                  <div
                    onClick={() => {
                      setShowNotifications(false);
                      onNavigate('/hallmarking/huid');
                    }}
                    style={{
                      padding: '10px',
                      backgroundColor: '#F8FAFD',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      borderLeft: '3px solid #92BBF8',
                    }}
                  >
                    <div style={{ fontWeight: 700, color: '#1E293B' }}>6-Digit HUID Traceability Live</div>
                    <div style={{ color: '#64748B', fontSize: '11.5px', marginTop: '2px' }}>
                      Mandatory hallmarking active across all certified A&H centres.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Help Button */}
          <button
            onClick={() => setShowHelp(!showHelp)}
            title="Help Desk"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: '#F8FAFD',
              border: '1px solid #D6E4F8',
              color: '#39527B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <HelpCircle size={18} />
          </button>

          {/* Authentication State Button / User Badge */}
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 12px',
                  backgroundColor: '#F1F6FD',
                  borderRadius: '20px',
                  border: '1px solid #C4DCFA',
                  fontSize: '12px',
                  color: '#1D2B42',
                  fontWeight: 600,
                }}
              >
                <User size={14} color="#3A74C2" />
                <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {currentUser.email}
                </span>
                <span className="badge badge-sky" style={{ fontSize: '9.5px', textTransform: 'uppercase', padding: '2px 6px' }}>
                  {currentUser.role}
                </span>
              </div>
              <button
                onClick={() => {
                  authApi.logout();
                  setCurrentUser(null);
                  if (String(currentRoute).startsWith('/admin')) {
                    onNavigate('/');
                  }
                }}
                title="Sign Out"
                style={{
                  backgroundColor: 'transparent',
                  color: '#64748B',
                  border: '1px solid #D6E4F8',
                  borderRadius: '20px',
                  padding: '5px 10px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <LogOut size={13} />
                Sign Out
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Sign In Button (white background + blue border) */}
              <button
                onClick={() => {
                  setAuthError(null);
                  setShowAuthModal('signin');
                }}
                style={{
                  backgroundColor: '#FFFFFF',
                  color: '#1D2B42',
                  border: '1.5px solid #3A74C2',
                  borderRadius: '20px',
                  padding: '7px 18px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#F0F6FE';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                }}
              >
                Sign in
              </button>

              {/* Register Button (primary BIS blue) */}
              <button
                onClick={() => {
                  setAuthError(null);
                  setShowAuthModal('register');
                }}
                style={{
                  backgroundColor: '#3A74C2',
                  color: '#FFFFFF',
                  border: '1.5px solid #3A74C2',
                  borderRadius: '20px',
                  padding: '7px 18px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(58, 116, 194, 0.25)',
                  transition: 'all 0.15s ease',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#2F62A8';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#3A74C2';
                }}
              >
                Register
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Help Modal */}
      {showHelp && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(29, 43, 66, 0.65)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowHelp(false);
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '520px',
              padding: '24px',
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #D6E4F8',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                borderBottom: '1px solid #E2EAF5',
                paddingBottom: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BisLogo size={28} />
                <h3 style={{ fontSize: '17px', color: '#1D2B42', fontWeight: 800 }}>
                  BIS Institutional Helpdesk
                </h3>
              </div>
              <button onClick={() => setShowHelp(false)} style={{ color: '#64748B' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ fontSize: '13.5px', color: '#475569', lineHeight: 1.6 }}>
              <p style={{ marginBottom: '14px' }}>
                For statutory verification or filing complaints regarding misuse of ISI Mark or hallmarking, contact the official Bureau of Indian Standards channels:
              </p>

              <div
                style={{
                  backgroundColor: '#F8FAFD',
                  padding: '14px',
                  borderRadius: '10px',
                  border: '1px solid #D6E4F8',
                  marginBottom: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Phone size={15} color="#3A74C2" />
                  <span><strong>National Toll-Free Helpline:</strong> 1800-11-8004</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Building2 size={15} color="#3A74C2" />
                  <span><strong>HQ:</strong> Manak Bhavan, 9 Bahadur Shah Zafar Marg, New Delhi 110002</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mail size={15} color="#3A74C2" />
                  <span><strong>Complaints:</strong> complaints@bis.gov.in</span>
                </div>
                <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => {
                      setShowHelp(false);
                      onNavigate('/whistleblower');
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      backgroundColor: '#DC2626',
                      color: '#FFFFFF',
                      fontSize: '12px',
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <ShieldAlert size={14} /> File Whistleblower Grievance &rarr;
                  </button>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  color: '#92400E',
                  backgroundColor: '#FFFBEB',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  border: '1px solid #FDE68A',
                }}
              >
                <ShieldAlert size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  <strong>Official Hallucination Guard:</strong> BIS Parakh references gazetted standards and QCOs. Always cross-check formal licence decisions with Manak Online.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal (Sign In / Register) */}
      {showAuthModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(29, 43, 66, 0.65)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAuthModal(null);
              setAuthError(null);
              if (
                currentRoute === '/login' ||
                currentRoute === 'login' ||
                (typeof window !== 'undefined' && window.location.pathname === '/login')
              ) {
                onNavigate('/');
              }
            }
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '440px',
              padding: '28px',
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #D6E4F8',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <BisLogo size={32} />
                <h3 style={{ fontSize: '18px', color: '#1D2B42', fontWeight: 800 }}>
                  {showAuthModal === 'signin' ? 'Sign In to BIS Parakh' : 'Register for BIS Parakh'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowAuthModal(null);
                  setAuthError(null);
                  if (
                    currentRoute === '/login' ||
                    currentRoute === 'login' ||
                    (typeof window !== 'undefined' && window.location.pathname === '/login')
                  ) {
                    onNavigate('/');
                  }
                }}
                style={{ color: '#64748B', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ fontSize: '13px', color: '#64748B', marginBottom: '16px' }}>
              {showAuthModal === 'signin'
                ? 'Sign in to access administrator features, live feed sync, and verified standard tracking.'
                : 'Create an account to access regulatory feeds and verified BIS portals.'}
            </div>

            {authError && (
              <div
                style={{
                  padding: '10px 14px',
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FECACA',
                  borderRadius: '8px',
                  fontSize: '12.5px',
                  color: '#991B1B',
                  marginBottom: '14px',
                }}
              >
                {authError}
              </div>
            )}

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setAuthLoading(true);
                setAuthError(null);
                try {
                  if (showAuthModal === 'signin') {
                    await authApi.login(authEmail, authPassword);
                  } else {
                    await authApi.register(authEmail, authPassword, registerRole);
                    await authApi.login(authEmail, authPassword);
                  }
                  const user = await authApi.getMe();
                  setCurrentUser(user);
                  setShowAuthModal(null);
                  setAuthEmail('');
                  setAuthPassword('');
                  if (user.role === 'admin') {
                    onNavigate('/admin');
                  } else if (
                    currentRoute === '/login' ||
                    currentRoute === 'login' ||
                    (typeof window !== 'undefined' && window.location.pathname === '/login')
                  ) {
                    onNavigate('/');
                  }
                } catch (err: unknown) {
                  setAuthError(err instanceof Error ? err.message : 'Authentication failed. Please verify credentials.');
                } finally {
                  setAuthLoading(false);
                }
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              {showAuthModal === 'register' && (
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#1D2B42', display: 'block', marginBottom: '6px' }}>
                    Select Persona / Role
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setRegisterRole('CONSUMER')}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        border: registerRole === 'CONSUMER' ? '1.5px solid #3A74C2' : '1px solid #D6E4F8',
                        backgroundColor: registerRole === 'CONSUMER' ? '#EAF2FE' : '#F8FAFD',
                        color: registerRole === 'CONSUMER' ? '#1D2B42' : '#64748B',
                      }}
                    >
                      Consumer (Citizen)
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegisterRole('INDUSTRY')}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        border: registerRole === 'INDUSTRY' ? '1.5px solid #3A74C2' : '1px solid #D6E4F8',
                        backgroundColor: registerRole === 'INDUSTRY' ? '#EAF2FE' : '#F8FAFD',
                        color: registerRole === 'INDUSTRY' ? '#1D2B42' : '#64748B',
                      }}
                    >
                      Industry / Manufacturer
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#1D2B42', display: 'block', marginBottom: '4px' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  style={{ width: '100%', height: '40px', padding: '0 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid #D6E4F8', backgroundColor: '#F8FAFD' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#1D2B42', display: 'block', marginBottom: '4px' }}>
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  style={{ width: '100%', height: '40px', padding: '0 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid #D6E4F8', backgroundColor: '#F8FAFD' }}
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="btn btn-primary"
                style={{ height: '42px', marginTop: '6px', borderRadius: '8px', fontSize: '14px', fontWeight: 700 }}
              >
                {authLoading ? 'Authenticating with Parakh Backend...' : showAuthModal === 'signin' ? 'Sign In' : `Create Account (${registerRole})`}
              </button>
            </form>

            <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '12px', color: '#64748B' }}>
              {showAuthModal === 'signin' ? (
                <span>
                  Don't have an account?{' '}
                  <span
                    onClick={() => {
                      setAuthError(null);
                      setShowAuthModal('register');
                    }}
                    style={{ color: '#3A74C2', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Register here
                  </span>
                </span>
              ) : (
                <span>
                  Already registered?{' '}
                  <span
                    onClick={() => {
                      setAuthError(null);
                      setShowAuthModal('signin');
                    }}
                    style={{ color: '#3A74C2', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Sign in
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .header-center-container {
            display: none !important;
          }
          .mobile-menu-toggle {
            display: inline-flex !important;
          }
        }
      `}</style>
    </>
  );
};
