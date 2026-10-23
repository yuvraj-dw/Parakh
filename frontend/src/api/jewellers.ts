import { apiClient } from './client';
import { JewellerOut, PaginatedResponse } from '../types/api';

export interface JewellersFilterParams {
  state?: string;
  city?: string;
  status?: string;
  page?: number;
  page_size?: number;
}

export const jewellersApi = {
  listJewellers: async (
    params?: JewellersFilterParams
  ): Promise<PaginatedResponse<JewellerOut>> => {
    return apiClient.get<PaginatedResponse<JewellerOut>>('/jewellers', params);
  },
};
