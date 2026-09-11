import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Divider from '@mui/material/Divider';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import type { User, MediaMetadata } from '../../types/api';
import { displayName, formatCount, userHandle } from '../../types/api';

const getProfilePictureUrl = (profilePicture: MediaMetadata | null | undefined): string | undefined => {
  return profilePicture?.media_url;
};

interface ProfileSidebarProps {
  user: User;
  followers: User[];
  following: User[];
  showViewAll?: boolean;
  onViewFollowers?: () => void;
  onViewFollowing?: () => void;
}

export default function ProfileSidebar({ user, followers, following, showViewAll = false, onViewFollowers, onViewFollowing }: ProfileSidebarProps) {
  const followerCount = Number.isFinite(user.follower_count) ? user.follower_count : 0;
  const followingCount = Number.isFinite(user.following_count) ? user.following_count : 0;
  const joinedDate = user.joined_at ? new Date(user.joined_at).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }) : '—';
  return (
    <Box sx={{ position: 'sticky', top: 96, display: 'flex', flexDirection: 'column', gap: 3, width: '280px', minWidth: '280px' }}>
      <Card
        sx={{
          bgcolor: '#1f1e2a', // surface-container
          borderRadius: 3,
          boxShadow: 3,
          overflow: 'hidden'
        }}
      >
        {/* Stats */}
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ color: '#e8e6ef', fontWeight: 600, mb: 3 }}>
            Stats
          </Typography>
          <TableContainer>
            <Table sx={{ '& td, & th': { border: 0, p: 2 } }}>
              <TableBody>
                <TableRow>
                  <TableCell sx={{ pb: 5, width: '50%' }}>
                    <Typography variant="h6" sx={{ color: '#d4bbff', fontWeight: 700, lineHeight: 1.2 }}>{formatCount(followerCount)}</Typography>
                    <Typography variant="caption" sx={{ color: '#9e9bab', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem' }}>Followers</Typography>
                  </TableCell>
                  <TableCell sx={{ pb: 5, width: '50%' }}>
                    <Typography variant="h6" sx={{ color: '#d4bbff', fontWeight: 700, lineHeight: 1.2 }}>{formatCount(followingCount)}</Typography>
                    <Typography variant="caption" sx={{ color: '#9e9bab', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem' }}>Following</Typography>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ pb: 5, width: '50%' }}>
                    <Typography variant="h6" sx={{ color: '#d4bbff', fontWeight: 700, lineHeight: 1.2 }}>{joinedDate}</Typography>
                    <Typography variant="caption" sx={{ color: '#9e9bab', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem' }}>Joined</Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {showViewAll && <>
          <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.06)', mx: 3 }} />

          {/* Recent Followers */}
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ color: '#e8e6ef', fontWeight: 500 }}>
                Recent Followers
              </Typography>
              {showViewAll && followers.length !== 0 && <Button size="small" onClick={onViewFollowers} sx={{ textTransform: 'none', color: '#d4bbff', fontSize: '0.75rem', minWidth: 0, '&:hover': { textDecoration: 'underline' } }}>View All</Button>}
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {followers.length === 0 ? (
                <Typography variant="body2" sx={{ color: '#9e9bab', py: 1 }}>
                  You have no followers
                </Typography>
              ) : followers.map((follower) => (
                <Box
                  key={follower.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    p: 1,
                    mx: -1,
                    borderRadius: 2,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#292935' } // hover:bg-surface-container-high
                  }}
                >
                  <Avatar src={getProfilePictureUrl(follower.profile_picture)} sx={{ width: 32, height: 32, bgcolor: '#343440' }}>{displayName(follower).charAt(0)}</Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ color: '#e3e0f1', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {displayName(follower)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#9e9bab', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                      {userHandle(follower)}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>

          <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.06)', mx: 3 }} />

          {/* Following */}
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ color: '#e8e6ef', fontWeight: 500 }}>
                Following
              </Typography>
              {showViewAll && following.length !== 0 && <Button size="small" onClick={onViewFollowing} sx={{ textTransform: 'none', color: '#d4bbff', fontSize: '0.75rem', minWidth: 0, '&:hover': { textDecoration: 'underline' } }}>View All</Button>}
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {following.length === 0 ? (
                <Typography variant="body2" sx={{ color: '#9e9bab', py: 1 }}>
                  You have not followed anyone
                </Typography>
              ) : following.map((followed) => (
                <Box
                  key={followed.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    p: 1,
                    mx: -1,
                    borderRadius: 2,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#292935' }
                  }}
                >
                  <Avatar src={getProfilePictureUrl(followed.profile_picture)} sx={{ width: 32, height: 32, bgcolor: '#343440' }}>{displayName(followed).charAt(0)}</Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ color: '#e3e0f1', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {displayName(followed)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#9e9bab', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                      {userHandle(followed)}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </>}
      </Card>
    </Box>
  );
}
