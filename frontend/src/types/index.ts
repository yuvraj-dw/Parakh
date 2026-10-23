export type NavRoute =
  | 'dashboard'
  | '/'
  | 'login'
  | '/login'
  | 'ai-assistant'
  | 'chat'
  | '/chat'
  | 'standards-explorer'
  | 'standards'
  | '/standards'
  | '/standards/search'
  | '/standards/:id'
  | '/standards/:id/clauses'
  | 'product-to-standard'
  | '/product-to-standard'
  | 'certification'
  | '/certification'
  | '/certification/schemes'
  | '/certification/mapping'
  | '/certification/roadmap'
  | '/certification/checklist'
  | 'qco-regulations'
  | '/qco-regulations'
  | 'testing-laboratories'
  | 'laboratories'
  | '/laboratories'
  | 'hallmarking-jewellery'
  | 'hallmarking'
  | '/hallmarking'
  | '/hallmarking/centres'
  | '/hallmarking/scanner'
  | '/hallmarking/purity'
  | '/hallmarking/assay'
  | '/hallmarking/huid'
  | 'licensed-jewellers'
  | '/licensed-jewellers'
  | 'verification-suite'
  | '/verification-suite'
  | 'verify'
  | '/verify'
  | '/verify/huid'
  | '/verify/licence'
  | '/verify/crs'
  | 'consumer-services'
  | '/consumer-services'
  | 'documents-analysis'
  | 'document-image-lab'
  | '/document-image-lab'
  | '/document-analysis'
  | '/image-analysis'
  | '/label-scanner'
  | '/assay-explainer'
  | 'compliance-gap'
  | '/compliance-gap'
  | 'whistleblower'
  | '/whistleblower'
  | 'admin-dashboard'
  | 'admin'
  | '/admin'
  | '/admin/health'
  | '/admin/sync'
  | '/admin/review'
  | '/admin/gap-report'
  | 'government-services'
  | '/government-services'
  | 'analysis-tools'
  | '/analysis-tools'
  | 'administration'
  | '/administration';

export type Language = 'en' | 'hi' | 'ta' | 'bn' | 'mr';

export type ChatPersona = 'CONSUMER' | 'INDUSTRY';

export type VerificationBadgeType = 
  | 'VERIFIED' 
  | 'SOURCE-BACKED' 
  | 'AI-ASSISTED' 
  | 'UNVERIFIED' 
  | 'UNABLE_TO_VERIFY';

export interface SourceCitation {
  id: string;
  documentTitle?: string;
  isNumber?: string;
  versionYear?: string;
  clause?: string;
  page?: string | number;
  sourceName?: string;
  sourceUrl?: string;
  retrievedDate?: string;
  confidence?: number | null;
}

export interface IndianStandard {
  id: string;
  isNumber: string;
  title: string;
  year?: string;
  status: 'ACTIVE' | 'UNDER_REVISION' | 'WITHDRAWN' | string;
  scope?: string;
  bisSourceUrl?: string;
  sourceReference?: string;
  lastUpdated?: string;
}

export interface ProductAttribute {
  name: string;
  value: string;
  confidence: number;
}

export interface TestingLab {
  id: string;
  name: string;
  code: string;
  state: string;
  district?: string;
  city: string;
  address?: string;
  contact?: string;
  email?: string;
  capabilities?: string[];
  accreditedStandards?: string[];
  services?: string[];
  validity?: string;
  status: 'RECOGNIZED' | 'AUDIT_PENDING' | 'SUSPENDED' | string;
  officialSource?: string;
  lastVerified?: string;
  distanceKm?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  mapsUrl?: string | null;
}

export interface HallmarkingCentre {
  id: string;
  name: string;
  code: string;
  state: string;
  city: string;
  district?: string;
  address?: string;
  contact?: string;
  services?: string[];
  metalCapability?: string;
  metalCapabilities?: string[] | null;
  status: 'OPERATIONAL' | 'RECOGNITION_EXPIRED' | 'AUDIT_IN_PROGRESS' | string;
  validity?: string;
  officialSource?: string;
  lastVerified?: string;
}

export interface LicensedJeweller {
  id: string;
  licenceNo: string;
  jewellerName: string;
  address?: string;
  city: string;
  state: string;
  district?: string;
  contact?: string;
  metalCategory?: string;
  status: 'OPERATIVE' | 'SURRENDERED' | 'CANCELLED' | string;
  validTill?: string;
  lastSynchronized?: string;
}

export interface QcoRecord {
  id: string;
  qcoTitle?: string;
  product: string;
  isNumber: string;
  ministry: string;
  notificationNo?: string;
  notificationDate?: string;
  effectiveDate?: string;
  status: 'ENFORCED' | 'UPCOMING' | 'EXTENDED' | string;
  applicableProducts?: string[];
  applicableStandards?: string[];
  complianceRequirements?: string[];
  importantDates?: {
    notification?: string;
    enforcement?: string;
    extension?: string;
  };
  sourceGazette?: string;
  sourceReference?: string;
  lastSynchronized?: string;
  daysUntilEnforcement?: number;
  isEnforced?: boolean;
  msmeMicroDeadline?: string | null;
  msmeSmallDeadline?: string | null;
  exemptionNote?: string | null;
}

