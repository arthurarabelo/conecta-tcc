export const QUERY_KEYS = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  proposals: {
    all: ['proposals'] as const,
    list: (filters?: object) => ['proposals', 'list', filters] as const,
    detail: (id: number) => ['proposals', 'detail', id] as const,
  },
  applications: {
    all: ['applications'] as const,
    list: (filters?: object) => ['applications', 'list', filters] as const,
    detail: (id: number) => ['applications', 'detail', id] as const,
  },
} as const
