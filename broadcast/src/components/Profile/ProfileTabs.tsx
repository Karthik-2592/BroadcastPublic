import { useState, type SyntheticEvent } from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import PostCard from '../PostCard/PostCard';
import { mockPosts } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';

interface ProfileTabsProps {
  userId?: string;
  sessionUserId?: string;
}

export default function ProfileTabs({ userId = 'user_1', sessionUserId = 'user_1' }: ProfileTabsProps) {
  const { isAuthenticated } = useAuth();
  const isOwner = userId === sessionUserId;
  const canViewPrivateTabs = isAuthenticated && isOwner;

  const [activeTab, setActiveTab] = useState(0);

  const handleChange = (event: SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const currentTab = canViewPrivateTabs ? activeTab : 0;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {/* Tabs */}
      <Box
        sx={{
          bgcolor: 'surfaceContainer.main',
          backgroundColor: '#1f1e2a',
          borderRadius: 2,
          p: 0.5,
          boxShadow: 1,
          zIndex: 30,
        }}
      >
        <Tabs
          value={currentTab}
          onChange={handleChange}
          variant="fullWidth"
          sx={{
            minHeight: 48,
            '& .MuiTabs-indicator': {
              display: 'none',
            },
          }}
        >
          <Tab
            label="Posts"
            sx={{
              textTransform: 'none',
              borderRadius: 1.5,
              fontWeight: 500,
              minHeight: 48,
              mx: '2px',
              color: '#ccc3d4',
              '&.Mui-selected': {
                color: '#d4bbff',
                backgroundColor: '#343440',
                boxShadow: 1
              },
              '&:hover:not(.Mui-selected)': {
                backgroundColor: '#343440',
                color: '#e3e0f1'
              }
            }}
          />
          {canViewPrivateTabs && (
            <Tab
              label="Comments"
              sx={{
                textTransform: 'none',
                borderRadius: 1.5,
                fontWeight: 500,
                minHeight: 48,
                mx: '2px',
                color: '#ccc3d4',
                '&.Mui-selected': {
                  color: '#d4bbff',
                  backgroundColor: '#343440',
                  boxShadow: 1
                },
                '&:hover:not(.Mui-selected)': {
                  backgroundColor: '#343440',
                  color: '#e3e0f1'
                }
              }}
            />
          )}
          {canViewPrivateTabs && (
            <Tab
              label="Saved"
              sx={{
                textTransform: 'none',
                borderRadius: 1.5,
                fontWeight: 500,
                minHeight: 48,
                mx: '2px',
                color: '#ccc3d4',
                '&.Mui-selected': {
                  color: '#d4bbff',
                  backgroundColor: '#343440',
                  boxShadow: 1
                },
                '&:hover:not(.Mui-selected)': {
                  backgroundColor: '#343440',
                  color: '#e3e0f1'
                }
              }}
            />
          )}
        </Tabs>
      </Box>

      {/* Feed Content */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {mockPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </Box>
    </Box>
  );
}
