import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  Gem,
  Award,
  Cpu,
  ChevronLeft,
  Copy,
  Check,
  BadgeCheck,
} from 'lucide-react';
import {
  NavRoute,
  HuidVerificationResult,
  LicenceVerificationResult,
  CrsVerificationResult,
} from '../types';
import { verificationService } from '../services/verificationService';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { NavigationPayload } from '../types';
import { SegmentedControl } from '../components/common/SegmentedControl';

interface VerificationSuitePageProps {
  initialTab?: 'huid' | 'licence' | 'crs';
  onNavigate: (route: NavRoute, payload?: NavigationPayload) => void;
}

export const VerificationSuitePage: React.FC<VerificationSuitePageProps> = ({
  initialTab = 'huid',
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'huid' | 'licence' | 'crs'>(initialTab);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // HUID State
  const [huidInput, setHuidInput] = useState('ABC123');
  const [huidResult, setHuidResult] = useState<HuidVerificationResult | null>(null);
  const [isVerifyingHuid, setIsVerifyingHuid] = useState(false);
  const [huidError, setHuidError] = useState<string | null>(null);

  // Licence State
  const [licenceInput, setLicenceInput] = useState('CM/L-1234567');
  const [licenceResult, setLicenceResult] = useState<LicenceVerificationResult | null>(null);
  const [isVerifyingLicence, setIsVerifyingLicence] = useState(false);
  const [licenceError, setLicenceError] = useState<string | null>(null);

  // CRS State
  const [crsInput, setCrsInput] = useState('R-12345678');
  const [crsResult, setCrsResult] = useState<CrsVerificationResult | null>(null);
  const [isVerifyingCrs, setIsVerifyingCrs] = useState(false);
  const [crsError, setCrsError] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(id);
    setTimeout(() => setCopiedField(null), 1800);
  };

  const handleVerifyHuid = async (overrideValue?: string) => {
    const val = (overrideValue || huidInput).trim();
    if (!val) return;
    setIsVerifyingHuid(true);
    setHuidError(null);
    setHuidResult(null);

    try {
      const result = await verificationService.verifyHuid(val);
      setHuidResult(result);
    } catch (err: unknown) {
      setHuidError(err instanceof Error ? err.message : 'HUID verification service could not be reached.');
    } finally {
      setIsVerifyingHuid(false);
    }
  };

  const handleVerifyLicence = async (overrideValue?: string) => {
    const val = (overrideValue || licenceInput).trim();
    if (!val) return;
    setIsVerifyingLicence(true);
    setLicenceError(null);
    setLicenceResult(null);

    try {
      const result = await verificationService.verifyLicence(val);
      setLicenceResult(result);
    } catch (err: unknown) {
      setLicenceError(err instanceof Error ? err.message : 'Licence verification service could not be reached.');
    } finally {
      setIsVerifyingLicence(false);
    }
  };

  const handleVerifyCrs = async (overrideValue?: string) => {
    const val = (overrideValue || crsInput).trim();
    if (!val) return;
    setIsVerifyingCrs(true);
    setCrsError(null);
    setCrsResult(null);

    try {
      const result = await verificationService.verifyCrs(val);
      setCrsResult(result);
    } catch (err: unknown) {
      setCrsError(err instanceof Error ? err.message : 'CRS verification service could not be reached.');
    } finally {
      setIsVerifyingCrs(false);
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Breadcrumb Bar */}
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
        <span style={{ color: '#1D2B42', fontWeight: 700 }}>Unified Verification Hub</span>
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
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#1D2B42' }}>
              Unified Verification Hub
            </h1>
            <p style={{ fontSize: '13px', color: '#64748B' }}>
              One-stop authoritative verification for gold HUID hallmarks, manufacturer ISI licences (CM/L), and electronics CRS R-numbers.
            </p>
          </div>
        </div>

        {/* Pill / Segmented Control Bar (Per Section 1 & 2) */}
        <div style={{ marginTop: '16px', borderTop: '1px solid #E2EAF5', paddingTop: '16px' }}>
          <SegmentedControl<'huid' | 'licence' | 'crs'>
            items={[
              {
                id: 'huid',
                label: 'HUID Verification',
                number: 1,
                icon: Gem,
              },
              {
                id: 'licence',
                label: 'BIS Licence Verification',
                number: 2,
                icon: Award,
              },
              {
                id: 'crs',
                label: 'CRS / R-Number Verification',
                number: 3,
                icon: Cpu,
              },
            ]}
            activeId={activeTab}
            onChange={(id) => setActiveTab(id)}
          />
        </div>
      </div>

      {/* ==================================================
          TAB 1: HUID VERIFICATION
          ================================================== */}
      {activeTab === 'huid' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Input Panel */}
          <div className="card" style={{ padding: '24px', backgroundColor: '#FFFFFF', border: '1px solid #D6E4F8', borderRadius: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Gem size={20} color="#3A74C2" />
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#1D2B42' }}>
                Verify 6-Digit Hallmark Unique Identification (HUID)
              </h3>
            </div>
            <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '16px' }}>
              Enter the laser-engraved 6-character alphanumeric code found on your certified gold jewellery piece:
            </p>

            <div style={{ display: 'flex', gap: '10px', maxWidth: '580px', marginBottom: '16px' }}>
              <input
                type="text"
                maxLength={6}
                placeholder="e.g. AB1234"
                value={huidInput}
                onChange={(e) => setHuidInput(e.target.value.toUpperCase())}
                style={{
                  flex: 1,
                  height: '46px',
                  padding: '0 16px',
                  fontSize: '16px',
                  fontWeight: 800,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  border: '1.5px solid #D6E4F8',
                  borderRadius: '10px',
                  backgroundColor: '#F8FAFD',
                  color: '#1D2B42',
                }}
              />
              <button
                onClick={() => handleVerifyHuid()}
                disabled={isVerifyingHuid || !huidInput.trim()}
                className="btn btn-primary"
                style={{ height: '46px', padding: '0 24px', fontSize: '14px', borderRadius: '10px' }}
              >
                <Search size={16} />
                {isVerifyingHuid ? 'Verifying...' : 'Verify HUID'}
              </button>
            </div>

            {/* Sample Quick-Input Values */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Sample HUIDs:</span>
              {['ABC123', 'GLD916', 'DIA750', 'SIL925', 'K98L2M'].map((code) => (
                <button
                  key={code}
                  onClick={() => {
                    setHuidInput(code);
                    handleVerifyHuid(code);
                  }}
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: '6px',
                    backgroundColor: '#F1F6FD',
                    border: '1px solid #C4DCFA',
                    color: '#3A74C2',
                    cursor: 'pointer',
                  }}
                >
                  {code}
                </button>
              ))}
            </div>
          </div>

          {huidError && (
            <ErrorState
              title="HUID Verification Service Error"
              message={huidError}
              apiEndpoint="/api/v1/verification/huid"
              onRetry={() => handleVerifyHuid()}
            />
          )}

          {/* Results Area */}
          {isVerifyingHuid ? (
            <LoadingSkeleton type="detail" count={1} message="Querying central BIS hallmarking repository for HUID..." />
          ) : huidResult ? (
            <div
              className="card"
              style={{
                padding: '28px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #D6E4F8',
                borderRadius: '16px',
                boxShadow: '0 4px 14px rgba(30, 41, 59, 0.05)',
              }}
            >
              {/* Header result row */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                  borderBottom: '1px solid #E2EAF5',
                  paddingBottom: '16px',
                  marginBottom: '20px',
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', letterSpacing: '0.05em' }}>
                    HALLMARK UNIQUE IDENTIFICATION
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '2px' }}>
                    <span style={{ fontSize: '26px', fontWeight: 900, color: '#1D2B42', letterSpacing: '0.08em' }}>
                      {huidResult.huid}
                    </span>
                    <button
                      onClick={() => handleCopy(huidResult.huid, 'huid')}
                      title="Copy HUID"
                      style={{
                        padding: '4px',
                        borderRadius: '6px',
                        border: '1px solid #D6E4F8',
                        backgroundColor: '#F8FAFD',
                        color: copiedField === 'huid' ? '#166534' : '#64748B',
                        cursor: 'pointer',
                      }}
                    >
                      {copiedField === 'huid' ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 14px',
                      borderRadius: '20px',
                      backgroundColor: huidResult.status === 'VERIFIED' ? '#DCFCE7' : '#FEF2F2',
                      color: huidResult.status === 'VERIFIED' ? '#166534' : '#DC2626',
                      fontSize: '12.5px',
                      fontWeight: 800,
                      border: huidResult.status === 'VERIFIED' ? '1px solid #86EFAC' : '1px solid #FECACA',
                    }}
                  >
                    {huidResult.status === 'VERIFIED' ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />}
                    STATUS: {huidResult.status}
                  </span>
                </div>
              </div>

              {/* 7 Required Output Spec Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: '18px',
                  marginBottom: '20px',
                }}
              >
                {/* 1. Jewellery Details */}
                <div style={{ padding: '16px', backgroundColor: '#F8FAFD', borderRadius: '12px', border: '1px solid #E2EAF5' }}>
                  <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                    1. Jewellery Details
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#1D2B42', marginBottom: '2px' }}>
                    {huidResult.articleType || 'Not available'}
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#475569' }}>
                    Gross / Net Weight: <strong>{huidResult.articleWeight || 'Not available'}</strong>
                  </div>
                </div>

                {/* 2. Metal & Purity */}
                <div style={{ padding: '16px', backgroundColor: '#F8FAFD', borderRadius: '12px', border: '1px solid #E2EAF5' }}>
                  <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                    2. Certified Fineness
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#B45309', marginBottom: '2px' }}>
                    {huidResult.metalFineness || 'Not available'}
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#475569' }}>
                    Standard Precious Metal Fineness per IS 1417
                  </div>
                </div>

                {/* 3. Jeweller Information */}
                <div style={{ padding: '16px', backgroundColor: '#F8FAFD', borderRadius: '12px', border: '1px solid #E2EAF5' }}>
                  <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                    3. Registered Jeweller
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#1D2B42', marginBottom: '2px' }}>
                    {huidResult.jewellerName || 'Not available'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#475569' }}>
                    Reg No: <span style={{ color: '#3A74C2', fontWeight: 700 }}>{huidResult.jewellerRegNo || 'Not available'}</span>
                  </div>
                </div>

                {/* 4. Assaying & Hallmarking Centre */}
                <div style={{ padding: '16px', backgroundColor: '#F8FAFD', borderRadius: '12px', border: '1px solid #E2EAF5' }}>
                  <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                    4. Assaying & Hallmarking Centre (AHC)
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#1D2B42', marginBottom: '2px' }}>
                    {huidResult.ahcName || 'Not available'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#475569' }}>
                    AHC Code: <span style={{ fontWeight: 700, color: '#3A74C2' }}>{huidResult.ahcCode || 'Not available'}</span>
                  </div>
                </div>

                {/* 5. Hallmark Details */}
                <div style={{ padding: '16px', backgroundColor: '#F8FAFD', borderRadius: '12px', border: '1px solid #E2EAF5' }}>
                  <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                    5. Hallmark Details & Date
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#1D2B42', marginBottom: '2px' }}>
                    Marking Date: {huidResult.hallmarkingDate || 'Not available'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#475569' }}>
                    {huidResult.disclaimer || 'Laser HUID identification record'}
                  </div>
                </div>

                {/* 6. Verification Status & Source */}
                <div style={{ padding: '16px', backgroundColor: '#F8FAFD', borderRadius: '12px', border: '1px solid #E2EAF5' }}>
                  <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                    6. Registry Source & Audit
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: huidResult.status === 'VERIFIED' ? '#166534' : '#DC2626', marginBottom: '2px' }}>
                    Source: {huidResult.officialSource || 'Not available'}
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                    Verified: {huidResult.verifiedAt || huidResult.retrievedAt || 'Not available'}
                  </div>
                </div>
              </div>

              {/* Informational Disclaimer Box */}
              <div
                style={{
                  padding: '12px 16px',
                  backgroundColor: '#F0F9FF',
                  border: '1px solid #BAE6FD',
                  borderRadius: '10px',
                  fontSize: '12px',
                  color: '#0369A1',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <BadgeCheck size={18} style={{ flexShrink: 0 }} />
                <span>
                  <strong>Consumer Tip:</strong> Always verify that the 6-digit HUID printed on your purchase bill matches the exact engraving on the jewellery piece.
                </span>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={ShieldCheck}
              title="Enter a 6-digit HUID to begin verification"
              description="Enter a 6-character HUID code from a hallmarked piece or click on any of the sample HUIDs above."
              actionText="Load Sample AB1234"
              onAction={() => {
                setHuidInput('AB1234');
                handleVerifyHuid('AB1234');
              }}
            />
          )}
        </div>
      )}

      {/* ==================================================
          TAB 2: BIS LICENCE VERIFICATION (CM/L)
          ================================================== */}
      {activeTab === 'licence' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card" style={{ padding: '24px', backgroundColor: '#FFFFFF', border: '1px solid #D6E4F8', borderRadius: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Award size={20} color="#3A74C2" />
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#1D2B42' }}>
                Verify BIS Licence Number (CM/L)
              </h3>
            </div>
            <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '16px' }}>
              The CM/L number is an official 7-digit to 10-digit number printed directly beneath the ISI Mark on certified products:
            </p>

            <div style={{ display: 'flex', gap: '10px', maxWidth: '580px', marginBottom: '16px' }}>
              <input
                type="text"
                placeholder="e.g. CM/L-7200142981"
                value={licenceInput}
                onChange={(e) => setLicenceInput(e.target.value.toUpperCase())}
                style={{
                  flex: 1,
                  height: '46px',
                  padding: '0 16px',
                  fontSize: '15px',
                  fontWeight: 700,
                  border: '1.5px solid #D6E4F8',
                  borderRadius: '10px',
                  backgroundColor: '#F8FAFD',
                  color: '#1D2B42',
                }}
              />
              <button
                onClick={() => handleVerifyLicence()}
                disabled={isVerifyingLicence || !licenceInput.trim()}
                className="btn btn-primary"
                style={{ height: '46px', padding: '0 24px', fontSize: '14px', borderRadius: '10px' }}
              >
                <Search size={16} />
                {isVerifyingLicence ? 'Checking...' : 'Verify Licence'}
              </button>
            </div>

            {/* Sample Quick-Input Values */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Sample Licences:</span>
              {[
                { label: 'Insulated Bottles', code: 'CM/L-1234567' },
                { label: 'Standard Mark', code: 'CM/L-7200142' },
                { label: 'Packaged Goods', code: 'CM/L-8400021' },
              ].map((item) => (
                <button
                  key={item.code}
                  onClick={() => {
                    setLicenceInput(item.code);
                    handleVerifyLicence(item.code);
                  }}
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: '6px',
                    backgroundColor: '#F1F6FD',
                    border: '1px solid #C4DCFA',
                    color: '#3A74C2',
                    cursor: 'pointer',
                  }}
                >
                  {item.label} ({item.code})
                </button>
              ))}
            </div>
          </div>

          {licenceError && (
            <ErrorState
              title="Licence Verification Service Error"
              message={licenceError}
              apiEndpoint="/api/v1/verification/licence"
              onRetry={() => handleVerifyLicence()}
            />
          )}

          {isVerifyingLicence ? (
            <LoadingSkeleton type="detail" count={1} message="Searching e-Manak central licence repository..." />
          ) : licenceResult ? (
            <div
              className="card"
              style={{
                padding: '28px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #D6E4F8',
                borderRadius: '16px',
                boxShadow: '0 4px 14px rgba(30, 41, 59, 0.05)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                  borderBottom: '1px solid #E2EAF5',
                  paddingBottom: '16px',
                  marginBottom: '20px',
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', letterSpacing: '0.05em' }}>
                    BIS LICENCE NUMBER (CM/L)
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '2px' }}>
                    <span style={{ fontSize: '24px', fontWeight: 900, color: '#1D2B42' }}>
                      {licenceResult.licenceNo}
                    </span>
                    <button
                      onClick={() => handleCopy(licenceResult.licenceNo, 'licence')}
                      title="Copy Licence Number"
                      style={{
                        padding: '4px',
                        borderRadius: '6px',
                        border: '1px solid #D6E4F8',
                        backgroundColor: '#F8FAFD',
                        color: copiedField === 'licence' ? '#166534' : '#64748B',
                        cursor: 'pointer',
                      }}
                    >
                      {copiedField === 'licence' ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    backgroundColor: licenceResult.status === 'VERIFIED' ? '#DCFCE7' : licenceResult.status === 'EXPIRED' ? '#FEF3C7' : '#FEF2F2',
                    color: licenceResult.status === 'VERIFIED' ? '#166534' : licenceResult.status === 'EXPIRED' ? '#92400E' : '#DC2626',
                    fontSize: '12.5px',
                    fontWeight: 800,
                    border: '1px solid currentColor',
                  }}
                >
                  {licenceResult.status === 'VERIFIED' ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />}
                  STATUS: {licenceResult.status}
                </span>
              </div>

              {/* Required Outputs Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '18px',
                  marginBottom: '20px',
                }}
              >
                <div style={{ padding: '16px', backgroundColor: '#F8FAFD', borderRadius: '12px', border: '1px solid #E2EAF5' }}>
                  <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Licensee / Grantee
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#1D2B42', marginBottom: '4px' }}>
                    {licenceResult.licenseeName || 'Not available'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>
                    BIS Central Registry Grantee
                  </div>
                </div>

                <div style={{ padding: '16px', backgroundColor: '#F8FAFD', borderRadius: '12px', border: '1px solid #E2EAF5' }}>
                  <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Indian Standard (IS)
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#3A74C2', marginBottom: '4px' }}>
                    {licenceResult.isNumber || 'Not available'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#475569' }}>
                    Scheme: {licenceResult.scheme || 'Product Certification Scheme I (ISI)'}
                  </div>
                </div>

                <div style={{ padding: '16px', backgroundColor: '#F8FAFD', borderRadius: '12px', border: '1px solid #E2EAF5' }}>
                  <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Validity & Operative Status
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#166534', marginBottom: '4px' }}>
                    Valid Till: {licenceResult.validTill || 'Not available'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#475569' }}>
                    Registry Status: <strong>{licenceResult.status}</strong>
                  </div>
                </div>

                <div style={{ padding: '16px', backgroundColor: '#F8FAFD', borderRadius: '12px', border: '1px solid #E2EAF5' }}>
                  <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Registry Source & Notes
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#1D2B42', marginBottom: '4px' }}>
                    {licenceResult.officialSource || 'Bureau of Indian Standards'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>
                    {licenceResult.certificationDetails || 'Verified against BIS e-portal database'}
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #EDF3FB', paddingTop: '12px', fontSize: '12px', color: '#64748B', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Official Source: <strong>{licenceResult.officialSource || 'Not available'}</strong></span>
                <span>Verified: {licenceResult.verifiedAt || licenceResult.retrievedAt || 'Not available'}</span>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={Award}
              title="Enter a CM/L licence number to begin verification"
              description="Check the validity and authorized scope of any ISI marked consumer or industrial product."
              actionText="Load Sample CM/L-7200142981"
              onAction={() => {
                setLicenceInput('CM/L-7200142981');
                handleVerifyLicence('CM/L-7200142981');
              }}
            />
          )}
        </div>
      )}

      {/* ==================================================
          TAB 3: CRS / R-NUMBER VERIFICATION
          ================================================== */}
      {activeTab === 'crs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card" style={{ padding: '24px', backgroundColor: '#FFFFFF', border: '1px solid #D6E4F8', borderRadius: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Cpu size={20} color="#3A74C2" />
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#1D2B42' }}>
                Verify Compulsory Registration (CRS R-Number)
              </h3>
            </div>
            <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '16px' }}>
              Electronic devices (power banks, adapters, smartphones, laptops) carry a unique R-number under MeitY compulsory regulations:
            </p>

            <div style={{ display: 'flex', gap: '10px', maxWidth: '580px', marginBottom: '16px' }}>
              <input
                type="text"
                placeholder="e.g. R-41001234"
                value={crsInput}
                onChange={(e) => setCrsInput(e.target.value.toUpperCase())}
                style={{
                  flex: 1,
                  height: '46px',
                  padding: '0 16px',
                  fontSize: '15px',
                  fontWeight: 700,
                  border: '1.5px solid #D6E4F8',
                  borderRadius: '10px',
                  backgroundColor: '#F8FAFD',
                  color: '#1D2B42',
                }}
              />
              <button
                onClick={() => handleVerifyCrs()}
                disabled={isVerifyingCrs || !crsInput.trim()}
                className="btn btn-primary"
                style={{ height: '46px', padding: '0 24px', fontSize: '14px', borderRadius: '10px' }}
              >
                <Search size={16} />
                {isVerifyingCrs ? 'Checking...' : 'Verify R-Number'}
              </button>
            </div>

            {/* Quick Sample Preloads */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Sample R-Numbers:</span>
              {[
                { label: 'Power Banks', code: 'R-41001234' },
                { label: 'LED Drivers', code: 'R-41029876' },
                { label: 'Smartphones', code: 'R-85002134' },
              ].map((item) => (
                <button
                  key={item.code}
                  onClick={() => {
                    setCrsInput(item.code);
                    handleVerifyCrs(item.code);
                  }}
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: '6px',
                    backgroundColor: '#F1F6FD',
                    border: '1px solid #C4DCFA',
                    color: '#3A74C2',
                    cursor: 'pointer',
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {crsError && (
            <ErrorState
              title="CRS Registration Verification Error"
              message={crsError}
              apiEndpoint="/api/v1/verification/r-number"
              onRetry={() => handleVerifyCrs()}
            />
          )}

          {isVerifyingCrs ? (
            <LoadingSkeleton type="detail" count={1} message="Checking MeitY-BIS Compulsory Registration Portal..." />
          ) : crsResult ? (
            <div
              className="card"
              style={{
                padding: '28px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #D6E4F8',
                borderRadius: '16px',
                boxShadow: '0 4px 14px rgba(30, 41, 59, 0.05)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                  borderBottom: '1px solid #E2EAF5',
                  paddingBottom: '16px',
                  marginBottom: '20px',
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', letterSpacing: '0.05em' }}>
                    COMPULSORY REGISTRATION NUMBER (CRS)
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '2px' }}>
                    <span style={{ fontSize: '24px', fontWeight: 900, color: '#1D2B42' }}>
                      {crsResult.rNumber}
                    </span>
                    <button
                      onClick={() => handleCopy(crsResult.rNumber, 'crs')}
                      title="Copy R-Number"
                      style={{
                        padding: '4px',
                        borderRadius: '6px',
                        border: '1px solid #D6E4F8',
                        backgroundColor: '#F8FAFD',
                        color: copiedField === 'crs' ? '#166534' : '#64748B',
                        cursor: 'pointer',
                      }}
                    >
                      {copiedField === 'crs' ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    backgroundColor: crsResult.status === 'VERIFIED' ? '#DCFCE7' : '#FEE2E2',
                    color: crsResult.status === 'VERIFIED' ? '#166534' : '#991B1B',
                    fontSize: '12.5px',
                    fontWeight: 800,
                    border: '1px solid currentColor',
                  }}
                >
                  {crsResult.status === 'VERIFIED' ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />}
                  STATUS: {crsResult.status}
                </span>
              </div>

              {/* Required Outputs Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '18px',
                  marginBottom: '20px',
                }}
              >
                <div style={{ padding: '16px', backgroundColor: '#F8FAFD', borderRadius: '12px', border: '1px solid #E2EAF5' }}>
                  <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Brand / Manufacturer
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#1D2B42', marginBottom: '4px' }}>
                    {crsResult.companyName || 'Not available'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>
                    Registered Brand Name
                  </div>
                </div>

                <div style={{ padding: '16px', backgroundColor: '#F8FAFD', borderRadius: '12px', border: '1px solid #E2EAF5' }}>
                  <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Product Category
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#3A74C2', marginBottom: '4px' }}>
                    {crsResult.productCategory || 'Not available'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>
                    CRS Notified Electronics Category
                  </div>
                </div>

                <div style={{ padding: '16px', backgroundColor: '#F8FAFD', borderRadius: '12px', border: '1px solid #E2EAF5' }}>
                  <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Indian Standard (IS)
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#1D2B42', marginBottom: '4px' }}>
                    {crsResult.isStandard || 'Not available'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#475569' }}>
                    Compulsory Registration Scheme Standard
                  </div>
                </div>

                <div style={{ padding: '16px', backgroundColor: '#F8FAFD', borderRadius: '12px', border: '1px solid #E2EAF5' }}>
                  <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Registry Source & Notes
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#1D2B42', marginBottom: '4px' }}>
                    {crsResult.officialSource || 'Bureau of Indian Standards'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>
                    {crsResult.registrationDetails || 'Verified via central CRS e-portal'}
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #EDF3FB', paddingTop: '12px', fontSize: '12px', color: '#64748B', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Official Source: <strong>{crsResult.officialSource || 'Not available'}</strong></span>
                <span>Verified: {crsResult.verifiedAt || crsResult.retrievedAt || 'Not available'}</span>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={Cpu}
              title="Enter an R-number to begin verification"
              description="Verify electronic and IT equipment registration status under the MeitY-BIS Compulsory Registration Scheme."
              actionText="Load Sample R-41001234"
              onAction={() => {
                setCrsInput('R-41001234');
                handleVerifyCrs('R-41001234');
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};
