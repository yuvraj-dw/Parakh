import { apiClient } from './client';
import { PaginatedResponse, StandardOut } from '../types/api';

export interface StandardsFilterParams {
  q?: string;
  is_number?: string;
  status?: string;
  page?: number;
  page_size?: number;
}

export const standardsApi = {
  listStandards: async (params?: StandardsFilterParams): Promise<PaginatedResponse<StandardOut>> => {
    const rawSearch = params?.q?.trim();
    const queryParams: Record<string, string | number> = {};
    if (rawSearch) {
      queryParams.q = rawSearch;
    }
    if (params?.is_number) {
      queryParams.is_number = params.is_number;
    }
    if (params?.status) {
      queryParams.status = params.status;
    }
    if (params?.page) {
      queryParams.page = params.page;
    }
    if (params?.page_size) {
      queryParams.page_size = params.page_size;
    }
    return apiClient.get<PaginatedResponse<StandardOut>>('/standards', queryParams);
  },

  getStandardByNumber: async (isNumber: string): Promise<StandardOut> => {
    return apiClient.get<StandardOut>(`/standards/${encodeURIComponent(isNumber)}`);
  },
};
