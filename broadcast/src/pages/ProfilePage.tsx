import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import InputAdornment from '@mui/material/InputAdornment';
import PersonOutlineOutlined from '@mui/icons-material/PersonOutlineOutlined';
import CloseIcon from '@mui/icons-material/Close';
import CircularProgress from '@mui/material/CircularProgress';
import UploadOutlinedIcon from '@mui/icons-material/UploadOutlined';
import ProfileDescription from '../components/Profile/ProfileDescription';
import ProfileTabs from '../components/Profile/ProfileTabs';
import ProfileSidebar from '../components/Profile/ProfileSidebar';
import type { User, UserSummary } from '../types/api';
import { displayName, userHandle } from '../types/api';
import { useAuth } from '../context/AuthContext';
import FetchErrorDialog from '../components/FetchErrorDialog';
import CommunityTagSelector from '../components/Community/CommunityTagSelector';
import type { Tag } from '../types/api';
import { BASE_URL } from '../config';

type UserListType = 'followers' | 'following';

function UserListDialog({ open, type, users, onClose, onFetch }: { open: boolean; type: UserListType; users: UserSummary[]; onClose: () => void; onFetch: (cursor?: string | null) => Promise<{ users: UserSummary[]; cursor: string | null }> }) {
  const navigate = useNavigate();
  const [loadedUsers, setLoadedUsers] = useState<UserSummary[]>(users);
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let active = true;
    setLoading(true);
    setCursor(null);
    onFetch().then((result) => {
      if (active) {
        setLoadedUsers(result.users);
        setCursor(result.cursor);
      }
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [open, onFetch]);

  const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) onClose();
  };

  const loadMore = () => {
    if (!cursor || loading) return;
    setLoading(true);
    onFetch(cursor).then((result) => {
      setLoadedUsers((current) => [...current, ...result.users]);
      setCursor(result.cursor);
    }).finally(() => setLoading(false));
  };

  return (
    <Dialog open={open} onClose={onClose} onBlur={handleBlur} maxWidth="xs" fullWidth disableScrollLock={true}>
      <DialogContent sx={{ p: 0, bgcolor: '#1a1a2e' }}>
        <Box sx={{ height: 2, background: 'linear-gradient(90deg, transparent, #31ff8eff, transparent)' }} />
        <Box sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>{type === 'followers' ? 'Followers' : 'Following'}</Typography>
          <IconButton aria-label="Close user list" onClick={onClose} sx={{ color: 'text.secondary' }}><CloseIcon /></IconButton>
        </Box>
        <Box sx={{ p: 2 }}>
          {loading && loadedUsers.length === 0 ? <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress size={24} /></Box> : loadedUsers.length === 0 ? (
            <Typography sx={{ py: 3, textAlign: 'center', color: 'text.secondary' }}>
              {type === 'followers' ? 'You have no followers' : 'You have not followed anyone'}
            </Typography>
          ) : loadedUsers.map((user) => (
            <Box key={user.id} onClick={() => { onClose(); navigate(`/profile/${user.id}`); }} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.25, borderRadius: 2, cursor: 'pointer', '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' } }}>
              <Avatar src={user.profile_picture ?? undefined} sx={{ width: 36, height: 36, bgcolor: '#343440' }}>{displayName(user).charAt(0)}</Avatar>
              <Box sx={{ minWidth: 0 }}><Typography variant="body2" sx={{ fontWeight: 600 }}>{displayName(user)}</Typography><Typography variant="caption" sx={{ color: 'text.secondary' }}>{userHandle(user)}</Typography></Box>
            </Box>
          ))}
          {cursor && <Button fullWidth variant="outlined" onClick={loadMore} disabled={loading} sx={{ mt: 1 }}>
            {loading ? <CircularProgress size={18} /> : `Load more ${type}`}
          </Button>}
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { userId: viewedUserId } = useParams<{ userId: string }>();
  const { isAuthenticated, currentUser: sessionUser, logout } = useAuth();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [followers, setFollowers] = useState<UserSummary[]>([]);
  const [following, setFollowing] = useState<UserSummary[]>([]);
  const [displayName, setDisplayName] = useState(profileUser?.profile_name ?? '');
  const [bio, setBio] = useState(profileUser?.profile_description ?? '');
  const [interests, setInterests] = useState<Tag[]>(() => (profileUser?.interests ?? []) as Tag[]);
  const profilePictureInputRef = useRef<HTMLInputElement>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(profileUser?.profile_picture?.media_url ?? null);
  const [profilePictureError, setProfilePictureError] = useState('');
  const [userListType, setUserListType] = useState<UserListType>('followers');
  const MAX_PROFILE_PICTURE_SIZE = 4 * 1024 * 1024;
  const [isUserListOpen, setIsUserListOpen] = useState(false);
  const [hasFetchError, setHasFetchError] = useState(false);
  const effectiveUserId = viewedUserId ?? sessionUser?.id;
  const isOwnProfile = Boolean(sessionUser && effectiveUserId && sessionUser.id === effectiveUserId);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (!effectiveUserId) {
      setProfileUser(null);
      return;
    }
    if (!viewedUserId && sessionUser?.id) {
      navigate(`/profile/${sessionUser.id}`, { replace: true });
      return;
    }
  }, [navigate, sessionUser?.id, viewedUserId, effectiveUserId]);

  useEffect(() => {
    if (!effectiveUserId) return;

    let active = true;
    void (async () => {
      try {
        const response = await fetch(`${BASE_URL}/users/${effectiveUserId}`, { credentials: 'include' });
        if (!response.ok) throw new Error('Unable to load profile');

        const body = await response.json() as { data?: User };
        if (!body.data) throw new Error('Missing profile data');

        if (!active) return;
        setProfileUser((current) => {
          const nextUser = body.data as User;
          if (current && current.id === nextUser.id) {
            return { ...current, ...nextUser };
          }
          return nextUser;
        });
      } catch {
        if (active) setHasFetchError(true);
      }
    })();

    return () => {
      active = false;
    };
  }, [effectiveUserId]);

  useEffect(() => {
    if (!effectiveUserId) return;

    let active = true;
    void (async () => {
      try {
        const [followersResponse, followingResponse] = await Promise.all([
          fetch(`${BASE_URL}/users/${effectiveUserId}/followers`, { credentials: 'include' }),
          fetch(`${BASE_URL}/users/${effectiveUserId}/following`, { credentials: 'include' }),
        ]);

        if (!followersResponse.ok || !followingResponse.ok) {
          throw new Error('Unable to load connection previews');
        }

        const [followersBody, followingBody] = await Promise.all([
          followersResponse.json() as Promise<{ data?: UserSummary[] }>,
          followingResponse.json() as Promise<{ data?: UserSummary[] }>,
        ]);

        if (!active) return;

        setFollowers(Array.isArray(followersBody.data) ? followersBody.data.slice(0, 3) : []);
        setFollowing(Array.isArray(followingBody.data) ? followingBody.data.slice(0, 3) : []);
      } catch {
        if (active) {
          setFollowers([]);
          setFollowing([]);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [effectiveUserId]);

  useEffect(() => {
    if (!profileUser) {
      return;
    }

    setDisplayName(profileUser.profile_name ?? '');
    setBio(profileUser.profile_description ?? '');
    setInterests((profileUser.interests ?? []) as Tag[]);
    setProfilePicture(profileUser.profile_picture?.media_url ?? null);
  }, [profileUser]);

  useEffect(() => {
    if (!viewedUserId || !sessionUser || viewedUserId === sessionUser.id) {
      setIsFollowing(false);
      return;
    }
    void fetch(`${BASE_URL}/users/${viewedUserId}/follows/status`, { credentials: 'include' })
      .then((response) => response.ok ? response.json() : null)
      .then((body: { data?: { active?: boolean } } | null) => setIsFollowing(Boolean(body?.data?.active)))
      .catch(() => setIsFollowing(false));
  }, [sessionUser?.id, viewedUserId]);

  const handleFollow = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!viewedUserId) return;
    const next = !isFollowing;
    setIsFollowing(next);
    void fetch(`${BASE_URL}/users/follows`, { method: next ? 'POST' : 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ followed_id: viewedUserId }), credentials: 'include' })
      .then((response) => { if (!response.ok) throw new Error('Unable to update follow'); })
      .catch(() => setIsFollowing(next === false));
  };

  const profileUserId = profileUser?.id ?? effectiveUserId;

  const fetchFollowers = useCallback(async (cursor?: string | null) => {
    if (!profileUserId) return { users: [], cursor: null };
    try {
      const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : '';
      const response = await fetch(`${BASE_URL}/users/${profileUserId}/followers${query}`, { credentials: 'include' });
      if (response.ok) {
        const body = await response.json() as { data?: UserSummary[]; cursor?: string };
        return { users: Array.isArray(body.data) ? body.data : [], cursor: body.cursor === 'null' ? null : body.cursor ?? null };
      }
      setHasFetchError(true);
    } catch {
      setHasFetchError(true);
    }
    return { users: [], cursor: null };
  }, [profileUserId]);

  const fetchFollowing = useCallback(async (cursor?: string | null) => {
    if (!profileUserId) return { users: [], cursor: null };
    try {
      const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : '';
      const response = await fetch(`${BASE_URL}/users/${profileUserId}/following${query}`, { credentials: 'include' });
      if (response.ok) {
        const body = await response.json() as { data?: UserSummary[]; cursor?: string };
        return { users: Array.isArray(body.data) ? body.data : [], cursor: body.cursor === 'null' ? null : body.cursor ?? null };
      }
      setHasFetchError(true);
    } catch {
      setHasFetchError(true);
    }
    return { users: [], cursor: null };
  }, [profileUserId]);

  const handleConfirmEdit = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    await fetch(`${BASE_URL}/users/${profileUser?.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile_name: displayName, profile_description: bio, profile_picture: profilePicture, interests }),
      credentials: 'include',
    }).catch(() => undefined);
    setIsEditOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!sessionUser?.id) return;

    try {
      const response = await fetch(`${BASE_URL}/users/${sessionUser.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      logout();
      setIsDeleteOpen(false);
      setIsEditOpen(false);
      navigate('/', { replace: true });
    } catch {
      window.alert('We could not delete your account right now. Please try again in a moment.');
    }
  };

  return (
    <>
      <div className="flex flex-col relative py-6 w-[65%] mx-auto pl-8">
      {profileUser && <ProfileDescription user={profileUser} isOwner={isOwnProfile} isFollowing={isFollowing} onEdit={isOwnProfile ? () => setIsEditOpen(true) : undefined} onFollow={!isOwnProfile ? handleFollow : undefined} onReport={!isOwnProfile ? () => {
        navigate('/placeholder');
      } : undefined} />}
      </div>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 0.53fr',
          justifyContent: 'center',
          gap: 4,
          px: 4,
          py: 2,
          width: '100%',
          alignItems: 'start',
        }}
      >
        <Box sx={{ justifySelf: 'end', width: '100%', maxWidth: 720 }}>
          <ProfileTabs userId={viewedUserId ?? sessionUser?.id} sessionUserId={sessionUser?.id} />
        </Box>
        <Box sx={{ maxHeight: '100%' }}>
          {profileUser && <ProfileSidebar 
          user={profileUser as any} 
          followers={followers} 
          following={following}
           showViewAll={isOwnProfile}
            onViewFollowers={() => { 
              setUserListType('followers'); 
            setIsUserListOpen(true); }}
             onViewFollowing={() => {
               setUserListType('following');
                setIsUserListOpen(true); }} />
                }
        </Box>
      </Box>

      <Dialog
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        disableScrollLock={true}
        slotProps={{
          backdrop: {
            sx: {
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'brightness(0.5) blur(4px)',
            },
          },
          paper: {
            sx: {
              width: '100%',
              maxWidth: 520,
              bgcolor: '#1a1a2e',
              color: 'text.primary',
              borderRadius: 3,
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
              m: 2,
              overflow: 'hidden',
            },
          },
        }}
      >
        <Box sx={{ height: 2, background: 'linear-gradient(90deg, transparent, #b388ff, transparent)' }} />
        <Box sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>Edit your profile</Typography>
            <Typography variant="body2">Update your profile details.</Typography>
          </Box>
          <IconButton aria-label="Close edit profile" onClick={() => setIsEditOpen(false)} sx={{ color: 'text.secondary' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <DialogContent sx={{ p: { xs: 3, md: 4 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
            <Box
              component="label"
              sx={{
                position: 'relative',
                width: 96,
                height: 96,
                borderRadius: '50%',
                bgcolor: 'rgba(179,136,255,0.08)',
                border: '2px solid rgba(179,136,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                overflow: 'hidden',
                transition: 'all 0.2s ease',
              }}
            >
              {profilePicture ? (
                <Box component="img" src={profilePicture} alt="Profile preview" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <PersonOutlineOutlined sx={{ color: 'text.secondary', fontSize: 40 }} />
              )}
              <input ref={profilePictureInputRef} hidden accept="image/png,image/jpeg,image/jpg" type="file" onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                if (file.size > MAX_PROFILE_PICTURE_SIZE) {
                  setProfilePictureError('File size exceeded');
                  event.target.value = '';
                  return;
                }
                setProfilePictureError('');
                setProfilePicture(URL.createObjectURL(file));
              }} />
              <Box
                className="upload-overlay"
                sx={{
                  position: 'absolute',
                  inset: 0,
                  bgcolor: 'rgba(0,0,0,0.5)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0,
                  transition: 'opacity 0.2s ease',
                  borderRadius: '50%',
                }}
              >
                <UploadOutlinedIcon sx={{ color: 'text.primary', fontSize: 22, mb: 0.5 }} />
                <Typography variant="caption" sx={{ color: 'text.primary', fontSize: '0.7rem' }}>
                  Upload
                </Typography>
              </Box>
            </Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Profile Picture</Typography>
            {profilePictureError && (
              <Typography variant="caption" sx={{ color: 'error.main', fontSize: '0.75rem' }}>
                {profilePictureError}
              </Typography>
            )}
          </Box>

          <TextField
            label="Display Name"
            fullWidth
            size="small"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value.slice(0, 50))}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><PersonOutlineOutlined sx={{ color: 'text.secondary', fontSize: 20 }} /></InputAdornment> } }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 9999,
                border: '1px solid rgba(255, 255, 255, 0.23)',
                bgcolor: 'rgba(31, 19, 36, 0.53)'
              }
            }}
          />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <TextField
              label="Bio"
              multiline
              minRows={4}
              value={bio}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setBio(event.target.value.slice(0, 200))
              }
              variant="outlined"
              fullWidth
              sx={{
                background: 'rgba(31, 19, 36, 0.53)',
                borderRadius: 4,
                '& .MuiOutlinedInput-root': {
                  padding: '12px 16px',
                  fontFamily: 'inherit',
                  fontSize: '0.88rem',
                  border: '1px solid rgba(255, 255, 255, 0.23)',
                  lineHeight: 1.65,
                  color: 'inherit',
                  resize: 'none',
                  borderRadius: 4,
                },
              }}
            />
          </Box>

          <CommunityTagSelector selectedTags={interests} onChange={setInterests} />

          <Box sx={{ display: 'flex', width: '100%', gap: 1.5, borderTop: '1px solid rgba(255,255,255,0.06)', pt: 3 }}>
            <Button color="error" variant="outlined" onClick={() => setIsDeleteOpen(true)}
              sx={{ alignSelf: 'flex-start' }}>
              Delete account
            </Button>
            <Box sx={{ flex: 1 }} />
            <Button variant="outlined" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleConfirmEdit}>Confirm</Button>
          </Box>

        </DialogContent>
      </Dialog>

      <UserListDialog
        open={isUserListOpen}
        type={userListType}
        users={[]}
        onClose={() => setIsUserListOpen(false)}
        onFetch={userListType === 'followers' ? fetchFollowers : fetchFollowing}
      />
      <FetchErrorDialog open={hasFetchError} onClose={() => setHasFetchError(false)} />

      <Dialog open={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} maxWidth="xs" fullWidth>
        <DialogContent sx={{ p: 4, bgcolor: '#1a1a2e' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Delete account?</Typography>
          <Typography variant="body2" sx={{ mb: 3 }}>This action cannot be undone. Your account and profile data will be permanently deleted.</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
            <Button variant="outlined" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button color="error" variant="contained" onClick={handleConfirmDelete}>Confirm delete</Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}
