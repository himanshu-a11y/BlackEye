// src/types/index.ts

export interface GeoResult {
  ip: string;
  version: string; // IPv4 / IPv6
  country: string;
  country_code: string;
  region: string;
  city: string;
  postal: string;
  continent: string;
  timezone: string;
  latitude: number | null;
  longitude: number | null;
  isp: string;
  org: string;
  asn: string;
  domain: string;
  connection_type: string;
  is_vpn: boolean | null;
  is_proxy: boolean | null;
  is_tor: boolean | null;
  is_hosting: boolean | null;
  is_mobile: boolean | null;
}

export interface ProviderResult {
  name: string;
  data: Partial<GeoResult>;
  success: boolean;
  error?: string;
}

export interface ConsistencyField {
  field: string;
  agreement: number;   // 0-3
  total: number;       // 3
  values: Record<string, string>; // provider -> value
  consistent: boolean;
}

export interface GeolocationResponse {
  success: boolean;
  test_id: string;
  timestamp: string;
  ip: string;
  normalized: GeoResult;
  providers: ProviderResult[];
  consistency: ConsistencyField[];
  consistency_score: 'HIGH' | 'MEDIUM' | 'LOW';
  errors: string[];
}

export interface PhoneResult {
  input: string;
  international_format: string;
  national_format: string;
  country: string;
  country_code: string;
  carrier: string;
  timezone: string[];
  number_type: string;
  is_valid: boolean;
  is_possible: boolean;
}

export interface UsernameCheck {
  platform: string;
  category?: string;
  url: string;
  status: 'FOUND' | 'NOT_FOUND' | 'UNKNOWN' | 'ERROR' | 'TIMEOUT' | 'RATE_LIMITED';
  response_time: number;
}

export interface UsernameResult {
  username: string;
  checks: UsernameCheck[];
  timestamp: string;
}

export interface HistoryRecord {
  id: string;
  test_type: string;
  target: string;
  country: string;
  country_code?: string;
  region: string;
  city: string;
  isp: string;
  asn: string;
  consistency_score: string;
  timestamp: string;
}

export interface Stats {
  total_tests: number;
  today_tests: number;
  unique_ips: number;
  avg_consistency: string;
}

export interface DnsRecord {
  name: string;
  type: string;
  ttl: number;
  data: string;
}

export interface SslInfo {
  valid: boolean;
  subject: string;
  issuer: string;
  valid_from: string | null;
  valid_to: string | null;
  days_left: number;
  tls_version: string | null;
  cipher: string | null;
  sans: string[];
  is_expired: boolean;
  error?: string | null;
}

export interface SecurityHeaderItem {
  header: string;
  status: 'SECURE' | 'WARNING' | 'MISSING';
  importance: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  current_value: string | null;
  description: string;
  recommendation: string;
}

export interface HeaderAudit {
  reachable: boolean;
  status_code?: number;
  score: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  server_info: string;
  headers_analysis: SecurityHeaderItem[];
  redirect_chain?: string[];
  error?: string;
}

export interface DomainReconData {
  domain: string;
  timestamp: string;
  primary_ips: string[];
  dns: Record<string, DnsRecord[]>;
  ssl: SslInfo;
  audit: HeaderAudit;
}

export interface DomainReconResponse {
  success: boolean;
  test_id: string;
  timestamp: string;
  domain: string;
  data: DomainReconData;
}
