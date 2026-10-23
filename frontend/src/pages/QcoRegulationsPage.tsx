import React, { useState, useEffect } from 'react';
import {
  Scale,
  Search,
  Calendar,
  ExternalLink,
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  FileText,
  X,
} from 'lucide-react';
import { NavRoute, NavigationPayload, QcoRecord } from '../types';
import { qcoService } from '../services/qcoService';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { Modal } from '../components/common/Modal';

interface QcoRegulationsPageProps {
  onNavigate: (route: NavRoute, payload?: NavigationPayload) => void;
}

export const QcoRegulationsPage: React.FC<QcoRegulationsPageProps> = ({
  onNavigate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMinistry, setSelectedMinistry] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedStandard, setSelectedStandard] = useState('ALL');

  const [qcoRecords, setQcoRecords] = useState<QcoRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedQco, setSelectedQco] = useState<QcoRecord | null>(null);

  const ministries = [
    'ALL',
    'Ministry of Commerce and Industry',
    'Ministry of Consumer Affairs',
    'Ministry of Electronics and Information Technology',
    'Ministry of Steel',
  ];

  const standardsFilterList = [
    'ALL',
    'IS 17803',
    'IS 1417',
    'IS 1293',
    'IS 16046',
    'IS 13252',
  ];

  const fetchQco = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await qcoService.getPaginatedQcoRecords({
        query: searchQuery,
        ministry: selectedMinistry !== 'ALL' ? selectedMinistry : undefined,
        status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
        standard: selectedStandard !== 'ALL' ? selectedStandard : undefined,
        page: currentPage,
        pageSize: 20,
      });
      setQcoRecords(res.items);
      setTotalPages(res.totalPages);
      setTotalItems(res.totalItems);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to connect to BIS Parakh QCO service.');
      setQcoRecords([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedMinistry, selectedStatus, selectedStandard]);

  useEffect(() => {
    fetchQco();
  }, [searchQuery, selectedMinistry, selectedStatus, selectedStandard, currentPage]);

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
        <span style={{ color: '#1D2B42', fontWeight: 700 }}>Quality Control Orders (QCO)</span>
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
            <Scale size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#1D2B42' }}>
              Quality Control Orders (QCO) Explorer
            </h1>
            <p style={{ fontSize: '13px', color: '#64748B' }}>
              Search central mandatory gazette orders making BIS ISI or CRS certification legally obligatory for domestic manufacturing and imports.
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar (Per Section 5) */}
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
        {/* Search Input */}
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#3A74C2' }} />
          <input
            type="text"
            placeholder="Search by QCO order name, product (e.g. bottles, toys, cement), notification number, or ministry..."
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

        {/* Filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
          {/* Ministry Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#39527B' }}>Ministry:</span>
            <select
              value={selectedMinistry}
              onChange={(e) => setSelectedMinistry(e.target.value)}
              style={{
                padding: '6px 10px',
                fontSize: '12px',
                borderRadius: '6px',
                border: '1px solid #D6E4F8',
                backgroundColor: '#FFFFFF',
                maxWidth: '260px',
              }}
            >
              {ministries.map((m) => (
                <option key={m} value={m}>{m === 'ALL' ? 'All Ministries' : m}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#39527B' }}>Status:</span>
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
              <option value="ALL">All Statuses</option>
              <option value="ENFORCED">Enforced</option>
              <option value="UPCOMING">Upcoming</option>
              <option value="EXTENDED">Extended</option>
            </select>
          </div>

          {/* Standard Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#39527B' }}>Standard:</span>
            <select
              value={selectedStandard}
              onChange={(e) => setSelectedStandard(e.target.value)}
              style={{
                padding: '6px 10px',
                fontSize: '12px',
                borderRadius: '6px',
                border: '1px solid #D6E4F8',
                backgroundColor: '#FFFFFF',
              }}
            >
              {standardsFilterList.map((s) => (
                <option key={s} value={s}>{s === 'ALL' ? 'All Standards' : s}</option>
              ))}
            </select>
          </div>

          <span style={{ fontSize: '12px', color: '#64748B', marginLeft: 'auto' }}>
            Showing <strong>{qcoRecords.length}</strong> QCO orders
          </span>
        </div>
      </div>

      {/* Results Cards List */}
      {error ? (
        <ErrorState
          title="Unable to Load Quality Control Orders"
          message={error}
          apiEndpoint="/api/v1/qco"
          onRetry={fetchQco}
        />
      ) : isLoading ? (
        <LoadingSkeleton type="card" count={3} message="Connecting to BIS QCO regulatory repository..." />
      ) : qcoRecords.length === 0 ? (
        <EmptyState
          icon={Scale}
          title="No Quality Control Orders found"
          description="Try broadening your search term or resetting the ministry filter."
          actionText="Reset Filters"
          onAction={() => {
            setSearchQuery('');
            setSelectedMinistry('ALL');
            setSelectedStatus('ALL');
            setSelectedStandard('ALL');
            setCurrentPage(1);
          }}
        />
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
            {qcoRecords.map((q) => (
              <div
                key={q.id}
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
                  boxShadow: '0 2px 8px rgba(30, 41, 59, 0.04)',
                }}
              >
                <div>
                  {/* Status & Standard Badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                    <span
                      style={{
                        padding: '3px 10px',
                        borderRadius: '14px',
                        fontSize: '11px',
                        fontWeight: 800,
                        backgroundColor: q.status === 'ENFORCED' ? '#DCFCE7' : '#FEF3C7',
                        color: q.status === 'ENFORCED' ? '#166534' : '#92400E',
                        border: '1px solid currentColor',
                      }}
                    >
                      {q.status}
                    </span>

                    <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#3A74C2' }}>
                      {q.isNumber}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1D2B42', lineHeight: 1.35, marginBottom: '6px' }}>
                    {q.qcoTitle || q.product}
                  </h3>

                  <div style={{ fontSize: '11.5px', color: '#64748B', marginBottom: '10px' }}>
                    Ministry: <strong style={{ color: '#39527B' }}>{q.ministry}</strong>
                  </div>

                  {q.applicableProducts && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '10px' }}>
                      {q.applicableProducts.slice(0, 2).map((p, idx) => (
                        <span
                          key={idx}
                          style={{
                            fontSize: '11px',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            backgroundColor: '#F1F6FD',
                            color: '#2A3C5B',
                            fontWeight: 500,
                          }}
                        >
                          {p}
                        </span>
                      ))}
                      {q.applicableProducts.length > 2 && (
                        <span style={{ fontSize: '11px', color: '#64748B', alignSelf: 'center' }}>
                          +{q.applicableProducts.length - 2} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Card Meta */}
                <div style={{ borderTop: '1px solid #E2EAF5', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11.5px', color: '#475569' }}>
                    Effective: <strong>{q.effectiveDate || 'Not available'}</strong>
                    {q.daysUntilEnforcement != null && (
                      <span style={{ marginLeft: '6px', color: q.daysUntilEnforcement > 0 ? '#B45309' : '#166534', fontWeight: 600 }}>
                        ({q.daysUntilEnforcement > 0 ? `${q.daysUntilEnforcement}d until enforcement` : 'Enforced'})
                      </span>
                    )}
                  </span>
                  <button
                    onClick={() => setSelectedQco(q)}
                    className="btn btn-primary btn-sm"
                    style={{ fontSize: '12px', padding: '4px 12px', borderRadius: '6px' }}
                  >
                    View QCO Details &rarr;
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
                <strong style={{ color: '#1D2B42' }}>{totalPages}</strong> ({totalItems} orders)
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

      {/* ==================================================
          QCO DETAIL MODAL (Per Section 5)
          ================================================== */}
      {selectedQco && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedQco(null)}
          title={selectedQco.qcoTitle || selectedQco.product}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Top Status & Ministry */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <span
                style={{
                  padding: '4px 12px',
                  borderRadius: '16px',
                  fontSize: '12px',
                  fontWeight: 800,
                  backgroundColor: selectedQco.status === 'ENFORCED' ? '#DCFCE7' : '#FEF3C7',
                  color: selectedQco.status === 'ENFORCED' ? '#166534' : '#92400E',
                }}
              >
                STATUS: {selectedQco.status}
              </span>
              <span style={{ fontSize: '12px', color: '#64748B' }}>
                Gazette Notification: <strong>{selectedQco.notificationNo || 'Not available'}</strong>
              </span>
            </div>

            {/* Ministry & Date */}
            <div style={{ padding: '14px', backgroundColor: '#F8FAFD', borderRadius: '10px', border: '1px solid #E2EAF5' }}>
              <div style={{ fontSize: '12px', color: '#64748B' }}>Notifying Ministry / Department</div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#1D2B42', marginTop: '2px' }}>
                {selectedQco.ministry}
              </div>
            </div>

            {/* Applicable Products */}
            {selectedQco.applicableProducts && (
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#1D2B42', marginBottom: '8px' }}>
                  Applicable Products Under Order Scope
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {selectedQco.applicableProducts.map((p, idx) => (
                    <span
                      key={idx}
                      style={{
                        padding: '4px 10px',
                        backgroundColor: '#F1F6FD',
                        borderRadius: '6px',
                        fontSize: '12px',
                        color: '#2A3C5B',
                        fontWeight: 600,
                        border: '1px solid #C4DCFA',
                      }}
                    >
                      • {p}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Applicable IS Standards */}
            <div>
              <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#1D2B42', marginBottom: '8px' }}>
                Applicable Indian Standards (IS)
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {(selectedQco.applicableStandards || [selectedQco.isNumber]).map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedQco(null);
                      onNavigate('/standards', s);
                    }}
                    style={{
                      padding: '4px 12px',
                      backgroundColor: '#FFFFFF',
                      borderRadius: '6px',
                      fontSize: '12.5px',
                      color: '#3A74C2',
                      fontWeight: 700,
                      border: '1.5px solid #3A74C2',
                      cursor: 'pointer',
                    }}
                  >
                    {s} &rarr;
                  </button>
                ))}
              </div>
            </div>

            {/* Compliance Requirements */}
            {selectedQco.complianceRequirements && selectedQco.complianceRequirements.length > 0 && (
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#1D2B42', marginBottom: '8px' }}>
                  Mandatory Compliance Requirements
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {selectedQco.complianceRequirements.map((cr, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#F8FAFD',
                        borderRadius: '6px',
                        border: '1px solid #E2EAF5',
                        fontSize: '12.5px',
                        color: '#334155',
                      }}
                    >
                      • {cr}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Important Dates */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
              <div style={{ padding: '10px', backgroundColor: '#F8FAFD', borderRadius: '8px', border: '1px solid #E2EAF5' }}>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>NOTIFICATION DATE</div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#1D2B42', marginTop: '2px' }}>
                  {selectedQco.notificationDate || selectedQco.importantDates?.notification || 'Not available'}
                </div>
              </div>

              <div style={{ padding: '10px', backgroundColor: '#F8FAFD', borderRadius: '8px', border: '1px solid #E2EAF5' }}>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>ENFORCEMENT DATE</div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#166534', marginTop: '2px' }}>
                  {selectedQco.effectiveDate || selectedQco.importantDates?.enforcement || 'Not available'}
                </div>
              </div>

              {selectedQco.msmeMicroDeadline && (
                <div style={{ padding: '10px', backgroundColor: '#F8FAFD', borderRadius: '8px', border: '1px solid #E2EAF5' }}>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>MSME (MICRO) DEADLINE</div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#1D2B42', marginTop: '2px' }}>
                    {selectedQco.msmeMicroDeadline}
                  </div>
                </div>
              )}

              {selectedQco.msmeSmallDeadline && (
                <div style={{ padding: '10px', backgroundColor: '#F8FAFD', borderRadius: '8px', border: '1px solid #E2EAF5' }}>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>MSME (SMALL) DEADLINE</div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#1D2B42', marginTop: '2px' }}>
                    {selectedQco.msmeSmallDeadline}
                  </div>
                </div>
              )}

              {selectedQco.daysUntilEnforcement != null && (
                <div style={{ padding: '10px', backgroundColor: '#F8FAFD', borderRadius: '8px', border: '1px solid #E2EAF5' }}>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>DAYS UNTIL ENFORCEMENT</div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: selectedQco.daysUntilEnforcement > 0 ? '#B45309' : '#166534', marginTop: '2px' }}>
                    {selectedQco.daysUntilEnforcement}
                  </div>
                </div>
              )}
            </div>

            {selectedQco.exemptionNote && (
              <div style={{ padding: '10px', backgroundColor: '#FFFBEB', borderRadius: '8px', border: '1px solid #FDE68A', fontSize: '12px', color: '#92400E' }}>
                <strong>Exemption Note:</strong> {selectedQco.exemptionNote}
              </div>
            )}

            {/* Source Reference */}
            <div style={{ borderTop: '1px solid #EDF3FB', paddingTop: '10px', fontSize: '11.5px', color: '#64748B' }}>
              Official Source: <strong>{selectedQco.sourceGazette || selectedQco.sourceReference || 'Not available'}</strong>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
