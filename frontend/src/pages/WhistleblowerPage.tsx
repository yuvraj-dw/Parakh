import React, { useState } from 'react';
import {
  ShieldAlert,
  ChevronLeft,
  Send,
  Search,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  FileText,
  MapPin,
  Building2,
  Lock,
  Eye,
  Info,
} from 'lucide-react';
import { NavRoute, NavigationPayload } from '../types';
import { IncidentType, WhistleblowerReportResponse, WhistleblowerDetailResponse } from '../types/api';
import { whistleblowerApi } from '../api/whistleblower';
import { ApiError } from '../api/client';
import { ErrorState } from '../components/common/ErrorState';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

interface WhistleblowerPageProps {
  onNavigate: (route: NavRoute, payload?: NavigationPayload) => void;
}

const INCIDENT_OPTIONS: { value: IncidentType; label: string; description: string }[] = [
  {
    value: 'COUNTERFEIT_ISI',
    label: 'Counterfeit ISI Mark',
    description: 'Unauthorized printing, forgery, or misuse of the ISI standard mark on non-certified products.',
  },
  {
    value: 'FAKE_HUID',
    label: 'Fake Hallmark / HUID',
    description: 'Fraudulent gold or silver hallmarking, falsified 6-digit HUID laser engraving, or unverified purity.',
  },
  {
    value: 'UNCERTIFIED_PRODUCT',
    label: 'Uncertified / QCO Violation',
    description: 'Import or retail sale of products under mandatory Quality Control Orders (QCO) without BIS licence.',
  },
  {
    value: 'LAB_REPORT_FRAUD',
    label: 'Lab Report Fraud',
    description: 'Falsified testing laboratory certificates, forged NABL/BIS test results, or manipulated parameters.',
  },
];

