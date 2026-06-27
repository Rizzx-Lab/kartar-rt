// Admin API Service - Connect to Laravel Backend

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

async function adminFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;

  // Jika body adalah FormData, JANGAN set Content-Type
  const isFormData = options.body instanceof FormData;
  const headers: HeadersInit = {
    'Accept': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: { ...headers, ...(options.headers || {}) },
    });

    const data = await response.json();

    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        window.location.href = '/admin/login';
      }
      return { success: false, message: 'Sesi berakhir. Silakan login ulang.' };
    }

    return {
      success: data.success ?? response.ok,
      data: data.data ?? data,
      message: data.message,
    };
  } catch (error) {
    console.error('Admin API Error:', error);
    return { success: false, message: 'Terjadi kesalahan koneksi.' };
  }
}

// ========================
// DASHBOARD
// ========================
export async function getAdminDashboard() {
  return adminFetch<any>('/admin/dashboard');
}

// ========================
// PROGRAMS
// ========================
export async function getPrograms() {
  return adminFetch<any[]>('/admin/programs');
}

export async function createProgram(data: FormData) {
  return adminFetch<any>('/admin/programs', {
    method: 'POST',
    body: data,
  });
}

export async function updateProgram(id: number, data: FormData) {
  // Laravel tidak support PUT dengan FormData, pakai POST dengan method spoofing
  data.append('_method', 'PUT');
  return adminFetch<any>(`/admin/programs/${id}`, {
    method: 'POST',
    body: data,
  });
}

export async function deleteProgram(id: number) {
  return adminFetch<any>(`/admin/programs/${id}`, {
    method: 'DELETE',
  });
}

// ========================
// PROGRAM SESSIONS
// ========================
export async function getProgramSessions(programId: number) {
  return adminFetch<any[]>(`/admin/programs/${programId}/sessions`);
}

