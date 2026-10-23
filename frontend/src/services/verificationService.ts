import { HuidVerificationResult, LicenceVerificationResult, CrsVerificationResult } from '../types';
import { verificationApi } from '../api/verification';
import {
  VerificationResponse,
  HUIDVerificationData,
  LicenceVerificationData,
  RNumberVerificationData,
} from '../types/api';

export function mapVerificationResponseToHuidResult(res: VerificationResponse<HUIDVerificationData>): HuidVerificationResult {
  const d = res.data;
  const isVerified = res.status === 'VERIFIED';

  return {
    huid: res.normalized_identifier || d?.huid || '',
    isValidFormat: res.normalized_identifier ? /^[A-Z0-9]{6}$/i.test(res.normalized_identifier) : true,
    isVerifiedLive: isVerified,
    status: res.status,
    jewellerRegNo: d?.jeweller_registration || undefined,
    jewellerName: d?.jeweller_name || undefined,
    ahcCode: d?.ahc_recognition || undefined,
    ahcName: d?.ahc_name || undefined,
    metalFineness: d?.fineness || undefined,
    hallmarkingDate: d?.hallmarking_date || undefined,
    articleType: d?.article_type || undefined,
    articleWeight: d?.gross_weight || d?.net_weight || undefined,
    officialSource: res.source_name || undefined,
    sourceUrl: res.source_url || undefined,
    verifiedAt: res.retrieved_at ? new Date(res.retrieved_at).toLocaleString() : undefined,
    retrievedAt: res.retrieved_at || undefined,
    disclaimer: res.notes || undefined,
  };
}

export function mapVerificationResponseToLicenceResult(res: VerificationResponse<LicenceVerificationData>): LicenceVerificationResult {
  const d = res.data;

  return {
    licenceNo: res.normalized_identifier || d?.licence_no || '',
    status: res.status,
    licenseeName: d?.grantee_name || undefined,
    isNumber: d?.is_number || undefined,
    validTill: d?.validity || undefined,
    certificationDetails: res.notes || undefined,
    officialSource: res.source_name || undefined,
    sourceUrl: res.source_url || undefined,
    verifiedAt: res.retrieved_at ? new Date(res.retrieved_at).toLocaleString() : undefined,
    retrievedAt: res.retrieved_at || undefined,
  };
}

export function mapVerificationResponseToCrsResult(res: VerificationResponse<RNumberVerificationData>): CrsVerificationResult {
  const d = res.data;

  return {
    rNumber: res.normalized_identifier || d?.r_number || '',
    status: res.status,
    companyName: d?.brand || undefined,
    productCategory: d?.product || undefined,
    isStandard: d?.is_number || undefined,
    registrationDetails: res.notes || undefined,
    officialSource: res.source_name || undefined,
    sourceUrl: res.source_url || undefined,
    verifiedAt: res.retrieved_at ? new Date(res.retrieved_at).toLocaleString() : undefined,
    retrievedAt: res.retrieved_at || undefined,
  };
}

export const verificationService = {
  /**
   * Verify HUID directly via Parakh backend endpoint POST /verification/huid
   */
  verifyHuid: async (huid: string): Promise<HuidVerificationResult> => {
    const raw = await verificationApi.verifyHUID(huid.trim());
    return mapVerificationResponseToHuidResult(raw);
  },

  /**
   * Verify BIS Licence CM/L number via backend endpoint POST /verification/licence
   */
  verifyLicence: async (licenceNo: string): Promise<LicenceVerificationResult> => {
    const raw = await verificationApi.verifyLicence(licenceNo.trim());
    return mapVerificationResponseToLicenceResult(raw);
  },

  /**
   * Verify CRS R-Number via backend endpoint POST /verification/r-number
   */
  verifyCrs: async (rNumber: string): Promise<CrsVerificationResult> => {
    const raw = await verificationApi.verifyRNumber(rNumber.trim());
    return mapVerificationResponseToCrsResult(raw);
  },
};
