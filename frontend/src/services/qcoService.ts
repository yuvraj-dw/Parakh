import { QcoRecord } from '../types';
import { qcoApi, QCOFilterParams } from '../api/qco';
import { QCOOut } from '../types/api';

export interface QcoQueryParams {
  query?: string;
  product_name?: string;
  ministry?: string;
  status?: string;
  standard?: string;
  is_number?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginatedQcoResult {
  items: QcoRecord[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export function mapQCOOutToQcoRecord(qco: QCOOut): QcoRecord {
  return {
    id: qco.id,
    qcoTitle: qco.title,
    product: qco.product_name,
    isNumber: qco.is_number,
    ministry: qco.ministry,
    notificationNo: qco.notification_number || qco.qco_number || undefined,
    notificationDate: qco.notification_date ? String(qco.notification_date) : undefined,
    effectiveDate: qco.effective_date ? String(qco.effective_date) : undefined,
    status: qco.status,
    applicableProducts: [qco.product_name],
    applicableStandards: [qco.is_number],
    sourceGazette: qco.source_url || undefined,
    daysUntilEnforcement: qco.days_until_enforcement,
    isEnforced: qco.is_enforced,
    msmeMicroDeadline: qco.msme_micro_deadline,
    msmeSmallDeadline: qco.msme_small_deadline,
    exemptionNote: qco.exemption_note,
  };
}

export const qcoService = {
  getPaginatedQcoRecords: async (params?: QcoQueryParams): Promise<PaginatedQcoResult> => {
    let isNumber = params?.is_number || (params?.standard && params.standard !== 'ALL' ? params.standard : undefined);
    let productName = params?.product_name?.trim();

    if (params?.query) {
      const q = params.query.trim();
      if (/^IS\s*\d+/i.test(q) || /^\d{3,5}/.test(q)) {
        isNumber = q;
      } else if (!productName) {
        productName = q;
      }
    }

    const apiParams: QCOFilterParams = {
      product_name: productName || undefined,
      ministry: params?.ministry && params.ministry !== 'ALL' ? params.ministry : undefined,
      status: params?.status && params.status !== 'ALL' ? params.status : undefined,
      is_number: isNumber,
      page: params?.page || 1,
      page_size: params?.pageSize || 20,
    };

    const res = await qcoApi.listQCOs(apiParams);
    const items = res.items.map(mapQCOOutToQcoRecord);

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

  getQcoRecords: async (params?: QcoQueryParams): Promise<QcoRecord[]> => {
    const res = await qcoService.getPaginatedQcoRecords(params);
    return res.items;
  },

  getQcoById: async (id: string): Promise<QcoRecord> => {
    const qco = await qcoApi.getQCOById(id);
    return mapQCOOutToQcoRecord(qco);
  },
};
