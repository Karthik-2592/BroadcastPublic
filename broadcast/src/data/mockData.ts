//  Mock data for the Broadcast application prototype.
//  All types are imported from src/types/api.ts, which mirrors the backend schema.
//  Field names match the backend exactly so that swapping fetch() responses requires
//  only removing the relevant mock export — no component changes needed.

import type { Post, Comment, Community, User, UserSummary } from '../types/api';
export type { Tag } from '../types/api';

//  ── Current logged-in user (mock) ─────────────────────────────────────────────
export const currentUser: User = {
  id: 'u0',
  username: 'alex_rivera',
  email: 'alex@example.com',
  interests: ['React', 'Node.js', 'System Architecture'],
  profile_name: 'Alex Rivera',
  profile_picture: null,
  profile_description:
    'Senior Full-stack Developer & Tech Enthusiast based in San Francisco. Passionate about React, Node.js, and building community-driven software. Constantly exploring the edges of what\'s possible with web technologies and always open to collaborating on open-source projects.',
  pinned_posts: [],
  follower_count: 1200,
  following_count: 850,
  post_count: 124,
  community_count: 12,
  joined_at: "2021-10-01T00:00:00Z",
};

export const currentUserSummary: UserSummary = {
  id: currentUser.id,
  username: currentUser.username,
  profile_name: currentUser.profile_name,
  profile_picture: currentUser.profile_picture,
};

//  ── Mock follower / following lists ───────────────────────────────────────────
export const mockFollowers: UserSummary[] = [
  { id: 'u1', username: 'alice_dev', profile_name: 'Alice Chen', profile_picture: null },
  { id: 'u2', username: 'mwebb_ui', profile_name: 'Marcus Webb', profile_picture: null },
  { id: 'u3', username: 'priya_codes', profile_name: 'Priya Sharma', profile_picture: null },
];

export const mockFollowing: UserSummary[] = [
  { id: 'f1', username: 'dan_abramov', profile_name: 'Dan Abramov', profile_picture: null },
  { id: 'f2', username: 'sarah_edo', profile_name: 'Sarah Drasner', profile_picture: null },
  { id: 'f3', username: 'vercel', profile_name: 'Vercel', profile_picture: null },
  { id: 'f4', username: 'supabase', profile_name: 'Supabase', profile_picture: null },

];

export const followedUsers = mockFollowing;
export const userSummaries: UserSummary[] = [currentUserSummary, ...mockFollowers, ...mockFollowing];

//  ── Posts displayed in the main feed ──────────────────────────────────────────
export const mockPosts: Post[] = [
  {
    id: 'p1',
    user_id: 'u1',
    community_id: null,
    user_summary: { id: 'u1', username: 'alice_c', profile_name: 'Alice Chen', profile_picture: null },
    title: 'Just deployed my first full-stack app!',
    content:
      'After months of work, my social media side-project is finally live. Built with React, Node.js, and MongoDB. Would love to hear your feedback on the architecture choices I made.',
    media: [],
    popularity_score: 42,
    favorite_count: 42,
    comment_count: 8,
    time_created: '2h ago',
    tags: ['webdev', 'react', 'launch'],
    recommendationReason: 'Post was recommended based on your interests',
  },
  {
    id: 'p2',
    user_id: 'u2',
    community_id: null,
    user_summary: { id: 'u2', username: 'mwebb', profile_name: 'Marcus Webb', profile_picture: null },
    title: 'Graph databases changed how I think about data',
    content:
      'Switched from a pure relational model to Neo4j for relationship-heavy queries and the performance improvement is staggering. If your app deals with social connections, give graph DBs a serious look.',
    media: [],
    popularity_score: 127,
    favorite_count: 127,
    comment_count: 23,
    time_created: '5h ago',
    tags: ['databases', 'neo4j', 'backend'],
  },
  {
    id: 'p3',
    user_id: 'u3',
    community_id: null,
    user_summary: { id: 'u3', username: 'priya_s', profile_name: 'Priya Sharma', profile_picture: null },
    title: 'Community spotlight: Design Systems Weekly',
    content:
      'Huge shoutout to the Design Systems Weekly community for curating the best resources on component libraries, tokens, and accessibility patterns. Joined last month and already learned so much!',
    media: [],
    popularity_score: 89,
    favorite_count: 89,
    comment_count: 14,
    time_created: '8h ago',
    tags: ['design', 'community', 'spotlight'],
  },
  {
    id: 'p4',
    user_id: 'u4',
    community_id: null,
    user_summary: { id: 'u4', username: 'jlee_dev', profile_name: 'Jordan Lee', profile_picture: null },
    title: 'TypeScript 6.0 — first impressions',
    content:
      'The new type inference improvements are incredible. Pattern matching on discriminated unions feels almost magical now. Here are some real-world examples from my project migration.',
    media: [],
    popularity_score: 215,
    favorite_count: 215,
    comment_count: 41,
    time_created: '12h ago',
    tags: ['typescript', 'javascript', 'programming'],
  },
];

