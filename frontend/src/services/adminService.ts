import {
  AdminSyncRecord,
  SourceHealthMetric,
  HumanReviewQueueItem,
  SyncErrorRecord,
  AdminGapReportItem,
} from '../types';
import { adminApi } from '../api/admin';
import { ApiError } from '../api/client';
import {
  SourceHealthSource,
  SyncErrorOut,
  SyncRunOut,
  GapReportItem,
  GapReportResponse,
} from '../types/api';

export interface DashboardStats {
  totalSyncRuns: number;
  totalRecordsProcessed: number;
  totalRecordsCreated: number;
  totalRecordsUpdated: number;
  sourceHealthStatus: string;
  activeSourcesCount: number;
  totalSourcesCount: number;
  lastCheckedAt: string;
}

export function mapSyncRunToAdminSyncRecord(run: SyncRunOut): AdminSyncRecord {
  const statusFormatted: 'SUCCESS' | 'WARNING' | 'FAILED' =
    run.status === 'COMPLETED' ? 'SUCCESS' : run.status === 'FAILED' ? 'FAILED' : 'WARNING';

  let durationMs: number | undefined = undefined;
  if (run.started_at && run.completed_at) {
    const diff = new Date(run.completed_at).getTime() - new Date(run.started_at).getTime();
    if (!isNaN(diff) && diff >= 0) durationMs = diff;
  }

  return {
    id: run.id,
    sourceName: run.source || undefined,
    dataType: run.dataset.toUpperCase(),
    recordsAdded: run.records_created,
    recordsUpdated: run.records_updated,
    recordsRemoved: run.records_deactivated,
    status: statusFormatted,
    lastRun: run.started_at ? new Date(run.started_at).toLocaleString() : 'N/A',
    durationMs,
    completedAt: run.completed_at ? new Date(run.completed_at).toLocaleString() : undefined,
    recordsProcessed: run.records_seen,
  };
}

export function mapSourceHealthToMetric(s: SourceHealthSource): SourceHealthMetric {
  const rawStatus = (s.status || '').toUpperCase();
  const status: 'HEALTHY' | 'WARNING' | 'ERROR' | 'STALE' =
    rawStatus === 'AVAILABLE' || rawStatus === 'CONNECTED' || rawStatus === 'HEALTHY'
      ? 'HEALTHY'
      : rawStatus === 'DEGRADED' || rawStatus === 'WARNING'
      ? 'WARNING'
      : 'ERROR';

  return {
    name: s.name,
    endpoint: s.endpoint || 'Not available',
    status,
    lastChecked: s.last_checked_at ? new Date(s.last_checked_at).toLocaleTimeString() : 'Not available',
  };
}

export function mapSyncErrorToRecord(err: SyncErrorOut): SyncErrorRecord {
  return {
    id: err.id,
    dataset: err.item_identifier || 'GENERAL',
    errorType: err.error_type,
    message: err.message,
    timestamp: err.created_at ? new Date(err.created_at).toLocaleString() : 'N/A',
  };
}

export function mapGapReportItem(item: GapReportItem): AdminGapReportItem {
  return {
    query: item.query || 'Unknown',
    frequency: typeof item.frequency === 'number' ? item.frequency : 0,
    category: item.category || 'Uncategorized',
    retrievalScore: typeof item.retrieval_score === 'number' ? item.retrieval_score : null,
    firstTimestamp: item.first_timestamp || null,
    latestTimestamp: item.latest_timestamp || null,
  };
}

export function parseGapReportResponse(res: GapReportResponse | GapReportItem[] | null | undefined): AdminGapReportItem[] {
  if (!res) return [];
  if (Array.isArray(res)) return res.map(mapGapReportItem);
  if (Array.isArray(res.items)) return res.items.map(mapGapReportItem);
  return [];
}

export const adminService = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    // Real summary computed from backend source-health and sync runs
    const health = await adminApi.getSourceHealth();
    const runs = await adminApi.listSyncRuns({ page: 1, page_size: 50 });

    const totalProcessed = runs.items.reduce((acc, r) => acc + (r.records_seen || 0), 0);
    const totalCreated = runs.items.reduce((acc, r) => acc + (r.records_created || 0), 0);
    const totalUpdated = runs.items.reduce((acc, r) => acc + (r.records_updated || 0), 0);
    const activeSources = health.sources.filter(s => s.status === 'available' || s.status === 'connected').length;

    return {
      totalSyncRuns: runs.pagination.total_items,
      totalRecordsProcessed: totalProcessed,
      totalRecordsCreated: totalCreated,
      totalRecordsUpdated: totalUpdated,
      sourceHealthStatus: health.status ? health.status.toUpperCase() : 'UNKNOWN',
      activeSourcesCount: activeSources,
      totalSourcesCount: health.sources.length,
      lastCheckedAt: health.checked_at ? new Date(health.checked_at).toLocaleTimeString() : 'N/A',
    };
  },

  getSyncLogs: async (): Promise<AdminSyncRecord[]> => {
    const res = await adminApi.listSyncRuns({ page: 1, page_size: 20 });
    return res.items.map(mapSyncRunToAdminSyncRecord);
  },

  getSourceHealth: async (): Promise<SourceHealthMetric[]> => {
    const res = await adminApi.getSourceHealth();
    return res.sources.map(mapSourceHealthToMetric);
  },

  getSyncErrors: async (): Promise<SyncErrorRecord[]> => {
    const res = await adminApi.listSyncErrors({ page: 1, page_size: 20 });
    return res.items.map(mapSyncErrorToRecord);
  },

  getGapReport: async (params?: { limit?: number; offset?: number }): Promise<AdminGapReportItem[]> => {
    const res = await adminApi.getGapReport(params);
    return parseGapReportResponse(res);
  },

  getReviewQueue: async (): Promise<HumanReviewQueueItem[]> => {
    throw new ApiError('Review Queue unavailable — no backend endpoint is currently provided.', 404, 'NOT_IMPLEMENTED');
  },

  triggerSync: async (dataset: string = 'standards') => {
    const res = await adminApi.triggerSync(dataset);
    return {
      success: res.status !== 'FAILED',
      message: `Triggered sync for dataset: ${res.dataset}. Processed ${res.records_seen} records.`,
      syncedAt: new Date().toLocaleTimeString(),
      syncRunId: res.sync_run_id,
    };
  },
};

