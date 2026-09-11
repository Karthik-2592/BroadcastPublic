import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BASE_URL } from '../config';
import type { Comment as ApiComment, RelationStatusMap } from '../types/api';

export const commentsQueryKey = (postId?: string | null) => ['comments', postId] as const;
export const commentRepliesQueryKey = (commentId?: string | null) => ['comment-replies', commentId] as const;
export const commentLikeStatusQueryKey = (commentId?: string | null) => ['comment-like-status', commentId] as const;

export function useComments(postId?: string | null, enabled = true) {
  return useQuery({
    queryKey: commentsQueryKey(postId),
    queryFn: async () => {
      if (!postId) return [];
      const response = await fetch(`${BASE_URL}/posts/${postId}/comments`, { credentials: 'include' });
      if (!response.ok) throw new Error('Unable to load comments');
      const body = await response.json() as { data?: ApiComment[]; cursor?: string };
      return body.data ?? [];
    },
    enabled: Boolean(postId) && enabled,
  });
}

export function useCommentReplies(commentId?: string | null, limit = 5, enabled = true) {
  return useQuery({
    queryKey: commentRepliesQueryKey(commentId),
    queryFn: async () => {
      if (!commentId) return { replies: [], cursor: null };
      const response = await fetch(`${BASE_URL}/comments/${commentId}/replies?limit=${limit}`, { credentials: 'include' });
      if (!response.ok) throw new Error('Unable to load replies');
      const payload = await response.json() as { data?: ApiComment[]; cursor?: string } | ApiComment[];
      const replies = Array.isArray(payload) ? payload : payload.data ?? [];
      const cursor = Array.isArray(payload) ? null : (payload.cursor === 'null' ? null : payload.cursor ?? null);
      return { replies, cursor };
    },
    enabled: Boolean(commentId) && enabled,
  });
}

export function useCommentLikeStatuses(commentIds: string[], enabled = true) {
  return useQuery({
    queryKey: ['comment-like-statuses', commentIds],
    queryFn: async () => {
      if (commentIds.length === 0) return {};
      const response = await fetch(`${BASE_URL}/comments/likes/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: commentIds }),
        credentials: 'include',
      });
      if (!response.ok) return {};
      const body = await response.json() as { data?: RelationStatusMap };
      return body.data ?? {};
    },
    enabled: commentIds.length > 0 && enabled,
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
      const response = await fetch(`${BASE_URL}/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Unable to post comment');
      const body = await response.json() as { data?: ApiComment; message?: string };
      if (!body.data) throw new Error(body.message ?? 'Unable to post comment');
      return body.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: commentsQueryKey(variables.postId) });
      queryClient.invalidateQueries({ queryKey: ['user-comments'] });
    },
  });
}

export function useCreateReply() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, content, root }: { postId: string; content: string; root: string }) => {
      const response = await fetch(`${BASE_URL}/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, root }),
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Unable to post reply');
      const body = await response.json() as { data?: ApiComment; message?: string };
      if (!body.data) throw new Error(body.message ?? 'Unable to post reply');
      return body.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: commentsQueryKey(variables.postId) });
      queryClient.invalidateQueries({ queryKey: commentRepliesQueryKey(variables.root) });
      queryClient.invalidateQueries({ queryKey: ['user-comments'] });
    },
  });
}

export function useUpdateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, content }: { commentId: string; content: string }) => {
      const response = await fetch(`${BASE_URL}/comments/${commentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Unable to update comment');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      queryClient.invalidateQueries({ queryKey: ['comment-replies'] });
      queryClient.invalidateQueries({ queryKey: ['user-comments'] });
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentId: string) => {
      const response = await fetch(`${BASE_URL}/comments/${commentId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Unable to delete comment');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      queryClient.invalidateQueries({ queryKey: ['comment-replies'] });
      queryClient.invalidateQueries({ queryKey: ['user-comments'] });
    },
  });
}

export function useToggleCommentLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, commentId, liked }: { postId: string; commentId: string; liked: boolean }) => {
      const response = await fetch(`${BASE_URL}/posts/${postId}/comments/likes`, {
        method: liked ? 'POST' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: postId, comment_id: commentId }),
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Unable to update like');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: commentLikeStatusQueryKey(variables.commentId) });
      queryClient.invalidateQueries({ queryKey: ['comment-like-statuses'] });
      queryClient.invalidateQueries({ queryKey: ['user-comments'] });
    },
  });
}
