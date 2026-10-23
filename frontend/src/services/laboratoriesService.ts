import { TestingLab } from '../types';
import { laboratoriesApi, LaboratoriesFilterParams } from '../api/laboratories';
import { LaboratoryOut } from '../types/api';

export interface LabQueryParams {
  query?: string;
  state?: string;
  city?: string;
  standard?: string;
  is_number?: string;
  user_lat?: number;
  user_lng?: number;
  userLat?: number;
  userLng?: number;
  page?: number;
  pageSize?: number;
}

export interface PaginatedLaboratoriesResult {
  items: TestingLab[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export function mapLaboratoryOutToTestingLab(lab: LaboratoryOut): TestingLab {
  return {
    id: lab.id,
    name: lab.name,
    code: lab.recognition_code,
    state: lab.state,
    district: lab.district || undefined,
    city: lab.city,
    address: lab.address || `${lab.city}, ${lab.state}${lab.pincode ? ` - ${lab.pincode}` : ''}`,
    status: lab.status,
    validity: lab.valid_until ? `Valid until ${String(lab.valid_until)}` : lab.valid_from ? `Valid from ${String(lab.valid_from)}` : undefined,
    latitude: lab.latitude,
    longitude: lab.longitude,
    distanceKm: lab.distance_km ?? undefined,
    mapsUrl: lab.maps_url ?? undefined,
  };
}

export const laboratoriesService = {
  getPaginatedLaboratories: async (params?: LabQueryParams): Promise<PaginatedLaboratoriesResult> => {
    let isNumber = params?.is_number || (params?.standard && params.standard !== 'ALL' ? params.standard : undefined);
    if (!isNumber && params?.query) {
      const q = params.query.trim();
      if (/^IS\s*\d+/i.test(q) || /^\d{3,5}/.test(q)) {
        isNumber = q;
      }
    }

    const userLat = params?.user_lat ?? params?.userLat;
    const userLng = params?.user_lng ?? params?.userLng;

    const apiParams: LaboratoriesFilterParams = {
      state: params?.state && params.state !== 'ALL' ? params.state : undefined,
      city: params?.city && params.city !== 'ALL' ? params.city : undefined,
      is_number: isNumber,
      user_lat: userLat,
      user_lng: userLng,
      page: params?.page || 1,
      page_size: params?.pageSize || 20,
    };

    const res = await laboratoriesApi.listLaboratories(apiParams);
    const items = res.items.map(mapLaboratoryOutToTestingLab);

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

  getLaboratories: async (params?: LabQueryParams): Promise<TestingLab[]> => {
    const res = await laboratoriesService.getPaginatedLaboratories(params);
    return res.items;
  },

  getLaboratoryById: async (recognitionCode: string): Promise<TestingLab> => {
    const lab = await laboratoriesApi.getLaboratoryByCode(recognitionCode);
    return mapLaboratoryOutToTestingLab(lab);
  },
};
