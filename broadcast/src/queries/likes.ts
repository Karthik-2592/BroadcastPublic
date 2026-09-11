/**
 * queries/likes.ts
 *
 * Query keys and cache-seeding helpers for post/save/comment like statuses.
 *
 * Strategy: the batch endpoints (POST /posts/likes/status, POST /comments/likes/status)
 * remain the efficient way to bulk-check status. After each batch resolves, we call
 * seedPostLikeStatuses / seedCommentLikeStatuses to populate individual cache entries.
 * This lets PostViewPage (and any other per-item reader) get an instant cache hit when
 * the user arrives from a feed that already fetched the batch.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { QueryClient } from '@tanstack/react-query';
import { BASE_URL } from '../config';

// ── Query keys ─────────────────────────────────────────────────────────────────

export const postLikeStatusQueryKey = (postId?: string | null) =>
  ['post-like-status', postId] as const;

export const saveStatusQueryKey = (postId?: string | null) =>
  ['post-save-status', postId] as const;

export const commentLikeStatusQueryKey = (commentId?: string | null) =>
  ['comment-like-status', commentId] as const;

// ── Cache seeders ──────────────────────────────────────────────────────────────

/**
 * After a batch POST /posts/likes/status resolves, call this to populate
 * individual ['post-like-status', id] cache entries so any subsequent
 * per-post reader (e.g. PostViewPage) gets an instant hit.
 */
export function seedPostLikeStatuses(
  queryClient: QueryClient,
  map: Record<string, boolean>,
) {
  Object.entries(map).forEach(([postId, liked]) => {
    queryClient.setQueryData(postLikeStatusQueryKey(postId), liked);
  });
}

/**
 * After a batch POST /comments/likes/status resolves, populate per-comment cache entries.
 */
export function seedCommentLikeStatuses(
  queryClient: QueryClient,
  map: Record<string, boolean>,
) {
  Object.entries(map).forEach(([commentId, liked]) => {
    queryClient.setQueryData(commentLikeStatusQueryKey(commentId), liked);
  });
}

// ── Per-item hooks (used by PostViewPage for cache-first like + save status) ───

/**
 * Whether the current user has liked a specific post.
 * On first visit after a feed load the answer is served from cache (0 ms).
 * On cache miss it fetches the batch endpoint with a single-item array.
 */
export function usePostLikeStatus(postId?: string | null, enabled = true) {
  return useQuery({
    queryKey: postLikeStatusQueryKey(postId),
    queryFn: async () => {
      const response = await fetch(`${BASE_URL}/posts/likes/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [postId!] }),
        credentials: 'include',
      });
      if (!response.ok) return false;
      const body = (await response.json()) as { data?: Record<string, boolean> };
      return Boolean(body.data?.[postId!]);
    },
    enabled: Boolean(postId) && enabled,
  });
}

/**
 * Whether the current user has saved (bookmarked) a specific post.
 */
export function usePostSaveStatus(postId?: string | null, enabled = true) {
  return useQuery({
    queryKey: saveStatusQueryKey(postId),
    queryFn: async () => {
      const response = await fetch(`${BASE_URL}/posts/${postId!}/saves/status`, {
        credentials: 'include',
      });
      if (!response.ok) return false;
      const body = (await response.json()) as { data?: { active?: boolean } };
      return Boolean(body.data?.active);
    },
    enabled: Boolean(postId) && enabled,
  });
}

// ── Mutation hooks ───────────────────────────────────────────────────────────────

export function useTogglePostLike() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ postId, liked }: { postId: string; liked: boolean }) => {
      const response = await fetch(`${BASE_URL}/posts/likes`, {
        method: liked ? 'POST' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: postId }),
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Unable to update like');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: postLikeStatusQueryKey(variables.postId) });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
      queryClient.invalidateQueries({ queryKey: ['user-posts'] });
      queryClient.invalidateQueries({ queryKey: ['user-saved-posts'] });
    },
  });
}

export function useTogglePostSave() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ postId, saved }: { postId: string; saved: boolean }) => {
      const response = await fetch(`${BASE_URL}/posts/saves`, {
        method: saved ? 'POST' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: postId }),
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Unable to update bookmark');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: saveStatusQueryKey(variables.postId) });
      queryClient.invalidateQueries({ queryKey: ['user-saved-posts'] });
    },
  });
}