export interface CertificationScheme {
  id: string;
  name: string;
  code: string;
  badge: string;
  description: string;
  applicableProducts?: string[];
  eligibility?: string;
  basicProcedure?: string[];
  requiredDocuments?: string[];
  importantSteps?: string[];
}

export interface ProductCertificationMapping {
  id: string;
  productName: string;
  category: string;
  applicableScheme: string;
  applicableStandard: string;
  standardTitle: string;
  requiredDocuments?: string[];
  basicProcess?: string[];
  rejectedAlternatives?: Array<{
    standard_code: string;
    standard_title: string;
    reason_rejected: string;
  }>;
}

export interface ProductMatchResult {
  id: string;
  candidate_standard: string;
  isNumber: string;
  title: string;
  standard_title: string;
  is_mandatory: boolean;
  qcoMandatory: boolean;
  applicable_qco?: string | null;
  applicableQco?: string | null;
  certification_scheme?: string | null;
  certificationRequirement?: string | null;
  confidence?: number | null;
  relevance?: number | null;
  reasoning?: string | null;
  explanation?: string | null;
  rejectedAlternatives: Array<{
    standard_code: string;
    standard_title: string;
    reason_rejected: string;
  }>;
}

export interface HuidVerificationResult {
  huid: string;
  isValidFormat: boolean;
  isVerifiedLive: boolean;
  status: 'VERIFIED' | 'INVALID_FORMAT' | 'NOT_FOUND' | 'UNAVAILABLE' | string;
  jewellerRegNo?: string;
  jewellerName?: string;
  ahcCode?: string;
  ahcName?: string;
  metalFineness?: string; // e.g. "22K (916)"
  hallmarkingDate?: string;
  articleType?: string;
  articleWeight?: string;
  officialSource?: string;
  sourceUrl?: string;
  verifiedAt?: string;
  retrievedAt?: string;
  disclaimer?: string;
}

export interface LicenceVerificationResult {
  licenceNo: string;
  status: 'OPERATIVE' | 'EXPIRED' | 'SUSPENDED' | 'NOT_FOUND' | string;
  licenseeName?: string;
  isNumber?: string;
  validTill?: string;
  scheme?: string;
  certificationDetails?: string;
  officialSource?: string;
  sourceUrl?: string;
  verifiedAt?: string;
  retrievedAt?: string;
}

export interface CrsVerificationResult {
  rNumber: string;
  status: 'ACTIVE' | 'EXPIRED' | 'INVALID' | 'SUSPENDED' | string;
  companyName?: string;
  productCategory?: string;
  isStandard?: string;
  registrationDetails?: string;
  officialSource?: string;
  sourceUrl?: string;
  verifiedAt?: string;
  retrievedAt?: string;
}

export interface NavigationStatePayload {
  search?: string;
  query?: string;
  standard?: string;
  initialMessage?: string;
}

export type NavigationPayload = string | NavigationStatePayload | undefined | null;

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  conversation_id?: string;
  persona?: ChatPersona;
  standard?: {
    isNumber: string;
    title: string;
  };
  reasoning?: string;
  citations?: SourceCitation[];
  actions?: {
    label: string;
    route: NavRoute;
    payload?: NavigationPayload;
  }[];
  isHallucinationGuard?: boolean;
}

export interface ConversationHistoryItem {
  id: string;
  title: string;
  preview: string;
  timestamp: string;
  messageCount: number;
}

export interface ComplianceGapItem {
  id: string;
  clause: string;
  parameter: string;
  bisRequirement: string;
  evidenceFound: string;
  gapStatus: 'COMPLIANT' | 'GAP_FOUND' | 'PARTIAL' | 'UNVERIFIABLE';
  remedialAction: string;
  sourceStandard: string;
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface ComplianceSummary {
  overallStatus: 'COMPLIANT' | 'GAP_FOUND' | 'PARTIAL_COMPLIANCE' | 'AUDIT_READY';
  requirementsMet: number;
  requirementsPending: number;
  missingInformation: string[];
}

export interface AdminSyncRecord {
  id: string;
  sourceName?: string;
  dataType: string;
  recordsAdded?: number;
  recordsUpdated?: number;
  recordsRemoved?: number;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  lastRun: string;
  durationMs?: number;
  completedAt?: string;
  recordsProcessed?: number;
  errorsCount?: number;
}

export interface SyncErrorRecord {
  id: string;
  dataset: string;
  errorType: string;
  message: string;
  timestamp: string;
}

export interface SourceHealthMetric {
  name: string;
  endpoint?: string;
  status: 'HEALTHY' | 'WARNING' | 'ERROR' | 'STALE';
  uptimePercentage?: number;
  latencyMs?: number;
  lastChecked: string;
  lastSuccessSync?: string;
  records?: number;
}

export interface HumanReviewQueueItem {
  id: string;
  issue: string;
  type: 'AMBIGUOUS_MAPPING' | 'CONFLICTING_SOURCE' | 'OCR_FAILURE' | 'REGULATORY_UNCERTAINTY';
  source: string;
  dataset?: string;
  created: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PENDING' | 'IN_REVIEW' | 'RESOLVED';
  confidenceScore: number;
}

export interface AdminGapReportItem {
  query: string;
  frequency: number;
  category: string;
  retrievalScore: number | null;
  firstTimestamp: string | null;
  latestTimestamp: string | null;
}

