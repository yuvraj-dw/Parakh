import React, { useState, useEffect } from 'react';
import {
  Server,
  RefreshCw,
  Inbox,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Database,
  ChevronLeft,
  FileSearch,
} from 'lucide-react';
import {
  NavRoute,
  NavigationPayload,
  HumanReviewQueueItem,
  AdminSyncRecord,
  SourceHealthMetric,
  SyncErrorRecord,
  AdminGapReportItem,
} from '../types';
import { adminService, DashboardStats } from '../services/adminService';
import { ApiError } from '../api/client';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { SegmentedControl } from '../components/common/SegmentedControl';
import { ErrorState } from '../components/common/ErrorState';

export type ReviewQueueState =
  | { status: 'LOADING' }
  | { status: 'LOADED'; items: HumanReviewQueueItem[] }
  | { status: 'UNAVAILABLE'; message: string }
  | { status: 'ERROR'; message: string };

interface AdminDashboardPageProps {
  initialTab?: 'OVERVIEW' | 'HEALTH' | 'SYNC' | 'ERRORS' | 'GAP_REPORT' | 'REVIEW';
  onNavigate: (route: NavRoute, payload?: NavigationPayload) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  initialTab = 'OVERVIEW',
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'HEALTH' | 'SYNC' | 'ERRORS' | 'GAP_REPORT' | 'REVIEW'>(initialTab);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [syncLogs, setSyncLogs] = useState<AdminSyncRecord[]>([]);
  const [sourceHealth, setSourceHealth] = useState<SourceHealthMetric[]>([]);
  const [syncErrors, setSyncErrors] = useState<SyncErrorRecord[]>([]);
  const [gapReport, setGapReport] = useState<AdminGapReportItem[]>([]);
  const [reviewQueueState, setReviewQueueState] = useState<ReviewQueueState>({ status: 'LOADING' });
  const [isLoading, setIsLoading] = useState(true);
  const [adminError, setAdminError] = useState<string | null>(null);

