import { apiClient } from './client';
import { LaboratoryOut, PaginatedResponse } from '../types/api';

export interface LaboratoriesFilterParams {
  state?: string;
  city?: string;
  is_number?: string;
  user_lat?: number;
  user_lng?: number;
  page?: number;
  page_size?: number;
}

export const laboratoriesApi = {
  listLaboratories: async (
    params?: LaboratoriesFilterParams
  ): Promise<PaginatedResponse<LaboratoryOut>> => {
    return apiClient.get<PaginatedResponse<LaboratoryOut>>('/laboratories', params);
  },

  getLaboratoryByCode: async (code: string): Promise<LaboratoryOut> => {
    return apiClient.get<LaboratoryOut>(`/laboratories/${encodeURIComponent(code)}`);
  },
};
