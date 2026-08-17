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
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

export default function ProfileSidebar() {
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
                    <Typography variant="h6" sx={{ color: '#d4bbff', fontWeight: 700, lineHeight: 1.2 }}>1.2k</Typography>
                    <Typography variant="caption" sx={{ color: '#9e9bab', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem' }}>Followers</Typography>
                  </TableCell>
                  <TableCell sx={{ pb: 5, width: '50%' }}>
                    <Typography variant="h6" sx={{ color: '#d4bbff', fontWeight: 700, lineHeight: 1.2 }}>850</Typography>
                    <Typography variant="caption" sx={{ color: '#9e9bab', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem' }}>Following</Typography>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ pb: 5, width: '50%' }}>
                    <Typography variant="h6" sx={{ color: '#d4bbff', fontWeight: 700, lineHeight: 1.2 }}>124</Typography>
                    <Typography variant="caption" sx={{ color: '#9e9bab', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem' }}>Posts</Typography>
                  </TableCell>
                  <TableCell sx={{ pb: 5, width: '50%' }}>
                    <Typography variant="h6" sx={{ color: '#d4bbff', fontWeight: 700, lineHeight: 1.2 }}>Oct '21</Typography>
                    <Typography variant="caption" sx={{ color: '#9e9bab', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem' }}>Joined</Typography>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ width: '50%' }}>
                    <Typography variant="h6" sx={{ color: '#d4bbff', fontWeight: 700, lineHeight: 1.2 }}>12</Typography>
                    <Typography variant="caption" sx={{ color: '#9e9bab', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem' }}>Communities</Typography>
                  </TableCell>
                  <TableCell sx={{ width: '50%' }} />
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.06)', mx: 3 }} />

        {/* Recent Followers */}
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" sx={{ color: '#e8e6ef', fontWeight: 500 }}>
              Recent Followers
            </Typography>
            <Button size="small" sx={{ textTransform: 'none', color: '#d4bbff', fontSize: '0.75rem', minWidth: 0, '&:hover': { textDecoration: 'underline' } }}>
              View All
            </Button>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {[
              { name: 'Alice Chen', handle: '@alice_dev', img: '' },
              { name: 'Marcus Webb', handle: '@mwebb_ui', img: '' },
              { name: 'Priya Sharma', handle: '@priya_codes', img: '' }
            ].map((user, idx) => (
              <Box
                key={idx}
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
                <Avatar src={user.img} sx={{ width: 32, height: 32, bgcolor: '#343440' }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ color: '#e3e0f1', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#9e9bab', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                    {user.handle}
                  </Typography>
                </Box>
                <IconButton size="small" sx={{ color: '#d4bbff', '&:hover': { bgcolor: 'rgba(212,187,255,0.1)' } }}>
                  <PersonAddIcon fontSize="small" />
                </IconButton>
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
            <Button size="small" sx={{ textTransform: 'none', color: '#d4bbff', fontSize: '0.75rem', minWidth: 0, '&:hover': { textDecoration: 'underline' } }}>
              View All
            </Button>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {[
              { name: 'Dan Abramov', handle: '@dan_abramov', img: '' },
              { name: 'Sarah Drasner', handle: '@sarah_edo', img: '' },
              { name: 'Vercel', handle: '@vercel', img: '' }
            ].map((user, idx) => (
              <Box
                key={idx}
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
                <Avatar src={user.img} sx={{ width: 32, height: 32, bgcolor: '#343440' }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ color: '#e3e0f1', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#9e9bab', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                    {user.handle}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Card>
    </Box>
  );
}
