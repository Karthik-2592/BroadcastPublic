import { useState, type SyntheticEvent } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Fade from '@mui/material/Fade';
import PostCard from '../PostCard/PostCard';
import type { Comment as ApiComment } from '../../types/api';
import CommentRow from '../Comment/Comment';
import { useAuth } from '../../context/AuthContext';

interface ProfileTabsProps {
  userId?: string;
  sessionUserId?: string;
}

export default function ProfileTabs({ userId = 'user_1', sessionUserId = 'user_1' }: ProfileTabsProps) {
  const { isAuthenticated } = useAuth();
  const isOwner = isAuthenticated && userId === sessionUserId;
  const canViewPrivateTabs = isAuthenticated && isOwner;

  const [activeTab, setActiveTab] = useState(0);

  const handleChange = (_event: SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const currentTab = (activeTab === 2 && !canViewPrivateTabs) ? 0 : activeTab;
  const profileComments: ApiComment[] = [];

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
      <Fade in timeout={250} key={currentTab}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {currentTab === 2 ? (
            <Typography sx={{ py: 8, textAlign: 'center', color: 'text.secondary' }}>
              You have no saved posts
            </Typography>
          ) : currentTab === 1
            ? (profileComments.length === 0 ? (
              <Typography sx={{ py: 8, textAlign: 'center', color: 'text.secondary' }}>
                {isOwner ? 'You have not made any comments' : 'User has not made any comments'}
              </Typography>
            ) : profileComments.map((comment) => <CommentRow key={comment.id} comment={comment} canEdit={isOwner} />))
            : ([].length === 0 ? (
              <Typography sx={{ py: 8, textAlign: 'center', color: 'text.secondary' }}>
                {isOwner ? 'You have not made any posts' : 'User has not made any posts'}
              </Typography>
            ) : ([] as import('../../types/api').Post[]).map((post) => <PostCard key={post.id} post={post} canEdit={isOwner} />))}
        </Box>
      </Fade>
    </Box>
  );
}
