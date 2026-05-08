'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';

interface Comment {
  _id: string;
  articleSlug: string;
  parentId: string | null;
  depth: number;
  author: { name: string; email?: string; avatar?: string; userId?: string };
  content: string;
  contentHtml: string;
  likes: number;
  dislikes: number;
  createdAt: string;
}

interface ThreadedComment extends Comment {
  replies: ThreadedComment[];
}

interface PageInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface CommentsProps {
  articleSlug: string;
}

function buildTree(comments: Comment[]): ThreadedComment[] {
  const map = new Map<string, ThreadedComment>();
  const roots: ThreadedComment[] = [];
  const sorted = [...comments].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  for (const c of sorted) map.set(c._id, { ...c, replies: [] });
  for (const c of map.values()) {
    if (c.parentId && map.has(c.parentId)) map.get(c.parentId)!.replies.push(c);
    else roots.push(c);
  }
  return roots;
}

function CommentThread({
  comment, articleSlug, currentUser, isAdmin, articleAuthorId,
  onDelete, onReply, onLike, onEdit, onHide, onFlag, depth,
}: {
  comment: ThreadedComment;
  articleSlug: string;
  currentUser: { _id: string; role: string } | null;
  isAdmin: boolean;
  articleAuthorId: string | null;
  onDelete: (id: string) => void;
  onReply: (parentId: string, content: string) => Promise<void>;
  onLike: (commentId: string, vote: 'like' | 'dislike' | null) => void;
  onEdit: (commentId: string, content: string) => Promise<void>;
  onHide: (commentId: string) => void;
  onFlag: (commentId: string) => void;
  depth: number;
}) {
  const [showReply, setShowReply] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [replying, setReplying] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const isOwn = comment.author?.userId === currentUser?._id;
  const marginLeft = Math.min(depth * 16, 48);

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    setReplying(true);
    await onReply(comment._id, replyContent.trim());
    setReplyContent('');
    setShowReply(false);
    setReplying(false);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editContent.trim()) return;
    setSavingEdit(true);
    await onEdit(comment._id, editContent.trim());
    setEditing(false);
    setSavingEdit(false);
  };

  return (
    <div>
      <div className={`p-4 rounded-lg ${depth === 0 ? 'bg-gray-50' : 'bg-white border border-gray-100'}`} style={{ marginLeft }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold text-xs">
              {comment.author.name.charAt(0).toUpperCase()}
            </div>
            <span className="font-medium text-gray-900 text-sm">{comment.author.name}</span>
            <span className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
            {isOwn && <span className="text-xs text-green-600 font-medium">You</span>}
          </div>
          <div className="flex items-center gap-2">
            {(isOwn || isAdmin) && (
              <button onClick={() => { setEditing(true); setEditContent(comment.content); }} className="text-xs text-gray-500 hover:text-blue-600 transition-colors">Edit</button>
            )}
            {(isOwn || isAdmin) && (
              <button onClick={() => onDelete(comment._id)} className="text-xs text-red-500 hover:text-red-700 transition-colors">Delete</button>
            )}
            {(isAdmin || (articleAuthorId && currentUser?._id === articleAuthorId)) && (
              <button onClick={() => onHide(comment._id)} className="text-xs text-gray-500 hover:text-orange-600 transition-colors">Hide</button>
            )}
            {!isOwn && (
              <button onClick={() => onFlag(comment._id)} className="text-xs text-gray-400 hover:text-red-500 transition-colors">Report</button>
            )}
          </div>
        </div>

        {editing ? (
          <form onSubmit={handleEditSubmit} className="space-y-2">
            <textarea value={editContent} onChange={e => setEditContent(e.target.value)} rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y" required />
            <div className="flex gap-2">
              <button type="submit" disabled={savingEdit} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors">
                {savingEdit ? 'Saving...' : 'Save'}
              </button>
              <button type="button" onClick={() => setEditing(false)} className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-xs transition-colors">Cancel</button>
            </div>
          </form>
        ) : (
          <div className="text-gray-700 text-sm mb-2 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: comment.contentHtml || comment.content }} />
        )}

        <div className="flex items-center gap-3 text-xs text-gray-500">
          <button onClick={() => onLike(comment._id, 'like')} className="inline-flex items-center gap-1 hover:text-blue-600 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
            {comment.likes || 0}
          </button>
          {depth < 3 && (
            <button onClick={() => setShowReply(!showReply)} className="hover:text-blue-600 transition-colors">Reply</button>
          )}
        </div>

        {showReply && (
          <form onSubmit={handleReplySubmit} className="mt-3 space-y-2">
            <textarea value={replyContent} onChange={e => setReplyContent(e.target.value)} placeholder="Write a reply..." rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y" required />
            <div className="flex gap-2">
              <button type="submit" disabled={replying || !replyContent.trim()} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg text-xs font-medium transition-colors">{replying ? 'Posting...' : 'Reply'}</button>
              <button type="button" onClick={() => { setShowReply(false); setReplyContent(''); }} className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-xs transition-colors">Cancel</button>
            </div>
          </form>
        )}
      </div>

      {comment.replies.length > 0 && (
        <div className="space-y-2 mt-2">
          {comment.replies.map(reply => (
            <CommentThread key={reply._id} comment={reply} articleSlug={articleSlug}
              currentUser={currentUser} isAdmin={isAdmin} articleAuthorId={articleAuthorId}
              onDelete={onDelete} onReply={onReply} onLike={onLike} onEdit={onEdit} onHide={onHide} onFlag={onFlag} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Comments({ articleSlug }: CommentsProps) {
  const { user, isLoggedIn, isLoading } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [pagination, setPagination] = useState<PageInfo>({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sort, setSort] = useState<'oldest' | 'newest'>('oldest');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const currentUser = user ? { _id: user._id, role: user.role } : null;
  const isAdmin = user && (user.role === 'admin' || user.role === 'superuser');

  const fetchComments = useCallback(async (page = 1, append = false) => {
    try {
      if (append) setLoadingMore(true); else setLoading(true);
      const res = await fetch(`/api/articles/${articleSlug}/comments?page=${page}&limit=${pagination.limit}&sort=${sort}`);
      if (res.ok) {
        const data = await res.json();
        if (append) setComments(prev => [...prev, ...(data.comments || [])]);
        else setComments(data.comments || []);
        setPagination(data.pagination || { total: 0, page: 1, limit: 20, totalPages: 0 });
      }
    } catch {} finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [articleSlug, pagination.limit, sort]);

  useEffect(() => { fetchComments(1); }, [fetchComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true); setError('');
    try {
      const res = await fetch(`/api/articles/${articleSlug}/comments`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim() }),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); setError(d.error || 'Failed to post comment'); return; }
      setContent('');
      await fetchComments(1);
    } catch { setError('Failed to post comment'); } finally { setSubmitting(false); }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return;
    try {
      const res = await fetch(`/api/articles/${articleSlug}/comments/${commentId}`, { method: 'DELETE' });
      if (res.ok) setComments(prev => prev.filter(c => c._id !== commentId));
    } catch {}
  };

  const handleEdit = async (commentId: string, newContent: string) => {
    const res = await fetch(`/api/articles/${articleSlug}/comments/${commentId}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newContent }),
    });
    if (res.ok) await fetchComments(1);
  };

  const handleReply = async (parentId: string, replyContent: string) => {
    const res = await fetch(`/api/articles/${articleSlug}/comments`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: replyContent, parentId }),
    });
    if (res.ok) await fetchComments(1);
  };

  const handleLike = async (commentId: string, vote: 'like' | 'dislike' | null) => {
    try {
      const res = await fetch(`/api/articles/${articleSlug}/comments/${commentId}/like`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vote }),
      });
      if (res.ok) {
        const updated = await res.json();
        setComments(prev => prev.map(c => c._id === updated._id ? { ...c, likes: updated.likes } : c));
      }
    } catch {}
  };

  const handleHide = async (commentId: string) => {
    try {
      const res = await fetch(`/api/articles/${articleSlug}/comments/${commentId}/hide`, { method: 'PATCH' });
      if (res.ok) setComments(prev => prev.filter(c => c._id !== commentId));
    } catch {}
  };

  const handleFlag = async (commentId: string) => {
    try {
      await fetch(`/api/articles/${articleSlug}/comments/${commentId}/flag`, { method: 'POST' });
    } catch {}
  };

  const handleLoadMore = () => {
    if (!loadingMore && pagination.page < pagination.totalPages) {
      fetchComments(pagination.page + 1, true);
    }
  };

  const handleSortChange = (newSort: 'oldest' | 'newest') => {
    setSort(newSort);
  };

  const tree = buildTree(comments);
  const topLevelCount = comments.filter(c => !c.parentId).length;

  return (
    <div className="mt-12 pt-8 border-t border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Comments ({pagination.total})</h3>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">Sort:</span>
          <button onClick={() => handleSortChange('oldest')} className={`px-2 py-1 rounded ${sort === 'oldest' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-600 hover:text-gray-900'}`}>Oldest</button>
          <button onClick={() => handleSortChange('newest')} className={`px-2 py-1 rounded ${sort === 'newest' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-600 hover:text-gray-900'}`}>Newest</button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mb-8 space-y-3">
        {isLoading ? null : !isLoggedIn ? (
          <div className="p-4 bg-gray-50 rounded-lg text-center text-sm text-gray-600">
            <a href="/auth/signin" className="text-blue-600 hover:underline font-medium">Sign in</a> to leave a comment.
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold text-xs">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              Commenting as <span className="font-medium text-gray-900">{user?.name}</span>
            </div>
            <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Write a comment..." rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y" required />
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button type="submit" disabled={submitting || !content.trim()}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg text-sm font-medium transition-colors">
              {submitting ? 'Posting...' : 'Post Comment'}
            </button>
          </>
        )}
      </form>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading comments...</div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No comments yet. Be the first to comment!</div>
      ) : (
        <div className="space-y-3">
          {tree.map(comment => (
            <CommentThread key={comment._id} comment={comment} articleSlug={articleSlug}
              currentUser={currentUser} isAdmin={isAdmin} articleAuthorId={null}
              onDelete={handleDelete} onReply={handleReply} onLike={handleLike} onEdit={handleEdit} onHide={handleHide} onFlag={handleFlag} depth={0} />
          ))}
          {pagination.page < pagination.totalPages && (
            <div className="text-center pt-4">
              <button onClick={handleLoadMore} disabled={loadingMore}
                className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
                {loadingMore ? 'Loading...' : `Load More (${pagination.total - comments.length} remaining)`}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
