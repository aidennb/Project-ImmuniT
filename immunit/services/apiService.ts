// ImmuniT API Service
// Connects to Jon's deployed DynamoDB backend (immunit-infra)
// 3 Lambdas: UserManagement, ImmunityData, VaccineTracking
import { CONFIG } from './config';
import { authService } from './authService';

async function getHeaders(): Promise<Record<string, string>> {
  const token = await authService.getIdToken();
  return {
    'Content-Type': 'application/json',
    'x-api-key': CONFIG.API_KEY,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request<T>(
  method: string,
  path: string,
  body?: Record<string, any>,
): Promise<T> {
  const headers = await getHeaders();
  const url = `${CONFIG.API_BASE_URL}${path}`;

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || error.message || `API error: ${response.status}`);
  }

  return response.json();
}

// ---------------------------------------------------------------------------
// Type definitions matching Jon's DynamoDB Lambda responses
// ---------------------------------------------------------------------------

export interface UserProfile {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  nationality: string;
  profile_complete: boolean;
  consent_hipaa: boolean;
  consent_research: boolean;
  created_at: number;
  updated_at: number;
}

export interface VaccineRecord {
  record_id: string;
  user_id: string;
  vaccine_name: string;
  vaccine_type: string;
  manufacturer: string;
  admin_date: number;
  next_due_date: number;
  batch_number: string;
  location: string;
  provider: string;
  dose_number: number;
  protection_status: string;
  efficacy_percentile: number;
}

export interface VaccineRecommendation {
  vaccine_name: string;
  current_protection_level: number;
  status: string;
  urgency: string;
  priority: number;
  recommendation: string;
  days_since_last_dose: number;
  recommended_interval_days: number;
  last_vaccination_date: string;
  trend: string;
}

export interface ImmunityData {
  user_id: string;
  vaccine_metrics: {
    vaccines: Record<string, {
      protection_level: number;
      status: string;
      antibody_titer: number;
      population_percentile: number;
      trend: string;
    }>;
  } | null;
  autoimmune_data: {
    markers: Record<string, {
      reactivity_level: number;
      population_percentile: number;
      risk_status: string;
      associated_conditions: string[];
    }>;
    overall_risk_score: number;
    flagged_markers: string[];
  } | null;
  allergen_data: {
    food_allergens: Record<string, {
      reactivity: number;
      risk_level: string;
      population_percentile: number;
    }>;
    environmental_allergens: Record<string, {
      reactivity: number;
      risk_level: string;
      population_percentile: number;
      seasonal_pattern?: boolean;
    }>;
  } | null;
  neuroprotective_data: {
    markers: Record<string, {
      antibody_level: number;
      population_percentile: number;
      status: string;
      protective_threshold: number;
    }>;
    overall_protection_score: number;
  } | null;
}

// ---------------------------------------------------------------------------
// API methods — matching Jon's 3-Lambda endpoint structure
// ---------------------------------------------------------------------------

export const apiService = {
  // ---- UserManagement Lambda ----

  createUser: (data: {
    email: string;
    first_name?: string;
    last_name?: string;
    date_of_birth?: string;
  }) =>
    request<{ message: string; user: UserProfile }>('POST', '/users', data),

  getUser: (userId: string) =>
    request<{ user: UserProfile }>('GET', `/users/${userId}`),

  updateUser: (userId: string, data: Partial<UserProfile>) =>
    request<{ message: string; user: UserProfile }>('PUT', `/users/${userId}`, data),

  deleteUser: (userId: string) =>
    request<{ message: string }>('DELETE', `/users/${userId}`),

  // ---- ImmunityData Lambda ----

  getImmunityData: (userId: string) =>
    request<ImmunityData>('GET', `/immunity-data/${userId}`),

  ingestTestResults: (data: {
    user_id: string;
    sample_id?: string;
    peptide_count?: number;
    quality_score?: number;
    vaccine_antibodies?: Record<string, any>;
    autoimmune_markers?: Record<string, any>;
    allergen_data?: Record<string, any>;
    neuroprotective_markers?: Record<string, any>;
  }) =>
    request<{ message: string; test_id: string; metrics: any }>('POST', '/immunity-data', data),

  // ---- VaccineTracking Lambda ----

  getVaccineHistory: (userId: string) =>
    request<{ user_id: string; vaccine_history: VaccineRecord[]; total_vaccines: number }>(
      'GET', `/vaccines/${userId}`,
    ),

  addVaccine: (data: {
    user_id: string;
    vaccine_name: string;
    vaccine_type?: string;
    manufacturer?: string;
    admin_date?: number;
    batch_number?: string;
    location?: string;
    provider?: string;
    dose_number?: number;
  }) =>
    request<{ message: string; record: VaccineRecord }>('POST', '/vaccines', data),

  getVaccineRecommendations: (userId: string) =>
    request<{
      user_id: string;
      recommendations: VaccineRecommendation[];
      urgent_count: number;
      high_priority_count: number;
    }>('GET', `/vaccines/${userId}/recommendations`),

  getVaccineComparison: (userId: string) =>
    request<{
      user_id: string;
      comparisons: Array<{
        vaccine_name: string;
        your_efficacy: number;
        herd_threshold: number;
        above_threshold: boolean;
        difference: number;
        population_percentile: number;
      }>;
    }>('GET', `/vaccines/${userId}/comparison`),

  // ---- Convenience helpers ----

  getDashboard: async (userId: string) => {
    const [immunityRes, vaccineRes] = await Promise.all([
      apiService.getImmunityData(userId),
      apiService.getVaccineHistory(userId),
    ]);

    const vaccines = immunityRes.vaccine_metrics?.vaccines || {};
    const protectedCount = Object.values(vaccines).filter(v => v.status === 'protected').length;
    const waningCount = Object.values(vaccines).filter(v => v.status === 'waning').length;
    const totalVaccines = Object.keys(vaccines).length || vaccineRes.total_vaccines;

    const neuroScore = immunityRes.neuroprotective_data?.overall_protection_score ?? 0;
    const autoRisk = immunityRes.autoimmune_data?.overall_risk_score ?? 0;

    const overallScore = totalVaccines > 0
      ? Math.round(Object.values(vaccines).reduce((sum, v) => sum + v.protection_level, 0) / totalVaccines)
      : 0;

    return {
      vaccine_metrics: vaccines,
      vaccine_history: vaccineRes.vaccine_history,
      total_vaccines: totalVaccines,
      protected_count: protectedCount,
      waning_count: waningCount,
      overall_score: overallScore,
      neuro_protection_score: neuroScore,
      autoimmune_risk_score: autoRisk,
      autoimmune_data: immunityRes.autoimmune_data,
      allergen_data: immunityRes.allergen_data,
      neuroprotective_data: immunityRes.neuroprotective_data,
      flagged_markers: immunityRes.autoimmune_data?.flagged_markers || [],
    };
  },
};
