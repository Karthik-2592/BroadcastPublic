import Box from '@mui/material/Box';
import ProfileDescription from '../components/Profile/ProfileDescription';
import ProfileTabs from '../components/Profile/ProfileTabs';
import ProfileSidebar from '../components/Profile/ProfileSidebar';

export default function ProfilePage() {
  return (
    <>
      <div className="flex flex-col relative py-6 w-[65%] mx-auto pl-8">
        <ProfileDescription />
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
          <ProfileTabs />
        </Box>
        <Box sx={{ maxHeight: '100%' }}>
          <ProfileSidebar />
        </Box>
      </Box>
    </>
  );
}
