import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import CircularProgress from '@mui/material/CircularProgress';
import type { Community } from '../types/api';
import { BASE_URL } from '../config';
import { useQueryClient } from '@tanstack/react-query';
import {
  useRecommendedCommunities,
  communityQueryKey,
  recommendedCommunitiesQueryKey,
  myMembershipsQueryKey,
} from '../queries/communities';

export default function CommunityExplorePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useRecommendedCommunities();

  const communities = useMemo(() => {
    return data?.pages.flatMap((page) => page.communities) ?? [];
  }, [data]);

  const handleToggleJoin = (e: React.MouseEvent, communityId: string) => {
    e.stopPropagation();
    const community = communities.find((item) => item.id === communityId);
    const nextState = !community?.isMember;

    // Optimistically update the recommendations cache
    queryClient.setQueryData(
      recommendedCommunitiesQueryKey,
      (old: { pages: Array<{ communities: Community[]; nextCursor: string | null }> } | undefined) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            communities: page.communities.map((c) =>
              c.id === communityId ? { ...c, isMember: nextState } : c
            ),
          })),
        };
      }
    );

    void fetch(`${BASE_URL}/communities/memberships`, {
      method: nextState ? 'POST' : 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ community_id: communityId }),
      credentials: 'include',
    })
      .then((response) => {
        if (!response.ok) throw new Error('Unable to update membership');
        void queryClient.invalidateQueries({ queryKey: communityQueryKey(communityId) });
        // Keep sidebar in sync
        void queryClient.invalidateQueries({ queryKey: myMembershipsQueryKey });
      })
      .catch(() => {
        void queryClient.invalidateQueries({ queryKey: recommendedCommunitiesQueryKey });
      });
  };
  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 1280,
        mx: 'auto',
        px: { xs: 2, lg: 3 },
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        pb: 8,
        pt: 6,
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', w: '100%', p: { xs: 2, md: 4 }, gap: 6 }}>
        {/* Header Section */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'flex-end' },
            gap: 3,
            mb: 2,
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="h4" component="h1" sx={{ color: 'text.primary', fontWeight: 600, letterSpacing: '-0.02em' }}>
              Explore Communities
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 672, lineHeight: 1.6 }}>
              Discover vibrant hubs of knowledge, collaborate with peers, and dive deep into topics shaping the future of technology.
            </Typography>
          </Box>
        </Box>

        {/* Communities Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 0.23fr',
            justifyContent: 'center',
            gap: 4,
            width: '100%',
            alignItems: 'start',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {communities.length === 0 ? (
              <Typography sx={{ py: 8, textAlign: 'center', color: 'text.secondary' }}>
                Nothing to see here
              </Typography>
            ) : communities.map((community) => {
              const isJoined = community.isMember;
              return (
                <Card
                  key={community.id}
                  onClick={() => navigate(`/community/${community.id}`)}
                  sx={{
                    bgcolor: 'background.paper',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: 'rgba(179,136,255,0.25)',
                      boxShadow: '0 4px 20px rgba(179,136,255,0.08)',
                    },
                  }}
                >
                  {/* Banner Area */}
                  <Box
                    sx={{
                      height: 260,
                      width: '100%',
                      position: 'relative',
                      background: community.bannerGradient,
                      backgroundImage: community.community_banner?.media_url
                        ? `url(${community.community_banner.media_url})`
                        : undefined,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      display: 'flex',
                      alignItems: 'flex-start',
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to top, #1a1a2e, transparent)',
                        opacity: 0.8,
                      }}
                    />
                    <Typography
                      variant="h5"
                      component="h2"
                      sx={{
                        position: 'absolute',
                        top: 16,
                        left: 16,
                        color: 'text.primary',
                        fontWeight: 600,
                        zIndex: 10,
                      }}
                    >
                      {community.community_name}
                    </Typography>
                  </Box>

                  {/* Card Body */}
                  <CardContent
                    sx={{
                      p: 3,
                      display: 'flex',
                      flexDirection: 'column',
                      flexGrow: 1,
                      '&:last-child': { pb: 3 },
                    }}
                  >
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.6 }}>
                      {community.community_desc}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 'auto' }}>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <ForumOutlinedIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                          <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>
                            {community.post_count}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <GroupOutlinedIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                          <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>
                            {community.population}
                          </Typography>
                        </Box>
                      </Box>
                      {community.recommendationReason && (
                        <Typography variant="caption" sx={{ color: 'secondary.light', fontSize: '0.72rem', textAlign: 'right' }}>
                          {community.recommendationReason}
                        </Typography>
                      )}
                      {!isJoined ? (
                        <Button
                          variant="contained"
                          size="small"
                          onClick={(e) => handleToggleJoin(e, community.id)}
                          sx={{
                            bgcolor: 'primary.main',
                            color: 'primary.contrastText',
                            borderRadius: 2,
                            px: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            '&:hover': {
                              bgcolor: 'primary.light',
                            },
                          }}
                        >
                          Join
                        </Button>
                      ) : (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={(e) => handleToggleJoin(e, community.id)}
                          sx={{
                            borderColor: 'rgba(255, 255, 255, 0.12)',
                            color: 'text.primary',
                            bgcolor: 'rgba(255, 255, 255, 0.04)',
                            borderRadius: 2,
                            px: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            '&:hover': {
                              bgcolor: 'rgba(255, 255, 255, 0.08)',
                              borderColor: 'rgba(255, 255, 255, 0.12)',
                            },
                          }}
                        >
                          Joined
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
            {hasNextPage && <Button variant="outlined" onClick={() => void fetchNextPage()} disabled={isFetchingNextPage} sx={{ alignSelf: 'stretch' }}>
              {isFetchingNextPage ? <CircularProgress size={18} /> : 'Load more communities'}
            </Button>}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
