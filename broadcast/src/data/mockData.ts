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

// -- Comment data for post view page --
export interface MockComment {
  id: string;
  author: {
    name: string;
    handle: string;
    avatarColor: string;
  };
  content: string;
  timestamp: string;
  likes: number;
  replies?: MockComment[];
}

export const mockComments: MockComment[] = [
  {
    id: 'cm1',
    author: { name: 'Marcus Chen', handle: '@mchen', avatarColor: '#7c4dff' },
    content:
      "I've been experimenting with a similar approach for edge deployments. The cold start times really are incredible — our benchmarks show sub-10ms initialization. What runtime are you targeting primarily?",
    timestamp: '1h ago',
    likes: 24,
    replies: [
      {
        id: 'cm1r1',
        author: { name: 'Alice Chen', handle: '@alice_c', avatarColor: '#7c4dff' },
        content:
          'Primarily Wasmtime for server-side and WasmEdge for the IoT edge nodes. The ecosystem is maturing fast — highly recommend giving both a try.',
        timestamp: '45m ago',
        likes: 18,
      },
    ],
  },
  {
    id: 'cm2',
    author: { name: 'Sarah Jenkins', handle: '@sjenkins', avatarColor: '#00bfa5' },
    content:
      'The memory footprint reduction is what sold our team. Going from 500MB containers to 2MB Wasm modules was a game-changer cost-wise. The rewrite took time but was absolutely worth it.',
    timestamp: '30m ago',
    likes: 8,
  },
  {
    id: 'cm3',
    author: { name: 'Jordan Lee', handle: '@jlee_dev', avatarColor: '#2979ff' },
    content:
      'Great write-up! One thing worth mentioning is the WASI standardization progress — it will make a lot of this tooling interoperable soon. Excited to see where the ecosystem lands by end of year.',
    timestamp: '15m ago',
    likes: 5,
    replies: [
      {
        id: 'cm3r1',
        author: { name: 'Priya Sharma', handle: '@priya.s', avatarColor: '#ff6d00' },
        content:
          'WASI 2.0 preview is already looking very solid. The component model is the piece that will really unlock cross-language composition.',
        timestamp: '10m ago',
        likes: 3,
      },
    ],
  },
];

// -- Users shown in the "Your Follows" sidebar section --
export const followedUsers: MockUser[] = [
  { id: 'u1', name: 'Alice Chen', handle: '@alice_c', avatarColor: '#7c4dff' },
  { id: 'u2', name: 'Marcus Webb', handle: '@mwebb', avatarColor: '#00bfa5' },
  { id: 'u3', name: 'Priya Sharma', handle: '@priya.s', avatarColor: '#ff6d00' },
];

export interface MockCommunityCard {
  id: string;
  name: string;
  description: string;
  postCount: string;
  memberCount: string;
  bannerGradient: string;
  badge?: 'Trending' | 'New';
  joinState: 'join' | 'joined';
}

export const exploreCommunities: MockCommunityCard[] = [
  {
    id: 'ec1',
    name: 'Web Developers',
    description: 'A collective of frontend and backend engineers building the next generation of web applications. Discuss frameworks, performance, and modern architecture.',
    postCount: '12.4k',
    memberCount: '85k',
    bannerGradient: 'linear-gradient(135deg, #7c4dff 0%, #b388ff 100%)',
    badge: 'Trending',
    joinState: 'join',
  },
  {
    id: 'ec2',
    name: 'AI & Machine Learning',
    description: 'Dive into deep learning, neural networks, and generative AI. Share research papers, models, and cutting-edge implementations.',
    postCount: '8.2k',
    memberCount: '42k',
    bannerGradient: 'linear-gradient(135deg, #e040fb 0%, #ea80fc 100%)',
    joinState: 'join',
  },
  {
    id: 'ec3',
    name: 'UI/UX Design',
    description: 'Critique sessions, design system architecture, and user research methodologies. Elevate your interface craftsmanship.',
    postCount: '4.1k',
    memberCount: '31k',
    bannerGradient: 'linear-gradient(135deg, #ff6d00 0%, #ff9e80 100%)',
    joinState: 'join',
  },
  {
    id: 'ec4',
    name: 'Open Source Hub',
    description: 'Find your next project. Connect with maintainers, discuss governance, and collaborate on software that powers the world.',
    postCount: '15k',
    memberCount: '112k',
    bannerGradient: 'linear-gradient(135deg, #00bfa5 0%, #1de9b6 100%)',
    joinState: 'joined',
  },
  {
    id: 'ec5',
    name: 'Hardware Hackers',
    description: 'Microcontrollers, custom PCBs, and robotics. A space for makers pushing the physical boundaries of technology.',
    postCount: '2.8k',
    memberCount: '18k',
    bannerGradient: 'linear-gradient(135deg, #76ff03 0%, #b2ff59 100%)',
    joinState: 'join',
  },
  {
    id: 'ec6',
    name: 'Web3 & Decentralization',
    description: 'Exploring smart contracts, dApps, and zero-knowledge proofs. Building the distributed infrastructure of tomorrow.',
    postCount: '945',
    memberCount: '5.2k',
    bannerGradient: 'linear-gradient(135deg, #00e5ff 0%, #84ffff 100%)',
    badge: 'New',
    joinState: 'join', // Changed from requested to join as requested
  },
];

