import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BASE_URL } from '../config';
import type { User, UserSummary, Post, Comment } from '../types/api';

// ── Query keys ─────────────────────────────────────────────────────────────────

export const profileQueryKey = (userId?: string | null) =>
  ['user', userId] as const;

export const followersPreviewQueryKey = (userId?: string | null) =>
  ['followers-preview', userId] as const;

export const followingPreviewQueryKey = (userId?: string | null) =>
  ['following-preview', userId] as const;

export const followStatusQueryKey = (
  viewedUserId?: string | null,
  sessionUserId?: string | null,
) => ['follow-status', viewedUserId, sessionUserId] as const;

export const paginatedFollowersQueryKey = (userId?: string | null) =>
  ['followers-paginated', userId] as const;

export const paginatedFollowingQueryKey = (userId?: string | null) =>
  ['following-paginated', userId] as const;

export const userPostsQueryKey = (userId?: string | null) =>
  ['user-posts', userId] as const;

export const userCommentsQueryKey = (userId?: string | null) =>
  ['user-comments', userId] as const;

export const userSavedPostsQueryKey = (userId?: string | null) =>
  ['user-saved-posts', userId] as const;

export const userRecommendationsQueryKey = (userId?: string | null) =>
  ['user-recommendations', userId] as const;

// ── Fetch helpers ──────────────────────────────────────────────────────────────

async function fetchUserSummaries(
  url: string,
): Promise<{ users: User[]; cursor: string | null }> {
  const response = await fetch(url, { credentials: 'include' });
  if (!response.ok) throw new Error('Unable to load user list');
  const body = (await response.json()) as { data?: User[]; cursor?: string };
  return {
    users: Array.isArray(body.data) ? body.data : [],
    cursor: body.cursor === 'null' ? null : (body.cursor ?? null),
  };
}

// ── Hooks ──────────────────────────────────────────────────────────────────────

/** Full profile for a given user id. Cached for 5 min (inherits default staleTime). */
export function useProfile(userId?: string | null) {
  return useQuery({
    queryKey: profileQueryKey(userId),
    queryFn: async () => {
      const response = await fetch(`${BASE_URL}/users/${userId!}`, { credentials: 'include' });
      if (!response.ok) throw new Error('Unable to load profile');
      const body = (await response.json()) as { data?: User };
      if (!body.data) throw new Error('Missing profile data');
      return body.data;
    },
    enabled: Boolean(userId),
  });
}

