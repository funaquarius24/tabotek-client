export const queryKeys = {
  articles: {
    all: ['articles'] as const,
    lists: () => [...queryKeys.articles.all, 'list'] as const,
    list: (params?: any) => [...queryKeys.articles.lists(), params] as const,
    details: () => [...queryKeys.articles.all, 'detail'] as const,
    detail: (slug: string) => [...queryKeys.articles.details(), slug] as const,
  },
  categories: {
    all: ['categories'] as const,
    lists: () => [...queryKeys.categories.all, 'list'] as const,
    list: (params?: any) => [...queryKeys.categories.lists(), params] as const,
    details: () => [...queryKeys.categories.all, 'detail'] as const,
    detail: (slug: string) => [...queryKeys.categories.details(), slug] as const,
  },
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: () => [...queryKeys.users.lists()] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
  },
  files: {
    all: ['files'] as const,
    lists: () => [...queryKeys.files.all, 'list'] as const,
    list: (params?: any) => [...queryKeys.files.lists(), params] as const,
  },
  admin: {
    stats: ['admin', 'stats'] as const,
  },
};