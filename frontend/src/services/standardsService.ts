import { IndianStandard, ProductMatchResult } from '../types';
import { standardsApi, StandardsFilterParams } from '../api/standards';
import { certificationApi } from '../api/certification';
import { StandardOut } from '../types/api';

export interface StandardsQueryParams {
  query?: string;
  search?: string;
  q?: string;
  is_number?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginatedStandardsResult {
  items: IndianStandard[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export function mapStandardOutToIndianStandard(std: StandardOut): IndianStandard {
  return {
    id: std.id,
    isNumber: std.is_number,
    title: std.title,
    year: std.year ? String(std.year) : undefined,
    status: std.status,
    scope: std.scope || undefined,
    bisSourceUrl: std.source_url || undefined,
    sourceReference: std.source_name || undefined,
    lastUpdated: std.last_verified_at ? new Date(std.last_verified_at).toLocaleDateString() : undefined,
  };
}

export const standardsService = {
  /**
   * Fetch paginated standards directly from backend API
   */
  getPaginatedStandards: async (params?: StandardsQueryParams): Promise<PaginatedStandardsResult> => {
    const rawSearch = params?.query?.trim() || params?.q?.trim() || params?.search?.trim();
    const apiParams: StandardsFilterParams = {
      q: rawSearch || undefined,
      is_number: params?.is_number?.trim() || undefined,
      status: params?.status && params.status !== 'ALL' ? params.status : undefined,
      page: params?.page || 1,
      page_size: params?.pageSize || 20,
    };

    const response = await standardsApi.listStandards(apiParams);
    return {
      items: response.items.map(mapStandardOutToIndianStandard),
      page: response.pagination.page,
      pageSize: response.pagination.page_size,
      totalItems: response.pagination.total_items,
      totalPages: response.pagination.total_pages,
      hasNext: response.pagination.has_next,
      hasPrev: response.pagination.has_prev,
    };
  },

  /**
   * Fetch list of standards directly from backend API
   */
  getStandards: async (params?: StandardsQueryParams): Promise<IndianStandard[]> => {
    const paginated = await standardsService.getPaginatedStandards(params);
    return paginated.items;
  },

  /**
   * Fetch standard detail by IS number or ID directly from backend
   */
  getStandardById: async (idOrNumber: string): Promise<IndianStandard> => {
    const record = await standardsApi.getStandardByNumber(idOrNumber);
    return mapStandardOutToIndianStandard(record);
  },

  /**
   * Matches product to candidate standard using backend /certification/map-product endpoint
   */
  matchProductToStandards: async (description: string, category?: string, keywords?: string): Promise<ProductMatchResult[]> => {
    const fullQuery = [description, category, keywords].filter(Boolean).join(' ');
    const mapping = await certificationApi.mapProduct(fullQuery);

    return [
      {
        id: mapping.candidate_standard,
        candidate_standard: mapping.candidate_standard,
        isNumber: mapping.candidate_standard,
        title: mapping.standard_title,
        standard_title: mapping.standard_title,
        is_mandatory: mapping.is_mandatory,
        qcoMandatory: mapping.is_mandatory,
        applicable_qco: mapping.applicable_qco,
        applicableQco: mapping.applicable_qco,
        certification_scheme: mapping.certification_scheme,
        certificationRequirement: mapping.certification_scheme,
        confidence: mapping.confidence,
        relevance: mapping.confidence != null ? Math.round(mapping.confidence * 100) : null,
        reasoning: mapping.reasoning,
        explanation: mapping.reasoning,
        rejectedAlternatives: (mapping.rejected_alternatives ?? []).map((alt) => ({
          standard_code: alt.standard_code,
          standard_title: alt.standard_title,
          reason_rejected: alt.reason_rejected,
        })),
      },
    ];
  },
};
