// CN: 统一 API 工具（前端版），参考 formbase_sample_api/app.js 并适配 React Native 环境
import Constants from 'expo-constants';

// CN: 从 Expo extra 读取变量（由 app.config.js 注入）
const { API_BASE_URL, JWT_TOKEN, USERNAME } = Constants.expoConfig?.extra || {};

// CN: 基础校验，开发期尽早发现未配置的环境变量
export function assertEnvReady() {
  if (!API_BASE_URL) throw new Error('API_BASE_URL undefined');
  if (!JWT_TOKEN) throw new Error('JWT_TOKEN undefined');
  if (!USERNAME) throw new Error('USERNAME undefined');
}

/**
 * 发起 API 请求
 * @param {string} endpoint - 形如 "/form"、"/field"、"/record" 或包含查询的完整路径
 * @param {string} method - GET/POST/PATCH/DELETE，默认 GET
 * @param {object|null} body - 写操作请求体，自动附加 username
 * @returns {Promise<any>} - JSON 响应或空对象（无内容）
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
    // CN: 后端要求所有写操作体内包含 username 以满足行级安全
    options.body = JSON.stringify({ ...body, username: USERNAME });
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, options);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }

  // CN: 处理无内容或非 JSON 响应，避免 JSON 解析错误（如 DELETE 204）
  if (res.status === 204) return {};
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return res.json();
  }
  // CN: 其他情况返回空对象（例如空文本）
  return {};
}

// CN: 表单资源 API
export const FormApi = {
  list: () => apiRequest('/form'),
  create: ({ name, description }) => apiRequest('/form', 'POST', { name, description }),
  update: (id, partial) => apiRequest(`/form?id=eq.${id}`, 'PATCH', partial),
  // CN: 删除时附加 username=eq 过滤，只删除本人数据
  remove: (id) => apiRequest(`/form?id=eq.${id}&username=eq.${USERNAME}`, 'DELETE'),
};

// CN: 字段资源 API
export const FieldApi = {
  listByForm: (formId) => apiRequest(`/field?form_id=eq.${formId}`),
  create: (payload) => apiRequest('/field', 'POST', payload),
};

// CN: 记录资源 API
export const RecordApi = {
  listByForm: (formId, { limit = 20, offset = 0 } = {}) =>
    apiRequest(`/record?form_id=eq.${formId}&limit=${limit}&offset=${offset}`),
  create: (payload) => apiRequest('/record', 'POST', payload),
  remove: (id) => apiRequest(`/record?id=eq.${id}&username=eq.${USERNAME}`, 'DELETE'),
};

// CN: JSONB 过滤构造（线性 AND/OR，不支持括号分组）
// CN: conditions 示例：[{ path: "values->>category", op: "ilike", value: "*Python*" }]
export function buildJsonbFilterQuery(formId, conditions = [], join = 'AND') {
  const base = [`form_id=eq.${formId}`];
  if (!Array.isArray(conditions) || conditions.length === 0) return `/record?${base.join('&')}`;

  const upperJoin = (join || 'AND').toUpperCase();
  if (upperJoin === 'OR') {
    // CN: or=() 语法需要 path.op.value，用点连接；path 使用原始 JSON 路径（values->>field）
    const parts = conditions.map((c) => `${c.path}.${c.op}.${c.value}`);
    return `/record?${base.join('&')}&or=(${parts.join(',')})`;
  }
  // AND：线性参数 path=op.value
  const items = conditions.map((c) => `${encodeURIComponent(c.path)}=${c.op}.${encodeURIComponent(c.value)}`);
  return `/record?${[...base, ...items].join('&')}`;
}
