// MainLayout — Top-level layout shell for the application.
// Renders the TopBar across the full width, then a 2-column body:
// LeftSidebar (240px) | Router Outlet (flex)
// All child routes render inside the <Outlet />.

import { Outlet } from 'react-router-dom';
import Box from '@mui/material/Box';
import TopBar from '../components/TopBar/TopBar';
import LeftSidebar from '../components/LeftSidebar/LeftSidebar';

export default function MainLayout() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      <TopBar />

      <Box sx={{ display: 'flex', flex: 1 }}>
        <LeftSidebar />

        {/* Main content area — starts after the 260px fixed LeftSidebar */}
        <Box
          component="main"
          sx={{
            flex: 1,
            minWidth: 0,
            height: '100%',
            marginLeft: '260px',
            bgcolor: 'background.default',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
