const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

export async function apiFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    signal: AbortSignal.timeout(5000),
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  get: async <T = unknown>(p: string) => (await apiFetch(p)) as T,
  post: async <T = unknown>(p: string, body: unknown) =>
    (await apiFetch(p, { method: 'POST', body: JSON.stringify(body) })) as T,
  put: async <T = unknown>(p: string, body: unknown) =>
    (await apiFetch(p, { method: 'PUT', body: JSON.stringify(body) })) as T,
  del: async <T = unknown>(p: string) =>
    (await apiFetch(p, { method: 'DELETE' })) as T,
};

export async function uploadFile(file: File): Promise<{ url: string }> {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch(`${API_URL}/api/upload`, {
    method: 'POST',
    body: fd,
    credentials: 'include',
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Upload failed: ${res.status}`);
  }
  return res.json();
}

export type AdminUser = { id: string; email: string; name: string };
