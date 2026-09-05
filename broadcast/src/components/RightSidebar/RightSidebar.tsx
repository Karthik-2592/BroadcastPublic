// RightSidebar — Supplementary panel showing popular communities,
// followed users, and support links.
// Fixed 320px width; three distinct card-like sections stacked vertically.

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import ContactSupportOutlinedIcon from '@mui/icons-material/ContactSupportOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import { useNavigate } from 'react-router-dom';

// Reusable section wrapper with a subtle card-like surface
function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'divider',
        p: 2,
        mb: 2,
      }}
    >
      <Typography
        variant="subtitle1"
        sx={{ fontWeight: 600, mb: 1.5, fontSize: '0.9rem' }}
      >
        {title}
      </Typography>
      {children}
    </Box>
  );
}

export default function RightSidebar() {
  const navigate = useNavigate();

  return (
    <Box
      component="aside"
      sx={{
        width: 320,
        minWidth: 320,
        px: 2,
        pt: 2,
        position: 'sticky',
        top: '76px',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 'calc(100vh - 76px)',
        justifyContent: 'flex-end',
        ml: 8
      }}
    >


      {/* Support links */}
      <SidebarSection title="Support">
        <List disablePadding>
          <ListItemButton sx={{ py: 0.25, px: 1, borderRadius: 2 }} onClick={() => navigate('/placeholder')}>
            <ListItemIcon sx={{ minWidth: 32, color: 'text.secondary' }}>
              <ContactSupportOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography sx={{ fontSize: '0.65rem', fontWeight: 500 }}>
                  Contact Support
                </Typography>
              }
            />
          </ListItemButton>

          <ListItemButton sx={{ py: 0.25, px: 1, borderRadius: 2 }} onClick={() => navigate('/placeholder')}>
            <ListItemIcon sx={{ minWidth: 32, color: 'text.secondary' }}>
              <InfoOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography sx={{ fontSize: '0.65rem', fontWeight: 500 }}>
                  About Us
                </Typography>
              }
            />
          </ListItemButton>

          <ListItemButton sx={{ py: 0.25, px: 1, borderRadius: 2 }} onClick={() => navigate('/placeholder')}>
            <ListItemIcon sx={{ minWidth: 32, color: 'text.secondary' }}>
              <GavelOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography sx={{ fontSize: '0.65rem', fontWeight: 500 }}>
                  Terms of Service
                </Typography>
              }
            />
          </ListItemButton>
        </List>
      </SidebarSection>

      <Divider sx={{ mb: 1 }} />
      <Typography
        variant="caption"
        sx={{ color: 'text.secondary', display: 'block', textAlign: 'center', pb: 2 }}
      >
        © 2026 Broadcast · Non-commercial project
      </Typography>
    </Box>
  );
}