  // Manual Sync execution state (calls POST /api/v1/admin/sync/{dataset})
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);

  const loadAdminData = () => {
    setIsLoading(true);
    setAdminError(null);
    setReviewQueueState({ status: 'LOADING' });

    // Review Queue handled distinctly from primary telemetry
    adminService
      .getReviewQueue()
      .then((items) => {
        setReviewQueueState({ status: 'LOADED', items });
      })
      .catch((err: unknown) => {
        if (err instanceof ApiError && (err.status === 404 || err.code === 'NOT_IMPLEMENTED')) {
          setReviewQueueState({
            status: 'UNAVAILABLE',
            message: err.message || 'Review Queue unavailable — no backend endpoint is currently provided.',
          });
        } else {
          setReviewQueueState({
            status: 'ERROR',
            message: err instanceof Error ? err.message : 'Failed to query review queue from backend.',
          });
        }
      });

    Promise.all([
      adminService.getDashboardStats(),
      adminService.getSyncLogs(),
      adminService.getSourceHealth(),
      adminService.getSyncErrors(),
      adminService.getGapReport({ limit: 100 }),
    ])
      .then(([s, logs, health, errors, gaps]) => {
        setStats(s);
        setSyncLogs(logs);
        setSourceHealth(health);
        setSyncErrors(errors);
        setGapReport(gaps);
      })
      .catch((err: unknown) => {
        let msg = 'Unable to load administrator diagnostics from Parakh backend.';
        if (err instanceof ApiError) {
          if (err.status === 401 || err.status === 403) {
            msg = 'Administrator privileges required. Please sign in with an administrator account to view and trigger ingestion sync feeds.';
          } else {
            msg = err.message;
          }
        } else if (err instanceof Error) {
          msg = err.message;
        }
        setAdminError(msg);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleTriggerManualSync = async () => {
    setIsSyncing(true);
    setSyncSuccessMsg(null);
    try {
      const res = await adminService.triggerSync();
      setSyncSuccessMsg(res.message);
      setTimeout(() => setSyncSuccessMsg(null), 4000);
    } finally {
      setIsSyncing(false);
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
        <span style={{ color: '#1D2B42', fontWeight: 700 }}>Admin & Telemetry Dashboard</span>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
              <Server size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#1D2B42' }}>
                Admin Operations & System Health Telemetry
              </h1>
              <p style={{ fontSize: '13px', color: '#64748B' }}>
                Monitor public BIS registry feeds, synchronization logs, source endpoints, and human review queues.
              </p>
            </div>
          </div>

          {/* Manual Sync UI — Triggers live backend sync via POST /admin/sync */}
          <button
            onClick={handleTriggerManualSync}
            disabled={isSyncing}
            className="btn btn-primary"
            style={{ padding: '9px 18px', fontSize: '13px', borderRadius: '10px' }}
          >
            <RefreshCw size={15} className={isSyncing ? 'spin' : ''} />
            {isSyncing ? 'Syncing Feeds...' : 'Manual Sync Feeds'}
          </button>
        </div>

        {/* Sync Success Notification Banner */}
        {syncSuccessMsg && (
          <div
            style={{
              marginTop: '16px',
              padding: '12px 16px',
              backgroundColor: '#DCFCE7',
              border: '1px solid #86EFAC',
              borderRadius: '10px',
              fontSize: '13px',
              color: '#166534',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <CheckCircle2 size={16} />
            <strong>Sync Success:</strong> {syncSuccessMsg}
          </div>
        )}

        {/* Pill / Segmented Control Bar (Per Section 1 & 2) */}
        <div style={{ marginTop: '16px', borderTop: '1px solid #E2EAF5', paddingTop: '16px' }}>
          <SegmentedControl<'OVERVIEW' | 'HEALTH' | 'SYNC' | 'ERRORS' | 'GAP_REPORT' | 'REVIEW'>
            items={[
              {
                id: 'OVERVIEW',
                label: 'Overview',
                number: 1,
                icon: Database,
              },
              {
                id: 'HEALTH',
                label: 'Source Health',
                number: 2,
                icon: Activity,
              },
              {
                id: 'SYNC',
                label: 'Sync Runs',
                number: 3,
                icon: RefreshCw,
              },
              {
                id: 'ERRORS',
                label: 'Sync Errors',
                number: 4,
                icon: AlertTriangle,
                badge: syncErrors.length > 0 ? syncErrors.length : undefined,
              },
              {
                id: 'GAP_REPORT',
                label: 'Gap Report',
                number: 5,
                icon: FileSearch,
                badge: gapReport.length > 0 ? gapReport.length : undefined,
              },
              {
                id: 'REVIEW',
                label: 'Review Queue',
                number: 6,
                icon: Inbox,
              },
            ]}
            activeId={activeTab}
            onChange={(id) => setActiveTab(id)}
          />
        </div>
      </div>

      {/* ==================================================
          TAB 1: OVERVIEW METRICS (Per Section 16)
          ================================================== */}
      {activeTab === 'OVERVIEW' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {adminError && (
            <ErrorState
              title="Admin Access Required"
              message={adminError}
              apiEndpoint="/api/v1/admin"
              onRetry={loadAdminData}
            />
          )}

          {isLoading ? (
            <LoadingSkeleton type="card" count={4} message="Aggregating registry statistics from backend..." />
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '16px',
              }}
            >
              {[
                { label: 'Total Ingestion Runs', val: stats?.totalSyncRuns?.toLocaleString() || '0', sub: 'Backend Sync Jobs', color: '#3A74C2' },
                { label: 'Records Processed', val: stats?.totalRecordsProcessed?.toLocaleString() || '0', sub: 'Indexed Entries', color: '#166534' },
                { label: 'Records Seeded / Created', val: stats?.totalRecordsCreated?.toLocaleString() || '0', sub: 'Stored in Database', color: '#0369A1' },
                { label: 'Records Updated', val: stats?.totalRecordsUpdated?.toLocaleString() || '0', sub: 'Synchronized Updates', color: '#7C3AED' },
                { label: 'Active Data Sources', val: `${stats?.activeSourcesCount ?? 0} / ${stats?.totalSourcesCount ?? 0}`, sub: 'Connected Endpoints', color: '#0F766E' },
                {
                  label: 'Ingestion Status',
                  val: stats?.sourceHealthStatus || 'N/A',
                  sub: stats?.lastCheckedAt && stats.lastCheckedAt !== 'N/A' ? `Checked: ${stats.lastCheckedAt}` : 'Timestamp unavailable',
                  color: stats?.sourceHealthStatus === 'HEALTHY' || stats?.sourceHealthStatus === 'AVAILABLE' || stats?.sourceHealthStatus === 'OPERATIONAL' ? '#166534' : '#DC2626',
                },
              ].map((m, idx) => (
                <div
                  key={idx}
                  className="card"
                  style={{
                    padding: '20px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #D6E4F8',
                    borderRadius: '14px',
                    borderLeft: `4px solid ${m.color}`,
                  }}
                >
                  <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                    {m.label}
                  </div>
                  <div style={{ fontSize: '26px', fontWeight: 900, color: '#1D2B42', margin: '4px 0 2px' }}>
                    {m.val}
                  </div>
                  <div style={{ fontSize: '11px', color: m.color, fontWeight: 700 }}>
                    {m.sub}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==================================================
          TAB 2: SOURCE HEALTH (Per Section 4)
          ================================================== */}
      {activeTab === 'HEALTH' && (
        <div className="card" style={{ padding: '24px', backgroundColor: '#FFFFFF', border: '1px solid #D6E4F8', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#1D2B42', margin: 0 }}>
              External Source Endpoint Health & Availability
            </h3>
            <span style={{ fontSize: '12px', color: '#64748B' }}>
              Endpoint: <code style={{ backgroundColor: '#F1F5F9', padding: '2px 6px', borderRadius: '4px' }}>/api/v1/admin/source-health</code>
            </span>
          </div>

          <div style={{ padding: '10px 14px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '12.5px', color: '#64748B', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-sky" style={{ fontSize: '11px', textTransform: 'uppercase' }}>Backend Supported</span>
            <span>Reports active endpoint status and last checked time. Granular parser failure counts, individual API failure counters, and stale dataset metrics are not currently provided by the backend API.</span>
          </div>

          {sourceHealth.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: '#64748B', fontSize: '13px' }}>
              No source health records reported by backend.
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Source Feed Name</th>
                    <th>Status</th>
                    <th>Last Checked</th>
                    <th>Endpoint URL</th>
                    <th>Parser Failures</th>
                    <th>API Failures</th>
                    <th>Stale Datasets</th>
                  </tr>
                </thead>
                <tbody>
                  {sourceHealth.map((sh, idx) => (
                    <tr key={idx}>
                      <td>
                        <div style={{ fontWeight: 800, color: '#1D2B42' }}>{sh.name}</div>
                      </td>
                      <td>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '10px',
                            fontSize: '11px',
                            fontWeight: 800,
                            backgroundColor: sh.status === 'HEALTHY' ? '#DCFCE7' : '#FEF3C7',
                            color: sh.status === 'HEALTHY' ? '#166534' : '#92400E',
                          }}
                        >
                          {sh.status}
                        </span>
                      </td>
                      <td style={{ fontSize: '12.5px', color: '#475569' }}>{sh.lastChecked}</td>
                      <td style={{ fontSize: '12px', color: '#64748B' }}>
                        {sh.endpoint}
                      </td>
                      <td style={{ fontSize: '12px', color: '#94A3B8', fontStyle: 'italic' }}>N/A (Not provided)</td>
                      <td style={{ fontSize: '12px', color: '#94A3B8', fontStyle: 'italic' }}>N/A (Not provided)</td>
                      <td style={{ fontSize: '12px', color: '#94A3B8', fontStyle: 'italic' }}>N/A (Not provided)</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ==================================================
          TAB 3: SYNC RUNS (Per Section 5)
          ================================================== */}
      {activeTab === 'SYNC' && (
        <div className="card" style={{ padding: '24px', backgroundColor: '#FFFFFF', border: '1px solid #D6E4F8', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#1D2B42', margin: 0 }}>
              Data Ingestion & Synchronisation Run History
            </h3>
            <span style={{ fontSize: '12px', color: '#64748B' }}>
              Endpoint: <code style={{ backgroundColor: '#F1F5F9', padding: '2px 6px', borderRadius: '4px' }}>/api/v1/admin/sync/runs</code>
            </span>
          </div>

          {syncLogs.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: '#64748B', fontSize: '13px' }}>
              No synchronization run records returned by backend.
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Dataset / Source</th>
                    <th>Status</th>
                    <th>Started</th>
                    <th>Completed</th>
                    <th>Records Processed</th>
                    <th>Created</th>
                    <th>Updated</th>
                    <th>Removed</th>
                    <th>Errors</th>
                  </tr>
                </thead>
                <tbody>
                  {syncLogs.map((log) => (
                    <tr key={log.id}>
                      <td>
                        <div style={{ fontWeight: 800, color: '#1D2B42' }}>{log.sourceName || log.dataType}</div>
                        <div style={{ fontSize: '11px', color: '#64748B' }}>{log.dataType}</div>
                      </td>
                      <td>
                        <span className={`badge ${log.status === 'SUCCESS' ? 'badge-verified' : 'badge-warning'}`}>
                          {log.status}
                        </span>
                      </td>
                      <td style={{ fontSize: '12px', color: '#475569' }}>{log.lastRun}</td>
                      <td style={{ fontSize: '12px', color: '#475569' }}>{log.completedAt || 'N/A'}</td>
                      <td style={{ fontWeight: 700 }}>{log.recordsProcessed ?? 'N/A'}</td>
                      <td style={{ color: '#166534', fontWeight: 700 }}>
                        {log.recordsAdded !== undefined ? `+${log.recordsAdded}` : 'N/A'}
                      </td>
                      <td style={{ color: '#3A74C2', fontWeight: 700 }}>
                        {log.recordsUpdated !== undefined ? `${log.recordsUpdated}` : 'N/A'}
                      </td>
                      <td style={{ color: '#64748B', fontWeight: 700 }}>
                        {log.recordsRemoved !== undefined ? `-${log.recordsRemoved}` : 'N/A'}
                      </td>
                      <td style={{ color: log.errorsCount ? '#DC2626' : '#64748B', fontWeight: 700 }}>
                        {log.errorsCount !== undefined ? log.errorsCount : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ==================================================
          TAB 4: SYNC ERRORS (Per Section 5)
          ================================================== */}
      {activeTab === 'ERRORS' && (
        <div className="card" style={{ padding: '24px', backgroundColor: '#FFFFFF', border: '1px solid #D6E4F8', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#1D2B42', margin: 0 }}>
              Data Pipeline Sync Errors & Warnings Log
            </h3>
            <span style={{ fontSize: '12px', color: '#64748B' }}>
              Endpoint: <code style={{ backgroundColor: '#F1F5F9', padding: '2px 6px', borderRadius: '4px' }}>/api/v1/admin/sync/errors</code>
            </span>
          </div>

          {syncErrors.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: '#64748B', fontSize: '13px' }}>
              No synchronization errors reported by backend.
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Dataset</th>
                    <th>Error Type</th>
                    <th>Message / Trace</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {syncErrors.map((err) => (
                    <tr key={err.id}>
                      <td style={{ fontWeight: 800, color: '#1D2B42' }}>{err.dataset}</td>
                      <td>
                        <span className="badge badge-danger">{err.errorType}</span>
                      </td>
                      <td style={{ fontSize: '12px', color: '#334155', maxWidth: '380px' }}>
                        {err.message}
                      </td>
                      <td style={{ fontSize: '12px', color: '#64748B' }}>{err.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ==================================================
          TAB 5: ADMIN GAP REPORT (Per Section 3)
          ================================================== */}
      {activeTab === 'GAP_REPORT' && (
        <div className="card" style={{ padding: '24px', backgroundColor: '#FFFFFF', border: '1px solid #D6E4F8', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#1D2B42', margin: '0 0 4px' }}>
                Knowledge & Retrieval Gap Report
              </h3>
              <p style={{ fontSize: '12.5px', color: '#64748B', margin: 0 }}>
                Authoritative queries and intent categories with low retrieval confidence or missing regulatory standards.
              </p>
            </div>
            <span style={{ fontSize: '12px', color: '#64748B' }}>
              Endpoint: <code style={{ backgroundColor: '#F1F5F9', padding: '2px 6px', borderRadius: '4px' }}>/api/v1/admin/gap-report</code>
            </span>
          </div>

          {isLoading ? (
            <LoadingSkeleton type="table" count={5} message="Loading gap report from backend..." />
          ) : gapReport.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center', backgroundColor: '#F8FAFD', borderRadius: '12px', border: '1px dashed #D6E4F8' }}>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#1D2B42', marginBottom: '6px' }}>
                No Retrieval Gaps Logged
              </div>
              <p style={{ fontSize: '13px', color: '#64748B', maxWidth: '420px', margin: '0 auto' }}>
                The backend gap report returned zero unresolved query gaps or unindexed standard requests.
              </p>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User Query</th>
                    <th>Frequency</th>
                    <th>Category</th>
                    <th>Retrieval Score</th>
                    <th>First Timestamp</th>
                    <th>Latest Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {gapReport.map((gap, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 700, color: '#1D2B42', maxWidth: '280px' }}>
                        {gap.query}
                      </td>
                      <td style={{ fontWeight: 800, color: '#3A74C2' }}>
                        {gap.frequency}
                      </td>
                      <td>
                        <span className="badge badge-sky" style={{ fontSize: '11px' }}>
                          {gap.category}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700, color: gap.retrievalScore !== null && gap.retrievalScore < 0.6 ? '#DC2626' : '#166534' }}>
                        {gap.retrievalScore !== null ? gap.retrievalScore.toFixed(3) : 'N/A'}
                      </td>
                      <td style={{ fontSize: '12px', color: '#64748B' }}>
                        {gap.firstTimestamp ? new Date(gap.firstTimestamp).toLocaleString() : 'N/A'}
                      </td>
                      <td style={{ fontSize: '12px', color: '#64748B' }}>
                        {gap.latestTimestamp ? new Date(gap.latestTimestamp).toLocaleString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ==================================================
          TAB 6: REVIEW QUEUE (Per Section 6 & PART 12)
          ================================================== */}
      {activeTab === 'REVIEW' && (
        <div>
          {reviewQueueState.status === 'LOADING' && (
            <LoadingSkeleton type="table" count={3} message="Querying administrative review queue status..." />
          )}

          {reviewQueueState.status === 'UNAVAILABLE' && (
            <div className="card" style={{ padding: '48px 24px', backgroundColor: '#FFFFFF', border: '1px solid #D6E4F8', borderRadius: '16px', textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#FEF3C7', color: '#B45309', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <AlertTriangle size={24} />
              </div>
              <span className="badge badge-warning" style={{ fontSize: '11.5px', marginBottom: '10px', display: 'inline-block' }}>
                Backend Endpoint Unavailable
              </span>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1D2B42', marginBottom: '8px' }}>
                Human-in-the-Loop Review Queue Unavailable
              </h3>
              <p style={{ fontSize: '14px', color: '#64748B', maxWidth: '580px', margin: '0 auto 16px', lineHeight: 1.6 }}>
                {reviewQueueState.message}
              </p>
              <div style={{ display: 'inline-flex', padding: '8px 16px', borderRadius: '20px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', color: '#475569', fontSize: '12px', fontWeight: 600 }}>
                Strict single-source-of-truth: no simulated or synthetic review queue items are generated on the frontend.
              </div>
            </div>
          )}

          {reviewQueueState.status === 'ERROR' && (
            <ErrorState
              title="Unable to Access Review Queue"
              message={reviewQueueState.message}
              onRetry={loadAdminData}
            />
          )}

          {reviewQueueState.status === 'LOADED' && reviewQueueState.items.length === 0 && (
            <EmptyState
              icon={CheckCircle2}
              title="Review Queue is Empty"
              description="There are currently zero flagged items pending administrative review."
            />
          )}

          {reviewQueueState.status === 'LOADED' && reviewQueueState.items.length > 0 && (
            <div className="card" style={{ padding: '24px', backgroundColor: '#FFFFFF', border: '1px solid #D6E4F8', borderRadius: '16px' }}>
              <div style={{ overflowX: 'auto' }}>
                <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th>Queue ID</th>
                      <th>Issue</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Submitted At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviewQueueState.items.map((item) => (
                      <tr key={item.id}>
                        <td><code>{item.id}</code></td>
                        <td>{item.issue}</td>
                        <td>{item.type}</td>
                        <td><span className="badge badge-sky">{item.status}</span></td>
                        <td>{item.created ? new Date(item.created).toLocaleString() : 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

