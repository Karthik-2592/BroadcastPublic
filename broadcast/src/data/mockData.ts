// Mock data for the Broadcast landing page prototype.
// Provides static placeholder content for posts, communities, and followed users.

export interface MockPost {
  id: string;
  author: {
    name: string;
    handle: string;
    avatarColor: string;   // MUI Avatar fallback color
  };
  title: string;
  content: string;
  mediaPlaceholder?: string; // CSS gradient or color for the media area
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  tags: string[];
}

export interface MockCommunity {
  id: string;
  name: string;
  avatarColor: string;
  memberCount: number;
}

export interface MockUser {
  id: string;
  name: string;
  handle: string;
  avatarColor: string;
}

// -- Posts displayed in the main feed --
export const mockPosts: MockPost[] = [
  {
    id: 'p1',
    author: { name: 'Alice Chen', handle: '@alice_c', avatarColor: '#7c4dff' },
    title: 'Just deployed my first full-stack app!',
    content:
      'After months of work, my social media side-project is finally live. Built with React, Node.js, and MongoDB. Would love to hear your feedback on the architecture choices I made.',
    mediaPlaceholder: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    timestamp: '2h ago',
    likes: 42,
    comments: 8,
    shares: 3,
    tags: ['webdev', 'react', 'launch'],
  },
  {
    id: 'p2',
    author: { name: 'Marcus Webb', handle: '@mwebb', avatarColor: '#00bfa5' },
    title: 'Graph databases changed how I think about data',
    content:
      'Switched from a pure relational model to Neo4j for relationship-heavy queries and the performance improvement is staggering. If your app deals with social connections, give graph DBs a serious look.',
    timestamp: '5h ago',
    likes: 127,
    comments: 23,
    shares: 15,
    tags: ['databases', 'neo4j', 'backend'],
  },
  {
    id: 'p3',
    author: { name: 'Priya Sharma', handle: '@priya.s', avatarColor: '#ff6d00' },
    title: 'Community spotlight: Design Systems Weekly',
    content:
      'Huge shoutout to the Design Systems Weekly community for curating the best resources on component libraries, tokens, and accessibility patterns. Joined last month and already learned so much!',
    mediaPlaceholder: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    timestamp: '8h ago',
    likes: 89,
    comments: 14,
    shares: 7,
    tags: ['design', 'community', 'spotlight'],
  },
  {
    id: 'p4',
    author: { name: 'Jordan Lee', handle: '@jlee_dev', avatarColor: '#2979ff' },
    title: 'TypeScript 6.0 — first impressions',
    content:
      'The new type inference improvements are incredible. Pattern matching on discriminated unions feels almost magical now. Here are some real-world examples from my project migration.',
    timestamp: '12h ago',
    likes: 215,
    comments: 41,
    shares: 28,
    tags: ['typescript', 'javascript', 'programming'],
  },
];

// -- Communities shown in the left and right sidebars --
export const userCommunities: MockCommunity[] = [
  { id: 'c1', name: 'Web Developers', avatarColor: '#7c4dff', memberCount: 3420 },
  { id: 'c2', name: 'Open Source Projects', avatarColor: '#00bfa5', memberCount: 1890 },
  { id: 'c3', name: 'UI/UX Design', avatarColor: '#ff6d00', memberCount: 2150 },
];

export const popularCommunities: MockCommunity[] = [
  { id: 'pc1', name: 'Machine Learning', avatarColor: '#e040fb', memberCount: 8900 },
  { id: 'pc2', name: 'Startup Founders', avatarColor: '#00e5ff', memberCount: 5430 },
  { id: 'pc3', name: 'Game Development', avatarColor: '#76ff03', memberCount: 6210 },
];

// -- Users shown in the "Your Follows" sidebar section --
export const followedUsers: MockUser[] = [
  { id: 'u1', name: 'Alice Chen', handle: '@alice_c', avatarColor: '#7c4dff' },
  { id: 'u2', name: 'Marcus Webb', handle: '@mwebb', avatarColor: '#00bfa5' },
  { id: 'u3', name: 'Priya Sharma', handle: '@priya.s', avatarColor: '#ff6d00' },
];
