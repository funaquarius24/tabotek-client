import type { FileRecord } from '@/lib/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export const fileProvider = {
  async uploadFile(file: File, unique: number = 0): Promise<FileRecord> {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    const base64 = btoa(binary);

    const res = await fetch(`${API_BASE}/api/files/upload?unique=${unique}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file: base64,
        filename: file.name,
        type: file.type,
        unique,
      }),
      credentials: 'include',
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(error.error || `HTTP ${res.status}`);
    }

    return res.json();
  },

  async getFiles(params?: { page?: number; limit?: number; type?: string }): Promise<{ files: FileRecord[]; pagination: { total: number; page: number; limit: number; totalPages: number } }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.type) searchParams.set('type', params.type);

    const query = searchParams.toString();
    const res = await fetch(`${API_BASE}/api/files${query ? `?${query}` : ''}`, {
      credentials: 'include',
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Failed to fetch files' }));
      throw new Error(error.error || `HTTP ${res.status}`);
    }

    return res.json();
  },

  async deleteFile(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/api/files?id=${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Delete failed' }));
      throw new Error(error.error || `HTTP ${res.status}`);
    }

    return res.json();
  },
};
