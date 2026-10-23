import React, { useState } from 'react';
import {
  Split,
  Search,
  CheckCircle2,
  BookOpen,
  Award,
  Scale,
  Sparkles,
  ChevronLeft,
  ArrowRight,
  Layers,
  RotateCcw,
} from 'lucide-react';
import { NavRoute, NavigationPayload, ProductMatchResult } from '../types';
import { standardsService } from '../services/standardsService';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorState } from '../components/common/ErrorState';
import { RejectedAlternative } from '../types/api';

interface ProductToStandardPageProps {
  onNavigate: (route: NavRoute, payload?: NavigationPayload) => void;
}

export const ProductToStandardPage: React.FC<ProductToStandardPageProps> = ({
  onNavigate,
}) => {
  const [productName, setProductName] = useState('Stainless Steel Vacuum Insulated Water Bottle');
  const [productCategory, setProductCategory] = useState('Consumer Utensils / Food Contact');
  const [description, setDescription] = useState(
    'Double-walled vacuum insulated flask manufactured from grade 304 stainless steel with a silicone sealing ring, intended for domestic potable beverage storage.'
  );
  const [optionalKeywords, setOptionalKeywords] = useState('vacuum flask, thermal retention, drop test, SS 304');

  const [matchingResults, setMatchingResults] = useState<ProductMatchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const presets = [
    {
      name: 'Stainless Steel Water Bottle',
      category: 'Consumer Utensils',
      desc: 'Double-walled vacuum insulated bottle manufactured from grade 304 stainless steel with silicone seal.',
      keywords: 'insulated, vacuum flask, SS 304',
    },
    {
      name: 'Wooden Educational Puzzle Toy',
      category: 'Child Safety & Toys',
      desc: 'Wooden building blocks and shape sorter puzzle for children aged 18 to 36 months coated with water-based non-toxic paint.',
      keywords: 'toys, small parts, lead migration',
    },
    {
      name: 'Packaged Drinking Water (1L)',
      category: 'Food & Beverages',
      desc: 'Purified drinking water packaged in sealed food-grade PET bottles treated by reverse osmosis and ozonation.',
      keywords: 'packaged water, bottle, ozonation',
    },
    {
      name: 'Rechargeable 10000mAh Power Bank',
      category: 'Electronics & IT Goods',
      desc: 'Portable secondary lithium-ion battery pack with USB-C power delivery for smartphone recharging.',
      keywords: 'lithium battery, power bank, CRS',
    },
    {
      name: '3-Pin Domestic 16A Socket & Plug',
      category: 'Electrical Accessories',
      desc: 'Flush mounting wall socket-outlet with safety shutters and heavy duty 16A rated plug top.',
      keywords: 'plug, socket, safety shutter',
    },
  ];

  const handleApplyPreset = (preset: typeof presets[0]) => {
    setProductName(preset.name);
    setProductCategory(preset.category);
    setDescription(preset.desc);
    setOptionalKeywords(preset.keywords);
  };

  const handleFindStandards = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!description.trim() && !productName.trim()) return;

    setIsSearching(true);
    setHasSearched(true);
    setSearchError(null);
    try {
      const results = await standardsService.matchProductToStandards(
        `${productName} ${description}`,
        productCategory,
        optionalKeywords
      );
      setMatchingResults(results);
    } catch (err: unknown) {
      setSearchError(err instanceof Error ? err.message : 'Failed to map product to standards via Parakh backend.');
      setMatchingResults([]);
    } finally {
      setIsSearching(false);
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
        <span style={{ color: '#1D2B42', fontWeight: 700 }}>Find Applicable Standards</span>
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
            <Split size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#1D2B42' }}>
              Product → Standard Discovery
            </h1>
            <p style={{ fontSize: '13px', color: '#64748B' }}>
              Find applicable Indian Standards (IS), mandatory Quality Control Orders (QCO), and required certification schemes for your product.
            </p>
          </div>
        </div>

        {/* Preset Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '16px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#39527B' }}>Quick Fill Presets:</span>
          {presets.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(p)}
              style={{
                fontSize: '12px',
                fontWeight: 600,
                padding: '4px 12px',
                borderRadius: '16px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #C4DCFA',
                color: '#3A74C2',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#EAF2FE';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
              }}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Two-Column Layout: Form & Results */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
          gap: '20px',
        }}
      >
        {/* Left Column: Input Form (Per Section 4) */}
        <div
          className="card"
          style={{
            padding: '24px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #D6E4F8',
            borderRadius: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Sparkles size={18} color="#3A74C2" />
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1D2B42' }}>
              Product Parameters
            </h3>
          </div>

          <form onSubmit={handleFindStandards} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Product Name */}
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#2A3C5B', marginBottom: '6px' }}>
                Product Name: <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Stainless Steel Vacuum Water Bottle"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                required
                style={{
                  width: '100%',
                  height: '42px',
                  padding: '0 14px',
                  fontSize: '13.5px',
                  borderRadius: '8px',
                  border: '1px solid #D6E4F8',
                  backgroundColor: '#F8FAFD',
                  color: '#1D2B42',
                }}
              />
            </div>

            {/* Product Category */}
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#2A3C5B', marginBottom: '6px' }}>
                Product Category / Sector:
              </label>
              <input
                type="text"
                placeholder="e.g. Consumer Utensils / Food Contact"
                value={productCategory}
                onChange={(e) => setProductCategory(e.target.value)}
                style={{
                  width: '100%',
                  height: '42px',
                  padding: '0 14px',
                  fontSize: '13.5px',
                  borderRadius: '8px',
                  border: '1px solid #D6E4F8',
                  backgroundColor: '#F8FAFD',
                  color: '#1D2B42',
                }}
              />
            </div>

            {/* Description */}
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#2A3C5B', marginBottom: '6px' }}>
                Description (Materials, Features, Intended Use): <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <textarea
                rows={4}
                placeholder="Describe product materials, construction, intended consumer or industrial application..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  fontSize: '13px',
                  lineHeight: 1.5,
                  borderRadius: '8px',
                  border: '1px solid #D6E4F8',
                  backgroundColor: '#F8FAFD',
                  color: '#1D2B42',
                  resize: 'vertical',
                }}
              />
            </div>

            {/* Optional Keywords */}
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#2A3C5B', marginBottom: '6px' }}>
                Optional Keywords:
              </label>
              <input
                type="text"
                placeholder="e.g. insulated, vacuum, thermal, SS 304"
                value={optionalKeywords}
                onChange={(e) => setOptionalKeywords(e.target.value)}
                style={{
                  width: '100%',
                  height: '42px',
                  padding: '0 14px',
                  fontSize: '13.5px',
                  borderRadius: '8px',
                  border: '1px solid #D6E4F8',
                  backgroundColor: '#F8FAFD',
                  color: '#1D2B42',
                }}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSearching || !productName.trim()}
              className="btn btn-primary"
              style={{
                height: '46px',
                fontSize: '14px',
                fontWeight: 700,
                borderRadius: '10px',
                marginTop: '6px',
              }}
            >
              <Search size={16} />
              {isSearching ? 'Analyzing Standards Catalogue...' : 'Find Applicable Standards'}
            </button>
          </form>
        </div>

        {/* Right Column: Matching Standards Output */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {searchError && (
            <ErrorState
              title="Product Mapping Error"
              message={searchError}
              apiEndpoint="/api/v1/certification/map-product"
              onRetry={() => handleFindStandards()}
            />
          )}

          {isSearching ? (
            <LoadingSkeleton type="card" count={2} message="Extracting attributes and querying Indian Standards registry..." />
          ) : matchingResults.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1D2B42' }}>
                  Matching Standards Identified ({matchingResults.length})
                </h3>
                <span style={{ fontSize: '12px', color: '#166534', fontWeight: 700 }}>
                  High Confidence Match
                </span>
              </div>

              {matchingResults.map((s, idx) => (
                <div
                  key={idx}
                  className="card"
                  style={{
                    padding: '24px',
                    backgroundColor: '#FFFFFF',
                    border: '1.5px solid #3A74C2',
                    borderRadius: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    boxShadow: '0 4px 14px rgba(58, 116, 194, 0.08)',
                  }}
                >
                  {/* Top Bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '18px', fontWeight: 900, color: '#3A74C2' }}>
                          {s.candidate_standard || s.isNumber}
                        </span>
                        {s.is_mandatory || s.qcoMandatory ? (
                          <span className="badge badge-danger">Mandatory QCO</span>
                        ) : (
                          <span className="badge badge-sky">Voluntary</span>
                        )}
                      </div>
                      <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#1D2B42', marginTop: '4px' }}>
                        {s.standard_title || s.title}
                      </h4>
                    </div>

                    {(s.confidence != null || s.relevance != null) && (
                      <span
                        style={{
                          padding: '4px 10px',
                          backgroundColor: '#DCFCE7',
                          color: '#166534',
                          fontWeight: 800,
                          fontSize: '12px',
                          borderRadius: '20px',
                          border: '1px solid #86EFAC',
                        }}
                      >
                        {s.relevance ?? Math.round((s.confidence ?? 0) * 100)}% Match
                      </span>
                    )}
                  </div>

                  {/* Relevance & Reasoning */}
                  <div style={{ padding: '12px 14px', backgroundColor: '#F8FAFD', borderRadius: '10px', border: '1px solid #E2EAF5', fontSize: '13px', color: '#334155' }}>
                    <strong>Reasoning:</strong> {s.reasoning || s.explanation || 'Identified based on product attributes and statutory standards catalog.'}
                  </div>

                  {/* Rejected Alternatives if provided by backend */}
                  {s.rejectedAlternatives && s.rejectedAlternatives.length > 0 && (
                    <div style={{ padding: '12px 14px', backgroundColor: '#FFF7ED', borderRadius: '10px', border: '1px solid #FED7AA', fontSize: '12.5px', color: '#9A3412' }}>
                      <strong style={{ display: 'block', marginBottom: '6px', color: '#C2410C' }}>
                        Evaluated & Rejected Alternatives:
                      </strong>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {s.rejectedAlternatives.map((alt: RejectedAlternative, aIdx: number) => (
                          <div key={aIdx}>
                            <span style={{ fontWeight: 700, color: '#9A3412' }}>
                              {alt.standard_code}:
                            </span>{' '}
                            <span>{alt.reason_rejected}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Applicable QCO & Certification Requirement */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                    <div style={{ padding: '12px', backgroundColor: '#FFFBEB', borderRadius: '8px', border: '1px solid #FDE68A' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: '#92400E', textTransform: 'uppercase' }}>
                        <Scale size={14} /> Applicable QCO Order
                      </div>
                      <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#78350F', marginTop: '4px' }}>
                        {s.applicable_qco || s.applicableQco || 'None / Not available'}
                      </div>
                    </div>

                    <div style={{ padding: '12px', backgroundColor: '#F0F9FF', borderRadius: '8px', border: '1px solid #BAE6FD' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: '#0369A1', textTransform: 'uppercase' }}>
                        <Award size={14} /> Certification Requirement
                      </div>
                      <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0C4A6E', marginTop: '4px' }}>
                        {s.certification_scheme || s.certificationRequirement || 'Not provided by backend'}
                      </div>
                    </div>
                  </div>

                  {/* Action CTAs */}
                  <div style={{ borderTop: '1px solid #EDF3FB', paddingTop: '12px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => onNavigate('/standards', s.candidate_standard || s.isNumber)}
                      className="btn btn-primary btn-sm"
                    >
                      Open Standard Detail &rarr;
                    </button>
                    <button
                      onClick={() => onNavigate('/certification', s.id || 'is-17526')}
                      className="btn btn-secondary btn-sm"
                    >
                      View Certification Guide
                    </button>
                    <button
                      onClick={() => onNavigate('/laboratories', { standard: s.isNumber })}
                      className="btn btn-secondary btn-sm"
                    >
                      Find Testing Labs
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              className="card"
              style={{
                padding: '36px 24px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #D6E4F8',
                borderRadius: '16px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '340px',
              }}
            >
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  backgroundColor: '#F0F6FE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#3A74C2',
                  marginBottom: '14px',
                }}
              >
                <Split size={26} />
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#1D2B42', marginBottom: '8px' }}>
                Discover Applicable Indian Standards
              </h3>
              <p style={{ fontSize: '13px', color: '#64748B', maxWidth: '380px', lineHeight: 1.5, marginBottom: '18px' }}>
                Enter product details on the left or select a quick-fill preset to see matching Indian Standards, applicable QCOs, and certification routes.
              </p>
              <button
                type="button"
                onClick={() => handleFindStandards()}
                className="btn btn-primary btn-sm"
              >
                Analyze Current Input &rarr;
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
