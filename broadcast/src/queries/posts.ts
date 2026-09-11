import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BASE_URL } from '../config';
import type { Post } from '../types/api';

export const feedQueryKey = (endpoint: string = '/feed') => ['feed', endpoint] as const;
export const communityPostsQueryKey = (communityId?: string | null, sort: 'new' | 'top' = 'new') =>
  ['community-posts', communityId, sort] as const;

export function useInfiniteFeed(endpoint: string = '/feed') {
  return useInfiniteQuery({
    queryKey: feedQueryKey(endpoint),
    queryFn: async ({ pageParam }) => {
      const query = pageParam ? `?cursor=${encodeURIComponent(pageParam)}` : '';
      const response = await fetch(`${BASE_URL}${endpoint}${query}`, { credentials: 'include' });
      if (!response.ok) throw new Error('Unable to load feed');
      const body = (await response.json()) as { data?: Post[]; cursor?: string };
      return {
        posts: Array.isArray(body.data) ? body.data : [],
        nextCursor: body.cursor === 'null' ? null : body.cursor ?? null,
      };
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}

export function useCommunityPosts(communityId?: string | null, sortTab: 'new' | 'top' = 'new') {
  return useInfiniteQuery({
    queryKey: communityPostsQueryKey(communityId, sortTab),
    queryFn: async ({ pageParam }) => {
      if (!communityId) return { posts: [], nextCursor: null };
      const cursorQuery = pageParam ? `&cursor=${encodeURIComponent(pageParam)}` : '';
      const response = await fetch(
        `${BASE_URL}/communities/${communityId}/posts?sort=${sortTab}${cursorQuery}`,
        { credentials: 'include' }
      );
      if (!response.ok) throw new Error('Unable to load community posts');
      const body = (await response.json()) as { data?: Post[]; cursor?: string };
      return {
        posts: Array.isArray(body.data) ? body.data : [],
        nextCursor: body.cursor === 'null' ? null : body.cursor ?? null,
      };
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: Boolean(communityId),
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ postId, title, content, tags }: { postId: string; title: string; content: string; tags: string[] }) => {
      const response = await fetch(`${BASE_URL}/posts/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, tags }),
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Unable to update post');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
      queryClient.invalidateQueries({ queryKey: ['user-posts'] });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (postId: string) => {
      const response = await fetch(`${BASE_URL}/posts/${postId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Unable to delete post');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
      queryClient.invalidateQueries({ queryKey: ['user-posts'] });
      queryClient.invalidateQueries({ queryKey: ['user-saved-posts'] });
    },
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ title, content, tags, communityName }: { 
      title: string; 
      content: string; 
      tags: string[]; 
      communityName: string | null 
    }) => {
      const response = await fetch(`${BASE_URL}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          tags,
          community_name: communityName || null,
        }),
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Unable to create post');
      const body = await response.json() as { data?: { id?: string }; message?: string };
      if (!body.data?.id) throw new Error(body.message ?? 'Failed to create post');
      return body.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
      queryClient.invalidateQueries({ queryKey: ['user-posts'] });
    },
  });
}
