export const ROUTES = {
  home: '/',
  login: '/entrar',
  proposals: {
    list: '/propostas',
    detail: (id: number | string) => `/propostas/${id}`,
    create: '/propostas/nova',
    edit: (id: number | string) => `/propostas/${id}/editar`,
  },
  myApplications: '/minhas-candidaturas',
  dashboard: '/dashboard',
} as const
