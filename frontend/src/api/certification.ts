import { apiClient } from './client';
import { CertificationSchemeOut, ProductMappingResponse } from '../types/api';

export const certificationApi = {
  listSchemes: async (): Promise<CertificationSchemeOut[]> => {
    return apiClient.get<CertificationSchemeOut[]>('/certification/schemes');
  },

  mapProduct: async (description: string): Promise<ProductMappingResponse> => {
    return apiClient.post<ProductMappingResponse>('/certification/map-product', { description });
  },
};
