// RightSidebar — Supplementary panel showing popular communities,
// followed users, and support links.
// Fixed 320px width; three distinct card-like sections stacked vertically.

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import ContactSupportOutlinedIcon from '@mui/icons-material/ContactSupportOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import { popularCommunities, followedUsers } from '../../data/mockData';

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
  return (
    <Box
      component="aside"
      sx={{
        width: 320,
        minWidth: 320,
        height: 'calc(100vh - 60px)',
        position: 'fixed',
        top: 60,
        right: 0,
        px: 2,
        pt: 1,
      }}
    >
      {/* Popular Communities */}
      <SidebarSection title="Popular Communities">
        <List disablePadding>
          {popularCommunities.map((community) => (
            <ListItemButton key={community.id} sx={{ py: 0.75, px: 1, borderRadius: 2 }}>
              <ListItemIcon sx={{ minWidth: 38 }}>
                <Avatar
                  sx={{
                    width: 30,
                    height: 30,
                    bgcolor: community.avatarColor,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    border: 'none',
                  }}
                >
                  {community.name.charAt(0)}
                </Avatar>
              </ListItemIcon>
              <ListItemText
                primary={community.name}
                secondary={`${community.memberCount.toLocaleString()} members`}
                primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 500 }}
                secondaryTypographyProps={{ fontSize: '0.7rem' }}
              />
            </ListItemButton>
          ))}
        </List>
        <Button
          size="small"
          sx={{ mt: 1, fontSize: '0.75rem', color: 'primary.light' }}
        >
          See all communities
        </Button>
      </SidebarSection>

      {/* Your Follows */}
      <SidebarSection title="Your Follows">
        <List disablePadding>
          {followedUsers.map((user) => (
            <ListItemButton key={user.id} sx={{ py: 0.75, px: 1, borderRadius: 2 }}>
              <ListItemIcon sx={{ minWidth: 38 }}>
                <Avatar
                  sx={{
                    width: 30,
                    height: 30,
                    bgcolor: user.avatarColor,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    border: 'none',
                  }}
                >
                  {user.name.charAt(0)}
                </Avatar>
              </ListItemIcon>
              <ListItemText
                primary={user.name}
                secondary={user.handle}
                primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 500 }}
                secondaryTypographyProps={{ fontSize: '0.7rem' }}
              />
            </ListItemButton>
          ))}
        </List>
        <Button
          size="small"
          sx={{ mt: 1, fontSize: '0.75rem', color: 'primary.light' }}
        >
          See all follows
        </Button>
      </SidebarSection>

      {/* Support links */}
      <SidebarSection title="Support">
        <List disablePadding>
          <ListItemButton sx={{ py: 0.5, px: 1, borderRadius: 2 }}>
            <ListItemIcon sx={{ minWidth: 32, color: 'text.secondary' }}>
              <ContactSupportOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Contact Support"
              primaryTypographyProps={{ fontSize: '0.82rem' }}
            />
          </ListItemButton>

          <ListItemButton sx={{ py: 0.5, px: 1, borderRadius: 2 }}>
            <ListItemIcon sx={{ minWidth: 32, color: 'text.secondary' }}>
              <InfoOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="About Us"
              primaryTypographyProps={{ fontSize: '0.82rem' }}
            />
          </ListItemButton>

          <ListItemButton sx={{ py: 0.5, px: 1, borderRadius: 2 }}>
            <ListItemIcon sx={{ minWidth: 32, color: 'text.secondary' }}>
              <GavelOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Terms of Service"
              primaryTypographyProps={{ fontSize: '0.82rem' }}
            />
          </ListItemButton>
        </List>
      </SidebarSection>

      <Divider sx={{ my: 1 }} />
      <Typography
        variant="caption"
        sx={{ color: 'text.secondary', display: 'block', textAlign: 'center', mt: 1 }}
      >
        © 2026 Broadcast · Non-commercial project
      </Typography>
    </Box>
  );
}
