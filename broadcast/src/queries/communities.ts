import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BASE_URL } from '../config';
import type { Community } from '../types/api';

export const communityQueryKey = (id?: string | null) => ['community', id] as const;
export const recommendedCommunitiesQueryKey = ['community-recommendations'] as const;
/** Shared key for the current user's joined communities list (LeftSidebar). */
export const myMembershipsQueryKey = ['my-memberships'] as const;

export async function fetchCommunity(id: string): Promise<Community | null> {
  try {
    const response = await fetch(`${BASE_URL}/communities/${id}`, { credentials: 'include' });
    if (!response.ok) return null;
    const body = (await response.json()) as { data?: Community };
    return body.data ?? null;
  } catch {
    return null;
  }
}

export function useCommunity(id?: string | null) {
  return useQuery({
    queryKey: communityQueryKey(id),
    queryFn: () => (id ? fetchCommunity(id) : Promise.resolve(null)),
    enabled: Boolean(id),
  });
}

/** Returns the list of communities the current user is a member of. */
export function useMyMemberships(enabled = true) {
  return useQuery({
    queryKey: myMembershipsQueryKey,
    queryFn: async () => {
      const response = await fetch(`${BASE_URL}/communities/memberships`, { credentials: 'include' });
      if (!response.ok) return [] as Community[];
      const body = (await response.json()) as { data?: Community[] };
      return Array.isArray(body.data) ? body.data : ([] as Community[]);
    },
    enabled,
  });
}

export function useRecommendedCommunities() {
  return useInfiniteQuery({
    queryKey: recommendedCommunitiesQueryKey,
    queryFn: async ({ pageParam }) => {
      const query = pageParam ? `?cursor=${encodeURIComponent(pageParam)}` : '';
      const response = await fetch(`${BASE_URL}/communities/recommendations${query}`, { credentials: 'include' });
      if (!response.ok) throw new Error('Unable to load communities');
      const body = (await response.json()) as { data?: Community[]; cursor?: string };
      return {
        communities: Array.isArray(body.data) ? body.data : [],
        nextCursor: body.cursor === 'null' ? null : body.cursor ?? null,
      };
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}

// ── Mutation hooks ───────────────────────────────────────────────────────────────

export function useToggleMembership() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ communityId, isMember }: { communityId: string; isMember: boolean }) => {
      const response = await fetch(`${BASE_URL}/communities/memberships`, {
        method: (isMember ? 'POST' : 'DELETE'),
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ community_id: communityId }),
        credentials: 'include',
      });
      console.log(response)
      if (!response.ok) throw new Error('Unable to update membership');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: communityQueryKey(variables.communityId) });
      queryClient.invalidateQueries({ queryKey: myMembershipsQueryKey });
    },
  });
}

export function useUpdateCommunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ communityId, communityDesc, communityGuidelines, tags }: {
      communityId: string;
      communityDesc: string;
      communityGuidelines: string;
      tags: string[]
    }) => {
      const response = await fetch(`${BASE_URL}/communities/${communityId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          community_desc: communityDesc,
          community_guidelines: communityGuidelines,
          tags
        }),
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Unable to update community');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: communityQueryKey(variables.communityId) });
    },
  });
}

export function useDeleteCommunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (communityId: string) => {
      const response = await fetch(`${BASE_URL}/communities/${communityId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Unable to delete community');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: communityQueryKey(variables) });
      queryClient.invalidateQueries({ queryKey: myMembershipsQueryKey });
    },
  });
}

export function useCreateCommunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ communityName, communityDesc, communityGuidelines, tags }: {
      communityName: string;
      communityDesc: string;
      communityGuidelines: string;
      tags: string[]
    }) => {
      const response = await fetch(`${BASE_URL}/communities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          community_name: communityName,
          community_desc: communityDesc,
          community_guidelines: communityGuidelines,
          tags,
        }),
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Unable to create community');
      const body = await response.json() as { data?: { id?: string }; message?: string };
      if (!body.data?.id) throw new Error(body.message ?? 'Failed to create community');
      return body.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: myMembershipsQueryKey });
    },
  });
}
