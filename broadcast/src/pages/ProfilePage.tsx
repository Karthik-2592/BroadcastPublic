import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { currentUser, mockFollowers, mockFollowing } from '../data/mockData';
import type { UserSummary } from '../types/api';
import { displayName, userHandle } from '../types/api';
import { useAuth } from '../context/AuthContext';

type UserListType = 'followers' | 'following';

function UserListDialog({ open, type, users, onClose, onFetch }: { open: boolean; type: UserListType; users: UserSummary[]; onClose: () => void; onFetch: () => Promise<UserSummary[]> }) {
  const navigate = useNavigate();
  const [loadedUsers, setLoadedUsers] = useState<UserSummary[]>(users);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    let active = true;
    setLoading(true);
    onFetch().then((result) => {
      if (active) setLoadedUsers(result);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [open, onFetch]);

  const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) onClose();
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
          {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress size={24} /></Box> : loadedUsers.map((user) => (
            <Box key={user.id} onClick={() => { onClose(); navigate(`/profile/${user.id}`); }} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.25, borderRadius: 2, cursor: 'pointer', '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' } }}>
              <Avatar src={user.profile_picture ?? undefined} sx={{ width: 36, height: 36, bgcolor: '#343440' }}>{displayName(user).charAt(0)}</Avatar>
              <Box sx={{ minWidth: 0 }}><Typography variant="body2" sx={{ fontWeight: 600 }}>{displayName(user)}</Typography><Typography variant="caption" sx={{ color: 'text.secondary' }}>{userHandle(user)}</Typography></Box>
            </Box>
          ))}
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { isAuthenticated, currentUser: sessionUser } = useAuth();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [displayName, setDisplayName] = useState(currentUser.profile_name ?? currentUser.username);
  const [bio, setBio] = useState(currentUser.profile_description ?? '');
  const profilePictureInputRef = useRef<HTMLInputElement>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(currentUser.profile_picture ?? null);
  const [userListType, setUserListType] = useState<UserListType>('followers');
  const [isUserListOpen, setIsUserListOpen] = useState(false);
  const isOwnProfile = isAuthenticated && sessionUser?.id === currentUser.id;

  const fetchFollowers = useCallback(async () => {
    try {
      const response = await fetch(`/v1/users/${currentUser.id}/followers`);
      if (response.ok) {
        const body = await response.json() as { data?: UserSummary[] };
        if (Array.isArray(body.data)) return body.data;
      }
    } catch { /* Future endpoint is not available yet. */ }
    return mockFollowers;
  }, []);

  const fetchFollowing = useCallback(async () => {
    try {
      const response = await fetch(`/v1/users/${currentUser.id}/following`);
      if (response.ok) {
        const body = await response.json() as { data?: UserSummary[] };
        if (Array.isArray(body.data)) return body.data;
      }
    } catch { /* Future endpoint is not available yet. */ }
    return mockFollowing;
  }, []);

  const handleConfirmEdit = async () => {
    // Placeholder callback for the future profile update endpoint.
    await fetch('/v1/users/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile_name: displayName, profile_description: bio, profile_picture: profilePicture }),
    }).catch(() => undefined);
    setIsEditOpen(false);
  };

  const handleConfirmDelete = () => {
    // Placeholder callback for the future account deletion endpoint.
    setIsDeleteOpen(false);
    setIsEditOpen(false);
    navigate('/');
  };

  return (
    <>
      <div className="flex flex-col relative py-6 w-[65%] mx-auto pl-8">
        <ProfileDescription user={currentUser} onEdit={() => setIsEditOpen(true)} />
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
          <ProfileTabs userId={currentUser.id} sessionUserId={currentUser.id} />
        </Box>
        <Box sx={{ maxHeight: '100%' }}>
          <ProfileSidebar user={currentUser} followers={mockFollowers} following={mockFollowing} showViewAll={isOwnProfile} onViewFollowers={() => { setUserListType('followers'); setIsUserListOpen(true); }} onViewFollowing={() => { setUserListType('following'); setIsUserListOpen(true); }} />
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
            <Box sx={{ position: 'relative', width: 96, height: 96 }}>
              <Box sx={{ width: '100%', height: '100%', borderRadius: '50%', bgcolor: 'rgba(179,136,255,0.08)', border: '2px solid rgba(179,136,255,0.2)', background: profilePicture ? `url(${profilePicture}) center/cover` : undefined, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {!profilePicture && <PersonOutlineOutlined sx={{ color: 'text.secondary', fontSize: 40 }} />}
              </Box>
              <input ref={profilePictureInputRef} hidden type="file" accept="image/png,image/jpeg,image/jpg" onChange={(event) => { const file = event.target.files?.[0]; if (file) setProfilePicture(URL.createObjectURL(file)); }} />
            </Box>
            <Button size="small" startIcon={<UploadOutlinedIcon />} onClick={() => profilePictureInputRef.current?.click()} sx={{ textTransform: 'none' }}>Upload picture</Button>
            <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Profile Picture</Typography>
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
        users={userListType === 'followers' ? mockFollowers : mockFollowing}
        onClose={() => setIsUserListOpen(false)}
        onFetch={userListType === 'followers' ? fetchFollowers : fetchFollowing}
      />

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
