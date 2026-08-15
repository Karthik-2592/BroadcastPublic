// MainLayout — Top-level layout shell for the application.
// Renders the TopBar across the full width, then a 3-column body:
// LeftSidebar (240px) | Router Outlet (flex) | RightSidebar (320px).
// All child routes render inside the <Outlet />.

import { Outlet } from 'react-router-dom';
import Box from '@mui/material/Box';
import TopBar from '../components/TopBar/TopBar';
import LeftSidebar from '../components/LeftSidebar/LeftSidebar';
import RightSidebar from '../components/RightSidebar/RightSidebar';

export default function MainLayout() {
  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
    }}>
      <TopBar />

      <Box sx={{ display: 'flex', flex: 1 }}>
        <LeftSidebar />

        {/* Main content area — fills available horizontal space */}
        <Box
          component="main"
          sx={{
            flex: 1,
            minWidth: 0,
            height: '100%',
            bgcolor: 'background.default',
          }}
        >
          <Outlet />
        </Box>

        <RightSidebar />
      </Box>
    </Box>
  );
}
