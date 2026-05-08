export const ROUTES = {
  home: '/',
  login: '/entrar',
  proposals: {
    list: '/propostas',
    detail: (id: number | string) => `/propostas/${id}`,
  },
  myApplications: '/minhas-candidaturas',
  dashboard: '/dashboard',
} as const