export const WhistleblowerPage: React.FC<WhistleblowerPageProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'FILE' | 'TRACK'>('FILE');

  // Submission Form State
  const [incidentType, setIncidentType] = useState<IncidentType>('COUNTERFEIT_ISI');
  const [suspectEntity, setSuspectEntity] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState<WhistleblowerReportResponse | null>(null);
  const [hasCopiedCode, setHasCopiedCode] = useState(false);

  // Tracking Form State
  const [trackingCodeInput, setTrackingCodeInput] = useState('');
  const [isTracking, setIsTracking] = useState(false);
  const [trackError, setTrackError] = useState<string | null>(null);
  const [trackedReport, setTrackedReport] = useState<WhistleblowerDetailResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suspectEntity.trim() || !location.trim() || !description.trim()) {
      setSubmissionError('Please provide suspect entity name, location, and violation description.');
      return;
    }

    setIsSubmitting(true);
    setSubmissionError(null);
    setSubmissionSuccess(null);

    try {
      const response = await whistleblowerApi.submitReport({
        incident_type: incidentType,
        suspect_entity: suspectEntity.trim(),
        location: location.trim(),
        description: description.trim(),
        image_url: imageUrl.trim() || null,
      });

      // Authoritative backend response: tracking code and status come strictly from backend
      setSubmissionSuccess(response);
    } catch (err: unknown) {
      setSubmissionError(
        err instanceof Error ? err.message : 'Failed to submit whistleblower report to Parakh backend. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTrack = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = trackingCodeInput.trim();
    if (!code) {
      setTrackError('Please enter a valid tracking code.');
      return;
    }

    setIsTracking(true);
    setTrackError(null);
    setTrackedReport(null);

    try {
      const report = await whistleblowerApi.trackReport(code);
      setTrackedReport(report);
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 404) {
        setTrackError(`No whistleblower report found matching tracking code "${code}". Please verify the code.`);
      } else {
        setTrackError(err instanceof Error ? err.message : 'Unable to retrieve report status from Parakh backend.');
      }
    } finally {
      setIsTracking(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setHasCopiedCode(true);
    setTimeout(() => setHasCopiedCode(false), 2000);
  };

  const handleResetForm = () => {
    setSuspectEntity('');
    setLocation('');
    setDescription('');
    setImageUrl('');
    setSubmissionSuccess(null);
    setSubmissionError(null);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
        <span style={{ color: '#1D2B42', fontWeight: 700 }}>Whistleblower Grievance Portal</span>
      </div>

      {/* Header Banner */}
      <div
        className="card"
        style={{
          padding: '28px',
          background: 'linear-gradient(180deg, #F0F6FE 0%, #FFFFFF 100%)',
          border: '1px solid #D6E4F8',
          borderRadius: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: '#FEF2F2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#DC2626',
                border: '1px solid #FECACA',
              }}
            >
              <ShieldAlert size={26} />
            </div>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#1D2B42', margin: '0 0 4px' }}>
                BIS Whistleblower & Citizen Grievance Portal
              </h1>
              <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                Directly report counterfeit ISI marks, fake HUID hallmarking, uncertified products, or fraudulent lab reports.
              </p>
            </div>
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '20px',
              backgroundColor: '#EFF6FF',
              border: '1px solid #BFDBFE',
              color: '#1E40AF',
              fontSize: '12px',
              fontWeight: 700,
            }}
          >
            <Lock size={14} /> End-to-End Anonymous Reporting
          </div>
        </div>

        {/* Tab Toggle: File Report vs Track Report */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button
            onClick={() => setActiveTab('FILE')}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              border: activeTab === 'FILE' ? '1px solid #3A74C2' : '1px solid #D6E4F8',
              backgroundColor: activeTab === 'FILE' ? '#3A74C2' : '#FFFFFF',
              color: activeTab === 'FILE' ? '#FFFFFF' : '#475569',
              transition: 'all 0.15s ease',
            }}
          >
            File New Grievance
          </button>
          <button
            onClick={() => setActiveTab('TRACK')}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              border: activeTab === 'TRACK' ? '1px solid #3A74C2' : '1px solid #D6E4F8',
              backgroundColor: activeTab === 'TRACK' ? '#3A74C2' : '#FFFFFF',
              color: activeTab === 'TRACK' ? '#FFFFFF' : '#475569',
              transition: 'all 0.15s ease',
            }}
          >
            Track Existing Grievance
          </button>
        </div>
      </div>

      {/* ==================================================
          MODE 1: FILE NEW GRIEVANCE (POST /grievances/whistleblower)
          ================================================== */}
      {activeTab === 'FILE' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Submission Success Box (Backend Authoritative Response) */}
          {submissionSuccess ? (
            <div
              className="card"
              style={{
                padding: '28px',
                backgroundColor: '#F0FDF4',
                border: '1px solid #86EFAC',
                borderRadius: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <CheckCircle2 size={28} color="#166534" />
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#166534', margin: 0 }}>
                    Grievance Successfully Logged with BIS Enforcement
                  </h2>
                  <p style={{ fontSize: '13px', color: '#15803D', margin: '4px 0 0' }}>
                    {submissionSuccess.message || 'Your confidential grievance has been recorded in the central enforcement system.'}
                  </p>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid #BBF7D0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>
                      Authoritative Tracking Code
                    </span>
                    <div style={{ fontSize: '24px', fontWeight: 900, color: '#166534', letterSpacing: '0.5px' }}>
                      {submissionSuccess.tracking_code}
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy(submissionSuccess.tracking_code)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      backgroundColor: hasCopiedCode ? '#DCFCE7' : '#F8FAFC',
                      border: '1px solid #CBD5E1',
                      color: hasCopiedCode ? '#166534' : '#1E293B',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {hasCopiedCode ? <Check size={16} /> : <Copy size={16} />}
                    {hasCopiedCode ? 'Copied!' : 'Copy Tracking Code'}
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', paddingTop: '10px', borderTop: '1px solid #F1F5F9' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 700 }}>Backend Status</span>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#1D2B42' }}>
                      {submissionSuccess.status}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 700 }}>Incident Category</span>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#1D2B42' }}>
                      {submissionSuccess.incident_type}
                    </div>
                  </div>
                </div>

                <div style={{ padding: '12px', backgroundColor: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: '8px', fontSize: '12px', color: '#92400E' }}>
                  <strong>Important:</strong> Please store your tracking code securely. You can use it anytime on the "Track Existing Grievance" tab to review real-time investigation updates anonymously.
                </div>
              </div>

              <div style={{ marginTop: '18px', display: 'flex', gap: '10px' }}>
                <button
                  onClick={handleResetForm}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    backgroundColor: '#166534',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  File Another Grievance
                </button>
                <button
                  onClick={() => {
                    setTrackingCodeInput(submissionSuccess.tracking_code);
                    setActiveTab('TRACK');
                  }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    backgroundColor: '#FFFFFF',
                    color: '#166534',
                    fontSize: '13px',
                    fontWeight: 700,
                    border: '1px solid #86EFAC',
                    cursor: 'pointer',
                  }}
                >
                  Track This Report &rarr;
                </button>
              </div>
            </div>
          ) : (
            /* Submission Form */
            <form onSubmit={handleSubmit} className="card" style={{ padding: '28px', backgroundColor: '#FFFFFF', border: '1px solid #D6E4F8', borderRadius: '16px' }}>
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#1D2B42', margin: '0 0 6px' }}>
                  Confidential Grievance Submission Form
                </h3>
                <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                  All information submitted is routed directly to the BIS Enforcement Cell. Your identity is not recorded.
                </p>
              </div>

              {submissionError && (
                <div style={{ marginBottom: '20px' }}>
                  <ErrorState
                    title="Submission Failed"
                    message={submissionError}
                    apiEndpoint="/api/v1/grievances/whistleblower"
                    onRetry={() => setSubmissionError(null)}
                  />
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {/* 1. Incident Type */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#1D2B42', marginBottom: '8px' }}>
                    Incident Type <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                    {INCIDENT_OPTIONS.map((opt) => (
                      <div
                        key={opt.value}
                        onClick={() => setIncidentType(opt.value)}
                        style={{
                          padding: '12px 14px',
                          borderRadius: '10px',
                          border: incidentType === opt.value ? '2px solid #3A74C2' : '1px solid #E2E8F0',
                          backgroundColor: incidentType === opt.value ? '#F0F6FE' : '#F8FAFC',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ fontSize: '13px', fontWeight: 800, color: incidentType === opt.value ? '#3A74C2' : '#1D2B42', marginBottom: '4px' }}>
                          {opt.label}
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#64748B', lineHeight: 1.4 }}>
                          {opt.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Suspect Entity */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#1D2B42', marginBottom: '6px' }}>
                    Suspect Manufacturer / Firm / Jeweller Name <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={suspectEntity}
                    onChange={(e) => setSuspectEntity(e.target.value)}
                    placeholder="e.g. M/s Golden Jewellers / ABC Appliances Pvt Ltd"
                    required
                    style={{
                      width: '100%',
                      height: '42px',
                      padding: '0 14px',
                      borderRadius: '8px',
                      border: '1px solid #D6E4F8',
                      fontSize: '13.5px',
                      color: '#1D2B42',
                    }}
                  />
                </div>

                {/* 3. Location */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#1D2B42', marginBottom: '6px' }}>
                    Location / Address / Market <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Shop 42, Zaveri Bazaar, Mumbai, Maharashtra"
                    required
                    style={{
                      width: '100%',
                      height: '42px',
                      padding: '0 14px',
                      borderRadius: '8px',
                      border: '1px solid #D6E4F8',
                      fontSize: '13.5px',
                      color: '#1D2B42',
                    }}
                  />
                </div>

                {/* 4. Description */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#1D2B42', marginBottom: '6px' }}>
                    Detailed Violation Description <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    placeholder="Describe how the counterfeit ISI mark, unverified HUID, or non-compliant product was identified..."
                    required
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      border: '1px solid #D6E4F8',
                      fontSize: '13.5px',
                      color: '#1D2B42',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                    }}
                  />
                </div>

                {/* 5. Optional Evidence URL */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#1D2B42', marginBottom: '6px' }}>
                    Optional Photographic or Document Evidence URL <span style={{ color: '#64748B', fontWeight: 500 }}>(Optional)</span>
                  </label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/evidence-photo.jpg (Optional)"
                    style={{
                      width: '100%',
                      height: '42px',
                      padding: '0 14px',
                      borderRadius: '8px',
                      border: '1px solid #D6E4F8',
                      fontSize: '13.5px',
                      color: '#1D2B42',
                    }}
                  />
                  <span style={{ fontSize: '11.5px', color: '#64748B', marginTop: '4px', display: 'block' }}>
                    Leave blank if no online photo URL is available. Evidence submission is optional.
                  </span>
                </div>

                <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      backgroundColor: '#DC2626',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      fontWeight: 700,
                      border: 'none',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      opacity: isSubmitting ? 0.7 : 1,
                      boxShadow: '0 2px 4px rgba(220, 38, 38, 0.2)',
                    }}
                  >
                    <Send size={16} />
                    {isSubmitting ? 'Transmitting to BIS Central API...' : 'Submit Confidential Grievance'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      )}

      {/* ==================================================
          MODE 2: TRACK EXISTING GRIEVANCE (GET /grievances/whistleblower/{tracking_code})
          ================================================== */}
      {activeTab === 'TRACK' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <form
            onSubmit={handleTrack}
            className="card"
            style={{ padding: '24px', backgroundColor: '#FFFFFF', border: '1px solid #D6E4F8', borderRadius: '16px' }}
          >
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#1D2B42', margin: '0 0 6px' }}>
              Check Real-Time Grievance Status
            </h3>
            <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 16px' }}>
              Enter the unique BIS tracking code received upon grievance filing.
            </p>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input
                type="text"
                value={trackingCodeInput}
                onChange={(e) => setTrackingCodeInput(e.target.value)}
                placeholder="e.g. BIS-WH-2026-XXXXXX"
                style={{
                  flex: 1,
                  minWidth: '240px',
                  height: '42px',
                  padding: '0 14px',
                  borderRadius: '8px',
                  border: '1px solid #D6E4F8',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#1D2B42',
                }}
              />
              <button
                type="submit"
                disabled={isTracking}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '0 20px',
                  height: '42px',
                  borderRadius: '8px',
                  backgroundColor: '#3A74C2',
                  color: '#FFFFFF',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: isTracking ? 'not-allowed' : 'pointer',
                }}
              >
                <Search size={16} />
                {isTracking ? 'Searching...' : 'Track Grievance'}
              </button>
            </div>
          </form>

          {isTracking && (
            <LoadingSkeleton type="card" count={1} message="Querying BIS grievance registry..." />
          )}

          {trackError && (
            <ErrorState
              title="Grievance Query Unsuccessful"
              message={trackError}
              apiEndpoint={`/api/v1/grievances/whistleblower/${encodeURIComponent(trackingCodeInput)}`}
              onRetry={handleTrack}
            />
          )}

          {trackedReport && (
            <div
              className="card"
              style={{
                padding: '28px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #D6E4F8',
                borderRadius: '16px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>
                    BIS Whistleblower Record
                  </span>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: '#1D2B42' }}>
                    {trackedReport.tracking_code}
                  </div>
                </div>

                <div
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '12.5px',
                    fontWeight: 800,
                    backgroundColor: trackedReport.status === 'LOGGED' ? '#DCFCE7' : '#FEF3C7',
                    color: trackedReport.status === 'LOGGED' ? '#166534' : '#92400E',
                  }}
                >
                  Status: {trackedReport.status}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                <div style={{ padding: '14px', backgroundColor: '#F8FAFD', borderRadius: '10px', border: '1px solid #E2EAF5' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B' }}>Incident Type</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#1D2B42', marginTop: '2px' }}>
                    {trackedReport.incident_type}
                  </div>
                </div>

                <div style={{ padding: '14px', backgroundColor: '#F8FAFD', borderRadius: '10px', border: '1px solid #E2EAF5' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B' }}>Suspect Entity</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#1D2B42', marginTop: '2px' }}>
                    {trackedReport.suspect_entity}
                  </div>
                </div>

                <div style={{ padding: '14px', backgroundColor: '#F8FAFD', borderRadius: '10px', border: '1px solid #E2EAF5' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B' }}>Location</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#1D2B42', marginTop: '2px' }}>
                    {trackedReport.location}
                  </div>
                </div>

                <div style={{ padding: '14px', backgroundColor: '#F8FAFD', borderRadius: '10px', border: '1px solid #E2EAF5' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B' }}>Date Logged</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#1D2B42', marginTop: '2px' }}>
                    {trackedReport.created_at ? new Date(trackedReport.created_at).toLocaleString() : 'N/A'}
                  </div>
                </div>
              </div>

              {trackedReport.evidence_text && (
                <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0', marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    Report Description / Evidence Summary:
                  </div>
                  <div style={{ fontSize: '13.5px', color: '#1E293B', lineHeight: 1.5 }}>
                    {trackedReport.evidence_text}
                  </div>
                </div>
              )}

              {trackedReport.image_url && (
                <div style={{ fontSize: '12.5px', color: '#3A74C2' }}>
                  <strong>Attached Evidence URL:</strong>{' '}
                  <a href={trackedReport.image_url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>
                    {trackedReport.image_url}
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
