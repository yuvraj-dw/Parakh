import { apiClient } from './client';
import {
  WhistleblowerReportRequest,
  WhistleblowerReportResponse,
  WhistleblowerDetailResponse,
} from '../types/api';

export const whistleblowerApi = {
  submitReport: async (data: WhistleblowerReportRequest): Promise<WhistleblowerReportResponse> => {
    return apiClient.post<WhistleblowerReportResponse>('/grievances/whistleblower', data);
  },

  trackReport: async (trackingCode: string): Promise<WhistleblowerDetailResponse> => {
    return apiClient.get<WhistleblowerDetailResponse>(`/grievances/whistleblower/${encodeURIComponent(trackingCode.trim())}`);
  },
};
