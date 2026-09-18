import { auth } from '../firebase';

const API_URL = import.meta.env.VITE_API_URL;

export async function apiFetch(path, options = {}) {
  // FormData bodies (file uploads) need the browser to set their own
  // multipart Content-Type with the boundary — a manual application/json
  // header here would corrupt the request.
  const isFormData = options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...options.headers,
  };

  if (auth.currentUser) {
    const token = await auth.currentUser.getIdToken();
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      message = body.message ?? message;
    } catch {
      // response had no JSON body — keep the generic message
    }
    throw new Error(Array.isArray(message) ? message.join(', ') : message);
  }

  if (res.status === 204) return null;
  return res.json();
}
