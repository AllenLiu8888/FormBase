// Unified API utility for the React Native frontend; adapted from sample backend contract
import Constants from 'expo-constants';

// Read runtime variables from Expo extra (injected via app.config.js)
const { API_BASE_URL, JWT_TOKEN, USERNAME } = Constants.expoConfig?.extra || {};

// Basic guard to fail fast when required env vars are missing
export function assertEnvReady() {
  if (!API_BASE_URL) throw new Error('API_BASE_URL undefined');
  if (!JWT_TOKEN) throw new Error('JWT_TOKEN undefined');
  if (!USERNAME) throw new Error('USERNAME undefined');
}

/**
 * Perform an API request
 * @param {string} endpoint - e.g. "/form", "/field", "/record" or full path with query
 * @param {string} method - GET/POST/PATCH/DELETE (default: GET)
 * @param {object|null} body - write payload; username is auto-injected
 * @returns {Promise<any>} - JSON response or empty object for no-content
 */
export async function apiRequest(endpoint, method = 'GET', body = null) {
  assertEnvReady();

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${JWT_TOKEN}`,
  };

  if (method === 'POST' || method === 'PATCH') {
    headers.Prefer = 'return=representation';
  }

  const options = { method, headers };
  if (body) {
    // Backend requires username in all write payloads to satisfy row-level security
    options.body = JSON.stringify({ ...body, username: USERNAME });
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, options);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }

  // Handle no-content or non-JSON responses safely (e.g., DELETE 204)
  if (res.status === 204) return {};
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return res.json();
  }
  // Fallback: return empty object (e.g., empty text)
  return {};
}

// Form resource API
export const FormApi = {
  list: () => apiRequest('/form'),
  create: ({ name, description }) => apiRequest('/form', 'POST', { name, description }),
  update: (id, partial) => apiRequest(`/form?id=eq.${id}`, 'PATCH', partial),
  // Delete with username filter to ensure only own data is affected
  remove: (id) => apiRequest(`/form?id=eq.${id}&username=eq.${USERNAME}`, 'DELETE'),
};

// Field resource API
export const FieldApi = {
  listByForm: (formId) => apiRequest(`/field?form_id=eq.${formId}`),
  create: (payload) => apiRequest('/field', 'POST', payload),
  update: (id, partial) => apiRequest(`/field?id=eq.${id}`, 'PATCH', partial),
};

// Record resource API
export const RecordApi = {
  listByForm: (formId, { limit = 20, offset = 0 } = {}) =>
    apiRequest(`/record?form_id=eq.${formId}&limit=${limit}&offset=${offset}`),
  create: (payload) => apiRequest('/record', 'POST', payload),
  remove: (id) => apiRequest(`/record?id=eq.${id}&username=eq.${USERNAME}`, 'DELETE'),
};

// JSONB filter query builder (linear AND/OR, no grouped parentheses)
// conditions example: [{ path: "values->>category", op: "ilike", value: "*Python*" }]
export function buildJsonbFilterQuery(formId, conditions = [], join = 'AND') {
  const base = [`form_id=eq.${formId}`];
  if (!Array.isArray(conditions) || conditions.length === 0) return `/record?${base.join('&')}`;

  const upperJoin = (join || 'AND').toUpperCase();
  if (upperJoin === 'OR') {
    // PostgREST or=() uses dotted path.op.value; path uses raw JSON path (values->>field)
    const parts = conditions.map((c) => `${c.path}.${c.op}.${c.value}`);
    return `/record?${base.join('&')}&or=(${parts.join(',')})`;
  }
  // AND: linear params path=op.value
  const items = conditions.map((c) => `${encodeURIComponent(c.path)}=${c.op}.${encodeURIComponent(c.value)}`);
  return `/record?${[...base, ...items].join('&')}`;
}
