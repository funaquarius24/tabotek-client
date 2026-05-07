'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';

interface Comment {
  _id: string;
  articleSlug: string;
  parentId: string | null;
  depth: number;
  author: { name: string; email?: string; avatar?: string };
  content: string;
  likes: number;
  dislikes: number;
  createdAt: string;
}

interface CommentsProps {
  articleSlug: string;
}

function buildTree(comments: Comment[]): Comment[] {
  const map = new Map<string, Comment & { replies: Comment[] }>();
  const roots: (Comment & { replies: Comment[] })[] = [];

  const sorted = [...comments].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  for (const c of sorted) {
    map.set(c._id, { ...c, replies: [] });
  }
  for (const c of map.values()) {
    if (c.parentId && map.has(c.parentId)) {
      map.get(c.parentId)!.replies.push(c);
    } else {
      roots.push(c);
    }
  }
  return roots;
}

function CommentThread({
  comment,
  articleSlug,
  authorName,
  isAdmin,
  onDelete,
  onReply,
  onLike,
  depth,
}: {
  comment: Comment & { replies: Comment[] };
  articleSlug: string;
  authorName: string;
  isAdmin: boolean;
  onDelete: (id: string) => void;
  onReply: (parentId: string, content: string) => Promise<void>;
  onLike: (commentId: string, vote: 'like' | 'dislike' | null) => void;
  depth: number;
}) {
  const [showReply, setShowReply] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [replying, setReplying] = useState(false);

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !authorName.trim()) return;
    setReplying(true);
    await onReply(comment._id, replyContent.trim());
    setReplyContent('');
    setShowReply(false);
    setReplying(false);
  };

  const marginLeft = Math.min(depth * 16, 48);

  return (
    <div>
      <div className="p-4 bg-gray-50 rounded-lg" style={{ marginLeft }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold text-xs">
              {comment.author.name.charAt(0).toUpperCase()}
            </div>
            <span className="font-medium text-gray-900 text-sm">{comment.author.name}</span>
            <span className="text-xs text-gray-500">
              {new Date(comment.createdAt).toLocaleDateString()}
            </span>
          </div>
          {isAdmin && (
            <button onClick={() => onDelete(comment._id)} className="text-xs text-red-500 hover:text-red-700 transition-colors">
              Delete
            </button>
          )}
        </div>

        <p className="text-gray-700 text-sm whitespace-pre-wrap mb-2">{comment.content}</p>

        <div className="flex items-center gap-3 text-xs text-gray-500">
          <button
            onClick={() => onLike(comment._id, 'like')}
            className="inline-flex items-center gap-1 hover:text-blue-600 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
            </svg>
            {comment.likes || 0}
          </button>

          {depth < 3 && (
            <button
              onClick={() => setShowReply(!showReply)}
              className="hover:text-blue-600 transition-colors"
            >
              Reply
            </button>
          )}
        </div>

        {showReply && (
          <form onSubmit={handleReplySubmit} className="mt-3 space-y-2">
            <textarea
              value={replyContent}
              onChange={e => setReplyContent(e.target.value)}
              placeholder="Write a reply..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
              required
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={replying || !replyContent.trim()}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg text-xs font-medium transition-colors"
              >
                {replying ? 'Posting...' : 'Reply'}
              </button>
              <button
                type="button"
                onClick={() => { setShowReply(false); setReplyContent(''); }}
                className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-xs transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {comment.replies.length > 0 && (
        <div className="space-y-2 mt-2">
          {comment.replies.map(reply => (
            <CommentThread
              key={reply._id}
              comment={reply}
              articleSlug={articleSlug}
              authorName={authorName}
              isAdmin={isAdmin}
              onDelete={onDelete}
              onReply={onReply}
              onLike={onLike}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Comments({ articleSlug }: CommentsProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorName, setAuthorName] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isAdmin = user && (user.role === 'admin' || user.role === 'superuser');

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/articles/${articleSlug}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, [articleSlug]);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !content.trim()) return;
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch(`/api/articles/${articleSlug}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author: { name: authorName.trim() }, content: content.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Failed to post comment');
        return;
      }

      setContent('');
      await fetchComments();
    } catch {
      setError('Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return;
    try {
      const res = await fetch(`/api/articles/${articleSlug}/comments/${commentId}`, { method: 'DELETE' });
      if (res.ok) {
        setComments(prev => prev.filter(c => c._id !== commentId));
      }
    } catch {}
  };

  const handleReply = async (parentId: string, replyContent: string) => {
    const res = await fetch(`/api/articles/${articleSlug}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author: { name: authorName.trim() }, content: replyContent, parentId }),
    });

    if (res.ok) {
      await fetchComments();
    }
  };

  const handleLike = async (commentId: string, vote: 'like' | 'dislike' | null) => {
    try {
      const res = await fetch(`/api/articles/${articleSlug}/comments/${commentId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vote }),
      });
      if (res.ok) {
        const updated = await res.json();
        setComments(prev => prev.map(c => c._id === updated._id ? { ...c, likes: updated.likes } : c));
      }
    } catch {}
  };

  const tree = buildTree(comments);
  const totalCount = comments.length;

  return (
    <div className="mt-12 pt-8 border-t border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Comments ({totalCount})
      </h3>

      <form onSubmit={handleSubmit} className="mb-8 space-y-3">
        <input
          type="text"
          value={authorName}
          onChange={e => setAuthorName(e.target.value)}
          placeholder="Your name"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Write a comment..."
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
          required
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={submitting || !authorName.trim() || !content.trim()}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {submitting ? 'Posting...' : 'Post Comment'}
        </button>
      </form>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading comments...</div>
      ) : totalCount === 0 ? (
        <div className="text-center py-8 text-gray-500">No comments yet. Be the first to comment!</div>
      ) : (
        <div className="space-y-3">
          {tree.map(comment => (
            <CommentThread
              key={comment._id}
              comment={comment}
              articleSlug={articleSlug}
              authorName={authorName}
              isAdmin={isAdmin}
              onDelete={handleDelete}
              onReply={handleReply}
              onLike={handleLike}
              depth={0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
