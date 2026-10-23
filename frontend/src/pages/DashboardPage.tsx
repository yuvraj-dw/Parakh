import React, { useState } from 'react';
import {
  BookOpen,
  Split,
  Award,
  Scale,
  FlaskConical,
  Gem,
  Store,
  FileSearch,
  CheckSquare,
  BotMessageSquare,
  ArrowRight,
  Search,
  Sparkles,
  ShieldCheck,
  Building2,
  BadgeCheck,
} from 'lucide-react';
import { NavRoute, NavigationPayload } from '../types';
import { BisLogo } from '../components/common/BisLogo';
import { SUGGESTED_ASSISTANT_QUESTIONS } from '../data/assistant';

interface DashboardPageProps {
  onNavigate: (route: NavRoute, payload?: NavigationPayload) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const [heroSearchInput, setHeroSearchInput] = useState('');

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = heroSearchInput.trim();
    if (!query) return;

    const lower = query.toLowerCase();
    if (lower.includes('huid') || lower.includes('gold') || lower.includes('hallmark')) {
      onNavigate('/verify/huid');
    } else if (lower.includes('lab') || lower.includes('test')) {
      onNavigate('/laboratories', { query });
    } else if (lower.includes('qco')) {
      onNavigate('/qco-regulations', query);
    } else if (lower.includes('certif') || lower.includes('scheme') || lower.includes('cml')) {
      onNavigate('/certification');
    } else if (lower.includes('jewel')) {
      onNavigate('/licensed-jewellers');
    } else {
      // By default open AI assistant with query or standards
      onNavigate('/chat', query);
    }
  };

  // The 9 core features specified in Section 2:
  // Standards, QCO, Certification, Verification, Hallmarking, Testing Laboratories, Licensed Jewellers, Document & Image Lab, AI Assistant
  const coreFeatures = [
    {
      id: 'standards',
      title: 'Standards Explorer',
      description: 'Search 21,000+ Indian Standards (IS), inspect technical clauses, scope and amendments.',
      route: '/standards' as NavRoute,
      icon: BookOpen,
      badge: 'IS Catalogue',
      color: '#3A74C2',
      cta: 'Explore Standards',
    },
    {
      id: 'qco',
      title: 'QCO & Regulations',
      description: 'Check mandatory central Quality Control Orders, effective dates and gazette notifications.',
      route: '/qco-regulations' as NavRoute,
      icon: Scale,
      badge: 'Mandatory Orders',
      color: '#DC2626',
      cta: 'Browse QCO Orders',
    },
    {
      id: 'certification',
      title: 'Certification Hub',
      description: 'Conformity schemes (ISI Mark, CRS, CoC), product mapping, roadmap, and compliance checklists.',
      route: '/certification' as NavRoute,
      icon: Award,
      badge: 'Scheme I & II',
      color: '#0369A1',
      cta: 'Certification Guide',
    },
    {
      id: 'verification',
      title: 'Unified Verification Hub',
      description: 'Verify 6-digit gold HUID hallmarks, manufacturer BIS licences (CM/L), and electronics CRS R-numbers.',
      route: '/verify' as NavRoute,
      icon: ShieldCheck,
      badge: 'Authoritative Portal',
      color: '#166534',
      cta: 'Verify Marks',
    },
    {
      id: 'hallmarking',
      title: 'Hallmarking & Jewellery',
      description: 'Recognized Assaying & Hallmarking Centres (AHC), optical hallmark scanner, and purity calculator.',
      route: '/hallmarking' as NavRoute,
      icon: Gem,
      badge: 'Gold & Silver',
      color: '#B45309',
      cta: 'Find Centres & Scanner',
    },
    {
      id: 'laboratories',
      title: 'Testing Laboratories',
      description: 'Locate central BIS and NABL accredited testing facilities filtered by capability and standard.',
      route: '/laboratories' as NavRoute,
      icon: FlaskConical,
      badge: 'LIMS Facilities',
      color: '#4F46E5',
      cta: 'Find Laboratories',
    },
    {
      id: 'jewellers',
      title: 'Licensed Jewellers',
      description: 'Official directory of jewellers holding active BIS hallmarking registrations across India.',
      route: '/licensed-jewellers' as NavRoute,
      icon: Store,
      badge: 'Published Registry',
      color: '#7C3AED',
      cta: 'Search Jewellers',
    },
    {
      id: 'doc-lab',
      title: 'Document & Image Lab',
      description: 'Diagnostic analyzer for test certificates, macro hallmark images, and BIS product packaging labels.',
      route: '/document-image-lab' as NavRoute,
      icon: FileSearch,
      badge: 'OCR & Analysis',
      color: '#0F766E',
      cta: 'Launch Tools',
    },
    {
      id: 'assistant',
      title: 'AI Assistant',
      description: 'Conversational assistant synthesizing clause citations directly from official BIS repositories.',
      route: '/chat' as NavRoute,
      icon: BotMessageSquare,
      badge: 'Conversational RAG',
      color: '#2563EB',
      cta: 'Start AI Session',
    },
  ];

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* ==================================================
          1. HERO SECTION: Search & Discovery Entry Point
          ================================================== */}
      <section
        style={{
          width: '100%',
          background: 'linear-gradient(180deg, #F0F6FE 0%, #FFFFFF 100%)',
          border: '1px solid #D6E4F8',
          borderRadius: '24px',
          padding: '40px 32px 36px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          boxShadow: '0 4px 20px -2px rgba(58, 116, 194, 0.08)',
        }}
      >
        <div style={{ marginBottom: '16px' }}>
          <BisLogo size={58} />
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#EAF2FE', color: '#1E40AF', padding: '3px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: 700, border: '1px solid #BFDBFE', marginBottom: '12px' }}>
          <Sparkles size={14} /> National Standardization & Conformity Portal
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '30px',
            fontWeight: 900,
            letterSpacing: '-0.02em',
            color: '#1D2B42',
            marginBottom: '8px',
          }}
        >
          Bureau of Indian Standards — <span style={{ color: '#3A74C2' }}>BIS Parakh</span>
        </h1>

        <p style={{ fontSize: '14.5px', color: '#475569', maxWidth: '680px', lineHeight: 1.5, marginBottom: '24px' }}>
          Access Indian Standards, mandatory Quality Control Orders, verification registries, recognized testing laboratories, and AI-assisted regulatory guidance.
        </p>

        {/* Global Search / Discovery Entry Bar */}
        <form
          onSubmit={handleHeroSubmit}
          style={{
            width: '100%',
            maxWidth: '680px',
            position: 'relative',
            marginBottom: '16px',
          }}
        >
          <Search
            size={20}
            style={{
              position: 'absolute',
              left: '18px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#3A74C2',
            }}
          />
          <input
            type="text"
            placeholder="Search IS numbers (e.g. IS 17526), products, HUIDs, testing labs, or QCOs..."
            value={heroSearchInput}
            onChange={(e) => setHeroSearchInput(e.target.value)}
            style={{
              width: '100%',
              height: '52px',
              paddingLeft: '50px',
              paddingRight: '120px',
              fontSize: '14.5px',
              backgroundColor: '#FFFFFF',
              border: '2px solid #C4DCFA',
              borderRadius: '26px',
              color: '#1D2B42',
              boxShadow: '0 4px 14px rgba(58, 116, 194, 0.12)',
              outline: 'none',
            }}
          />
          <button
            type="submit"
            className="btn btn-primary"
            style={{
              position: 'absolute',
              right: '6px',
              top: '6px',
              bottom: '6px',
              borderRadius: '20px',
              padding: '0 20px',
              fontSize: '13.5px',
              fontWeight: 700,
            }}
          >
            Search
          </button>
        </form>

        {/* Quick Suggested Discovery Prompts */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Suggested:</span>
          {SUGGESTED_ASSISTANT_QUESTIONS.slice(0, 4).map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onNavigate('/chat', q)}
              style={{
                fontSize: '12px',
                fontWeight: 600,
                padding: '4px 12px',
                borderRadius: '16px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #D6E4F8',
                color: '#39527B',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#EAF2FE';
                e.currentTarget.style.borderColor = '#3A74C2';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
                e.currentTarget.style.borderColor = '#D6E4F8';
              }}
            >
              {q}
            </button>
          ))}
        </div>
      </section>

      {/* ==================================================
          2. CORE FEATURES GRID (Per Section 2)
          ================================================== */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#1D2B42', marginBottom: '4px' }}>
            Core Standards & Conformity Services
          </h2>
          <p style={{ fontSize: '13.5px', color: '#64748B' }}>
            Official entry points to national standard catalogs, conformity schemes, and verification directories.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: '20px',
          }}
        >
          {coreFeatures.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.id}
                onClick={() => onNavigate(feat.route)}
                className="bis-feature-card"
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #D6E4F8',
                  borderRadius: '16px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.18s ease',
                  boxShadow: '0 1px 4px rgba(30, 41, 59, 0.04)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '12px',
                        backgroundColor: '#EAF2FE',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: feat.color,
                        border: '1px solid #C4DCFA',
                      }}
                    >
                      <Icon size={22} />
                    </div>

                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: '#F8FAFD',
                        border: '1px solid #D6E4F8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#3A74C2',
                      }}
                    >
                      <ArrowRight size={14} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#1D2B42' }}>
                      {feat.title}
                    </h3>
                  </div>

                  <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.5, marginBottom: '16px' }}>
                    {feat.description}
                  </p>
                </div>

                <div style={{ borderTop: '1px solid #E2EAF5', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: feat.color,
                      backgroundColor: '#F1F6FD',
                      padding: '2px 8px',
                      borderRadius: '10px',
                    }}
                  >
                    {feat.badge}
                  </span>
                  <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#3A74C2' }}>
                    {feat.cta} &rarr;
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ==================================================
          3. COMPLIANCE & PRODUCT DISCOVERY HIGHLIGHT BANNER
          ================================================== */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '16px',
        }}
      >
        <div
          onClick={() => onNavigate('/product-to-standard')}
          className="bis-feature-card"
          style={{
            padding: '22px 24px',
            backgroundColor: '#F8FAFD',
            border: '1px solid #D6E4F8',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: '#EAF2FE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#3A74C2',
              }}
            >
              <Split size={20} />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#1D2B42' }}>
                Product → Standard Discovery
              </div>
              <div style={{ fontSize: '12.5px', color: '#64748B' }}>
                Enter product attributes to find applicable Indian Standards.
              </div>
            </div>
          </div>
          <ArrowRight size={16} color="#3A74C2" />
        </div>

        <div
          onClick={() => onNavigate('/compliance-gap')}
          className="bis-feature-card"
          style={{
            padding: '22px 24px',
            backgroundColor: '#F8FAFD',
            border: '1px solid #D6E4F8',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: '#EAF2FE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#3A74C2',
              }}
            >
              <CheckSquare size={20} />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#1D2B42' }}>
                Compliance Gap Analysis
              </div>
              <div style={{ fontSize: '12.5px', color: '#64748B' }}>
                Compare factory documentation with mandatory BIS clause criteria.
              </div>
            </div>
          </div>
          <ArrowRight size={16} color="#3A74C2" />
        </div>
      </section>
    </div>
  );
};