//  ── Communities shown in the left sidebar (joined by current user) ────────────
export const userCommunities: Community[] = [
  {
    id: 'c1',
    community_name: 'Web Developers',
    community_desc: 'A collective of frontend and backend engineers.',
    admin_id: null,
    tags: ['webdev'],
    bannerGradient: 'linear-gradient(135deg, #7c4dff 0%, #b388ff 100%)',
    population: 3420,
    post_count: 12400,
    timestamp: '2021-01-01T00:00:00Z',
  },
  {
    id: 'c2',
    community_name: 'Open Source Projects',
    community_desc: 'Collaborate on software that powers the world.',
    admin_id: null,
    tags: ['opensource'],
    bannerGradient: 'linear-gradient(135deg, #00bfa5 0%, #1de9b6 100%)',
    population: 1890,
    post_count: 5600,
    timestamp: '2021-03-15T00:00:00Z',
  },
  {
    id: 'c3',
    community_name: 'UI/UX Design',
    community_desc: 'Elevate your interface craftsmanship.',
    admin_id: null,
    tags: ['design', 'ux'],
    bannerGradient: 'linear-gradient(135deg, #ff6d00 0%, #ff9e80 100%)',
    population: 2150,
    post_count: 4100,
    timestamp: '2021-06-01T00:00:00Z',
  },
];

//  ── Trending / popular communities shown in search ────────────────────────────
export const popularCommunities: Community[] = [
  {
    id: 'pc1',
    community_name: 'Machine Learning',
    community_desc: 'Deep learning, neural networks, and generative AI.',
    admin_id: null,
    tags: ['ai', 'ml'],
    bannerGradient: 'linear-gradient(135deg, #e040fb 0%, #ea80fc 100%)',
    population: 8900,
    post_count: 8200,
    timestamp: '2020-11-01T00:00:00Z',
  },
  {
    id: 'pc2',
    community_name: 'Startup Founders',
    community_desc: 'Community for founders and entrepreneurs.',
    admin_id: null,
    tags: ['startup', 'business'],
    bannerGradient: 'linear-gradient(135deg, #00e5ff 0%, #84ffff 100%)',
    population: 5430,
    post_count: 3100,
    timestamp: '2021-02-01T00:00:00Z',
  },
  {
    id: 'pc3',
    community_name: 'Game Development',
    community_desc: 'Build games from indie to AAA.',
    admin_id: null,
    tags: ['gamedev', 'unity', 'unreal'],
    bannerGradient: 'linear-gradient(135deg, #76ff03 0%, #b2ff59 100%)',
    population: 6210,
    post_count: 4900,
    timestamp: '2021-04-01T00:00:00Z',
  },
];

//  ── Top-level comments for the post view page ─────────────────────────────────
//  replies are loaded lazily; the mock pre-populates them for prototype purposes.
export const mockComments: Comment[] = [
  {
    id: 'cm1',
    post_id: 'p1',
    user_id: 'u5',
    root: null,
    user_summary: { id: 'u5', username: 'mchen', profile_name: 'Marcus Chen', profile_picture: null },
    content:
      "I've been experimenting with a similar approach for edge deployments. The cold start times really are incredible — our benchmarks show sub-10ms initialization. What runtime are you targeting primarily?",
    timestamp: '1h ago',
    favorite_count: 24,
    reply_count: 1,
    replies: [
    ],
  },
  {
    id: 'cm2',
    post_id: 'p1',
    user_id: 'u6',
    root: null,
    user_summary: { id: 'u6', username: 'sjenkins', profile_name: 'Sarah Jenkins', profile_picture: null },
    content:
      'The memory footprint reduction is what sold our team. Going from 500MB containers to 2MB Wasm modules was a game-changer cost-wise. The rewrite took time but was absolutely worth it.',
    timestamp: '30m ago',
    favorite_count: 8,
    reply_count: 0,
  },
  {
    id: 'cm3',
    post_id: 'p1',
    user_id: 'u4',
    root: null,
    user_summary: { id: 'u4', username: 'jlee_dev', profile_name: 'Jordan Lee', profile_picture: null },
    content:
      'Great write-up! One thing worth mentioning is the WASI standardization progress — it will make a lot of this tooling interoperable soon. Excited to see where the ecosystem lands by end of year.',
    timestamp: '15m ago',
    favorite_count: 5,
    reply_count: 1,
    replies: [
      {
        id: 'cm3r1',
        post_id: 'p1',
        user_id: 'u3',
        root: 'cm3',
        user_summary: { id: 'u3', username: 'priya_s', profile_name: 'Priya Sharma', profile_picture: null },
        content:
          'WASI 2.0 preview is already looking very solid. The component model is the piece that will really unlock cross-language composition.',
        timestamp: '10m ago',
        favorite_count: 3,
        reply_count: 0,
      },
    ],
  },
];

