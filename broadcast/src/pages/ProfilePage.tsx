import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import type { MediaMetadata } from '../types/api';
import { useNavigate, useParams } from 'react-router-dom';

const getProfilePictureUrl = (profilePicture: MediaMetadata | null | undefined): string | undefined => {
  return profilePicture?.media_url;
};
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
import { displayName, userHandle } from '../types/api';
import { useAuth } from '../context/AuthContext';
import FetchErrorDialog from '../components/FetchErrorDialog';
import CommunityTagSelector from '../components/Community/CommunityTagSelector';
import type { Tag } from '../types/api';
import {
  useProfile,
  useFollowersPreview,
  useFollowingPreview,
  useFollowStatus,
  usePaginatedFollowers,
  usePaginatedFollowing,
  useToggleFollow,
  useUpdateProfile,
  useDeleteAccount,
} from '../queries/users';

type UserListType = 'followers' | 'following';

function UserListDialog({
  open,
  type,
  profileUserId,
  onClose,
}: {
  open: boolean;
  type: UserListType;
  profileUserId?: string | null;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const isFollowers = type === 'followers';

  const followersQuery = usePaginatedFollowers(profileUserId, open && isFollowers);
  const followingQuery = usePaginatedFollowing(profileUserId, open && !isFollowers);
  const activeQuery = isFollowers ? followersQuery : followingQuery;

  const users = useMemo(
    () => activeQuery.data?.pages.flatMap((p) => p.users) ?? [],
    [activeQuery.data],
  );

  const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} onBlur={handleBlur} maxWidth="xs" fullWidth disableScrollLock={true}>
      <DialogContent sx={{ p: 0, bgcolor: '#1a1a2e' }}>
        <Box sx={{ height: 2, background: 'linear-gradient(90deg, transparent, #31ff8eff, transparent)' }} />
        <Box sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>{isFollowers ? 'Followers' : 'Following'}</Typography>
          <IconButton aria-label="Close user list" onClick={onClose} sx={{ color: 'text.secondary' }}><CloseIcon /></IconButton>
        </Box>
        <Box sx={{ p: 2 }}>
          {activeQuery.isLoading && users.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress size={24} /></Box>
          ) : users.length === 0 ? (
            <Typography sx={{ py: 3, textAlign: 'center', color: 'text.secondary' }}>
              {isFollowers ? 'You have no followers' : 'You have not followed anyone'}
            </Typography>
          ) : users.map((user) => (
            <Box key={user.id} onClick={() => { onClose(); navigate(`/profile/${user.id}`); }} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.25, borderRadius: 2, cursor: 'pointer', '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' } }}>
              <Avatar src={getProfilePictureUrl(user.profile_picture)} sx={{ width: 36, height: 36, bgcolor: '#343440' }}>{displayName(user).charAt(0)}</Avatar>
              <Box sx={{ minWidth: 0 }}><Typography variant="body2" sx={{ fontWeight: 600 }}>{displayName(user)}</Typography><Typography variant="caption" sx={{ color: 'text.secondary' }}>{userHandle(user)}</Typography></Box>
            </Box>
          ))}
          {activeQuery.hasNextPage && (
            <Button fullWidth variant="outlined" onClick={() => void activeQuery.fetchNextPage()} disabled={activeQuery.isFetchingNextPage} sx={{ mt: 1 }}>
              {activeQuery.isFetchingNextPage ? <CircularProgress size={18} /> : `Load more ${type}`}
            </Button>
          )}
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
  const [userListType, setUserListType] = useState<UserListType>('followers');
  const MAX_PROFILE_PICTURE_SIZE = 4 * 1024 * 1024;
  const [isUserListOpen, setIsUserListOpen] = useState(false);
  const [hasFetchError, setHasFetchError] = useState(false);

  const effectiveUserId = viewedUserId ?? sessionUser?.id;
  const isOwnProfile = Boolean(sessionUser && effectiveUserId && sessionUser.id === effectiveUserId);

  // ── TanStack Query reads ───────────────────────────────────────────────────
  const { data: profileUser, isError: profileError } = useProfile(effectiveUserId);
  const { data: followers = [] } = useFollowersPreview(effectiveUserId);
  const { data: following = [] } = useFollowingPreview(effectiveUserId);
  const { data: isFollowingData = false } = useFollowStatus(viewedUserId, sessionUser?.id);

  // ── TanStack Query mutations ─────────────────────────────────────────────────
  const toggleFollow = useToggleFollow();
  const updateProfile = useUpdateProfile();
  const deleteAccount = useDeleteAccount();

  // Derive isFollowing from query data, with local optimistic state overlay
  const [optimisticFollowing, setOptimisticFollowing] = useState<boolean | null>(null);
  const isFollowing = optimisticFollowing ?? isFollowingData;
  
  // Track pending follow operation to prevent race conditions
  const pendingFollowRef = useRef(false);

  // Reset optimistic state when the underlying query data changes (e.g. profile switch)
  const prevFollowingData = useRef(isFollowingData);
  useEffect(() => {
    if (prevFollowingData.current !== isFollowingData) {
      prevFollowingData.current = isFollowingData;
      setOptimisticFollowing(null);
    }
  }, [isFollowingData]);

  // ── Edit dialog local state (synced from profileUser) ─────────────────────
  const [displayName, setDisplayName] = useState(profileUser?.profile_name ?? '');
  const [bio, setBio] = useState(profileUser?.profile_description ?? '');
  const [interests, setInterests] = useState<Tag[]>(() => (profileUser?.interests ?? []) as Tag[]);
  const profilePictureInputRef = useRef<HTMLInputElement>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(
    profileUser?.profile_picture?.media_url ?? null,
  );
  const [profilePictureError, setProfilePictureError] = useState('');

  // Redirect /profile → /profile/:id
  useEffect(() => {
    if (!viewedUserId && sessionUser?.id) {
      navigate(`/profile/${sessionUser.id}`, { replace: true });
    }
  }, [navigate, sessionUser?.id, viewedUserId]);

  // Surface fetch errors from the profile query
  useEffect(() => {
    if (profileError) setHasFetchError(true);
  }, [profileError]);

  // Sync edit-dialog fields when profileUser loads or changes
  useEffect(() => {
    if (!profileUser) return;
    setDisplayName(profileUser.profile_name ?? '');
    setBio(profileUser.profile_description ?? '');
    setInterests((profileUser.interests ?? []) as Tag[]);
    setProfilePicture(profileUser.profile_picture?.media_url ?? null);
  }, [profileUser]);

  const handleFollow = useCallback(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!viewedUserId || !sessionUser?.id) return;
    
    // Prevent concurrent follow operations
    if (pendingFollowRef.current || toggleFollow.isPending) {
      return;
    }
    
    const next = !isFollowing;
    pendingFollowRef.current = true;
    
    // Optimistic update
    setOptimisticFollowing(next);
    toggleFollow.mutate({ followedId: viewedUserId, following: next }, {
      onError: () => {
        console.log("ROLLBACK")
        setOptimisticFollowing(!next);
        pendingFollowRef.current = false;
      },
      onSuccess: () => {
        setOptimisticFollowing(null);
        pendingFollowRef.current = false;
      },
    });
  }, [isAuthenticated, navigate, viewedUserId, sessionUser?.id, isFollowing, toggleFollow]);

  const handleConfirmEdit = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!profileUser?.id) return;
    try {
      await updateProfile.mutateAsync({
        userId: profileUser.id,
        profileName: displayName,
        profileDescription: bio,
        profilePicture,
        interests
      });
      setIsEditOpen(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleConfirmDelete = async () => {
    if (!sessionUser?.id) return;

    try {
      await deleteAccount.mutateAsync(sessionUser.id);
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
        {profileUser && <ProfileDescription user={profileUser} isOwner={isOwnProfile} isFollowing={isFollowing} isFollowLoading={toggleFollow.isPending} onEdit={isOwnProfile ? () => setIsEditOpen(true) : undefined} onFollow={!isOwnProfile ? handleFollow : undefined} onReport={!isOwnProfile ? () => {
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
          {profileUser && (
            <ProfileSidebar
              user={profileUser as any}
              followers={followers}
              following={following}
              showViewAll={isOwnProfile}
              onViewFollowers={() => { setUserListType('followers'); setIsUserListOpen(true); }}
              onViewFollowing={() => { setUserListType('following'); setIsUserListOpen(true); }}
            />
          )}
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
              backgroundImage: 'none'
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
                bgcolor: '#1a1a2e',
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
              sx={{ alignSelf: 'flex-start' }}
              disabled={deleteAccount.isPending}>
              Delete account
            </Button>
            <Box sx={{ flex: 1 }} />
            <Button variant="outlined" onClick={() => setIsEditOpen(false)} disabled={updateProfile.isPending || deleteAccount.isPending}>Cancel</Button>
            <Button variant="contained" onClick={handleConfirmEdit} disabled={updateProfile.isPending}>Confirm</Button>
          </Box>

        </DialogContent>
      </Dialog>

      <UserListDialog
        open={isUserListOpen}
        type={userListType}
        profileUserId={profileUser?.id ?? effectiveUserId}
        onClose={() => setIsUserListOpen(false)}
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
