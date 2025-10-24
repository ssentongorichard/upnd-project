// API utility functions
export async function fetcher(url: string) {
  const res = await fetch(url);
  
  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.');
    // Attach extra info to the error object.
    (error as any).info = await res.json();
    (error as any).status = res.status;
    throw error;
  }
  
  return res.json();
}

// Generic API functions
export async function createItem(endpoint: string, data: any) {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to create item');
  }
  
  return res.json();
}

export async function updateItem(endpoint: string, data: any) {
  const res = await fetch(endpoint, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to update item');
  }
  
  return res.json();
}

export async function deleteItem(endpoint: string) {
  const res = await fetch(endpoint, {
    method: 'DELETE',
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to delete item');
  }
  
  return res.json();
}

// Specific API functions for different entities
export const memberAPI = {
  create: (data: any) => createItem('/api/members', data),
  update: (id: string, data: any) => updateItem(`/api/members/${id}`, data),
  delete: (id: string) => deleteItem(`/api/members/${id}`),
  get: (id: string) => fetcher(`/api/members/${id}`),
  getAll: (filters?: any) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    return fetcher(`/api/members?${params.toString()}`);
  },
};

export const eventAPI = {
  create: (data: any) => createItem('/api/events', data),
  update: (id: string, data: any) => updateItem(`/api/events/${id}`, data),
  delete: (id: string) => deleteItem(`/api/events/${id}`),
  get: (id: string) => fetcher(`/api/events/${id}`),
  getAll: (filters?: any) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    return fetcher(`/api/events?${params.toString()}`);
  },
  rsvp: (data: any) => createItem('/api/events/rsvp', data),
  getRsvps: (eventId: string) => fetcher(`/api/events/${eventId}/rsvps`),
};

export const disciplinaryAPI = {
  create: (data: any) => createItem('/api/disciplinary-cases', data),
  update: (id: string, data: any) => updateItem(`/api/disciplinary-cases/${id}`, data),
  delete: (id: string) => deleteItem(`/api/disciplinary-cases/${id}`),
  get: (id: string) => fetcher(`/api/disciplinary-cases/${id}`),
  getAll: (filters?: any) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    return fetcher(`/api/disciplinary-cases?${params.toString()}`);
  },
};

export const communicationAPI = {
  create: (data: any) => createItem('/api/communications', data),
  update: (id: string, data: any) => updateItem(`/api/communications/${id}`, data),
  delete: (id: string) => deleteItem(`/api/communications/${id}`),
  get: (id: string) => fetcher(`/api/communications/${id}`),
  getAll: (filters?: any) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    return fetcher(`/api/communications?${params.toString()}`);
  },
  send: (id: string) => fetcher(`/api/communications/${id}/send`),
  getRecipients: (id: string) => fetcher(`/api/communications/${id}/recipients`),
};

export const membershipCardAPI = {
  create: (data: any) => createItem('/api/membership-cards', data),
  update: (id: string, data: any) => updateItem(`/api/membership-cards/${id}`, data),
  delete: (id: string) => deleteItem(`/api/membership-cards/${id}`),
  get: (id: string) => fetcher(`/api/membership-cards/${id}`),
  getAll: (filters?: any) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    return fetcher(`/api/membership-cards?${params.toString()}`);
  },
  sendReminder: (id: string) => fetcher(`/api/membership-cards/${id}/send-reminder`),
};