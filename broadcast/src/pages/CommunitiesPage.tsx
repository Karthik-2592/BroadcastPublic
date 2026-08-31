import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import UploadOutlinedIcon from '@mui/icons-material/UploadOutlined';
import Fade from '@mui/material/Fade';
import { useRef } from 'react';
import CommunityTagSelector from '../components/Community/CommunityTagSelector';
import { useAuth } from '../context/AuthContext';
import CommunitySortTabs from '../components/Community/CommunitySortTabs';
import CommunityRightSidebar from '../components/Community/CommunityRightSidebar';
import PostCard from '../components/PostCard/PostCard';
import type { Community, Post, Tag } from '../types/api';
import { BASE_URL } from '../config';

export default function CommunitiesPage() {
  const navigate = useNavigate();
  const { communityId = 'ec1' } = useParams<{ communityId: string }>();
  const { isAuthenticated, isMember } = useAuth();
  const [community, setCommunity] = useState<Community | null>(null);
  const [sortTab, setSortTab] = useState<'new' | 'top'>('new');
  const [communityPosts, setCommunityPosts] = useState<Post[]>([]);
  const [postsCursor, setPostsCursor] = useState<string | null>(null);
  const [postsLoading, setPostsLoading] = useState(false);
  const [isCommunityMember, setIsCommunityMember] = useState(isMember);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isJoinPromptOpen, setIsJoinPromptOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [guidelines, setGuidelines] = useState('');
  const [tags, setTags] = useState<Tag[]>([]);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const isAdmin = isAuthenticated && isCommunityMember && (communityId === 'ec1' || communityId === 'c1');

  useEffect(() => {
    if (!isAuthenticated) {
      setIsCommunityMember(false);
      return;
    }
    void fetch(`${BASE_URL}/communities/${communityId}/memberships/status`, { credentials: 'include' })
      .then((response) => response.ok ? response.json() : null)
      .then((body: { data?: { active?: boolean } } | null) => setIsCommunityMember(Boolean(body?.data?.active)))
      .catch(() => setIsCommunityMember(false));
  }, [communityId, isAuthenticated, isMember]);
  useEffect(() => { void fetch(`${BASE_URL}/communities/${communityId}`, { credentials: 'include' }).then((response) => response.ok ? response.json() : null).then((body: { data?: Community } | null) => { const value = body?.data ?? null; setCommunity(value); setDescription(value?.community_desc ?? ''); setGuidelines(value?.community_guidelines ?? ''); setTags((value?.tags ?? []) as Tag[]); }); }, [communityId]);

  const handleJoin = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    void fetch(`${BASE_URL}/communities/memberships`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ community_id: communityId }), credentials: 'include' })
      .then((response) => response.ok ? response.json() : null)
      .then((body: { data?: { active?: boolean } } | null) => { if (body?.data?.active !== undefined) { setIsCommunityMember(body.data.active); setIsJoinPromptOpen(false); } });
  };

  const handleCreatePost = () => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (!isCommunityMember) {
      setIsJoinPromptOpen(true);
    } else {
      navigate('/create');
    }
  };

  const handleEdit = async () => {
    if (!community) return;
    await fetch(`${BASE_URL}/communities/${community.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ community_desc: description, community_guidelines: guidelines, tags }),
      credentials: 'include',
    }).catch(() => undefined);
    setIsEditOpen(false);
  };

  const handleDelete = async () => {
    if (!community) return;
    await fetch(`${BASE_URL}/communities/${community.id}`, { method: 'DELETE', credentials: 'include' }).catch(() => undefined);
    setIsDeleteOpen(false);
    setIsEditOpen(false);
    navigate('/communities');
  };

  useEffect(() => {
    let active = true;
    setPostsLoading(true);
    setPostsCursor(null);
    if (!community) return;
    fetch(`${BASE_URL}/communities/${community?.id}/posts?sort=${sortTab}`, { credentials: 'include' })
      .then(async (response) => response.ok ? await response.json() as { data?: Post[]; cursor?: string } : null)
      .then((body) => {
        if (!active) return;
        const page = body?.data ?? [];
        setCommunityPosts(page);
        setPostsCursor(body?.cursor === 'null' ? null : body?.cursor ?? null);
      })
      .catch(() => undefined)
      .finally(() => { if (active) setPostsLoading(false); });
    return () => { active = false; };
  }, [community?.id, sortTab]);

  if (!community) return <Typography sx={{ p: 8, textAlign: 'center' }}>Nothing to see here</Typography>;

  const loadMorePosts = () => {
    if (!postsCursor || postsLoading) return;
    setPostsLoading(true);
    fetch(`${BASE_URL}/communities/${community?.id}/posts?sort=${sortTab}&cursor=${encodeURIComponent(postsCursor)}`, { credentials: 'include' })
      .then(async (response) => response.ok ? await response.json() as { data?: Post[]; cursor?: string } : null)
      .then((body) => {
        if (!body?.data) return;
        setCommunityPosts((current) => [...current, ...body.data!]);
        setPostsCursor(body.cursor === 'null' ? null : body.cursor ?? null);
      })
      .catch(() => undefined)
      .finally(() => setPostsLoading(false));
  };

  return (
    <>
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        py: 3,
        width: '100%',
        mx: 'auto',
        pl: 4,
        maxWidth: '1080px'
      }}>
        <Card sx={{ bgcolor: 'background.paper', borderRadius: 2, overflow: 'hidden' }}>
          <Box sx={{ height: 260, width: '100%', position: 'relative', background: community.bannerGradient }}>
            <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #1a1a2e, transparent)', opacity: 0.8 }} />
            <Typography variant="h4" component="h1" sx={{ position: 'absolute', bottom: 20, left: 24, color: 'text.primary', fontWeight: 600, zIndex: 1 }}>{community.community_name}</Typography>
          </Box>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.6 }}>{community.community_desc}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}><ForumOutlinedIcon sx={{ color: 'text.secondary', fontSize: 18 }} /><Typography variant="body2">{community.post_count}</Typography></Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}><GroupOutlinedIcon sx={{ color: 'text.secondary', fontSize: 18 }} /><Typography variant="body2">{community.population}</Typography></Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }} onClick={(event) => event.stopPropagation()}>
                {(!isAuthenticated || !isCommunityMember) && <Button variant="outlined" size="small" onClick={handleJoin}>Join</Button>}
                <Button variant="contained" size="small" onClick={handleCreatePost}>Create post</Button>
                {isAdmin && <IconButton aria-label="Edit community" onClick={() => setIsEditOpen(true)} sx={{ color: 'primary.light', bgcolor: 'rgba(179,136,255,0.1)', borderRadius: 2 }}><EditOutlinedIcon /></IconButton>}
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 0.53fr',
          justifyContent: 'center',
          gap: 4,
          px: 4,
          py: 2,
          width: '100%',
          height: '100%',
        }}
      >
        <Box sx={{ justifySelf: 'end', width: '100%', maxWidth: 720 }}>
          <CommunitySortTabs activeTab={sortTab} onTabChange={setSortTab} />

          {/* Reused Post Cards */}
          <Fade in timeout={250} key={sortTab}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 3 }}>
              {communityPosts.length === 0 ? (
                <Typography sx={{ py: 8, textAlign: 'center', color: 'text.secondary' }}>
                  Nothing to see here
                </Typography>
              ) : communityPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
              {postsCursor && <Button variant="outlined" onClick={loadMorePosts} disabled={postsLoading}>
                {postsLoading ? 'Loading…' : 'Load more posts'}
              </Button>}
            </Box>
          </Fade>
        </Box>

        <Box sx={{ maxHeight: '100%' }}>
          <CommunityRightSidebar community={community} />
        </Box>
      </Box>

      <Dialog open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        maxWidth="md"
        fullWidth
        disableScrollLock={true}>
        <DialogContent sx={{ p: 0, bgcolor: '#1a1a2e' }}>
          <Box sx={{ height: 2, background: 'linear-gradient(90deg, transparent, #b388ff, transparent)' }} />
          <Box sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <Box><Typography variant="h6" sx={{ fontWeight: 700 }}>Edit community</Typography><Typography variant="body2">Update your community details.</Typography></Box>
            <IconButton aria-label="Close edit community" onClick={() => setIsEditOpen(false)}><CloseRoundedIcon /></IconButton>
          </Box>
          <Box sx={{ p: { xs: 3, md: 4 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ height: 160, borderRadius: 2, background: bannerImage ? `url(${bannerImage}) center/cover` : community.bannerGradient, display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', p: 2 }}>
              <input ref={bannerInputRef} hidden type="file" accept="image/png,image/jpeg,image/jpg" onChange={(event) => { const file = event.target.files?.[0]; if (file) setBannerImage(URL.createObjectURL(file)); }} />
              <Button variant="contained" startIcon={<UploadOutlinedIcon />} onClick={() => bannerInputRef.current?.click()}>Upload banner</Button>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, bgcolor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 60, py: 1 }}>
              <TextField
                fullWidth
                slotProps={{
                  input: {
                    readOnly: true
                  }
                }}
                label="Community Name"
                defaultValue={community.community_name}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 4,
                    border: '1px solid rgba(255, 255, 255, 0.36)',
                    bgcolor: 'rgba(31, 19, 36, 0.53)'
                  },
                  '& . MuiFormLabel-root': {
                    fontSize: '1.2rem'
                  }
                }}
              />
            </Box>
            <TextField
              label="Community Description"
              multiline rows={4}
              fullWidth value={description}
              onChange={(event) => setDescription(event.target.value.slice(0, 200))}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 4,
                  border: '1px solid rgba(255, 255, 255, 0.36)',
                  bgcolor: 'rgba(31, 19, 36, 0.53)'
                },
                '& . MuiFormLabel-root': {
                  fontSize: '1.2rem'
                }
              }}
            />
            <CommunityTagSelector selectedTags={tags} onChange={setTags} />
            <TextField
              label="Community Guidelines"
              multiline
              rows={5}
              fullWidth
              value={guidelines}
              onChange={(event) => setGuidelines(event.target.value.slice(0, 200))}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 4,
                  border: '1px solid rgba(255, 255, 255, 0.36)',
                  bgcolor: 'rgba(31, 19, 36, 0.53)'
                },
                '& . MuiFormLabel-root': {
                  fontSize: '1.2rem'
                }
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)', pt: 3 }}>
              <Button color="error" variant="outlined" onClick={() => setIsDeleteOpen(true)}>Delete</Button>
              <Box sx={{ display: 'flex', gap: 1.5 }}><Button variant="outlined" onClick={() => setIsEditOpen(false)}>Cancel</Button><Button variant="contained" onClick={handleEdit}>Edit</Button></Box>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} maxWidth="xs" fullWidth>
        <DialogContent sx={{ p: 4, bgcolor: '#1a1a2e' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Delete community?</Typography>
          <Typography variant="body2" sx={{ mb: 3 }}>This action cannot be undone. Are you sure you want to delete this community?</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}><Button variant="outlined" onClick={() => setIsDeleteOpen(false)}>Cancel</Button><Button color="error" variant="contained" onClick={handleDelete}>Confirm delete</Button></Box>
        </DialogContent>
      </Dialog>

      <Dialog open={isJoinPromptOpen} onClose={() => setIsJoinPromptOpen(false)} maxWidth="xs" fullWidth>
        <DialogContent sx={{ p: 4, bgcolor: '#1a1a2e' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Join this community first</Typography>
          <Typography variant="body2" sx={{ mb: 3 }}>You need to be a member before creating a post here.</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
            <Button variant="outlined" onClick={() => setIsJoinPromptOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleJoin}>Join community</Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}
