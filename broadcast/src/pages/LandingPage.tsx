import Box from '@mui/material/Box';
import Feed from '../components/Feed/Feed';
import RightSidebar from '../components/RightSidebar/RightSidebar';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const route = isAuthenticated? "/feed" : "/feed/trending"
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '1fr 0.53fr',
        justifyContent: 'center',
        gap: 4,
        px: 4,
        pt: 2,
        width: '100%',
        height: '100%',
      }}
    >
      <Box sx={{ justifySelf: 'end', width: '100%', maxWidth: 720 }}>
        <Feed endpoint={route} />
      </Box>
      <Box sx={{ maxHeight: '100%' }}>
        <RightSidebar />
      </Box>
    </Box>
  );
}

