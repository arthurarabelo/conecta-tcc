export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

export const API_ENDPOINTS = {
  auth: {
    register: '/register',
    login: '/login',
    logout: '/logout',
    me: '/me',
  },
  proposals: {
    list: '/proposals',
    show: (id: number) => `/proposals/${id}`,
    store: '/proposals',
    update: (id: number) => `/proposals/${id}`,
    destroy: (id: number) => `/proposals/${id}`,
    apply: (id: number) => `/proposals/${id}/apply`,
  },
  applications: {
    list: '/applications',
    show: (id: number) => `/applications/${id}`,
    approve: (id: number) => `/applications/${id}/approve`,
    reject: (id: number) => `/applications/${id}/reject`,
  },
} as const
