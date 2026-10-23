import { LicensedJeweller } from '../types';
import { jewellersApi, JewellersFilterParams } from '../api/jewellers';
import { JewellerOut } from '../types/api';

export interface JewellerQueryParams {
  state?: string;
  city?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginatedJewellersResult {
  items: LicensedJeweller[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export function mapJewellerOutToLicensedJeweller(j: JewellerOut): LicensedJeweller {
  let metalCategory: 'Gold' | 'Silver' | 'Both' | string | undefined = undefined;
  if (j.metal_category) {
    const upper = j.metal_category.toUpperCase();
    if (upper === 'SILVER') metalCategory = 'Silver';
    else if (upper === 'BOTH') metalCategory = 'Both';
    else if (upper === 'GOLD') metalCategory = 'Gold';
    else metalCategory = j.metal_category;
  }

  return {
    id: j.id,
    licenceNo: j.registration_number,
    jewellerName: j.name,
    address: [j.city, j.district, j.state].filter(Boolean).join(', '),
    city: j.city,
    state: j.state,
    metalCategory,
    status: j.status,
  };
}

export const jewellersService = {
  getPaginatedJewellers: async (params?: JewellerQueryParams): Promise<PaginatedJewellersResult> => {
    const apiParams: JewellersFilterParams = {
      state: params?.state && params.state !== 'ALL' ? params.state : undefined,
      city: params?.city && params.city !== 'ALL' ? params.city : undefined,
      status: params?.status && params.status !== 'ALL' ? params.status : undefined,
      page: params?.page || 1,
      page_size: params?.pageSize || 20,
    };

    const res = await jewellersApi.listJewellers(apiParams);
    const items = res.items.map(mapJewellerOutToLicensedJeweller);

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

  getJewellers: async (params?: JewellerQueryParams): Promise<LicensedJeweller[]> => {
    const res = await jewellersService.getPaginatedJewellers(params);
    return res.items;
  },
};
