export const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
export const apiUrl = (path) => `${API_BASE}${path}`;

// Product photos uploaded from the admin come back as "/api/products/:id/image?v=...".
export const mediaUrl = (url) => (url && url.startsWith('/api/') ? apiUrl(url) : url || null);
