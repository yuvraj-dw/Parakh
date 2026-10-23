import React, { useState, useEffect } from 'react';
import {
  Award,
  CheckSquare,
  Square,
  ChevronLeft,
  ArrowRight,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  BookOpen,
  Filter,
  Search,
  Scale,
} from 'lucide-react';
import { NavRoute, CertificationScheme, NavigationPayload } from '../types';
import { ApiError } from '../api/client';
import { SegmentedControl } from '../components/common/SegmentedControl';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorState } from '../components/common/ErrorState';
import { certificationApi } from '../api/certification';
import { CertificationSchemeOut, ProductMappingResponse } from '../types/api';

interface CertificationPageProps {
  initialStandardId?: string;
  initialTab?: 'schemes' | 'mapping' | 'roadmap' | 'checklist' | 'guidance';
  onNavigate: (route: NavRoute, payload?: NavigationPayload) => void;
}

const mapBackendSchemeToViewModel = (s: CertificationSchemeOut): CertificationScheme => {
  return {
    id: s.id || s.scheme_code,
    name: s.name,
    code: s.scheme_code,
    badge: s.scheme_code.replace('_', ' '),
    description: s.description || '',
    basicProcedure: s.procedure ? [s.procedure] : undefined,
  };
};

export const CertificationPage: React.FC<CertificationPageProps> = ({
  initialTab = 'schemes',
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'schemes' | 'mapping' | 'roadmap' | 'checklist'>(
    initialTab === 'checklist' ? 'checklist' : initialTab === 'roadmap' ? 'roadmap' : initialTab === 'mapping' ? 'mapping' : 'schemes'
  );

  // Backend schemes state
  const [schemes, setSchemes] = useState<CertificationScheme[]>([]);
  const [isLoadingSchemes, setIsLoadingSchemes] = useState(true);
  const [schemesError, setSchemesError] = useState<string | null>(null);
  const [selectedScheme, setSelectedScheme] = useState<CertificationScheme | null>(null);

  const fetchSchemes = async () => {
    setIsLoadingSchemes(true);
    setSchemesError(null);
    try {
      const data = await certificationApi.listSchemes();
      const mapped = data.map(mapBackendSchemeToViewModel);
      setSchemes(mapped);
      if (mapped.length > 0) {
        setSelectedScheme(mapped[0]);
      }
    } catch (err: unknown) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
          ? err.message
          : 'Failed to load certification schemes from Parakh backend.';
      setSchemesError(message);
      setSchemes([]);
    } finally {
      setIsLoadingSchemes(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, []);

  // Product mapping state (Direct Parakh Backend Integration)
  const [mappingQuery, setMappingQuery] = useState('');
  const [mappingResult, setMappingResult] = useState<ProductMappingResponse | null>(null);
  const [isMappingLoading, setIsMappingLoading] = useState(false);
  const [mappingError, setMappingError] = useState<string | null>(null);

  const handleMapProduct = async (queryText?: string) => {
    const q = (queryText !== undefined ? queryText : mappingQuery).trim();
    if (!q) return;
    setIsMappingLoading(true);
    setMappingError(null);
    try {
      const res = await certificationApi.mapProduct(q);
      setMappingResult(res);
    } catch (err: unknown) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
          ? err.message
          : 'Failed to map product to certification standard.';
      setMappingError(message);
      setMappingResult(null);
    } finally {
      setIsMappingLoading(false);
    }
  };

  // Interactive Checklist State
  const [checklist, setChecklist] = useState([
    { id: 1, text: 'Applicable Indian Standard verified and identified (e.g. IS 17526, IS 14543)', completed: true, stage: 'Standard' },
    { id: 2, text: 'In-house test equipment & calibration instruments setup per Scheme of Testing and Inspection (STI)', completed: true, stage: 'Testing' },
    { id: 3, text: 'Quality manual, process flow chart, and manufacturing machinery list drafted', completed: true, stage: 'Documents' },
    { id: 4, text: 'Independent type test report obtained from a BIS recognized NABL laboratory', completed: false, stage: 'Testing' },
    { id: 5, text: 'Required statutory documents (incorporation, MSME, NOC, factory lease) uploaded', completed: false, stage: 'Documents' },
    { id: 6, text: 'Manak Online portal e-BIS formal application completed and fee paid', completed: false, stage: 'Application' },
    { id: 7, text: 'Factory inspection audit by BIS technical officer scheduled & passed', completed: false, stage: 'Assessment' },
    { id: 8, text: 'Grant of Certification Licence (CM/L) and ISI Mark authorization issued', completed: false, stage: 'Licence' },
  ]);

  const toggleChecklistItem = (id: number) => {
    setChecklist(
      checklist.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const completedCount = checklist.filter((item) => item.completed).length;
  const progressPercent = Math.round((completedCount / checklist.length) * 100);

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Breadcrumb Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748B' }}>
        <button
          onClick={() => onNavigate('/')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            color: '#3A74C2',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <ChevronLeft size={16} /> Home
        </button>
        <span>/</span>
        <span style={{ color: '#1D2B42', fontWeight: 700 }}>BIS Certification</span>
      </div>

      {/* Header Banner */}
      <div
        className="card"
        style={{
          padding: '24px 28px',
          background: 'linear-gradient(180deg, #F0F6FE 0%, #FFFFFF 100%)',
          border: '1px solid #D6E4F8',
          borderRadius: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: '#EAF2FE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#3A74C2',
              border: '1px solid #C4DCFA',
            }}
          >
            <Award size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#1D2B42' }}>
              BIS Parakh — Certification Schemes & Mapping
            </h1>
            <p style={{ fontSize: '13px', color: '#64748B' }}>
              Explore BIS conformity certification schemes, map products to certification routes, and track audit checklists.
            </p>
          </div>
        </div>

        {/* Pill / Segmented Control Bar (Per Section 1 & 2) */}
        <div style={{ marginTop: '16px', borderTop: '1px solid #E2EAF5', paddingTop: '16px' }}>
          <SegmentedControl<'schemes' | 'mapping' | 'roadmap' | 'checklist'>
            items={[
              {
                id: 'schemes',
                label: 'Certification Schemes',
                number: 1,
                icon: Award,
              },
              {
                id: 'mapping',
                label: 'Product Certification Mapping',
                number: 2,
                icon: Layers,
              },
              {
                id: 'roadmap',
                label: 'Certification Roadmap',
                number: 3,
                icon: ArrowRight,
              },
              {
                id: 'checklist',
                label: 'Compliance Checklist',
                number: 4,
                icon: CheckSquare,
              },
            ]}
            activeId={activeTab}
            onChange={(id) => setActiveTab(id)}
          />
        </div>
      </div>

      {/* ==================================================
          TAB 1: CERTIFICATION SCHEMES (Connected to Backend)
          ================================================== */}
      {activeTab === 'schemes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {schemesError && (
            <ErrorState
              title="Certification Schemes Error"
              message={schemesError}
              apiEndpoint="/api/v1/certification/schemes"
              onRetry={fetchSchemes}
            />
          )}

          {isLoadingSchemes ? (
            <LoadingSkeleton type="card" count={3} message="Loading official BIS certification schemes..." />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
              {schemes.map((scheme) => (
                <div
                  key={scheme.id}
                  onClick={() => setSelectedScheme(scheme)}
                  className="card"
                  style={{
                    padding: '22px',
                    backgroundColor: '#FFFFFF',
                    border: selectedScheme?.id === scheme.id ? '2px solid #3A74C2' : '1px solid #D6E4F8',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '12px',
                    transition: 'all 0.15s ease',
                  }}
                >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span
                      style={{
                        padding: '3px 10px',
                        borderRadius: '12px',
                        backgroundColor: '#EAF2FE',
                        color: '#3A74C2',
                        fontSize: '11px',
                        fontWeight: 700,
                        border: '1px solid #BFDBFE',
                      }}
                    >
                      {scheme.badge}
                    </span>
                    <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>{scheme.code}</span>
                  </div>

                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1D2B42', marginBottom: '6px' }}>
                    {scheme.name}
                  </h3>

                  <p style={{ fontSize: '12.5px', color: '#475569', lineHeight: 1.5, marginBottom: '10px' }}>
                    {scheme.description}
                  </p>
                </div>

                <div style={{ borderTop: '1px solid #E2EAF5', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11.5px', color: '#3A74C2', fontWeight: 700 }}>
                    {scheme.code}
                  </span>
                  <span style={{ fontSize: '12px', color: '#3A74C2', fontWeight: 700 }}>
                    View Scheme Details &rarr;
                  </span>
                </div>
              </div>
            ))}
          </div>
          )}

          {/* Scheme Detailed View Box */}
          {selectedScheme && (
            <div
              className="card"
              style={{
                padding: '28px',
                backgroundColor: '#FFFFFF',
                border: '1.5px solid #3A74C2',
                borderRadius: '16px',
                boxShadow: '0 4px 16px rgba(58, 116, 194, 0.08)',
              }}
            >
              <div style={{ borderBottom: '1px solid #E2EAF5', paddingBottom: '14px', marginBottom: '18px' }}>
                <span className="badge badge-sky" style={{ marginBottom: '6px' }}>{selectedScheme.badge}</span>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1D2B42' }}>
                  {selectedScheme.name}
                </h2>
                <p style={{ fontSize: '13.5px', color: '#475569', marginTop: '4px' }}>
                  {selectedScheme.description}
                </p>
              </div>

              {/* Procedure from backend */}
              <div style={{ padding: '18px', backgroundColor: '#F8FAFD', borderRadius: '12px', border: '1px solid #E2EAF5' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#1D2B42', marginBottom: '8px' }}>
                  Statutory Procedure (Scheme Regulatory Framework)
                </h4>
                {selectedScheme.basicProcedure && selectedScheme.basicProcedure.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {selectedScheme.basicProcedure.map((proc, idx) => (
                      <div key={idx} style={{ fontSize: '13px', color: '#334155', lineHeight: 1.6 }}>
                        <strong>{idx + 1}.</strong> {proc}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: '12.5px', color: '#64748B' }}>
                    Not provided by backend.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================================================
          TAB 2: PRODUCT CERTIFICATION MAPPING (Backend-driven)
          ================================================== */}
      {activeTab === 'mapping' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card" style={{ padding: '24px', backgroundColor: '#FFFFFF', border: '1px solid #D6E4F8', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#1D2B42', marginBottom: '6px' }}>
              Product Certification Scheme & Standard Mapping
            </h3>
            <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '16px' }}>
              Enter a product description to query the Parakh backend AI mapping engine and discover its candidate Indian Standard, certification scheme, and QCO status.
            </p>

            {/* Product Input & Submit */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleMapProduct();
              }}
              style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '14px' }}
            >
              <input
                type="text"
                placeholder="e.g. Stainless steel vacuum insulated water flask with silicone gasket"
                value={mappingQuery}
                onChange={(e) => setMappingQuery(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: '280px',
                  height: '42px',
                  padding: '0 14px',
                  fontSize: '13.5px',
                  borderRadius: '8px',
                  border: '1px solid #D6E4F8',
                  backgroundColor: '#F8FAFD',
                  color: '#1D2B42',
                }}
              />
              <button
                type="submit"
                disabled={isMappingLoading || !mappingQuery.trim()}
                className="btn btn-primary"
                style={{ height: '42px', padding: '0 20px', fontSize: '13.5px', fontWeight: 700, borderRadius: '8px' }}
              >
                <Search size={15} />
                {isMappingLoading ? 'Mapping...' : 'Map Product'}
              </button>
            </form>

            {/* Sample Queries */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Try Example Products:</span>
              {[
                'Stainless Steel Vacuum Flask',
                'Packaged Drinking Water (Bottled)',
                'Lithium-ion Battery Pack for Smartphone',
                '22 Karat Gold Jewellery Article',
                '16A 3-Pin Electrical Plug & Socket',
              ].map((sample) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => {
                    setMappingQuery(sample);
                    handleMapProduct(sample);
                  }}
                  disabled={isMappingLoading}
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    padding: '3px 10px',
                    borderRadius: '6px',
                    backgroundColor: '#F1F6FD',
                    border: '1px solid #C4DCFA',
                    color: '#3A74C2',
                    cursor: 'pointer',
                  }}
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>

          {/* Error State */}
          {mappingError && (
            <ErrorState
              title="Product Mapping Failed"
              message={mappingError}
              apiEndpoint="/api/v1/certification/map-product"
              onRetry={() => handleMapProduct()}
            />
          )}

          {/* Loading Skeleton */}
          {isMappingLoading && (
            <LoadingSkeleton type="card" count={1} message="Querying Parakh neural classifier for candidate standard and scheme..." />
          )}

          {/* Mapping Details Result: Backend fields ONLY */}
          {!isMappingLoading && mappingResult && (
            <div
              className="card"
              style={{
                padding: '28px',
                backgroundColor: '#FFFFFF',
                border: '1.5px solid #3A74C2',
                borderRadius: '16px',
                boxShadow: '0 4px 14px rgba(58, 116, 194, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                gap: '18px',
              }}
            >
              <div style={{ borderBottom: '1px solid #E2EAF5', paddingBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '20px', fontWeight: 900, color: '#3A74C2' }}>
                      {mappingResult.candidate_standard}
                    </span>
                    {mappingResult.is_mandatory ? (
                      <span className="badge badge-danger">Mandatory QCO Enforced</span>
                    ) : (
                      <span className="badge badge-sky">Voluntary / General</span>
                    )}
                  </div>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1D2B42', marginTop: '4px' }}>
                    {mappingResult.standard_title}
                  </h2>
                </div>

                <span
                  style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    backgroundColor: '#DCFCE7',
                    color: '#166534',
                    fontWeight: 800,
                    fontSize: '12px',
                    border: '1px solid #86EFAC',
                  }}
                >
                  {Math.round(mappingResult.confidence * 100)}% Confidence
                </span>
              </div>

              {/* Grid of Backend Fields */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {/* 1. Applicable Certification Scheme */}
                <div style={{ padding: '16px', backgroundColor: '#F8FAFD', borderRadius: '12px', border: '1px solid #E2EAF5' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Certification Scheme
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#3A74C2' }}>
                    {mappingResult.certification_scheme || 'Not provided by backend'}
                  </div>
                </div>

                {/* 2. Applicable QCO */}
                <div style={{ padding: '16px', backgroundColor: '#F8FAFD', borderRadius: '12px', border: '1px solid #E2EAF5' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Applicable Quality Control Order (QCO)
                  </div>
                  <div style={{ fontSize: '14.5px', fontWeight: 700, color: mappingResult.applicable_qco ? '#92400E' : '#64748B' }}>
                    {mappingResult.applicable_qco || 'None / Not available'}
                  </div>
                </div>
              </div>

              {/* 3. Reasoning from Backend */}
              <div style={{ padding: '16px', backgroundColor: '#F8FAFD', borderRadius: '12px', border: '1px solid #E2EAF5' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Classification Reasoning
                </div>
                <p style={{ fontSize: '13px', color: '#334155', lineHeight: 1.6 }}>
                  {mappingResult.reasoning || 'Not provided by backend'}
                </p>
              </div>

              <div style={{ borderTop: '1px solid #EDF3FB', paddingTop: '12px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => onNavigate('/standards', mappingResult.candidate_standard)}
                  className="btn btn-primary btn-sm"
                >
                  Explore Standard Detail &rarr;
                </button>
                {mappingResult.applicable_qco && (
                  <button
                    type="button"
                    onClick={() => onNavigate('/qco-regulations', mappingResult.candidate_standard)}
                    className="btn btn-secondary btn-sm"
                  >
                    View QCO Regulations
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isMappingLoading && !mappingResult && !mappingError && (
            <div
              className="card"
              style={{
                padding: '48px 24px',
                backgroundColor: '#FFFFFF',
                border: '1px dashed #C4DCFA',
                borderRadius: '16px',
                textAlign: 'center',
                color: '#64748B',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: '#F1F6FD',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#3A74C2',
                  margin: '0 auto 12px',
                }}
              >
                <Search size={24} />
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#1D2B42', marginBottom: '6px' }}>
                No Product Mapping Requested
              </h4>
              <p style={{ fontSize: '13px', maxWidth: '480px', margin: '0 auto' }}>
                Enter a product description above or pick a sample product to query the Parakh backend and determine the applicable Indian Standard and certification scheme.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ==================================================
          TAB 3: CERTIFICATION ROADMAP
          ================================================== */}
      {activeTab === 'roadmap' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ padding: '10px 14px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '12.5px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-sky" style={{ fontSize: '11px', textTransform: 'uppercase' }}>Advisory Guide</span>
            <span>This structured roadmap is an interactive guide for applicant readiness and statutory milestone tracking.</span>
          </div>

          <div className="card" style={{ padding: '28px', backgroundColor: '#FFFFFF', border: '1px solid #D6E4F8', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1D2B42', marginBottom: '6px' }}>
              8-Stage BIS Certification Roadmap (Scheme I)
            </h3>
          <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '24px' }}>
            A structured path from product conception to grant of official CM/L licence.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            {[
              { step: '1', title: 'Product Profile', desc: 'Define technical specs and identify whether product falls under mandatory QCO.' },
              { step: '2', title: 'Applicable Standard', desc: 'Identify IS standard number and obtain latest Scheme of Testing and Inspection (STI).' },
              { step: '3', title: 'Certification Route', desc: 'Determine Scheme I (ISI) or Scheme II (CRS) conformity evaluation route.' },
              { step: '4', title: 'In-House Testing', desc: 'Install and calibrate testing machinery matching STI specifications.' },
              { step: '5', title: 'Documentation', desc: 'Compile quality manual, machinery list, test certificates, and plant layouts.' },
              { step: '6', title: 'e-BIS Application', desc: 'Submit application on Manak Online portal and remit initial statutory fee.' },
              { step: '7', title: 'Factory Assessment', desc: 'BIS auditing officer conducts on-site audit and draws independent verification samples.' },
              { step: '8', title: 'Grant of Licence', desc: 'Receive CM/L licence and authorization to print the ISI mark on retail packages.' },
            ].map((st) => (
              <div
                key={st.step}
                style={{
                  padding: '18px',
                  backgroundColor: '#F8FAFD',
                  borderRadius: '12px',
                  border: '1px solid #E2EAF5',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#3A74C2',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 800,
                    marginBottom: '10px',
                  }}
                >
                  {st.step}
                </div>
                <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#1D2B42', marginBottom: '4px' }}>
                  {st.title}
                </h4>
                <p style={{ fontSize: '12.5px', color: '#64748B', lineHeight: 1.5 }}>
                  {st.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
        </div>
      )}

      {/* ==================================================
          TAB 4: COMPLIANCE CHECKLIST
          ================================================== */}
      {activeTab === 'checklist' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ padding: '12px 16px', backgroundColor: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: '10px', fontSize: '13px', color: '#92400E', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="badge badge-warning" style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 800 }}>Prototype / Demonstration Mode</span>
            <span>This readiness checklist is for demonstration and self-assessment only. It is not fetched from the live backend and does not represent live BIS evaluation data or formal certification approval.</span>
          </div>

          <div className="card" style={{ padding: '28px', backgroundColor: '#FFFFFF', border: '1px solid #D6E4F8', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1D2B42' }}>
                  Pre-Audit Readiness Checklist
                </h3>
              <p style={{ fontSize: '13px', color: '#64748B' }}>
                Ensure all documentation and technical parameters are completed prior to factory inspection.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#3A74C2' }}>
                {completedCount} of {checklist.length} Completed ({progressPercent}%)
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{ width: '100%', height: '8px', backgroundColor: '#E2EAF5', borderRadius: '4px', overflow: 'hidden', marginBottom: '20px' }}>
            <div style={{ width: `${progressPercent}%`, height: '100%', backgroundColor: '#166534', transition: 'width 0.2s ease' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {checklist.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleChecklistItem(item.id)}
                style={{
                  padding: '14px 18px',
                  borderRadius: '10px',
                  backgroundColor: item.completed ? '#F0FDF4' : '#F8FAFD',
                  border: item.completed ? '1px solid #BBF7D0' : '1px solid #E2EAF5',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.15s ease',
                }}
              >
                {item.completed ? (
                  <CheckSquare size={18} color="#166534" />
                ) : (
                  <Square size={18} color="#94A3B8" />
                )}
                <span
                  style={{
                    fontSize: '13.5px',
                    fontWeight: 600,
                    color: item.completed ? '#166534' : '#2A3C5B',
                    textDecoration: item.completed ? 'line-through' : 'none',
                    flex: 1,
                  }}
                >
                  {item.text}
                </span>
                <span className="badge badge-sky" style={{ fontSize: '10.5px' }}>
                  {item.stage}
                </span>
              </div>
            ))}
          </div>
        </div>
        </div>
      )}
    </div>
  );
};
