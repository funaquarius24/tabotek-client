import { ArticleResponse, CategoryResponse, UserResponse, CreateArticleRequest, UpdateArticleRequest, CreateCategoryRequest, UpdateCategoryRequest, CreateTagRequest, UpdateTagRequest, TagResponse, CreateUserRequest } from './types';

const API_BASE = '';

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const method = options?.method || 'GET';
  console.log(`[fetchAPI] ${method} ${url} | credentials=include | body=${options?.body ? 'yes' : 'no'}`);
  console.log(`[fetchAPI] cookies for this domain:`, document.cookie || '(none)');
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    console.log(`[fetchAPI] ${response.status} ${url}:`, error);
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Articles
export async function getArticles(params?: {
  limit?: number;
  page?: number;
  category?: string;
  status?: string;
  search?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.category) searchParams.set('category', params.category);
  if (params?.status) searchParams.set('status', params.status);
  if (params?.search) searchParams.set('search', params.search);

  const query = searchParams.toString();
  return fetchAPI<{ articles: ArticleResponse[]; pagination: { total: number; page: number; limit: number; totalPages: number } }>(
    `/api/articles${query ? `?${query}` : ''}`
  );
}

export async function getArticleBySlug(slug: string) {
  return fetchAPI<ArticleResponse>(`/api/articles/${slug}`);
}

export async function searchArticles(query: string, limit?: number) {
  const searchParams = new URLSearchParams({ q: query });
  if (limit) searchParams.set('limit', limit.toString());
  return fetchAPI<{ articles: ArticleResponse[]; total: number }>(`/api/articles/search?${searchParams}`);
}

export async function createArticle(data: CreateArticleRequest) {
  return fetchAPI<ArticleResponse>('/api/articles', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateArticle(slug: string, data: UpdateArticleRequest) {
  return fetchAPI<ArticleResponse>(`/api/articles/${slug}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteArticle(slug: string) {
  return fetchAPI<{ success: boolean }>(`/api/articles/${slug}`, {
    method: 'DELETE',
  });
}

export async function voteArticle(slug: string, vote: 'like' | 'dislike' | null, previousVote: 'like' | 'dislike' | null) {
  return fetchAPI<ArticleResponse>(`/api/articles/${slug}/vote`, {
    method: 'POST',
    body: JSON.stringify({ vote, previousVote }),
  });
}

// Categories
export async function getCategories(params?: { featured?: boolean; parent?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.featured) searchParams.set('featured', 'true');
  if (params?.parent) searchParams.set('parent', params.parent);

  const query = searchParams.toString();
  return fetchAPI<{ categories: CategoryResponse[] }>(`/api/categories${query ? `?${query}` : ''}`);
}

export async function getCategoryBySlug(slug: string) {
  return fetchAPI<CategoryResponse>(`/api/categories/${slug}`);
}

export async function createCategory(data: CreateCategoryRequest) {
  return fetchAPI<CategoryResponse>('/api/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateCategory(id: string, data: UpdateCategoryRequest) {
  return fetchAPI<CategoryResponse>(`/api/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// Tags
export async function getTags() {
  return fetchAPI<{ tags: TagResponse[] }>('/api/tags');
}

export async function getTagBySlug(slug: string) {
  return fetchAPI<TagResponse>(`/api/tags/${slug}`);
}

export async function createTag(data: CreateTagRequest) {
  return fetchAPI<TagResponse>('/api/tags', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateTag(id: string, data: UpdateTagRequest) {
  return fetchAPI<TagResponse>(`/api/tags/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function mergeTags(sourceId: string, targetId: string) {
  return fetchAPI<{ success: boolean; sourceTag: string; targetTag: string; articlesUpdated: number }>('/api/tags/merge', {
    method: 'POST',
    body: JSON.stringify({ sourceId, targetId }),
  });
}

export async function cleanupUnusedTags() {
  return fetchAPI<{ success: boolean; deletedCount: number; deletedTags: string[] }>('/api/tags/cleanup', {
    method: 'POST',
  });
}

export async function getTagSuggestions() {
  return fetchAPI<{ suggestions: Array<{ name: string; slug: string; articleCount: number }> }>('/api/tags/suggestions');
}

export async function recountTagCounts() {
  return fetchAPI<{ success: boolean; tagsUpdated: number }>('/api/tags/recount', {
    method: 'POST',
  });
}

export async function deleteTag(id: string) {
  return fetchAPI<{ success: boolean }>(`/api/tags/${id}`, {
    method: 'DELETE',
  });
}

export async function deleteCategory(id: string) {
  return fetchAPI<{ success: boolean }>(`/api/categories/${id}`, {
    method: 'DELETE',
  });
}

// Users
export async function getUsers() {
  return fetchAPI<{ users: UserResponse[] }>('/api/users');
}

export async function getUserById(id: string) {
  return fetchAPI<UserResponse>(`/api/users/${id}`);
}

export async function createUser(data: CreateUserRequest) {
  return fetchAPI<UserResponse>('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateUser(id: string, data: Record<string, unknown>) {
  return fetchAPI<UserResponse>(`/api/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteUser(id: string) {
  return fetchAPI<{ success: boolean }>(`/api/users/${id}`, {
    method: 'DELETE',
  });
}

// User Settings (personalized per user)
export async function getUserSettings() {
  return fetchAPI<{ settings: Record<string, unknown> }>('/api/user/settings');
}

export async function saveUserSettings(settings: Record<string, unknown>) {
  return fetchAPI<{ success: boolean; settings: Record<string, unknown> }>('/api/user/settings', {
    method: 'PUT',
    body: JSON.stringify({ settings }),
  });
}

// Site Settings (global, admin-only)
export async function getSiteSettings() {
  return fetchAPI<{ settings: Record<string, unknown> }>('/api/admin/site-settings');
}

export async function saveSiteSettings(settings: Record<string, unknown>) {
  return fetchAPI<{ success: boolean; settings: Record<string, unknown> }>('/api/admin/site-settings', {
    method: 'PUT',
    body: JSON.stringify({ settings }),
  });
}

// Statistics (admin)
export async function getAdminStats() {
  return fetchAPI<{
    totalArticles: number;
    publishedArticles: number;
    draftArticles: number;
    totalCategories: number;
    totalUsers: number;
  }>('/api/admin/stats');
}