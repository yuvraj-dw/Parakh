import { apiClient } from './client';
import { AssayReportData, JewelleryScanDetection } from '../types/api';

export const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024; // 10MB actual backend limit

export const jewelleryApi = {
  scanJewelleryMarks: async (file: File): Promise<JewelleryScanDetection> => {
    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      throw new Error(`File size exceeds the 10MB limit. Current size is ${(file.size / (1024 * 1024)).toFixed(1)}MB.`);
    }
    const formData = new FormData();
    // Temporary compatibility handling: Live FastAPI OpenAPI declares 'file: UploadFile',
    // whereas Integration Guide specifies 'image: UploadFile'. Providing both ensures compatibility.
    formData.append('file', file);
    formData.append('image', file);
    return apiClient.post<JewelleryScanDetection>('/jewellery/scan', formData, true);
  },

  parseAssayReport: async (file: File): Promise<AssayReportData> => {
    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      throw new Error(`File size exceeds the 10MB limit. Current size is ${(file.size / (1024 * 1024)).toFixed(1)}MB.`);
    }
    const formData = new FormData();
    // Temporary compatibility handling: Live FastAPI OpenAPI declares 'file: UploadFile',
    // whereas Integration Guide specifies 'report_file: UploadFile'. Providing both ensures compatibility.
    formData.append('file', file);
    formData.append('report_file', file);
    return apiClient.post<AssayReportData>('/jewellery/assay-report', formData, true);
  },
};
