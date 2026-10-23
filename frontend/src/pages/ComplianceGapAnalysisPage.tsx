import React, { useState } from 'react';
import {
  CheckSquare,
  ShieldAlert,
  ChevronLeft,
  Filter,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Sparkles,
  Info,
  BadgeAlert,
} from 'lucide-react';
import { NavRoute, NavigationPayload } from '../types';
import { MOCK_COMPLIANCE_PROFILES, ProductComplianceProfile } from '../data/compliance';

interface ComplianceGapAnalysisPageProps {
  onNavigate: (route: NavRoute, payload?: NavigationPayload) => void;
}

export const ComplianceGapAnalysisPage: React.FC<ComplianceGapAnalysisPageProps> = ({
  onNavigate,
}) => {
  const [selectedProfileId, setSelectedProfileId] = useState<string>('flask-ss');
  const [userComplianceStatus, setUserComplianceStatus] = useState<string>('PRE_AUDIT');

  const currentProfile: ProductComplianceProfile =
    MOCK_COMPLIANCE_PROFILES.find((p) => p.productId === selectedProfileId) ||
    MOCK_COMPLIANCE_PROFILES[0];

  const compliantCount = currentProfile.items.filter((i) => i.gapStatus === 'COMPLIANT').length;
  const gapCount = currentProfile.items.filter((i) => i.gapStatus === 'GAP_FOUND').length;
  const partialCount = currentProfile.items.filter((i) => i.gapStatus === 'PARTIAL').length;

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
        <span style={{ color: '#1D2B42', fontWeight: 700 }}>Compliance Gap Analysis</span>
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
            <CheckSquare size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#1D2B42' }}>
              Compliance Gap Analysis Engine
            </h1>
            <p style={{ fontSize: '13px', color: '#64748B' }}>
              Prototype demonstration: simulate factory documentation evaluation against standard clauses.
            </p>
          </div>
        </div>

        <div style={{ marginTop: '14px', padding: '12px 16px', backgroundColor: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: '10px', fontSize: '13px', color: '#92400E', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="badge badge-warning" style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 800 }}>Prototype / Demonstration Mode</span>
          <span>This is for demonstration and self-assessment only. It is not fetched from the live backend and does not represent live BIS evaluation data.</span>
        </div>
      </div>

      {/* Workflow Controls: Select Product, Applicable Standard, and Current Compliance Status (Per Section 13) */}
      <div
        className="card"
        style={{
          padding: '20px 24px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #D6E4F8',
          borderRadius: '14px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '16px',
        }}
      >
        {/* Product Selector */}
        <div>
          <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#2A3C5B', marginBottom: '6px' }}>
            Select Product Profile:
          </label>
          <select
            value={selectedProfileId}
            onChange={(e) => setSelectedProfileId(e.target.value)}
            style={{
              width: '100%',
              height: '40px',
              padding: '0 12px',
              fontSize: '13px',
              fontWeight: 600,
              borderRadius: '8px',
              border: '1px solid #D6E4F8',
              backgroundColor: '#F8FAFD',
              color: '#1D2B42',
            }}
          >
            {MOCK_COMPLIANCE_PROFILES.map((p) => (
              <option key={p.productId} value={p.productId}>
                {p.productName} ({p.standardNumber})
              </option>
            ))}
          </select>
        </div>

        {/* Applicable Standard (Auto-linked) */}
        <div>
          <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#2A3C5B', marginBottom: '6px' }}>
            Applicable Standard:
          </label>
          <div
            style={{
              height: '40px',
              padding: '0 12px',
              fontSize: '13.5px',
              fontWeight: 700,
              borderRadius: '8px',
              border: '1px solid #D6E4F8',
              backgroundColor: '#FFFFFF',
              color: '#3A74C2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>{currentProfile.standardNumber}</span>
            <button
              onClick={() => onNavigate('/standards', currentProfile.standardNumber)}
              style={{ fontSize: '11px', color: '#3A74C2', fontWeight: 700, cursor: 'pointer' }}
            >
              View Clauses &rarr;
            </button>
          </div>
        </div>

        {/* Current Compliance Status Selection */}
        <div>
          <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#2A3C5B', marginBottom: '6px' }}>
            Current Compliance Status:
          </label>
          <select
            value={userComplianceStatus}
            onChange={(e) => setUserComplianceStatus(e.target.value)}
            style={{
              width: '100%',
              height: '40px',
              padding: '0 12px',
              fontSize: '13px',
              fontWeight: 600,
              borderRadius: '8px',
              border: '1px solid #D6E4F8',
              backgroundColor: '#F8FAFD',
              color: '#1D2B42',
            }}
          >
            <option value="PRE_AUDIT">Pre-Audit Preparation Phase</option>
            <option value="APPLICATION_SUBMITTED">e-BIS Application Filed</option>
            <option value="AUDIT_SCHEDULED">Factory Audit Scheduled</option>
            <option value="RENEWAL">Annual Surveillance Renewal</option>
          </select>
        </div>
      </div>

      {/* ==================================================
          1. COMPLIANCE SUMMARY (Per Section 13)
          ================================================== */}
      <div
        className="card"
        style={{
          padding: '24px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #D6E4F8',
          borderRadius: '16px',
        }}
      >
        <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1D2B42', marginBottom: '16px' }}>
          Compliance Summary Overview
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>
          {/* Overall Status */}
          <div style={{ padding: '16px', backgroundColor: '#F8FAFD', borderRadius: '12px', borderLeft: '4px solid #3A74C2' }}>
            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
              Overall Readiness Status
            </div>
            <div style={{ fontSize: '18px', fontWeight: 900, color: '#1D2B42', marginTop: '4px' }}>
              {currentProfile.summary.overallStatus.replace(/_/g, ' ')}
            </div>
          </div>

          {/* Requirements Met */}
          <div style={{ padding: '16px', backgroundColor: '#F8FAFD', borderRadius: '12px', borderLeft: '4px solid #166534' }}>
            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
              Requirements Met
            </div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#166534', marginTop: '2px' }}>
              {compliantCount} <span style={{ fontSize: '14px', color: '#64748B' }}>/ {currentProfile.items.length}</span>
            </div>
          </div>

          {/* Requirements Pending / Gaps */}
          <div style={{ padding: '16px', backgroundColor: '#F8FAFD', borderRadius: '12px', borderLeft: '4px solid #DC2626' }}>
            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
              Gaps / Pending Action
            </div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#DC2626', marginTop: '2px' }}>
              {gapCount + partialCount}
            </div>
          </div>
        </div>

        {/* Missing Information Checklist */}
        <div style={{ padding: '16px', backgroundColor: '#FFFBEB', borderRadius: '12px', border: '1px solid #FDE68A' }}>
          <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#92400E', marginBottom: '6px' }}>
            Missing Information / Pending Evidence:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {currentProfile.summary.missingInformation.map((infoItem, idx) => (
              <div key={idx} style={{ fontSize: '12.5px', color: '#78350F' }}>
                • {infoItem}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ==================================================
          2. GAP ANALYSIS MATRIX (Per Section 13)
          ================================================== */}
      <div
        className="card"
        style={{
          padding: '24px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #D6E4F8',
          borderRadius: '16px',
        }}
      >
        <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1D2B42', marginBottom: '16px' }}>
          Clause-by-Clause Requirement Gap Analysis
        </h3>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Requirement & Clause</th>
                <th>Current Status</th>
                <th>Documentary Evidence Found</th>
                <th>Identified Gap</th>
                <th>Suggested Remedial Action</th>
                <th>Priority</th>
              </tr>
            </thead>
            <tbody>
              {currentProfile.items.map((item) => (
                <tr key={item.id}>
                  {/* Requirement */}
                  <td style={{ maxWidth: '220px' }}>
                    <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#3A74C2' }}>
                      {item.clause}
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#1D2B42', marginTop: '2px' }}>
                      {item.parameter}
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '4px' }}>
                      {item.bisRequirement}
                    </div>
                  </td>

                  {/* Current Status */}
                  <td>
                    {item.gapStatus === 'COMPLIANT' && (
                      <span className="badge badge-verified">COMPLIANT</span>
                    )}
                    {item.gapStatus === 'GAP_FOUND' && (
                      <span className="badge badge-danger">GAP FOUND</span>
                    )}
                    {item.gapStatus === 'PARTIAL' && (
                      <span className="badge badge-warning">PARTIAL</span>
                    )}
                  </td>

                  {/* Evidence */}
                  <td style={{ fontSize: '12px', color: '#334155', maxWidth: '200px' }}>
                    {item.evidenceFound}
                  </td>

                  {/* Gap */}
                  <td style={{ fontSize: '12px', color: item.gapStatus === 'COMPLIANT' ? '#166534' : '#991B1B', maxWidth: '180px' }}>
                    {item.gapStatus === 'COMPLIANT' ? 'None (Full compliance observed)' : item.evidenceFound.includes('missing') ? 'Documentation missing' : 'Action threshold unfulfilled'}
                  </td>

                  {/* Suggested Action */}
                  <td style={{ fontSize: '12px', color: '#1E293B', maxWidth: '220px', fontWeight: 500 }}>
                    {item.remedialAction}
                  </td>

                  {/* Priority */}
                  <td>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '10px',
                        fontSize: '11px',
                        fontWeight: 800,
                        backgroundColor: item.priority === 'HIGH' ? '#FEE2E2' : item.priority === 'MEDIUM' ? '#FEF3C7' : '#F1F5F9',
                        color: item.priority === 'HIGH' ? '#991B1B' : item.priority === 'MEDIUM' ? '#92400E' : '#475569',
                      }}
                    >
                      {item.priority || 'MEDIUM'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
