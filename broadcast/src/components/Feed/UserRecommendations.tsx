import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';
import { mockFollowing } from '../../data/mockData';
import { displayName, userHandle } from '../../types/api';
import type { UserSummary } from '../../types/api';

export default function UserRecommendations({ users = mockFollowing }: { users?: UserSummary[] }) {
  const navigate = useNavigate();

  return (
    <Box sx={{ width: '100%', height: 280, p: 2.5, bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 3, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '1.1rem', ml: 1 }}>People you might like</Typography>
      <Box sx={{ flex: 1, display: 'flex', gap: 8, minHeight: 0 }}>
        {users.map((user) => (
          <Card key={user.id} onClick={() => navigate(`/profile/${user.id}`)} sx={{ flex: 1, minWidth: 0, height: '100%', p: 1.5, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, bgcolor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', '&:hover': { borderColor: 'rgba(179,136,255,0.35)', bgcolor: 'rgba(179,136,255,0.08)' } }}>
            <Avatar src={user.profile_picture ?? undefined} sx={{ width: 96, height: 96, mb: 0.5, bgcolor: '#343440' }}>{displayName(user).charAt(0).toUpperCase()}</Avatar>
            <Typography variant="body2" sx={{ width: '100%', textAlign: 'center', fontWeight: 600, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName(user)}</Typography>
            <Typography variant="caption" sx={{ width: '100%', textAlign: 'center', color: 'text.secondary', fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userHandle(user)}</Typography>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
