import axios from 'axios';
import { authService } from './authService';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://ri2ubpde14.execute-api.us-west-2.amazonaws.com/prod';

const getAuthHeaders = async () => {
  const idToken = await authService.getIdToken();
  return {
    'Authorization': `Bearer ${idToken}`,
    'Content-Type': 'application/json'
  };
};

export const apiService = {
  // Generic CRUD methods
  getAll: async (endpoint) => {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${API_BASE_URL}${endpoint}`, { headers });
    return response.data;
  },

  getById: async (endpoint, id) => {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${API_BASE_URL}${endpoint}/${id}`, { headers });
    return response.data;
  },

  create: async (endpoint, data) => {
    const headers = await getAuthHeaders();
    const response = await axios.post(`${API_BASE_URL}${endpoint}`, data, { headers });
    return response.data;
  },

  update: async (endpoint, id, data) => {
    const headers = await getAuthHeaders();
    const response = await axios.put(`${API_BASE_URL}${endpoint}/${id}`, data, { headers });
    return response.data;
  },

  delete: async (endpoint, id) => {
    const headers = await getAuthHeaders();
    const response = await axios.delete(`${API_BASE_URL}${endpoint}/${id}`, { headers });
    return response.data;
  },

  // Allergens
  getAllergens: async () => apiService.getAll('/allergens'),
  getAllergen: async (id) => apiService.getById('/allergens', id),
  createAllergen: async (data) => apiService.create('/allergens', data),
  updateAllergen: async (id, data) => apiService.update('/allergens', id, data),
  deleteAllergen: async (id) => apiService.delete('/allergens', id),

  // Antibody Trends
  getAntibodyTrends: async () => apiService.getAll('/antibody-trends'),
  getAntibodyTrend: async (id) => apiService.getById('/antibody-trends', id),
  createAntibodyTrend: async (data) => apiService.create('/antibody-trends', data),
  updateAntibodyTrend: async (id, data) => apiService.update('/antibody-trends', id, data),
  deleteAntibodyTrend: async (id) => apiService.delete('/antibody-trends', id),

  // Autoimmune Markers
  getAutoimmuneMarkers: async () => apiService.getAll('/autoimmune-markers'),
  getAutoimmuneMarker: async (id) => apiService.getById('/autoimmune-markers', id),
  createAutoimmuneMarker: async (data) => apiService.create('/autoimmune-markers', data),
  updateAutoimmuneMarker: async (id, data) => apiService.update('/autoimmune-markers', id, data),
  deleteAutoimmuneMarker: async (id) => apiService.delete('/autoimmune-markers', id),

  // Vaccinations
  getVaccinations: async () => apiService.getAll('/vaccinations'),
  getVaccination: async (id) => apiService.getById('/vaccinations', id),
  createVaccination: async (data) => apiService.create('/vaccinations', data),
  updateVaccination: async (id, data) => apiService.update('/vaccinations', id, data),
  deleteVaccination: async (id) => apiService.delete('/vaccinations', id),

  // Immunity Passports
  getImmunityPassports: async () => apiService.getAll('/immunity-passports'),
  getImmunityPassport: async (id) => apiService.getById('/immunity-passports', id),
  createImmunityPassport: async (data) => apiService.create('/immunity-passports', data),
  updateImmunityPassport: async (id, data) => apiService.update('/immunity-passports', id, data),
  deleteImmunityPassport: async (id) => apiService.delete('/immunity-passports', id)
};
