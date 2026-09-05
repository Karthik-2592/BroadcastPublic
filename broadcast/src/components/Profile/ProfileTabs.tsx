import { useEffect, useState, type SyntheticEvent } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Fade from '@mui/material/Fade';
import PostCard from '../PostCard/PostCard';
import type { Comment as ApiComment, Post as ApiPost } from '../../types/api';
import CommentRow from '../Comment/Comment';
import { useAuth } from '../../context/AuthContext';
import { BASE_URL } from '../../config';

interface ProfileTabsProps {
  userId?: string;
  sessionUserId?: string;
}

export default function ProfileTabs({ userId = 'user_1', sessionUserId = 'user_1' }: ProfileTabsProps) {
  const { isAuthenticated } = useAuth();
  const isOwner = Boolean(isAuthenticated && userId && sessionUserId && userId === sessionUserId);
  const canViewPrivateTabs = isAuthenticated && isOwner;

  const [activeTab, setActiveTab] = useState(0);
  const [profilePosts, setProfilePosts] = useState<ApiPost[]>([]);
  const [profileComments, setProfileComments] = useState<ApiComment[]>([]);
  const [savedPosts, setSavedPosts] = useState<ApiPost[]>([]);

  useEffect(() => {
    if (!userId) return;

    let active = true;

    const loadProfileData = async () => {
      try {
        const [postsResponse, commentsResponse] = await Promise.all([
          fetch(`${BASE_URL}/users/${userId}/posts`, { credentials: 'include' }),
          fetch(`${BASE_URL}/users/${userId}/comments`, { credentials: 'include' }),
        ]);

        if (!postsResponse.ok || !commentsResponse.ok) {
          throw new Error('Unable to load profile activity');
        }

        const [postsBody, commentsBody] = await Promise.all([
          postsResponse.json() as Promise<{ data?: ApiPost[] }>,
          commentsResponse.json() as Promise<{ data?: ApiComment[] }>,
        ]);

        if (!active) return;
        setProfilePosts(Array.isArray(postsBody.data) ? postsBody.data : []);
        setProfileComments(Array.isArray(commentsBody.data) ? commentsBody.data : []);

        if (canViewPrivateTabs && sessionUserId) {
          const savedResponse = await fetch(`${BASE_URL}/users/${sessionUserId}/saved-posts`, { credentials: 'include' });
          if (!savedResponse.ok) throw new Error('Unable to load saved posts');
          const savedBody = await savedResponse.json() as { data?: ApiPost[] };
          if (active) setSavedPosts(Array.isArray(savedBody.data) ? savedBody.data : []);
        } else if (active) {
          setSavedPosts([]);
        }
      } catch {
        if (active) {
          setProfilePosts([]);
          setProfileComments([]);
          setSavedPosts([]);
        }
      }
    };

    void loadProfileData();
    return () => { active = false; };
  }, [canViewPrivateTabs, sessionUserId, userId]);

  const handleChange = (_event: SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const currentTab = (activeTab === 2 && !canViewPrivateTabs) ? 0 : activeTab;

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
            savedPosts.length === 0 ? (
              <Typography sx={{ py: 8, textAlign: 'center', color: 'text.secondary' }}>
                You have no saved posts
              </Typography>
            ) : savedPosts.map((post) => <PostCard key={post.id} post={post} canEdit={isOwner} />)
          ) : currentTab === 1
            ? (profileComments.length === 0 ? (
              <Typography sx={{ py: 8, textAlign: 'center', color: 'text.secondary' }}>
                {isOwner ? 'You have not made any comments' : 'User has not made any comments'}
              </Typography>
            ) : profileComments.map((comment) => <CommentRow key={comment.id} comment={comment} canEdit={isOwner} inPost={false} />))
            : (profilePosts.length === 0 ? (
              <Typography sx={{ py: 8, textAlign: 'center', color: 'text.secondary' }}>
                {isOwner ? 'You have not made any posts' : 'User has not made any posts'}
              </Typography>
            ) : profilePosts.map((post) => <PostCard key={post.id} post={post} canEdit={isOwner} />))}
        </Box>
      </Fade>
    </Box>
  );
}
