import { apiClient } from './client';
import { PaginatedResponse, QCOOut } from '../types/api';

export interface QCOFilterParams {
  product_name?: string;
  ministry?: string;
  status?: string;
  is_number?: string;
  page?: number;
  page_size?: number;
}

export const qcoApi = {
  listQCOs: async (params?: QCOFilterParams): Promise<PaginatedResponse<QCOOut>> => {
    return apiClient.get<PaginatedResponse<QCOOut>>('/qco', params);
  },

  getQCOById: async (id: string): Promise<QCOOut> => {
    return apiClient.get<QCOOut>(`/qco/${encodeURIComponent(id)}`);
  },
};
