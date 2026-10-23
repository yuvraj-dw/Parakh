import React, { useState, useEffect } from 'react';
import {
  Search,
  BookOpen,
  ExternalLink,
  Award,
  ChevronLeft,
  FileText,
  Layers,
  Scale,
} from 'lucide-react';
import { IndianStandard, NavRoute, NavigationPayload } from '../types';
import { standardsService } from '../services/standardsService';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { SegmentedControl } from '../components/common/SegmentedControl';

interface StandardsExplorerPageProps {
  initialSearch?: string;
  subRoute?: string;
  onNavigate: (route: NavRoute, payload?: NavigationPayload) => void;
}

export const StandardsExplorerPage: React.FC<StandardsExplorerPageProps> = ({
  initialSearch = '',
  subRoute = 'search',
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'search' | 'detail' | 'clauses' | 'related'>(
    subRoute === 'clauses' ? 'clauses' : subRoute === 'detail' ? 'detail' : 'search'
  );

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const [standards, setStandards] = useState<IndianStandard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedStandard, setSelectedStandard] = useState<IndianStandard | null>(null);

  const statuses = ['ALL', 'ACTIVE', 'UNDER_REVISION', 'WITHDRAWN'];

  const fetchStandards = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await standardsService.getPaginatedStandards({
        q: searchQuery,
        status: selectedStatus,
        page: currentPage,
        pageSize: 20,
      });
      setStandards(res.items);
      setTotalPages(res.totalPages);
      setTotalItems(res.totalItems);
      if (res.items.length > 0 && !selectedStandard) {
        setSelectedStandard(res.items[0]);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to connect to BIS Parakh standards service.');
      setStandards([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatus]);

  useEffect(() => {
    fetchStandards();
  }, [searchQuery, selectedStatus, currentPage]);

  const handleSelectStandard = async (std: IndianStandard) => {
    setSelectedStandard(std);
    setActiveTab('detail');
    try {
      const live = await standardsService.getStandardById(std.isNumber);
      if (live) setSelectedStandard(live);
    } catch {
      // keep selected standard
    }
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
        <span style={{ color: '#1D2B42', fontWeight: 700 }}>Standards Explorer</span>
      </div>

      {/* Header Container */}
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
            <BookOpen size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#1D2B42' }}>
              Standards Explorer
            </h1>
            <p style={{ fontSize: '13.5px', color: '#64748B' }}>
              Search Indian Standards by IS number, title, keyword or category, inspect clauses, amendments, and regulatory mandates.
            </p>
          </div>
        </div>

        {/* Pill / Segmented Control Bar (Per Section 1) */}
        <div style={{ marginTop: '16px', borderTop: '1px solid #E2EAF5', paddingTop: '16px' }}>
          <SegmentedControl<'search' | 'detail' | 'clauses' | 'related'>
            items={[
              {
                id: 'search',
                label: 'Search & Filter',
                number: 1,
                icon: Search,
              },
              {
                id: 'detail',
                label: 'Standard Details',
                number: 2,
                icon: FileText,
                subtitle: selectedStandard ? selectedStandard.isNumber : undefined,
              },
              {
                id: 'clauses',
                label: 'Clause Inspection',
                number: 3,
                icon: BookOpen,
                subtitle: 'AI RAG Retrieval',
              },
              {
                id: 'related',
                label: 'Related & Amendments',
                number: 4,
                icon: Layers,
                subtitle: 'Advisory / Gazette',
              },
            ]}
            activeId={activeTab}
            onChange={(id) => setActiveTab(id)}
          />
        </div>
      </div>

      {/* ==================================================
          TAB 1: SEARCH & FILTERS
          ================================================== */}
      {activeTab === 'search' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Search Controls & Filters */}
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
            {/* Top Search Input */}
            <div style={{ position: 'relative', width: '100%' }}>
              <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#3A74C2' }} />
              <input
                type="text"
                placeholder="Search by IS number (e.g. IS 17526, IS 1417), title, keyword, or product (e.g. water bottle, toys, cement)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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

            {/* Filter Bar */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
              {/* Status */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#39527B' }}>Regulatory Status:</span>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  style={{
                    padding: '6px 10px',
                    fontSize: '12px',
                    borderRadius: '6px',
                    border: '1px solid #D6E4F8',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>{s === 'ALL' ? 'All Statuses' : s}</option>
                  ))}
                </select>
              </div>

              <div style={{ fontSize: '12px', color: '#64748B', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Backend Filter: <code style={{ backgroundColor: '#F1F5F9', padding: '2px 5px', borderRadius: '4px' }}>q={searchQuery || '*'}&status={selectedStatus}</code></span>
                <span>•</span>
                <span>Found <strong>{totalItems}</strong> standards</span>
              </div>
            </div>
          </div>

          {/* Results List */}
          {error ? (
            <ErrorState
              title="Unable to Load Standards"
              message={error}
              apiEndpoint="/api/v1/standards"
              onRetry={fetchStandards}
            />
          ) : isLoading ? (
            <LoadingSkeleton type="card" count={3} message="Connecting to BIS Standards repository..." />
          ) : standards.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No standards found"
              description="No Indian Standards matched your current search filters. Try adjusting keywords or category."
              actionText="Reset All Filters"
              onAction={() => {
                setSearchQuery('');
                setSelectedStatus('ALL');
                setCurrentPage(1);
              }}
            />
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
                {standards.map((s) => (
                  <div
                    key={s.id}
                    className="card"
                    style={{
                      padding: '20px',
                      backgroundColor: '#FFFFFF',
                      border: selectedStandard?.id === s.id ? '2px solid #3A74C2' : '1px solid #D6E4F8',
                      borderRadius: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '12px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '15px', fontWeight: 800, color: '#3A74C2' }}>
                          {s.isNumber}
                        </span>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {s.year && <span className="badge badge-sky">{s.year}</span>}
                          <span className="badge badge-verified">{s.status}</span>
                        </div>
                      </div>

                      <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#1D2B42', marginBottom: '6px', lineHeight: 1.35 }}>
                        {s.title}
                      </h3>

                      <p style={{ fontSize: '12.5px', color: '#475569', lineHeight: 1.5, marginBottom: '10px' }}>
                        {s.scope ? (s.scope.length > 130 ? `${s.scope.slice(0, 130)}...` : s.scope) : 'Standard specification catalog entry.'}
                      </p>
                    </div>

                    <div style={{ borderTop: '1px solid #E2EAF5', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: '#64748B' }}>
                        Status: <strong>{s.status}</strong>
                      </span>
                      <button
                        onClick={() => handleSelectStandard(s)}
                        className="btn btn-primary btn-sm"
                        style={{ fontSize: '12px', padding: '4px 12px', borderRadius: '6px' }}
                      >
                        Open Standard &rarr;
                      </button>
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
                    <strong style={{ color: '#1D2B42' }}>{totalPages}</strong> ({totalItems} total standards)
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
          TAB 2: STANDARD DETAIL PAGE (Per Section 3)
          ================================================== */}
      {activeTab === 'detail' && selectedStandard && (
        <div
          className="card"
          style={{
            padding: '28px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #D6E4F8',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '22px',
          }}
        >
          {/* Top Detail Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '20px', fontWeight: 900, color: '#3A74C2' }}>
                  {selectedStandard.isNumber}
                </span>
                {selectedStandard.year && <span className="badge badge-sky">Year: {selectedStandard.year}</span>}
                <span className="badge badge-verified">Status: {selectedStandard.status}</span>
              </div>

              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#1D2B42', lineHeight: 1.3, marginBottom: '6px' }}>
                {selectedStandard.title}
              </h2>

              <div style={{ fontSize: '12.5px', color: '#64748B' }}>
                Status: <strong>{selectedStandard.status}</strong> • Publication Year: <strong>{selectedStandard.year || 'Not specified'}</strong> • Updated: {selectedStandard.lastUpdated || 'Not available'}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={() => onNavigate('/chat', `What are the critical clauses and testing requirements of ${selectedStandard.isNumber}?`)}
                className="btn btn-secondary btn-sm"
              >
                Ask Assistant about Clauses &rarr;
              </button>
              <button
                onClick={() => onNavigate('/product-to-standard')}
                className="btn btn-secondary btn-sm"
              >
                Product Discovery
              </button>
              {selectedStandard.bisSourceUrl && (
                <a
                  href={selectedStandard.bisSourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary btn-sm"
                >
                  Official BIS Portal <ExternalLink size={13} />
                </a>
              )}
            </div>
          </div>

          {/* Description & Scope */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            <div style={{ backgroundColor: '#F8FAFD', padding: '18px', borderRadius: '12px', border: '1px solid #E2EAF5' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#1D2B42', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Standard Title
              </h4>
              <p style={{ fontSize: '13.5px', color: '#334155', lineHeight: 1.6 }}>
                {selectedStandard.title}
              </p>
            </div>

            <div style={{ backgroundColor: '#F8FAFD', padding: '18px', borderRadius: '12px', border: '1px solid #E2EAF5' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#1D2B42', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Scope of Standard
              </h4>
              <p style={{ fontSize: '13.5px', color: '#334155', lineHeight: 1.6 }}>
                {selectedStandard.scope || 'No scope details available from backend.'}
              </p>
            </div>
          </div>

          {/* Related Modules Quick Links */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            {/* Related QCO Info */}
            <div style={{ border: '1px solid #E2EAF5', borderRadius: '12px', padding: '18px', backgroundColor: '#FFFFFF' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Scale size={18} color="#3A74C2" />
                <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#1D2B42' }}>
                  Quality Control Orders (QCO)
                </h4>
              </div>
              <p style={{ fontSize: '12.5px', color: '#475569', lineHeight: 1.5, margin: '0 0 10px' }}>
                Check if mandatory Quality Control Orders (QCOs) are notified for this standard.
              </p>
              <button
                onClick={() => onNavigate('/qco-regulations', selectedStandard.isNumber)}
                style={{ color: '#3A74C2', fontWeight: 700, fontSize: '12px', textAlign: 'left', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
              >
                Search in QCO Regulations &rarr;
              </button>
            </div>

            {/* Certification Information */}
            <div style={{ border: '1px solid #E2EAF5', borderRadius: '12px', padding: '18px', backgroundColor: '#FFFFFF' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Award size={18} color="#3A74C2" />
                <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#1D2B42' }}>
                  Conformity Certification
                </h4>
              </div>
              <p style={{ fontSize: '12.5px', color: '#475569', lineHeight: 1.5, margin: '0 0 10px' }}>
                Explore applicable certification schemes (Scheme I ISI, Scheme II CRS) and pre-audit checklists.
              </p>
              <button
                onClick={() => onNavigate('/certification', selectedStandard.id)}
                style={{ color: '#3A74C2', fontWeight: 700, fontSize: '12px', textAlign: 'left', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
              >
                Explore Certification Schemes &rarr;
              </button>
            </div>
          </div>

          {/* Clause & RAG Inquiry Card */}
          <div
            style={{
              border: '1px solid #D6E4F8',
              borderRadius: '14px',
              padding: '20px 22px',
              backgroundColor: '#F8FAFD',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={18} color="#3A74C2" />
                <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#1D2B42' }}>
                  Clause Inspection & Regulatory Analysis
                </h4>
              </div>
              <span className="badge badge-sky" style={{ fontSize: '11px', textTransform: 'uppercase' }}>
                Powered by PARAKH AI Assistant
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, margin: 0 }}>
              Detailed clause text, Section-by-Section testing parameters, amendments, and Scheme of Testing and Inspection (STI) requirements are not bundled in the directory metadata and are dynamically retrieved via the PARAKH Neural Assistant using verified BIS source documents.
            </p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '4px' }}>
              <button
                onClick={() => onNavigate('/chat', `Explain the critical clauses, testing procedures, and parameters in ${selectedStandard.isNumber}`)}
                className="btn btn-primary btn-sm"
              >
                Query Clauses for {selectedStandard.isNumber} &rarr;
              </button>
              <button
                onClick={() => onNavigate('/chat', `What are the gazetted amendments and related standards for ${selectedStandard.isNumber}?`)}
                className="btn btn-secondary btn-sm"
              >
                Inquire Amendments & Related Standards
              </button>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #EDF3FB', paddingTop: '12px', fontSize: '12px', color: '#64748B' }}>
            Source: <strong>{selectedStandard.bisSourceUrl ? 'Official Bureau of Indian Standards Portal' : 'Bureau of Indian Standards Official Publication'}</strong>
          </div>
        </div>
      )}

      {/* ==================================================
          TAB 3: CLAUSE INSPECTION (RAG Chat Retrieval)
          ================================================== */}
      {activeTab === 'clauses' && selectedStandard && (
        <div className="card" style={{ padding: '40px 24px', backgroundColor: '#FFFFFF', border: '1px solid #D6E4F8', borderRadius: '16px', textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', color: '#3A74C2' }}>
            <BookOpen size={24} />
          </div>
          <span className="badge badge-sky" style={{ fontSize: '11.5px', marginBottom: '10px', display: 'inline-block' }}>
            RAG Chat Retrieval
          </span>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1D2B42', marginBottom: '8px' }}>
            Clause-Level Retrieval: {selectedStandard.isNumber}
          </h3>
          <p style={{ fontSize: '13.5px', color: '#64748B', maxWidth: '580px', margin: '0 auto 20px', lineHeight: 1.6 }}>
            The REST standards directory endpoint (<code>/api/v1/standards</code>) provides catalog metadata (title, year, status, scope, source). Full-text clause inspection, tolerances, and testing parameters are retrieved dynamically through the AI Assistant via neural RAG search.
          </p>
          <button
            onClick={() => onNavigate('/chat', `What are the clauses and testing parameters specified in ${selectedStandard.isNumber}?`)}
            className="btn btn-primary"
            style={{ margin: '0 auto' }}
          >
            Launch Clause Analysis in AI Assistant &rarr;
          </button>
        </div>
      )}

      {/* ==================================================
          TAB 4: RELATED & AMENDMENTS (Advisory & Gazette)
          ================================================== */}
      {activeTab === 'related' && selectedStandard && (
        <div className="card" style={{ padding: '40px 24px', backgroundColor: '#FFFFFF', border: '1px solid #D6E4F8', borderRadius: '16px', textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', color: '#3A74C2' }}>
            <Layers size={24} />
          </div>
          <span className="badge badge-warning" style={{ fontSize: '11.5px', marginBottom: '10px', display: 'inline-block' }}>
            Endpoint Unavailable
          </span>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1D2B42', marginBottom: '8px' }}>
            Amendments & Related Standards: {selectedStandard.isNumber}
          </h3>
          <p style={{ fontSize: '13.5px', color: '#64748B', maxWidth: '580px', margin: '0 auto 20px', lineHeight: 1.6 }}>
            Historical gazetted amendments and cross-reference linkages are not currently exposed as standalone endpoints in the backend API. To verify specific amendment dates or companion standards, please query the Assistant or consult the official BIS portal.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => onNavigate('/chat', `Are there any recent amendments or revisions to ${selectedStandard.isNumber}?`)}
              className="btn btn-primary"
            >
              Inquire via AI Assistant &rarr;
            </button>
            {selectedStandard.bisSourceUrl && (
              <a
                href={selectedStandard.bisSourceUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary"
              >
                View on Official BIS Portal <ExternalLink size={13} />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
