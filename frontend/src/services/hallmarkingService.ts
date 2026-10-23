import { HallmarkingCentre } from '../types';
import { hallmarkingApi, HallmarkingFilterParams } from '../api/hallmarking';
import { AHCCentreOut } from '../types/api';

export interface AhcQueryParams {
  state?: string;
  city?: string;
  query?: string;
  search?: string;
  pincode?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginatedAhcResult {
  items: HallmarkingCentre[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export function mapAHCCentreOutToHallmarkingCentre(ahc: AHCCentreOut): HallmarkingCentre {
  const caps = ahc.metal_capabilities || [];
  const metalCap: 'Gold (Au)' | 'Silver (Ag)' | 'Gold & Silver' | undefined =
    caps.includes('GOLD') && caps.includes('SILVER')
      ? 'Gold & Silver'
      : caps.includes('SILVER')
      ? 'Silver (Ag)'
      : caps.includes('GOLD')
      ? 'Gold (Au)'
      : undefined;

  return {
    id: ahc.id,
    name: ahc.name,
    code: ahc.recognition_number,
    state: ahc.state,
    city: ahc.city,
    address: [ahc.city, ahc.district, ahc.state].filter(Boolean).join(', '),
    metalCapability: metalCap,
    metalCapabilities: ahc.metal_capabilities,
    status: ahc.status,
  };
}

export const hallmarkingService = {
  getPaginatedAhcCentres: async (params?: AhcQueryParams): Promise<PaginatedAhcResult> => {
    const rawSearch = params?.search?.trim() || params?.query?.trim();
    const apiParams: HallmarkingFilterParams = {
      search: rawSearch || undefined,
      state: params?.state && params.state !== 'ALL' ? params.state : undefined,
      city: params?.city && params.city !== 'ALL' ? params.city : undefined,
      pincode: params?.pincode && params.pincode.trim() ? params.pincode.trim() : undefined,
      page: params?.page || 1,
      page_size: params?.pageSize || 20,
    };

    const res = await hallmarkingApi.listCentres(apiParams);
    const items = res.items.map(mapAHCCentreOutToHallmarkingCentre);

    return {
      items,
      page: res.pagination.page,
      pageSize: res.pagination.page_size,
      totalItems: res.pagination.total_items,
      totalPages: res.pagination.total_pages,
      hasNext: res.pagination.has_next,
      hasPrev: res.pagination.has_prev,
    };
  },

  getAhcCentres: async (params?: AhcQueryParams): Promise<HallmarkingCentre[]> => {
    const res = await hallmarkingService.getPaginatedAhcCentres(params);
    return res.items;
  },
};
