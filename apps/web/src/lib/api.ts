import { createClient } from "./supabase/server";

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  
  if (session?.access_token) {
    headers.set('Authorization', `Bearer ${session.access_token}`);
  }

  // Gunakan URL internal 'http://api:3001' jika di dalam docker (Server-side fetch)
  // Atau fallback ke 'http://localhost:3001'
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
    } catch (e) {
      // Ignore
    }
    throw new Error(errorMessage);
  }

  // Jika response berupa 204 No Content atau empty
  if (res.status === 204) return null;
  
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}