/** Recommended users for the authenticated feed. */
export function useUserRecommendations(userId?: string | null) {
  return useQuery({
    queryKey: userRecommendationsQueryKey(userId),
    queryFn: async () => {
      const response = await fetch(`${BASE_URL}/users/${userId!}/recommendations`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Unable to load user recommendations');
      const body = (await response.json()) as { data?: UserSummary[] };
      return Array.isArray(body.data) ? body.data : [];
    },
    enabled: Boolean(userId),
  });
}

/** First ~3 followers for the profile sidebar preview. */
export function useFollowersPreview(userId?: string | null) {
  return useQuery({
    queryKey: followersPreviewQueryKey(userId),
    queryFn: async () => {
      const result = await fetchUserSummaries(`${BASE_URL}/users/${userId!}/followers`);
      return result.users.slice(0, 3);
    },
    enabled: Boolean(userId),
  });
}

/** First ~3 following for the profile sidebar preview. */
export function useFollowingPreview(userId?: string | null) {
  return useQuery({
    queryKey: followingPreviewQueryKey(userId),
    queryFn: async () => {
      const result = await fetchUserSummaries(`${BASE_URL}/users/${userId!}/following`);
      return result.users.slice(0, 3);
    },
    enabled: Boolean(userId),
  });
}

/**
 * Whether the current session user follows the viewed user.
 * Skipped when viewing own profile (viewedUserId === sessionUserId).
 */
export function useFollowStatus(
  viewedUserId?: string | null,
  sessionUserId?: string | null,
) {
  return useQuery({
    queryKey: followStatusQueryKey(viewedUserId, sessionUserId),
    queryFn: async () => {
      const response = await fetch(
        `${BASE_URL}/users/${viewedUserId!}/follows/status`,
        { credentials: 'include' },
      );
      if (!response.ok) return false;
      const body = (await response.json()) as { data?: { active?: boolean } };
      return Boolean(body?.data?.active);
    },
    enabled: Boolean(viewedUserId && sessionUserId && viewedUserId !== sessionUserId),
  });
}

/** Paginated infinite list of followers for the UserListDialog. */
export function usePaginatedFollowers(userId?: string | null, enabled = false) {
  return useInfiniteQuery({
    queryKey: paginatedFollowersQueryKey(userId),
    queryFn: ({ pageParam }) => {
      const query = pageParam ? `?cursor=${encodeURIComponent(pageParam)}` : '';
      return fetchUserSummaries(`${BASE_URL}/users/${userId!}/followers${query}`);
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.cursor,
    enabled: Boolean(userId) && enabled,
  });
}

/** Paginated infinite list of following for the UserListDialog. */
export function usePaginatedFollowing(userId?: string | null, enabled = false) {
  return useInfiniteQuery({
    queryKey: paginatedFollowingQueryKey(userId),
    queryFn: ({ pageParam }) => {
      const query = pageParam ? `?cursor=${encodeURIComponent(pageParam)}` : '';
      return fetchUserSummaries(`${BASE_URL}/users/${userId!}/following${query}`);
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.cursor,
    enabled: Boolean(userId) && enabled,
  });
}

/** Paginated posts for a user's profile (ProfileTabs). */
export function useUserPosts(userId?: string | null) {
  return useInfiniteQuery({
    queryKey: userPostsQueryKey(userId),
    queryFn: async ({ pageParam }) => {
      if (!userId) return { posts: [], nextCursor: null };
      const query = pageParam ? `?cursor=${encodeURIComponent(pageParam)}` : '';
      const response = await fetch(`${BASE_URL}/users/${userId}/posts${query}`, { credentials: 'include' });
      if (!response.ok) throw new Error('Unable to load user posts');
      const body = (await response.json()) as { data?: Post[]; cursor?: string };
      return {
        posts: Array.isArray(body.data) ? body.data : [],
        nextCursor: body.cursor === 'null' ? null : (body.cursor ?? null),
      };
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: Boolean(userId),
  });
}

/** Paginated comments for a user's profile (ProfileTabs). */
export function useUserComments(userId?: string | null) {
  return useInfiniteQuery({
    queryKey: userCommentsQueryKey(userId),
    queryFn: async ({ pageParam }) => {
      if (!userId) return { comments: [], nextCursor: null };
      const query = pageParam ? `?cursor=${encodeURIComponent(pageParam)}` : '';
      const response = await fetch(`${BASE_URL}/users/${userId}/comments${query}`, { credentials: 'include' });
      if (!response.ok) throw new Error('Unable to load user comments');
      const body = (await response.json()) as { data?: Comment[]; cursor?: string };
      return {
        comments: Array.isArray(body.data) ? body.data : [],
        nextCursor: body.cursor === 'null' ? null : (body.cursor ?? null),
      };
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: Boolean(userId),
  });
}

/** Paginated saved posts for a user's profile (ProfileTabs). */
export function useUserSavedPosts(userId?: string | null) {
  return useInfiniteQuery({
    queryKey: userSavedPostsQueryKey(userId),
    queryFn: async ({ pageParam }) => {
      if (!userId) return { posts: [], nextCursor: null };
      const query = pageParam ? `?cursor=${encodeURIComponent(pageParam)}` : '';
      const response = await fetch(`${BASE_URL}/users/${userId}/saved-posts${query}`, { credentials: 'include' });
      if (!response.ok) throw new Error('Unable to load saved posts');
      const body = (await response.json()) as { data?: Post[]; cursor?: string };
      return {
        posts: Array.isArray(body.data) ? body.data : [],
        nextCursor: body.cursor === 'null' ? null : (body.cursor ?? null),
      };
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: Boolean(userId),
  });
}

// ── Mutation hooks ───────────────────────────────────────────────────────────────

export function useToggleFollow() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ followedId, following }: { followedId: string; following: boolean }) => {
      const response = await fetch(`${BASE_URL}/users/follows`, {
        method: following ? 'POST' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followed_id: followedId }),
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Unable to update follow');
      return response.json();
    },
    onSuccess: (_, __) => {
      // Invalidate all relevant queries to ensure fresh data
      queryClient.invalidateQueries({ 
        queryKey: ['follow-status'],
        refetchType: 'active'
      });
      queryClient.invalidateQueries({ 
        queryKey: ['followers-preview'],
        refetchType: 'active'
      });
      queryClient.invalidateQueries({ 
        queryKey: ['following-preview'],
        refetchType: 'active'
      });
      queryClient.invalidateQueries({ 
        queryKey: ['followers-paginated'],
        refetchType: 'active'
      });
      queryClient.invalidateQueries({ 
        queryKey: ['following-paginated'],
        refetchType: 'active'
      });
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, profileName, profileDescription, profilePicture, interests }: { 
      userId: string; 
      profileName: string; 
      profileDescription: string; 
      profilePicture: string | null; 
      interests: any 
    }) => {
      const response = await fetch(`${BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          profile_name: profileName, 
          profile_description: profileDescription, 
          profile_picture: profilePicture, 
          interests 
        }),
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Unable to update profile');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: profileQueryKey(variables.userId) });
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`${BASE_URL}/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Unable to delete account');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}
