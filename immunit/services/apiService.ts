// ImmuniT API Service
// Connects to the deployed Lambda/API Gateway backend
import { CONFIG } from './config';
import { authService } from './authService';

async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await authService.getIdToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request<T>(
  method: string,
  path: string,
  body?: Record<string, any>,
): Promise<T> {
  const headers = await getAuthHeaders();
  const url = `${CONFIG.API_BASE_URL}${path}`;

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `API error: ${response.status}`);
  }

  return response.json();
}

// Type definitions matching the backend responses
export interface VaccineSummary {
  total: number;
  protected: number;
  waning: number;
  unprotected: number;
}

export interface RiskFlag {
  marker: string;
  z_score: number;
  status: string;
  note: string;
}

export interface DashboardSummary {
  user: { first_name: string; last_name: string } | null;
  overall_score: number;
  risk_level: string;
  vaccine_summary: VaccineSummary;
  neuro_protection_score: number;
  autoimmune_risk_score: number;
  flagged_autoimmune: string[];
  risk_flags: RiskFlag[];
  last_test_date: string | null;
}

export interface VaccineRecord {
  record_id: string;
  vaccine_name: string;
  vaccine_type: string;
  manufacturer: string;
  admin_date: string;
  next_due_date: string | null;
  dose_number: number;
  protection_status: string;
  efficacy_percentile: number;
}

export interface VaccineRecommendation {
  vaccine_name: string;
  current_status: string;
  efficacy_percentile: number;
  last_dose_date: string;
  next_due_date: string | null;
  urgency: string;
  priority: number;
  recommendation: string;
}

export interface AllergenData {
  food_allergens: Record<string, { reactivity: number; risk_level: string; population_percentile: number }>;
  environmental_allergens: Record<string, { reactivity: number; risk_level: string; population_percentile: number; seasonal_pattern?: boolean }>;
  test_date: string;
}

export interface AutoimmuneData {
  markers: Record<string, {
    reactivity_level: number;
    z_score: number;
    population_percentile: number;
    risk_status: string;
    associated_conditions: string[];
  }>;
  overall_risk_score: number;
  flagged_markers: string[];
  test_date: string;
}

export interface NeuroprotectiveData {
  markers: Record<string, {
    antibody_level: number;
    z_score: number;
    population_percentile: number;
    status: string;
    protective_threshold: number;
    clinical_note?: string;
  }>;
  overall_protection_score: number;
  test_date: string;
}

export interface AntibodyTrendPoint {
  date: string;
  value: number;
  z_score: number;
  percentile: number;
  unit: string;
}

export interface AntibodyTrend {
  marker_name: string;
  category: string;
  data_points: AntibodyTrendPoint[];
}

export interface Passport {
  passport_id: string;
  issued_date: string;
  expiry_date: string;
  status: string;
  vaccine_summary: Record<string, any>;
  immunity_summary: Record<string, any>;
  verified_by: string;
}

export interface RiskScore {
  composite_risk_score: number;
  risk_level: string;
  components: {
    vaccine_protection: number;
    autoimmune_risk: number;
    neuroprotective_score: number;
  };
  critical_flags: RiskFlag[];
}

// API methods
export const apiService = {
  // Health check
  health: () => request<any>('GET', '/health'),

  // Dashboard
  getDashboard: (userId: string) =>
    request<DashboardSummary>('GET', `/dashboard/summary?user_id=${userId}`),

  // Vaccinations
  getVaccinations: (userId: string) =>
    request<{ vaccinations: VaccineRecord[]; total: number }>(
      'GET', `/vaccinations?user_id=${userId}`,
    ),

  getVaccineRecommendations: (userId: string) =>
    request<{ recommendations: VaccineRecommendation[]; urgent_count: number; high_priority_count: number }>(
      'GET', `/vaccines/recommendations?user_id=${userId}`,
    ),

  getVaccineTrends: (userId: string) =>
    request<{ vaccine_trends: Record<string, AntibodyTrendPoint[]> }>(
      'GET', `/vaccines/trends?user_id=${userId}`,
    ),

  // Allergens
  getAllergens: (userId: string) =>
    request<{ allergen_data: AllergenData }>('GET', `/allergens?user_id=${userId}`),

  // Autoimmune
  getAutoimmuneMarkers: (userId: string) =>
    request<{ autoimmune_data: AutoimmuneData }>('GET', `/autoimmune-markers?user_id=${userId}`),

  // Neuroprotective
  getNeuroprotectiveMarkers: (userId: string) =>
    request<{ neuroprotective_data: NeuroprotectiveData }>(
      'GET', `/neuroprotective-markers?user_id=${userId}`,
    ),

  // Antibody trends (all categories)
  getAntibodyTrends: (userId: string) =>
    request<{ antibody_trends: AntibodyTrend[] }>('GET', `/antibody-trends?user_id=${userId}`),

  // Immunity passports
  getImmunityPassports: (userId: string) =>
    request<{ passports: Passport[]; total: number }>(
      'GET', `/immunity-passports?user_id=${userId}`,
    ),

  // Risk score
  getRiskScore: (userId: string) =>
    request<RiskScore>('GET', `/risk-score?user_id=${userId}`),

  // Data ingestion
  addVaccination: (data: Record<string, any>) =>
    request<{ message: string; record_id: string }>('POST', '/vaccinations', data),

  addTestResult: (data: Record<string, any>) =>
    request<{ message: string; test_id: string }>('POST', '/test-results', data),
};
