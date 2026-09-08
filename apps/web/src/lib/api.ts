import { cookies } from "next/headers";

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("better-auth.session_token")?.value;
  
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  
  if (sessionToken) {
    headers.set('Authorization', `Bearer ${sessionToken}`);
  }

  const baseUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  
  const url = `${baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  
  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorMessage = `API Request Failed with status ${res.status}`;
    try {
      const errorData = await res.json();
      if (errorData.message) {
        errorMessage = Array.isArray(errorData.message) ? errorData.message.join(', ') : errorData.message;
      }
    } catch (e) {}
    throw new Error(errorMessage);
  }

  if (res.status === 204) return null;
  
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}