export async function createSession(programId: number, data: any, createAnnouncement = false) {
  return adminFetch<any>(`/admin/programs/${programId}/sessions?create_announcement=${createAnnouncement}`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateSession(programId: number, sessionId: number, data: any) {
  return adminFetch<any>(`/admin/programs/${programId}/sessions/${sessionId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteSession(programId: number, sessionId: number) {
  return adminFetch<any>(`/admin/programs/${programId}/sessions/${sessionId}`, {
    method: 'DELETE',
  });
}

// ========================
// ANNOUNCEMENTS
// ========================
export async function getAnnouncements() {
  return adminFetch<any[]>('/admin/announcements');
}

export async function createAnnouncement(data: any) {
  return adminFetch<any>('/admin/announcements', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateAnnouncement(id: number, data: any) {
  return adminFetch<any>(`/admin/announcements/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteAnnouncement(id: number) {
  return adminFetch<any>(`/admin/announcements/${id}`, {
    method: 'DELETE',
  });
}

// ========================
// GALLERIES
// ========================
export async function getGalleries() {
  return adminFetch<any[]>('/admin/galleries');
}

export async function createGallery(data: FormData) {
  return adminFetch<any>('/admin/galleries', {
    method: 'POST',
    body: data,
  });
}

export async function updateGallery(id: number, data: FormData) {
  data.append('_method', 'PUT');
  return adminFetch<any>(`/admin/galleries/${id}`, {
    method: 'POST',
    body: data,
  });
}

export async function deleteGallery(id: number) {
  return adminFetch<any>(`/admin/galleries/${id}`, {
    method: 'DELETE',
  });
}

export async function addGalleryPhotos(galleryId: number, data: FormData) {
  return adminFetch<any>(`/admin/galleries/${galleryId}/photos`, {
    method: 'POST',
    body: data,
  });
}

export async function getGalleryPhotos(galleryId: number) {
  return adminFetch<any[]>(`/admin/galleries/${galleryId}/photos`);
}

export async function deleteGalleryPhoto(photoId: number) {
  return adminFetch<any>(`/admin/photos/${photoId}`, {
    method: 'DELETE',
  });
}

// ========================
// CONTACTS
// ========================
export async function getContacts() {
  return adminFetch<any[]>('/admin/contacts');
}

export async function markContactRead(id: number) {
  return adminFetch<any>(`/admin/contacts/${id}/read`, {
    method: 'PATCH',
  });
}

export async function deleteContact(id: number) {
  return adminFetch<any>(`/admin/contacts/${id}`, {
    method: 'DELETE',
  });
}

// ========================
// NOTIFICATIONS (Contacts sebagai sumber notifikasi)
// ========================
export async function getNotifications() {
  // contacts unread sebagai notifikasi
  const response = await adminFetch<any[]>('/admin/contacts');
  return response;
}

// ========================
// USERS
// ========================
export async function getUsers() {
  return adminFetch<any[]>('/admin/users');
}

export async function createUser(data: any) {
  return adminFetch<any>('/admin/users', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateUser(id: number, data: any) {
  return adminFetch<any>(`/admin/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteUser(id: number) {
  return adminFetch<any>(`/admin/users/${id}`, {
    method: 'DELETE',
  });
}

// ========================
// ORGANIZATION MEMBERS
// ========================
export async function getOrganizationMembers() {
  return adminFetch<any[]>('/admin/organization');
}

export async function createMember(data: FormData) {
  return adminFetch<any>('/admin/organization', {
    method: 'POST',
    body: data,
  });
}

export async function updateMember(id: number, data: FormData) {
  data.append('_method', 'PUT');
  return adminFetch<any>(`/admin/organization/${id}`, {
    method: 'POST',
    body: data,
  });
}

export async function deleteMember(id: number) {
  return adminFetch<any>(`/admin/organization/${id}`, {
    method: 'DELETE',
  });
}

// ========================
// SETTINGS
// ========================
export async function getSettings() {
  return adminFetch<any>('/admin/settings');
}

export async function updateSettings(data: any, hasFile = false) {
  // Always use FormData since frontend always sends it
  if (data instanceof FormData) {
    return adminFetch<any>('/admin/settings', {
      method: 'POST',
      body: data,
    });
  }

  // Fallback to JSON if somehow data is not FormData
  const formattedData: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'boolean') {
      formattedData[key] = value ? '1' : '0';
    } else if (value !== undefined && value !== null) {
      formattedData[key] = value;
    }
  }

  return adminFetch<any>('/admin/settings', {
    method: 'POST',
    body: JSON.stringify(formattedData),
  });
}

// ========================
// WEBSITE ANALYTICS (Placeholder - belum ada endpoint)
export async function getWebsiteAnalytics() {
  return { success: true, data: null, message: 'Endpoint analytics belum tersedia' };
}

// ========================
// PUSH NOTIFICATIONS
// ========================

// Fetch the VAPID public key from the backend (never hardcoded)
export async function getPushVapidKey(): Promise<string | null> {
  try {
    const response = await fetch(`${API_URL}/push/vapid-public-key`);
    const data = await response.json();
    return data?.data?.publicKey ?? null;
  } catch {
    return null;
  }
}

// Subscribe to push notifications
export async function subscribePush(subscription: PushSubscriptionJSON): Promise<boolean> {
  try {
    const result = await adminFetch('/push/subscribe', {
      method: 'POST',
      body: JSON.stringify(subscription),
    });
    return result.success;
  } catch {
    return false;
  }
}

// Unsubscribe from push notifications
export async function unsubscribePush(): Promise<boolean> {
  try {
    // Get existing subscription to get the endpoint
    const registration = await navigator.serviceWorker?.ready;
    if (!registration) return false;

    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) return true; // Already unsubscribed

    const endpoint = subscription.endpoint;

    const result = await adminFetch('/push/unsubscribe', {
      method: 'DELETE',
      body: JSON.stringify({ endpoint }),
    });

    // Also unsubscribe from browser push manager
    await subscription.unsubscribe();

    return result.success;
  } catch {
    return false;
  }
}