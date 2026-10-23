/**
 * BIS Parakh - FastAPI Backend Integration Types
 * Strictly reflects backend Pydantic schemas from Parakh FastAPI service.
 */

export interface PaginationMeta {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

export interface ApiErrorDetail {
  code: string;
  message: string;
  request_id?: string;
  details?: unknown;
}

export interface ApiErrorEnvelope {
  error: ApiErrorDetail;
}

// 1. Standards
export interface StandardOut {
  id: string;
  is_number: string;
  title: string;
  year?: number | null;
  status: string;
  scope?: string | null;
  source_name: string;
  source_url?: string | null;
  last_verified_at: string;
}

// 2. QCO
export interface QCOOut {
  id: string;
  qco_number?: string | null;
  title: string;
  product_name: string;
  is_number: string;
  ministry: string;
  notification_number?: string | null;
  notification_date?: string | null;
  effective_date?: string | null;
  status: string;
  source_url?: string | null;
  days_until_enforcement?: number;
  is_enforced?: boolean;
  msme_micro_deadline?: string | null;
  msme_small_deadline?: string | null;
  exemption_note?: string | null;
}

// 3. Certification Schemes & Product Mapping
export interface CertificationSchemeOut {
  id?: string;
  scheme_code: string;
  name: string;
  description?: string;
  procedure: string;
}

export interface ProductMappingRequest {
  description: string;
}

export interface RejectedAlternative {
  standard_code: string;
  standard_title: string;
  reason_rejected: string;
}

export interface ProductMappingResponse {
  candidate_standard: string;
  standard_title: string;
  is_mandatory: boolean;
  applicable_qco: string;
  certification_scheme: string;
  confidence: number;
  reasoning: string;
  rejected_alternatives?: RejectedAlternative[];
}

// 4. Laboratories
export interface LaboratoryOut {
  id: string;
  recognition_code: string;
  name: string;
  address?: string | null;
  city: string;
  district?: string | null;
  state: string;
  pincode?: string | null;
  status: string;
  valid_from?: string | null;
  valid_until?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  distance_km?: number | null;
  maps_url?: string | null;
}

// 5. Hallmarking Centres
export interface AHCCentreOut {
  id: string;
  recognition_number: string;
  name: string;
  city: string;
  district?: string | null;
  state: string;
  status: string;
  metal_capabilities?: string[] | null;
}

// 6. Licensed Jewellers
export interface JewellerOut {
  id: string;
  registration_number: string;
  name: string;
  city: string;
  district?: string | null;
  state: string;
  metal_category?: string | null;
  status: string;
}

// 7. Verification
export type VerificationStatus =
  | 'UNKNOWN'
  | 'PENDING'
  | 'VERIFIED'
  | 'NOT_VERIFIED'
  | 'NOT_FOUND'
  | 'EXPIRED'
  | 'SUSPENDED'
  | 'ERROR'
  | string;

export interface HUIDVerificationData {
  huid?: string;
  jeweller_name?: string;
  jeweller_registration?: string;
  ahc_name?: string;
  ahc_recognition?: string;
  fineness?: string;
  article_type?: string;
  gross_weight?: string;
  net_weight?: string;
  hallmarking_date?: string;
}

export interface LicenceVerificationData {
  licence_no?: string;
  grantee_name?: string;
  is_number?: string;
  validity?: string;
}

export interface RNumberVerificationData {
  r_number?: string;
  product?: string;
  is_number?: string;
  brand?: string;
}

export type VerificationData =
  | HUIDVerificationData
  | LicenceVerificationData
  | RNumberVerificationData
  | Record<string, unknown>;

export interface VerificationResponse<T = VerificationData> {
  status: VerificationStatus;
  normalized_identifier: string;
  source_name: string;
  source_url?: string | null;
  retrieved_at: string;
  data?: T | null;
  notes?: string | null;
}

// 8. Vision / Scanner & Assay
export interface JewelleryScanDetection {
  detected_huid?: string | null;
  detected_fineness?: string | null;
  detected_bis_logo: boolean;
  confidence_score: number;
}

export interface AssayReportData {
  report_number?: string | null;
  centre_name?: string | null;
  metal?: string | null;
  reported_purity?: string | null;
  test_date?: string | null;
  sample_description?: string | null;
}

// 9. AI Chat Assistant
export type ChatPersona = 'CONSUMER' | 'INDUSTRY';

export interface ChatRequest {
  message?: string;
  query?: string;
  conversation_id?: string;
  persona?: ChatPersona;
}

export interface ChatCitation {
  document_title?: string;
  standard_number?: string;
  clause?: string;
  page?: string | number;
  source_url?: string;
  verified_in_db?: boolean;
}

export interface ChatResponse {
  conversation_id: string;
  answer: string;
  citations: ChatCitation[];
}

export interface ConversationOut {
  id: string;
  title: string;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface ChatMessageOut {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: ChatCitation[];
  created_at?: string | null;
}

// 10. Authentication
export type AuthRegistrationRole = 'CONSUMER' | 'INDUSTRY';

export interface RegisterRequest {
  email: string;
  password: string;
  role: AuthRegistrationRole;
}

export interface UserResponse {
  id: string;
  email: string;
  role: string;
  is_active: boolean;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  role: string;
  user_id: string;
}

// 11. Admin Operations
export interface SyncRunOut {
  id: string;
  dataset: string;
  status: string;
  records_seen: number;
  records_created: number;
  records_updated: number;
  records_deactivated: number;
  source: string;
  started_at?: string | null;
  completed_at?: string | null;
}

export interface SyncErrorOut {
  id: string;
  sync_run_id?: string | null;
  item_identifier?: string | null;
  error_type: string;
  message: string;
  raw_payload?: Record<string, unknown> | null;
  created_at?: string | null;
}

export interface SourceHealthSource {
  name: string;
  status: string;
  endpoint?: string;
  type?: string;
  last_checked_at?: string;
}

export interface SourceHealthOut {
  status: string;
  sources: SourceHealthSource[];
  checked_at: string;
}

export interface TriggerSyncResponse {
  dataset: string;
  status: string;
  records_seen: number;
  records_created: number;
  records_updated: number;
  records_deactivated: number;
  errors: number;
  sync_run_id?: string;
}

// 12. Whistleblower Grievances
export type IncidentType =
  | 'COUNTERFEIT_ISI'
  | 'FAKE_HUID'
  | 'UNCERTIFIED_PRODUCT'
  | 'LAB_REPORT_FRAUD'
  | string;

export interface WhistleblowerReportRequest {
  incident_type: IncidentType;
  suspect_entity: string;
  location: string;
  description: string;
  image_url?: string | null;
}

export interface WhistleblowerReportResponse {
  tracking_code: string;
  status: string;
  incident_type: IncidentType;
  message: string;
}

export interface WhistleblowerDetailResponse {
  id?: string;
  tracking_code: string;
  incident_type: IncidentType;
  suspect_entity: string;
  location: string;
  evidence_text?: string;
  image_url?: string | null;
  status: string;
  created_at?: string;
}

// 13. Admin Gap Report
export interface GapReportItem {
  query: string;
  frequency: number;
  category: string;
  retrieval_score?: number | null;
  first_timestamp?: string | null;
  latest_timestamp?: string | null;
}

export interface GapReportResponse {
  items: GapReportItem[];
  total_items?: number;
}

