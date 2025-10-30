import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      console.error('Network Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// API functions
export const apiService = {
  // Get all states
  getStates: async () => {
    const response = await api.get('/districts/states');
    return response.data;
  },

  // Get districts by state
  getDistrictsByState: async (stateName) => {
    const response = await api.get(`/districts/by-state/${encodeURIComponent(stateName)}`);
    return response.data;
  },

  // Get district data
  getDistrictData: async (districtCode, finYear = null) => {
    const params = finYear ? { finYear } : {};
    const response = await api.get(`/districts/${districtCode}`, { params });
    // Response is already { success: true, data: { records: [...] } }
    return response.data;
  },

  // Get district summary
  getDistrictSummary: async (districtCode, finYear = null) => {
    const params = finYear ? { finYear } : {};
    const response = await api.get(`/stats/district/${districtCode}/summary`, { params });
    return response.data;
  },

  // Get aggregated state data
  getStateAggregateData: async (stateName) => {
    try {
      const response = await api.get(`/stats/state/${encodeURIComponent(stateName)}/aggregate`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch data for ${stateName}:`, error);
      return null;
    }
  },

  // Reverse geocode to get location info (using browser geolocation + external API)
  reverseGeocode: async (lat, lon) => {
    try {
      // Using OpenStreetMap Nominatim API (free, no API key needed)
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'MGNREGA-Tracker-App/1.0'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  },

  // Chatbot functions
  sendChatMessage: async (message, context = {}) => {
    const response = await api.post('/chatbot/chat', { message, context });
    // Response now includes both text and action
    return response.data;
  },

  getContextualHelp: async (context = {}) => {
    const response = await api.post('/chatbot/help', { context });
    return response.data;
  },
};

export default api;
