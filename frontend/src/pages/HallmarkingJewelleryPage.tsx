import React, { useState, useEffect, useRef } from 'react';
import {
  Gem,
  Search,
  Camera,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  ChevronLeft,
  Calculator,
} from 'lucide-react';
import { NavRoute, NavigationPayload, HallmarkingCentre } from '../types';
import { hallmarkingService } from '../services/hallmarkingService';
import { jewelleryApi } from '../api/jewellery';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { SegmentedControl } from '../components/common/SegmentedControl';

interface HallmarkingJewelleryPageProps {
  initialSubFeature?: 'centres' | 'scanner' | 'purity' | 'huid' | 'assay' | 'jewellers';
  onNavigate: (route: NavRoute, payload?: NavigationPayload) => void;
}

export const HallmarkingJewelleryPage: React.FC<HallmarkingJewelleryPageProps> = ({
  initialSubFeature = 'centres',
  onNavigate,
}) => {
  const mapInitialTab = (): 'centres' | 'scanner' | 'purity' => {
    if (initialSubFeature === 'scanner') return 'scanner';
    if (initialSubFeature === 'purity') return 'purity';
    return 'centres';
  };

  const [activeTab, setActiveTab] = useState<'centres' | 'scanner' | 'purity'>(mapInitialTab());

  // ==========================================
  // 1. Hallmarking Centre Finder State (Backend-Powered)
  // ==========================================
  const [ahcSearchQuery, setAhcSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('ALL');
  const [selectedCity, setSelectedCity] = useState('');
  const [ahcs, setAhcs] = useState<HallmarkingCentre[]>([]);
  const [isLoadingAhcs, setIsLoadingAhcs] = useState(true);
  const [ahcError, setAhcError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const states = ['ALL', 'Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Telangana', 'Rajasthan', 'West Bengal', 'Gujarat'];

  const fetchAhcs = async () => {
    setIsLoadingAhcs(true);
    setAhcError(null);
    try {
      const res = await hallmarkingService.getPaginatedAhcCentres({
        query: ahcSearchQuery,
        state: selectedState !== 'ALL' ? selectedState : undefined,
        city: selectedCity.trim() || undefined,
        page: currentPage,
        pageSize: 20,
      });
      setAhcs(res.items);
      setTotalPages(res.totalPages);
      setTotalItems(res.totalItems);
    } catch (err: unknown) {
      setAhcError(err instanceof Error ? err.message : 'Unable to connect to BIS Parakh hallmarking service.');
      setAhcs([]);
    } finally {
      setIsLoadingAhcs(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [ahcSearchQuery, selectedState, selectedCity]);

  useEffect(() => {
    fetchAhcs();
  }, [ahcSearchQuery, selectedState, selectedCity, currentPage]);

  // ==========================================
  // 2. Hallmark Scanner State (Backend Vision /jewellery/scan)
  // Strictly renders backend-provided facts without frontend fabrication (Problem 10)
  // ==========================================
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [scannerResult, setScannerResult] = useState<{
    detected_huid: string | null;
    detected_fineness: string | null;
    detected_bis_logo: boolean;
    confidence_score: number | null;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleScanFile = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setScannerError(`File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds the 10MB backend upload limit. Please upload an image under 10MB.`);
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setUploadedImage(previewUrl);
    setIsScanning(true);
    setScannerError(null);
    setScannerResult(null);

    try {
      const res = await jewelleryApi.scanJewelleryMarks(file);
      setScannerResult({
        detected_huid: res.detected_huid || null,
        detected_fineness: res.detected_fineness || null,
        detected_bis_logo: Boolean(res.detected_bis_logo),
        confidence_score: typeof res.confidence_score === 'number' ? Math.round(res.confidence_score * 100) : null,
      });
    } catch (err: unknown) {
      setScannerError(err instanceof Error ? err.message : 'Vision model processing failed. Please check image quality and try again.');
    } finally {
      setIsScanning(false);
    }
  };

  // ==========================================
  // 3. Purity Calculator State (Local per Section 15)
  // ==========================================
  const [karatValue, setKaratValue] = useState<number>(22);
  const [grossWeight, setGrossWeight] = useState<number>(10);

  const karatPurityTable: Record<number, { percent: number; fineness: string; desc: string }> = {
    24: { percent: 99.9, fineness: '999', desc: 'Standard Pure Gold (Bullion/Coins)' },
    23: { percent: 95.8, fineness: '958', desc: 'High Purity Jewellery' },
    22: { percent: 91.6, fineness: '916', desc: 'Traditional Indian Jewellery Standard' },
    20: { percent: 83.3, fineness: '833', desc: 'Hardened Studded Jewellery' },
    18: { percent: 75.0, fineness: '750', desc: 'Diamond & Gemstone Jewellery' },
    14: { percent: 58.5, fineness: '585', desc: 'Modern Everyday Wear' },
    9: { percent: 37.5, fineness: '375', desc: 'Affordable Lightweight Gold' },
  };

  const selectedPurity = karatPurityTable[karatValue] || karatPurityTable[22];
  const netPureGoldGrams = ((grossWeight * selectedPurity.percent) / 100).toFixed(3);
  const alloyWeightGrams = (grossWeight - parseFloat(netPureGoldGrams)).toFixed(3);

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
        <span style={{ color: '#1D2B42', fontWeight: 700 }}>Hallmarking & Jewellery</span>
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
            <Gem size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#1D2B42' }}>
              BIS Parakh — Hallmarking & Jewellery
            </h1>
            <p style={{ fontSize: '13px', color: '#64748B' }}>
              Locate recognized Assaying & Hallmarking Centres (AHC), scan jewellery hallmarks for HUID detection, and calculate exact gold purity per IS 1417.
            </p>
          </div>
        </div>

        {/* Pill / Segmented Control Bar (Per Section 1, 2, and 8) */}
        <div
          style={{
            marginTop: '16px',
            borderTop: '1px solid #E2EAF5',
            paddingTop: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <SegmentedControl<'centres' | 'scanner' | 'purity'>
            items={[
              {
                id: 'centres',
                label: 'Hallmarking Centre Finder',
                number: 1,
                icon: MapPin,
              },
              {
                id: 'scanner',
                label: 'Hallmark Scanner',
                number: 2,
                icon: Camera,
              },
              {
                id: 'purity',
                label: 'Purity Calculator',
                number: 3,
                icon: Calculator,
                subtitle: 'IS 1417',
              },
            ]}
            activeId={activeTab}
            onChange={(id) => setActiveTab(id)}
          />

          {/* Secondary Action: Keep HUID verification action separate (Per Section 2 specification) */}
          <button
            onClick={() => onNavigate('/verify/huid')}
            style={{
              padding: '8px 16px',
              borderRadius: '9999px',
              fontSize: '12.5px',
              fontWeight: 700,
              backgroundColor: '#F1F6FD',
              color: '#3A74C2',
              border: '1px solid #C4DCFA',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#E2EDFC';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#F1F6FD';
            }}
          >
            <Gem size={14} />
            Verify HUID Code &rarr;
          </button>
        </div>
      </div>

      {/* ==================================================
          TAB 1: HALLMARKING CENTRE FINDER (Per Section 8)
          ================================================== */}
      {activeTab === 'centres' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Search & Filters */}
          <div
            className="card"
            style={{
              padding: '18px 20px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #D6E4F8',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <div style={{ position: 'relative', width: '100%' }}>
              <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#3A74C2' }} />
              <input
                type="text"
                placeholder="Search by centre name, city, AHC code, or street address..."
                value={ahcSearchQuery}
                onChange={(e) => setAhcSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  height: '44px',
                  paddingLeft: '44px',
                  paddingRight: '14px',
                  fontSize: '14px',
                  borderRadius: '10px',
                  border: '1px solid #C4DCFA',
                  backgroundColor: '#F8FAFD',
                  color: '#1D2B42',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#39527B' }}>State:</span>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  style={{
                    padding: '6px 10px',
                    fontSize: '12px',
                    borderRadius: '6px',
                    border: '1px solid #D6E4F8',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  {states.map((s) => (
                    <option key={s} value={s}>{s === 'ALL' ? 'All States' : s}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#39527B' }}>City:</span>
                <input
                  type="text"
                  placeholder="Filter city..."
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  style={{
                    padding: '6px 10px',
                    fontSize: '12px',
                    borderRadius: '6px',
                    border: '1px solid #D6E4F8',
                    backgroundColor: '#FFFFFF',
                    width: '140px',
                  }}
                />
              </div>

              <span style={{ fontSize: '12px', color: '#64748B', marginLeft: 'auto' }}>
                Showing <strong>{totalItems || ahcs.length}</strong> recognized centres
              </span>
            </div>
          </div>

          {/* Cards Grid */}
          {ahcError ? (
            <ErrorState
              title="Unable to Load Hallmarking Centres"
              message={ahcError}
              apiEndpoint="/api/v1/hallmarking/centres"
              onRetry={fetchAhcs}
            />
          ) : isLoadingAhcs ? (
            <LoadingSkeleton type="card" count={3} message="Loading Assaying & Hallmarking Centres..." />
          ) : ahcs.length === 0 ? (
            <EmptyState
              icon={Gem}
              title="No hallmarking centres found"
              description="No AHC facilities matched your current filter criteria."
              actionText="Reset Filters"
              onAction={() => {
                setAhcSearchQuery('');
                setSelectedState('ALL');
                setSelectedCity('');
                setCurrentPage(1);
              }}
            />
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
                {ahcs.map((ahc) => (
                  <div
                    key={ahc.id}
                    className="card"
                    style={{
                      padding: '22px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #D6E4F8',
                      borderRadius: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '14px',
                      boxShadow: '0 2px 6px rgba(30, 41, 59, 0.04)',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                        <span className="badge badge-sky">{ahc.code}</span>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: '12px',
                            backgroundColor: ahc.status === 'OPERATIONAL' ? '#DCFCE7' : '#FEF3C7',
                            color: ahc.status === 'OPERATIONAL' ? '#166534' : '#92400E',
                          }}
                        >
                          {ahc.status}
                        </span>
                      </div>

                      <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1D2B42', marginBottom: '6px' }}>
                        {ahc.name}
                      </h3>

                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '12.5px', color: '#475569', marginBottom: '8px' }}>
                        <MapPin size={15} style={{ color: '#3A74C2', flexShrink: 0, marginTop: '2px' }} />
                        <span>{ahc.address}</span>
                      </div>

                      <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '6px' }}>
                        City: <strong>{ahc.city}</strong> • State: <strong>{ahc.state}</strong>
                      </div>

                      {ahc.contact && (
                        <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '10px' }}>
                          Contact: {ahc.contact}
                        </div>
                      )}

                      {ahc.services && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {ahc.services.map((srv, idx) => (
                            <span
                              key={idx}
                              style={{
                                fontSize: '11px',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                backgroundColor: '#F1F6FD',
                                color: '#39527B',
                                fontWeight: 500,
                              }}
                            >
                              • {srv}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div style={{ borderTop: '1px solid #E2EAF5', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11.5px', color: '#64748B' }}>
                      <span>Capability: <strong>{ahc.metalCapability || 'Not available'}</strong></span>
                      <span>Valid: {ahc.validity || 'Active'}</span>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '8px',
                    padding: '12px 18px',
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #D6E4F8',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <span style={{ fontSize: '13px', color: '#64748B' }}>
                    Showing page <strong style={{ color: '#1D2B42' }}>{currentPage}</strong> of{' '}
                    <strong style={{ color: '#1D2B42' }}>{totalPages}</strong> ({totalItems} centres)
                  </span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '12px', opacity: currentPage <= 1 ? 0.5 : 1 }}
                    >
                      &larr; Previous
                    </button>
                    <button
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '12px', opacity: currentPage >= totalPages ? 0.5 : 1 }}
                    >
                      Next &rarr;
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ==================================================
          TAB 2: HALLMARK SCANNER (Per Section 8 & 17)
          ================================================== */}
      {activeTab === 'scanner' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Upload & Camera Section */}
          <div
            className="card"
            style={{
              padding: '28px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #D6E4F8',
              borderRadius: '16px',
              textAlign: 'center',
            }}
          >
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1D2B42', marginBottom: '6px' }}>
              Optical Hallmark & HUID Scanner
            </h3>
            <p style={{ fontSize: '13px', color: '#64748B', maxWidth: '600px', margin: '0 auto 20px', lineHeight: 1.5 }}>
              Upload an image or macro photograph of gold jewellery hallmarks to automatically extract the 6-character HUID, verify purity markings via backend neural vision (/jewellery/scan).
            </p>

            {/* Drop Zone Box */}
            <div
              style={{
                border: '2px dashed #3A74C2',
                backgroundColor: '#F8FAFD',
                borderRadius: '16px',
                padding: '36px 20px',
                maxWidth: '620px',
                margin: '0 auto 20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleScanFile(file);
                }}
              />
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: '#EAF2FE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#3A74C2',
                  marginBottom: '12px',
                }}
              >
                <Camera size={26} />
              </div>
              <div style={{ fontSize: '14.5px', fontWeight: 800, color: '#1D2B42', marginBottom: '4px' }}>
                Drag & drop jewellery photograph, or click to browse
              </div>
              <div style={{ fontSize: '12px', color: '#64748B' }}>
                Supports JPG, PNG, WEBP macro photographs of hallmark laser engravings
              </div>
            </div>

            {uploadedImage && (
              <div style={{ marginBottom: '16px' }}>
                <img
                  src={uploadedImage}
                  alt="Jewellery Preview"
                  style={{ maxHeight: '180px', borderRadius: '10px', border: '1px solid #D6E4F8', objectFit: 'contain' }}
                />
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-primary"
                style={{ height: '42px', padding: '0 20px', fontSize: '13px' }}
                disabled={isScanning}
              >
                <Camera size={15} />
                {isScanning ? 'Processing with Vision Model...' : 'Select Macro Photo to Scan'}
              </button>
            </div>
          </div>

          {scannerError && (
            <ErrorState
              title="Hallmark Vision Processing Error"
              message={scannerError}
              apiEndpoint="/api/v1/jewellery/scan"
              onRetry={() => fileInputRef.current?.click()}
            />
          )}

          {/* Analysis Results View (Per Section 8) */}
          {isScanning ? (
            <LoadingSkeleton type="detail" count={1} message="Applying OCR and neural mark detection to hallmark image..." />
          ) : scannerResult ? (
            <div
              className="card"
              style={{
                padding: '28px',
                backgroundColor: '#FFFFFF',
                border: '1.5px solid #3A74C2',
                borderRadius: '16px',
                boxShadow: '0 4px 14px rgba(58, 116, 194, 0.08)',
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
                  <span
                    className={scannerResult.detected_bis_logo || scannerResult.detected_huid || scannerResult.detected_fineness ? "badge badge-verified" : "badge badge-suspended"}
                    style={{ marginBottom: '4px' }}
                  >
                    {scannerResult.detected_bis_logo || scannerResult.detected_huid || scannerResult.detected_fineness ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
                    {scannerResult.detected_bis_logo || scannerResult.detected_huid || scannerResult.detected_fineness ? 'Optical Marks Detected' : 'No Hallmark Marks Detected'}
                  </span>
                  <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#1D2B42' }}>
                    Scanner Optical Detections
                  </h3>
                </div>

                {scannerResult.confidence_score !== null && (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>CONFIDENCE SCORE</div>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: '#166534' }}>
                      {scannerResult.confidence_score}%
                    </div>
                  </div>
                )}
              </div>

              {/* Backend Provided Scanner Facts Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                <div style={{ padding: '16px', backgroundColor: '#F8FAFD', borderRadius: '12px', border: '1px solid #E2EAF5' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Detected HUID
                  </div>
                  <div style={{ fontSize: '22px', fontWeight: 900, color: scannerResult.detected_huid ? '#3A74C2' : '#64748B', letterSpacing: '0.08em' }}>
                    {scannerResult.detected_huid || 'Not detected'}
                  </div>
                  {scannerResult.detected_huid && (
                    <button
                      onClick={() => onNavigate('/verify/huid')}
                      style={{ marginTop: '6px', fontSize: '12px', color: '#3A74C2', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Verify HUID in Central Database &rarr;
                    </button>
                  )}
                </div>

                <div style={{ padding: '16px', backgroundColor: '#F8FAFD', borderRadius: '12px', border: '1px solid #E2EAF5' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Detected Fineness
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: scannerResult.detected_fineness ? '#B45309' : '#64748B' }}>
                    {scannerResult.detected_fineness || 'Not detected'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>
                    Raw Fineness Mark (from neural detector)
                  </div>
                </div>

                <div style={{ padding: '16px', backgroundColor: '#F8FAFD', borderRadius: '12px', border: '1px solid #E2EAF5' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                    BIS Logo Detection
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <div style={{ fontSize: '13px', color: scannerResult.detected_bis_logo ? '#166534' : '#64748B', fontWeight: 700 }}>
                      {scannerResult.detected_bis_logo ? '✓ BIS Standard Triangular Mark: Detected' : '✗ BIS Standard Triangular Mark: Not detected'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Informational Guidance */}
              <div style={{ padding: '14px 16px', backgroundColor: '#F0F9FF', borderRadius: '10px', border: '1px solid #BAE6FD', fontSize: '13px', color: '#0369A1', lineHeight: 1.5 }}>
                <strong>Verification Guidance:</strong> Visual marks detected above reflect optical detection model output. An authoritative confirmation of authenticity requires verifying the 6-digit HUID in the Central BIS Hallmarking Database.
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* ==================================================
          TAB 3: PURITY CALCULATOR (Per Section 15)
          ================================================== */}
      {activeTab === 'purity' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
              gap: '20px',
            }}
          >
            {/* Calculator Controls */}
            <div className="card" style={{ padding: '24px', backgroundColor: '#FFFFFF', border: '1px solid #D6E4F8', borderRadius: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Calculator size={20} color="#3A74C2" />
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#1D2B42' }}>
                  Gold Purity Calculator (IS 1417)
                </h3>
              </div>
              <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '20px' }}>
                Calculate net gold purity percentage and pure gold weight across statutory hallmarking karat grades:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Karat Input */}
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#2A3C5B', marginBottom: '6px' }}>
                    Select Karat Grade:
                  </label>
                  <select
                    value={karatValue}
                    onChange={(e) => setKaratValue(parseInt(e.target.value))}
                    style={{
                      width: '100%',
                      height: '42px',
                      padding: '0 12px',
                      fontSize: '14px',
                      fontWeight: 700,
                      borderRadius: '8px',
                      border: '1px solid #D6E4F8',
                      backgroundColor: '#F8FAFD',
                      color: '#1D2B42',
                    }}
                  >
                    <option value={24}>24 Karat (999 fineness) — 99.9% Pure</option>
                    <option value={23}>23 Karat (958 fineness) — 95.8% Pure</option>
                    <option value={22}>22 Karat (916 fineness) — 91.6% Pure</option>
                    <option value={20}>20 Karat (833 fineness) — 83.3% Pure</option>
                    <option value={18}>18 Karat (750 fineness) — 75.0% Pure</option>
                    <option value={14}>14 Karat (585 fineness) — 58.5% Pure</option>
                    <option value={9}>9 Karat (375 fineness) — 37.5% Pure</option>
                  </select>
                </div>

                {/* Weight Input */}
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#2A3C5B', marginBottom: '6px' }}>
                    Gross Jewellery Weight (Grams):
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.01"
                    value={grossWeight}
                    onChange={(e) => setGrossWeight(parseFloat(e.target.value) || 0)}
                    style={{
                      width: '100%',
                      height: '42px',
                      padding: '0 12px',
                      fontSize: '15px',
                      fontWeight: 700,
                      borderRadius: '8px',
                      border: '1px solid #D6E4F8',
                      backgroundColor: '#F8FAFD',
                      color: '#1D2B42',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Calculated Output Box (Per Section 15) */}
            <div
              className="card"
              style={{
                padding: '24px',
                backgroundColor: '#FFFFFF',
                border: '1.5px solid #C4DCFA',
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  PURITY PERCENTAGE OUTPUT
                </div>
                <div style={{ fontSize: '32px', fontWeight: 900, color: '#B45309', margin: '6px 0 2px' }}>
                  {karatValue}K → {selectedPurity.percent}%
                </div>
                <div style={{ fontSize: '13px', color: '#64748B', marginBottom: '16px' }}>
                  Fineness: <strong>{selectedPurity.fineness} parts per 1000</strong> ({selectedPurity.desc})
                </div>

                <div style={{ padding: '16px', backgroundColor: '#F8FAFD', borderRadius: '12px', border: '1px solid #E2EAF5' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', color: '#475569' }}>Calculated Net Pure Gold:</span>
                    <strong style={{ fontSize: '15px', color: '#166534' }}>{netPureGoldGrams} grams</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '13px', color: '#475569' }}>Alloy Metal (Copper/Silver):</span>
                    <strong style={{ fontSize: '14px', color: '#64748B' }}>{alloyWeightGrams} grams</strong>
                  </div>
                </div>
              </div>

              {/* Informational static bullion benchmark note */}
              <div style={{ borderTop: '1px solid #EDF3FB', paddingTop: '12px', marginTop: '16px', fontSize: '11.5px', color: '#64748B' }}>
                Note: Purity percentage calculation is mathematical and statutory per IS 1417 : 2016. Does not depend on live bullion spot market pricing.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
