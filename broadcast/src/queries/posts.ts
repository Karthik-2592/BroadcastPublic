import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BASE_URL } from '../config';
import type { Post } from '../types/api';

export const feedQueryKey = (endpoint: string = '/feed') => ['feed', endpoint] as const;
export const communityPostsQueryKey = (communityId?: string | null, sort: 'new' | 'top' = 'new') =>
  ['community-posts', communityId, sort] as const;

type PaginatedPostsResponse = {
  data?: Post[];
  cursor?: string | null;
};

type PaginatedPostsPage = {
  posts: Post[];
  nextCursor: string | null;
};

function cursorQuery(endpoint: string, cursor: string | null) {
  if (!cursor) return endpoint;
  const separator = endpoint.includes('?') ? '&' : '?';
  return `${endpoint}${separator}cursor=${encodeURIComponent(cursor)}`;
}

function parsePostsPage(body: PaginatedPostsResponse): PaginatedPostsPage {
  return {
    posts: Array.isArray(body.data) ? body.data : [],
    nextCursor: body.cursor && body.cursor !== 'null' ? body.cursor : null,
  };
}

export function useInfiniteFeed(endpoint: string = '/feed') {
  return useInfiniteQuery({
    queryKey: feedQueryKey(endpoint),
    queryFn: async ({ pageParam }) => {
      const response = await fetch(`${BASE_URL}${cursorQuery(endpoint, pageParam)}`, { credentials: 'include' });
      if (!response.ok) throw new Error('Unable to load feed');
      return parsePostsPage((await response.json()) as PaginatedPostsResponse);
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
      const endpoint = `/communities/${encodeURIComponent(communityId)}/posts?sort=${sortTab}`;
      const response = await fetch(`${BASE_URL}${cursorQuery(endpoint, pageParam)}`, { credentials: 'include' });
      if (!response.ok) throw new Error('Unable to load community posts');
      return parsePostsPage((await response.json()) as PaginatedPostsResponse);
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
