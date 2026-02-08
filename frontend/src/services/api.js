const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const AUTH_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '/api/auth') : 'http://localhost:3001/api/auth';

const getAuthHeader = () => {
  const token = localStorage.getItem('authToken');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP error ${response.status}`);
  }
  return response.json();
};

// Medical Cards API
export const cardsAPI = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_BASE_URL}/medical-cards?${params}`, {
      headers: getAuthHeader()
    });
    return handleResponse(response);
  },

  create: async (cardData) => {
    const response = await fetch(`${API_BASE_URL}/medical-cards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(cardData)
    });
    return handleResponse(response);
  },

  update: async (id, cardData) => {
    const response = await fetch(`${API_BASE_URL}/medical-cards/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(cardData)
    });
    return handleResponse(response);
  },

  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/medical-cards/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    return handleResponse(response);
  }
};

// Auth API
export const authAPI = {
  register: async (email, password, name) => {
    const response = await fetch(`${AUTH_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    });
    return handleResponse(response);
  },

  login: async (email, password) => {
    const response = await fetch(`${AUTH_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return handleResponse(response);
  },

  getMe: async () => {
    const response = await fetch(`${AUTH_URL}/me`, {
      headers: getAuthHeader()
    });
    return handleResponse(response);
  }
};

export default {
  cards: cardsAPI,
  auth: authAPI
};
