import React, { useState, useRef } from 'react';
import {
  FileSearch,
  Upload,
  ChevronLeft,
  FlaskConical,
} from 'lucide-react';
import { NavRoute, NavigationPayload } from '../types';
import { ApiError } from '../api/client';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { SegmentedControl } from '../components/common/SegmentedControl';
import { ErrorState } from '../components/common/ErrorState';
import { jewelleryApi } from '../api/jewellery';
import { AssayReportData } from '../types/api';

interface DocumentImageAnalysisPageProps {
  initialTab?: string;
  onNavigate: (route: NavRoute, payload?: NavigationPayload) => void;
}

export const DocumentImageAnalysisPage: React.FC<DocumentImageAnalysisPageProps> = ({
  onNavigate,
}) => {
  // Assay Report Explainer State (Connected to Parakh FastAPI Backend)
  const [isProcessingAssay, setIsProcessingAssay] = useState(false);
  const [assayError, setAssayError] = useState<string | null>(null);
  const [assayData, setAssayData] = useState<AssayReportData | null>(null);
  const [assayFileName, setAssayFileName] = useState<string | null>(null);

  const assayFileInputRef = useRef<HTMLInputElement>(null);

  // Real backend handler for Assay Report Explainer (POST /api/v1/jewellery/assay-report)
  const handleAssayFile = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setAssayError(`File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds the 10MB backend upload limit. Please upload a file under 10MB.`);
      return;
    }
    setIsProcessingAssay(true);
    setAssayError(null);
    setAssayFileName(file.name);
    try {
      const result = await jewelleryApi.parseAssayReport(file);
      setAssayData(result);
    } catch (err: unknown) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
          ? err.message
          : 'Failed to analyze assay report with Parakh AI service.';
      setAssayError(message);
      setAssayData(null);
    } finally {
      setIsProcessingAssay(false);
    }
  };

  const handleAssayInputFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleAssayFile(file);
    }
  };

  const handleTriggerSampleAssay = () => {
    const sampleBlob = new Blob(
      [
        'ASSAY CERTIFICATE\nCentre: AHC-DL-0012 Hallmarking Centre\nReport No: AR-2026/4482\nMetal: Gold (Au)\nReported Purity: 22K (916 Fineness)\nTest Date: 2026-09-20\nSample: 22K Gold Ring with Hallmarking'
      ],
      { type: 'text/plain' }
    );
    const sampleFile = new File([sampleBlob], 'sample_gold_assay_report.txt', { type: 'text/plain' });
    handleAssayFile(sampleFile);
  };

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
        <span style={{ color: '#1D2B42', fontWeight: 700 }}>Document & Image Lab</span>
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
            <FileSearch size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#1D2B42' }}>
              Document & Image Lab
            </h1>
            <p style={{ fontSize: '13px', color: '#64748B' }}>
              Analyze and explain metallurgical assay reports using the Parakh backend.
            </p>
          </div>
        </div>

        {/* Pill / Segmented Control Bar (Single Feature) */}
        <div style={{ marginTop: '16px', borderTop: '1px solid #E2EAF5', paddingTop: '16px' }}>
          <SegmentedControl<'assay'>
            items={[
              {
                id: 'assay',
                label: 'Assay Report Explainer',
                number: 1,
                icon: FlaskConical,
              },
            ]}
            activeId="assay"
            onChange={() => {}}
          />
        </div>
      </div>

      {/* ==================================================
          ASSAY REPORT EXPLAINER (Connected to Backend)
          ================================================== */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <input
          type="file"
          ref={assayFileInputRef}
          onChange={handleAssayInputFileChange}
          accept=".pdf,.png,.jpg,.jpeg,.txt"
          style={{ display: 'none' }}
        />

        <div className="card" style={{ padding: '24px', backgroundColor: '#FFFFFF', border: '1px solid #D6E4F8', borderRadius: '16px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '8px', padding: '4px 12px', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '20px', fontSize: '12px', color: '#166534', fontWeight: 700 }}>
            <FlaskConical size={14} /> Backend-Powered Metallurgical Parser (/api/v1/jewellery/assay-report)
          </div>
          <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#1D2B42', marginBottom: '6px' }}>
            Assay Report Explainer & Purity Decoder
          </h3>
          <p style={{ fontSize: '13px', color: '#64748B', maxWidth: '600px', margin: '0 auto 18px', lineHeight: 1.5 }}>
            Upload any laboratory gold assay certificate, fire assay test sheet, or cupellation report. The backend parser extracts certified parameters, validates legal limits per IS 1417, and produces a plain consumer explanation.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => assayFileInputRef.current?.click()}
              className="btn btn-primary"
              disabled={isProcessingAssay}
            >
              <Upload size={16} />
              Upload Assay Certificate (PDF / Image)
            </button>
            <button
              onClick={handleTriggerSampleAssay}
              className="btn btn-secondary"
              disabled={isProcessingAssay}
            >
              <FlaskConical size={16} />
              Load Sample Certificate (22K Gold)
            </button>
          </div>
        </div>

        {assayError && (
          <ErrorState
            title="Assay Report Parsing Error"
            message={assayError}
            apiEndpoint="/api/v1/jewellery/assay-report"
            onRetry={() => assayFileInputRef.current?.click()}
          />
        )}

        {isProcessingAssay ? (
          <LoadingSkeleton type="detail" count={1} message="Sending assay certificate to Parakh AI metallurgical service..." />
        ) : assayData ? (
          <div className="card" style={{ padding: '28px', backgroundColor: '#FFFFFF', border: '1.5px solid #3A74C2', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid #E2EAF5', paddingBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <span className="badge badge-sky">Certificate #{assayData.report_number}</span>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1D2B42', marginTop: '4px' }}>
                  Metal: {assayData.metal} • Certified Purity: <span style={{ color: '#B45309' }}>{assayData.reported_purity}</span>
                </h3>
              </div>
              <span className="badge badge-sky">OCR Extracted Data</span>
            </div>

            {/* Parsed Fields Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '20px' }}>
              <div style={{ padding: '14px', backgroundColor: '#F8FAFD', borderRadius: '10px', border: '1px solid #E2EAF5' }}>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Testing Centre / Lab</div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#1D2B42', marginTop: '3px' }}>
                  {assayData.centre_name || 'Not specified'}
                </div>
              </div>

              <div style={{ padding: '14px', backgroundColor: '#F8FAFD', borderRadius: '10px', border: '1px solid #E2EAF5' }}>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Report Number</div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#3A74C2', marginTop: '3px' }}>
                  {assayData.report_number || 'Not specified'}
                </div>
              </div>

              <div style={{ padding: '14px', backgroundColor: '#F8FAFD', borderRadius: '10px', border: '1px solid #E2EAF5' }}>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Sample Description</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#1D2B42', marginTop: '3px' }}>
                  {assayData.sample_description || 'Not specified'}
                </div>
              </div>

              <div style={{ padding: '14px', backgroundColor: '#F8FAFD', borderRadius: '10px', border: '1px solid #E2EAF5' }}>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Test Date</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#166534', marginTop: '3px' }}>
                  {assayData.test_date || 'Not specified'}
                </div>
              </div>
            </div>

            {/* Extracted Parameters Summary (Non-authoritative laboratory claim) */}
            <div style={{ padding: '16px 18px', backgroundColor: '#F8FAFD', borderRadius: '12px', border: '1px solid #E2EAF5', marginBottom: '16px' }}>
              <h4 style={{ fontSize: '13.5px', fontWeight: 800, color: '#1D2B42', marginBottom: '6px' }}>
                Extracted Report Summary
              </h4>
              <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6 }}>
                Backend OCR extracted certificate <strong>#{assayData.report_number || 'N/A'}</strong> from <strong>{assayData.centre_name || 'unspecified centre'}</strong> (test date: {assayData.test_date || 'N/A'}). Sample description: <em>{assayData.sample_description || 'N/A'}</em>, reported metal: <strong>{assayData.metal || 'N/A'}</strong>, reported purity: <strong>{assayData.reported_purity || 'N/A'}</strong>. (Note: Extraction reflects document text and does not constitute an independent laboratory verification).
              </p>
            </div>

            <div style={{ borderTop: '1px solid #EDF3FB', paddingTop: '12px', fontSize: '12px', color: '#64748B', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Source: <strong>Parakh Jewellery Backend API</strong></span>
              <span>File: {assayFileName || 'assay_certificate'}</span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
