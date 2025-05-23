export const API_BASE_URL = 'http://localhost:3000/api';

async function request<T>(
  path: string,
  options: RequestInit = {},
  useAuth: boolean = true
): Promise<T> {
  const headers: Record<string, string> = { ...(options.headers || {}) as Record<string, string> };

  // Tambahkan token jika diperlukan
  if (useAuth) {
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  // Tambahkan Content-Type default jika body bukan FormData
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const payload = await res.json();

  if (!res.ok) {
    const msg = (payload && (payload as any).message) || res.statusText;
    throw new Error(msg);
  }

  return payload as T;
}

export const api = {
  get: <T>(path: string, useAuth = true) =>
    request<T>(path, { method: 'GET' }, useAuth),

  post: <T>(path: string, body: any, useAuth = true) =>
    request<T>(
      path,
      {
        method: 'POST',
        body: JSON.stringify(body),
      },
      useAuth
    ),

  put: <T>(path: string, body: any, useAuth = true) =>
    request<T>(
      path,
      {
        method: 'PUT',
        body: JSON.stringify(body),
      },
      useAuth
    ),

  delete: <T>(path: string, useAuth = true) =>
    request<T>(path, { method: 'DELETE' }, useAuth),

  postFormData: <T>(path: string, formData: FormData, useAuth = true) =>
    request<T>(
      path,
      {
        method: 'POST',
        body: formData,
      },
      useAuth
    ),

  putFormData: <T>(path: string, formData: FormData, useAuth = true) =>
    request<T>(
      path,
      {
        method: 'PUT',
        body: formData,
      },
      useAuth
    ),
};
