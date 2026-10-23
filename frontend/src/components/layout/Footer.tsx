import React, { useState } from 'react';
import { Mail, X, Shield, FileText } from 'lucide-react';
import bisLogoImg from '../../assets/bis-logo.png';

export const Footer: React.FC = () => {
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | null>(null);
  const currentYear = new Date().getFullYear();

  return (
    <>
      <footer
        className="bis-parakh-footer"
        style={{
          backgroundColor: '#3572C4',
          color: '#FFFFFF',
          width: '100%',
          padding: '24px 36px 18px',
          marginTop: 'auto',
          boxSizing: 'border-box',
        }}
      >
        <div
          className="footer-content-wrapper"
          style={{
            maxWidth: '1600px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Main Horizontal Row */}
          <div
            className="footer-main-row"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '18px 24px',
            }}
          >
            {/* 1. BRANDING SECTION */}
            <div
              className="footer-brand-section"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                flexShrink: 0,
              }}
            >
              <img
                src={bisLogoImg}
                alt="Bureau of Indian Standards"
                style={{
                  height: '38px',
                  width: 'auto',
                  objectFit: 'contain',
                  display: 'block',
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
                <span
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '19px',
                    fontWeight: 800,
                    color: '#FFFFFF',
                    letterSpacing: '-0.01em',
                  }}
                >
                  BIS Parakh
                </span>
                <span
                  style={{
                    fontSize: '11.5px',
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontWeight: 500,
                    marginTop: '2px',
                  }}
                >
                  National Standards Portal
                </span>
              </div>
            </div>

            {/* Vertical Divider 1 */}
            <div className="footer-vertical-divider" />

            {/* 2. TAGLINE SECTION */}
            <div
              className="footer-tagline-section"
              style={{
                display: 'flex',
                flexDirection: 'column',
                lineHeight: 1.25,
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontSize: '13.5px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                }}
              >
                Standards for a Safer, Stronger India
              </span>
              <span
                style={{
                  fontSize: '11px',
                  color: 'rgba(255, 255, 255, 0.88)',
                  fontWeight: 500,
                  marginTop: '3px',
                }}
              >
                Quality &nbsp;|&nbsp; Safety &nbsp;|&nbsp; Trust &nbsp;|&nbsp; Sustainable Growth
              </span>
            </div>

            {/* Vertical Divider 2 */}
            <div className="footer-vertical-divider" />

            {/* 3. SOCIAL MEDIA SECTION */}
            <div
              className="footer-social-section"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  whiteSpace: 'nowrap',
                }}
              >
                Follow Us
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* Facebook */}
                <a
                  href="https://www.facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Follow BIS Parakh on Facebook"
                  className="social-icon-btn"
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: '#1877F2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textDecoration: 'none',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFFFFF">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>

                {/* Instagram */}
                <a
                  href="https://www.instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Follow BIS Parakh on Instagram"
                  className="social-icon-btn"
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background:
                      'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textDecoration: 'none',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </a>

                {/* X (formerly Twitter) */}
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Follow BIS Parakh on X"
                  className="social-icon-btn"
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: '#000000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textDecoration: 'none',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#FFFFFF">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>

                {/* LinkedIn */}
                <a
                  href="https://www.linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Follow BIS Parakh on LinkedIn"
                  className="social-icon-btn"
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: '#0A66C2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textDecoration: 'none',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="#FFFFFF">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Vertical Divider 3 */}
            <div className="footer-vertical-divider" />

            {/* 4. CONTACT SECTION */}
            <div
              className="footer-contact-section"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                flexShrink: 0,
              }}
            >
              {/* Circular White Icon Container */}
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#FFFFFF',
                  color: '#3572C4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.15)',
                }}
              >
                <Mail size={16} color="#3572C4" />
              </div>

              {/* Contact Text */}
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                <span
                  style={{
                    fontSize: '11.5px',
                    fontWeight: 700,
                    color: '#FFFFFF',
                  }}
                >
                  Contact Us
                </span>
                <a
                  href="mailto:krayam.aurions@gmail.com"
                  style={{
                    fontSize: '12px',
                    fontWeight: 500,
                    color: '#FFFFFF',
                    textDecoration: 'none',
                    transition: 'opacity 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.textDecoration = 'underline';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.textDecoration = 'none';
                  }}
                >
                  krayam.aurions@gmail.com
                </a>
              </div>
            </div>

            {/* Vertical Divider 4 */}
            <div className="footer-vertical-divider" />

            {/* 5. LEGAL LINKS */}
            <div
              className="footer-legal-section"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '12.5px',
                fontWeight: 500,
                color: '#FFFFFF',
                flexShrink: 0,
              }}
            >
              <button
                type="button"
                onClick={() => setActiveModal('privacy')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '12.5px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  padding: 0,
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.textDecoration = 'underline';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.textDecoration = 'none';
                }}
              >
                Privacy Policy
              </button>

              <span style={{ color: 'rgba(255, 255, 255, 0.55)' }}>|</span>

              <button
                type="button"
                onClick={() => setActiveModal('terms')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '12.5px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  padding: 0,
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.textDecoration = 'underline';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.textDecoration = 'none';
                }}
              >
                Terms & Conditions
              </button>
            </div>
          </div>

          {/* Bottom Copyright Row */}
          <div
            className="footer-copyright-row"
            style={{
              marginTop: '14px',
              fontSize: '11px',
              color: 'rgba(255, 255, 255, 0.85)',
              fontWeight: 400,
            }}
          >
            © {currentYear} BIS Parakh. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Privacy Policy Modal */}
      {activeModal === 'privacy' && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setActiveModal(null)}
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
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #D6E4F8',
              maxWidth: '560px',
              width: '100%',
              padding: '24px 28px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
              maxHeight: '85vh',
              overflowY: 'auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid #E2EAF5',
                paddingBottom: '14px',
                marginBottom: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={20} color="#3572C4" />
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#1D2B42', margin: 0 }}>
                  BIS Parakh Privacy Policy
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                style={{
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  color: '#64748B',
                  padding: '4px',
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p>
                <strong>1. Information Collection:</strong> BIS Parakh does not store or monetize personal user verification queries. Queries against HUID, BIS Licences (CM/L), and CRS R-numbers are executed strictly in real-time against verified registry datasets.
              </p>
              <p>
                <strong>2. Document & Image Data:</strong> Any files uploaded to the Document & Image Lab for OCR or hallmark detection are processed transiently in memory and are not permanently archived or shared with third parties.
              </p>
              <p>
                <strong>3. Regulatory Disclaimers:</strong> This portal references gazetted Indian Standards, QCOs, and laboratory accreditation directories. It does not replace statutory certification procedures governed by the Bureau of Indian Standards Act, 2016.
              </p>
              <p>
                <strong>4. Contact:</strong> For inquiries regarding data handling or statutory reporting, email <a href="mailto:krayam.aurions@gmail.com" style={{ color: '#3572C4', fontWeight: 600 }}>krayam.aurions@gmail.com</a>.
              </p>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="btn btn-primary"
                style={{ padding: '8px 18px', fontSize: '13px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Terms & Conditions Modal */}
      {activeModal === 'terms' && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setActiveModal(null)}
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
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #D6E4F8',
              maxWidth: '560px',
              width: '100%',
              padding: '24px 28px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
              maxHeight: '85vh',
              overflowY: 'auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid #E2EAF5',
                paddingBottom: '14px',
                marginBottom: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={20} color="#3572C4" />
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#1D2B42', margin: 0 }}>
                  BIS Parakh Terms & Conditions
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                style={{
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  color: '#64748B',
                  padding: '4px',
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p>
                <strong>1. Informational Purpose:</strong> BIS Parakh provides citizen and industry access to Indian Standards, mandatory QCO notifications, conformity assessments, and verification tooling.
              </p>
              <p>
                <strong>2. Authoritative Decisions:</strong> For statutory grant of licence, manufacturer certifications, and formal conformity declarations, refer to the Bureau of Indian Standards official portal (Manak Online).
              </p>
              <p>
                <strong>3. Intellectual Property:</strong> Standard titles, numbers, and gazetted provisions remain the statutory copyright of the Bureau of Indian Standards and the Government of India.
              </p>
              <p>
                <strong>4. Responsible Use:</strong> Users shall not submit fraudulent certification credentials or conduct automated scraping against portal endpoints.
              </p>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="btn btn-primary"
                style={{ padding: '8px 18px', fontSize: '13px' }}
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Component Styles & Responsive Media Queries */}
      <style>{`
        .footer-vertical-divider {
          width: 1px;
          height: 34px;
          background-color: rgba(255, 255, 255, 0.4);
          flex-shrink: 0;
        }

        .social-icon-btn:hover {
          transform: translateY(-2px) scale(1.08);
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3) !important;
        }

        @media (max-width: 1024px) {
          .bis-parakh-footer {
            padding: 20px 24px 16px !important;
          }
          .footer-vertical-divider {
            display: none !important;
          }
          .footer-main-row {
            justify-content: flex-start !important;
            gap: 16px 24px !important;
          }
        }

        @media (max-width: 768px) {
          .bis-parakh-footer {
            padding: 20px 16px 16px !important;
          }
          .footer-main-row {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 16px !important;
          }
          .footer-vertical-divider {
            display: none !important;
          }
          .footer-copyright-row {
            margin-top: 18px !important;
            border-top: 1px solid rgba(255, 255, 255, 0.2);
            padding-top: 12px;
            width: 100%;
          }
        }
      `}</style>
    </>
  );
};
