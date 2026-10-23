import { apiClient } from './client';
import { AHCCentreOut, PaginatedResponse } from '../types/api';

export interface HallmarkingFilterParams {
  search?: string;
  state?: string;
  city?: string;
  pincode?: string;
  page?: number;
  page_size?: number;
}

export const hallmarkingApi = {
  listCentres: async (
    params?: HallmarkingFilterParams
  ): Promise<PaginatedResponse<AHCCentreOut>> => {
    return apiClient.get<PaginatedResponse<AHCCentreOut>>('/hallmarking/centres', params);
  },
};