//  ── Communities for the Explore page ──────────────────────────────────────────
export const exploreCommunities: Community[] = [
  {
    id: 'ec1',
    community_name: 'Web Developers',
    community_desc: 'A collective of frontend and backend engineers building the next generation of web applications. Discuss frameworks, performance, and modern architecture.',
    admin_id: 'u0',
    tags: ['webdev', 'react', 'backend'],
    bannerGradient: 'linear-gradient(135deg, #7c4dff 0%, #b388ff 100%)',
    population: 85000,
    post_count: 12400,
    timestamp: '2021-01-01T00:00:00Z',
    badge: 'Trending',
    joinState: 'join',
    recommendationReason: 'Community was recommended based on your interests',
  },
  {
    id: 'ec2',
    community_name: 'AI & Machine Learning',
    community_desc: 'Dive into deep learning, neural networks, and generative AI. Share research papers, models, and cutting-edge implementations.',
    admin_id: null,
    tags: ['ai', 'ml', 'deeplearning'],
    bannerGradient: 'linear-gradient(135deg, #e040fb 0%, #ea80fc 100%)',
    population: 42000,
    post_count: 8200,
    timestamp: '2020-11-01T00:00:00Z',
    joinState: 'join',
  },
  {
    id: 'ec3',
    community_name: 'UI/UX Design',
    community_desc: 'Critique sessions, design system architecture, and user research methodologies. Elevate your interface craftsmanship.',
    admin_id: null,
    tags: ['design', 'ux', 'figma'],
    bannerGradient: 'linear-gradient(135deg, #ff6d00 0%, #ff9e80 100%)',
    population: 31000,
    post_count: 4100,
    timestamp: '2021-06-01T00:00:00Z',
    joinState: 'join',
  },
  {
    id: 'ec4',
    community_name: 'Open Source Hub',
    community_desc: 'Find your next project. Connect with maintainers, discuss governance, and collaborate on software that powers the world.',
    admin_id: null,
    tags: ['opensource', 'github'],
    bannerGradient: 'linear-gradient(135deg, #00bfa5 0%, #1de9b6 100%)',
    population: 112000,
    post_count: 15000,
    timestamp: '2020-09-01T00:00:00Z',
    joinState: 'joined',
  },
  {
    id: 'ec5',
    community_name: 'Hardware Hackers',
    community_desc: 'Microcontrollers, custom PCBs, and robotics. A space for makers pushing the physical boundaries of technology.',
    admin_id: null,
    tags: ['hardware', 'robotics', 'iot'],
    bannerGradient: 'linear-gradient(135deg, #76ff03 0%, #b2ff59 100%)',
    population: 18000,
    post_count: 2800,
    timestamp: '2022-01-01T00:00:00Z',
    joinState: 'join',
  },
  {
    id: 'ec6',
    community_name: 'Web3 & Decentralization',
    community_desc: 'Exploring smart contracts, dApps, and zero-knowledge proofs. Building the distributed infrastructure of tomorrow.',
    admin_id: null,
    tags: ['web3', 'blockchain', 'crypto'],
    bannerGradient: 'linear-gradient(135deg, #00e5ff 0%, #84ffff 100%)',
    population: 5200,
    post_count: 945,
    timestamp: '2023-03-01T00:00:00Z',
    badge: 'New',
    joinState: 'join',
  },
];

//  ── Related communities for the community sidebar widget ──────────────────────
export const relatedCommunities: Community[] = [
  {
    id: 'rc1',
    community_name: 'ReactDevs',
    community_desc: 'Everything React — hooks, patterns, and the ecosystem.',
    admin_id: null,
    tags: ['react', 'javascript'],
    bannerGradient: 'linear-gradient(135deg, #b388ff 0%, #7c4dff 100%)',
    population: 89000,
    post_count: 21000,
    timestamp: '2020-05-01T00:00:00Z',
  },
  {
    id: 'rc2',
    community_name: 'Backend Architecture',
    community_desc: 'Scalable systems, microservices, and API design.',
    admin_id: null,
    tags: ['backend', 'architecture', 'api'],
    bannerGradient: 'linear-gradient(135deg, #69f0ae 0%, #00bfa5 100%)',
    population: 112000,
    post_count: 18000,
    timestamp: '2020-07-01T00:00:00Z',
  },
  {
    id: 'rc3',
    community_name: 'CSS Wizards',
    community_desc: 'Animations, layouts, and the art of beautiful CSS.',
    admin_id: null,
    tags: ['css', 'design', 'frontend'],
    bannerGradient: 'linear-gradient(135deg, #ffd54f 0%, #ff6d00 100%)',
    population: 45000,
    post_count: 9700,
    timestamp: '2021-02-01T00:00:00Z',
  },
];

//  ── Community guidelines per community id ─────────────────────────────────────
export const communityGuidelines: Record<string, string[]> = {
  ec1: [
    'Be respectful and inclusive to all community members.',
    'Keep discussions relevant to web development and engineering.',
    'Format code snippets clearly and provide context for technical questions.',
    'No self-promotion, spam, or off-topic advertising.',
  ],
  ec2: [
    'Share research with appropriate citations.',
    'Discuss models and algorithms constructively.',
    'No promotion of unverified AI tools or services.',
    'Keep ethical implications of AI in mind.',
  ],
  default: [
    'Be respectful and constructive in all discussions.',
    'Stay on-topic for this community.',
    'No spam, self-promotion, or off-topic content.',
    'Follow the platform-wide terms of service.',
  ],
};
