const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';

const api = {
  get: async (endpoint) => {
    const res = await fetch(`${BACKEND_URL}${endpoint}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erro na requisição');
    return json;
  },
  
  post: async (endpoint, data) => {
    const isFormData = data instanceof FormData;
    const res = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: 'POST',
      headers: isFormData ? {} : { 'Content-Type': 'application/json' },
      body: isFormData ? data : JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erro na requisição');
    return json;
  },

  put: async (endpoint, data) => {
    const res = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erro na requisição');
    return json;
  },

  delete: async (endpoint) => {
    const res = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erro na requisição');
    return json;
  }
};

export default api;
