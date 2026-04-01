const BASE = import.meta.env.VITE_API_URL ?? '';

async function apiFetch(path, options = {}, token = null) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }

  return data;
}

export const api = {
  register: (email, password) =>
    apiFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  login: (email, password) =>
    apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  getSnippets: (token) =>
    apiFetch('/api/snippets', {}, token),
  saveSnippet: (token, title, code) =>
    apiFetch('/api/snippets', {
      method: 'POST',
      body: JSON.stringify({ title, code }),
    }, token),
  deleteSnippet: (token, id) =>
    apiFetch(`/api/snippets/${id}`, { method: 'DELETE' }, token),
};
