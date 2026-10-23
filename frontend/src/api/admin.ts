import { apiClient } from './client';
import {
  PaginatedResponse,
  SourceHealthOut,
  SyncErrorOut,
  SyncRunOut,
  TriggerSyncResponse,
  GapReportItem,
  GapReportResponse,
} from '../types/api';

export interface SyncRunsFilterParams {
  dataset?: string;
  status?: string;
  page?: number;
  page_size?: number;
}

export interface SyncErrorsFilterParams {
  sync_run_id?: string;
  error_type?: string;
  page?: number;
  page_size?: number;
}

export const adminApi = {
  getSourceHealth: async (): Promise<SourceHealthOut> => {
    return apiClient.get<SourceHealthOut>('/admin/source-health');
  },

  listSyncRuns: async (params?: SyncRunsFilterParams): Promise<PaginatedResponse<SyncRunOut>> => {
    return apiClient.get<PaginatedResponse<SyncRunOut>>('/admin/sync/runs', params);
  },

  listSyncErrors: async (params?: SyncErrorsFilterParams): Promise<PaginatedResponse<SyncErrorOut>> => {
    return apiClient.get<PaginatedResponse<SyncErrorOut>>('/admin/sync/errors', params);
  },

  triggerSync: async (dataset: string): Promise<TriggerSyncResponse> => {
    return apiClient.post<TriggerSyncResponse>(`/admin/sync/${encodeURIComponent(dataset)}`);
  },

  getGapReport: async (params?: { limit?: number; offset?: number }): Promise<GapReportResponse | GapReportItem[]> => {
    return apiClient.get<GapReportResponse | GapReportItem[]>('/admin/gap-report', params);
  },
};
