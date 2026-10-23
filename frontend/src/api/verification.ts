import { apiClient } from './client';
import {
  VerificationResponse,
  HUIDVerificationData,
  LicenceVerificationData,
  RNumberVerificationData,
} from '../types/api';

export const verificationApi = {
  verifyHUID: async (huid: string): Promise<VerificationResponse<HUIDVerificationData>> => {
    return apiClient.post<VerificationResponse<HUIDVerificationData>>('/verification/huid', { huid });
  },

  verifyLicence: async (licenceNumber: string): Promise<VerificationResponse<LicenceVerificationData>> => {
    return apiClient.post<VerificationResponse<LicenceVerificationData>>('/verification/licence', {
      licence_number: licenceNumber,
    });
  },

  verifyRNumber: async (rNumber: string): Promise<VerificationResponse<RNumberVerificationData>> => {
    return apiClient.post<VerificationResponse<RNumberVerificationData>>('/verification/r-number', {
      r_number: rNumber,
    });
  },
};
