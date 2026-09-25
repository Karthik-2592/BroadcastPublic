import { createHash, randomBytes } from "node:crypto";
import { Double, MongoClient, ObjectId } from "mongodb";
import { env } from "../src/config/env.ts";

const uri = env.mongoUri;
const databaseName = env.mongoDatabase;
const timeout = env.mongoServerSelectionTimeoutMs;
const notificationCount = env.sampleNotificationCount;
const commentFavoriteCount = env.sampleCommentFavoriteCount;

const randomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomSubset = <T>(arr: T[], max: number): T[] => {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.floor(Math.random() * max) + 1);
};
const randomDate = (start: Date, end: Date) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

const mediaPaths = {
    CommunityBanners: [
        'CommunityBanners/banner (1).jpg', 'CommunityBanners/banner (2).jpg',
        'CommunityBanners/banner (3).jpg', 'CommunityBanners/banner (4).jpg',
        'CommunityBanners/banner (5).jpg', 'CommunityBanners/banner (6).jpg'
    ],
    PostMedia: [
        'PostMedia/media (1).jpg', 'PostMedia/media (10).jpg', 'PostMedia/media (11).jpg',
        'PostMedia/media (12).jpg', 'PostMedia/media (13).jpg', 'PostMedia/media (14).jpg',
        'PostMedia/media (15).jpg', 'PostMedia/media (16).jpg', 'PostMedia/media (17).png',
        'PostMedia/media (2).jpg', 'PostMedia/media (3).jpg', 'PostMedia/media (4).jpg',
        'PostMedia/media (5).jpg', 'PostMedia/media (6).jpg', 'PostMedia/media (7).jpg',
        'PostMedia/media (8).jpg', 'PostMedia/media (9).jpg'
    ],
    ProfilePictures: [
        'ProfilePictures/profile  (1).jpg', 'ProfilePictures/profile  (2).png',
        'ProfilePictures/profile  (3).jpg', 'ProfilePictures/profile  (4).jpg',
        'ProfilePictures/profile  (4).png', 'ProfilePictures/profile  (5).png',
        'ProfilePictures/profile  (6).png', 'ProfilePictures/profile  (7).jpg',
        'ProfilePictures/profile  (8).png'
    ]
};

const names = [
    { first: 'Emma', last: 'Johnson', user: 'emmaj_tech' },
    { first: 'Noah', last: 'Williams', user: 'noah_w' },
    { first: 'Olivia', last: 'Brown', user: 'liv_brown99' },
    { first: 'Liam', last: 'Jones', user: 'liamjones_dev' },
    { first: 'Ava', last: 'Garcia', user: 'ava_creates' },
    { first: 'Elijah', last: 'Miller', user: 'eli_m' },
    { first: 'Sophia', last: 'Davis', user: 'sophia_d' },
    { first: 'Mateo', last: 'Rodriguez', user: 'mateo_rod' },
    { first: 'Isabella', last: 'Martinez', user: 'isa_martinez' },
    { first: 'Lucas', last: 'Hernandez', user: 'lucas_h' },
    { first: 'Mia', last: 'Lopez', user: 'mia_lopez' },
    { first: 'Levi', last: 'Gonzalez', user: 'levi_g' },
    { first: 'Amelia', last: 'Perez', user: 'amelia_p' },
    { first: 'Mason', last: 'Wilson', user: 'mason_w' },
    { first: 'Harper', last: 'Anderson', user: 'harper_a' },
    { first: 'Ethan', last: 'Thomas', user: 'ethan_t' },
    { first: 'Evelyn', last: 'Taylor', user: 'evelyn_t' },
    { first: 'James', last: 'Moore', user: 'james_m' },
    { first: 'Charlotte', last: 'Jackson', user: 'charlotte_j' },
    { first: 'Alexander', last: 'Martin', user: 'alex_m' },
    { first: 'Luna', last: 'Lee', user: 'luna_lee' },
    { first: 'Sebastian', last: 'White', user: 'seb_white' },
    { first: 'Avery', last: 'Harris', user: 'avery_h' },
    { first: 'Michael', last: 'Clark', user: 'mike_clark' },
    { first: 'Eleanor', last: 'Lewis', user: 'eleanor_l' },
];

const interests = ["Art", "Business & Finance", "Fashion & Beauty", "Travelling", "Sports", "Food", "Technology", "Books", "Health", "Games", "Films & TV", "Nature", "News & Politics", "Science", "Pop Culture", "Lifestyle"];
const tags = ["discussion", "ideas", "tips", "news", "question", "discovery", "community", "learning"];

const profileDescs = [
    "Software engineer passionate about open source and community building.",
    "Digital artist and designer. I love creating beautiful interfaces.",
    "Coffee enthusiast, avid reader, and weekend hiker.",
    "Tech lead by day, gamer by night. Always learning.",
    "Product manager focusing on user-centric design.",
    "Freelance writer and content creator. I talk about tech and lifestyle.",
    "Full-stack developer building scalable web applications.",
    "Data scientist analyzing trends and predicting the future.",
    "Amateur photographer exploring the city streets.",
    "Music producer and sound engineer. Let's collaborate!",
    "Travel blogger seeking the next adventure.",
    "Fitness coach dedicated to helping others achieve their goals.",
    "Culinary student experimenting with fusion recipes.",
    "Indie game developer working on my first major release.",
    "Minimalist lifestyle advocate and sustainability enthusiast."
];

const communityData = [
    { name: "Frontend Masters", desc: "A place for frontend developers to share tips, tricks, and resources on React, Vue, Angular, and more.", guidelines: "Be respectful. No self-promotion. Keep it related to frontend." },
    { name: "Digital Nomads", desc: "For those who work remotely and travel the world. Share your favorite spots and tips for balancing work and travel.", guidelines: "Share actionable advice. Respect local cultures in posts." },
    { name: "Healthy Living", desc: "Discuss nutrition, workouts, mental health, and overall wellness strategies.", guidelines: "No medical advice. Be supportive." },
    { name: "Indie Game Devs", desc: "Showcase your work in progress, get feedback, and discuss game design and mechanics.", guidelines: "Constructive feedback only. Tag your engines." },
    { name: "Bookworms Hub", desc: "A cozy corner for book lovers to review, recommend, and discuss their latest reads.", guidelines: "Use spoiler tags. Respect different tastes." }
];

const postTitles = [
    "Just released my first open-source project!",
    "What are your top productivity hacks?",
    "A comprehensive guide to understanding modern state management",
    "My journey traveling through Southeast Asia for 3 months",
    "Here is why you should consider waking up at 5 AM",
    "Reviewing the latest sci-fi novel that everyone is talking about",
    "Tips for maintaining mental health while working from home",
    "How I optimized my website to load 3x faster",
    "Looking for feedback on my latest character design",
    "The ultimate workout routine for busy professionals",
    "What's the best piece of advice you've ever received?",
    "Exploring the hidden gems of Kyoto",
    "A deep dive into functional programming concepts",
    "My favorite healthy recipes for meal prepping",
    "How to stay motivated during long projects?",
    "Sharing my thoughts on the latest movie release",
    "The future of AI and how it will impact our jobs",
    "Beginner's guide to investing in the stock market",
    "My experience transitioning from a different career into tech",
    "What are you currently reading?"
];

const postContents = [
    "I've been working on this for the past six months and I'm thrilled to finally share it. It solves a lot of the common problems I face daily. Would love to hear your thoughts and any feedback you might have!",
    "I've found that blocking out specific times for deep work and turning off all notifications has drastically improved my output. What strategies do you use?",
    "State management can be tricky, but breaking it down into smaller, manageable pieces makes it much easier to digest. In this post, I cover the core principles.",
    "The food, the culture, the people - everything was incredible. I highly recommend visiting if you get the chance. Here are some of my favorite highlights.",
    "It was tough at first, but adjusting my sleep schedule has given me so much more quiet time in the morning to focus on personal projects before the day gets busy.",
    "The world-building is phenomenal, but the pacing felt a bit slow in the middle. Overall, still a solid read for fans of the genre.",
    "Taking regular breaks and actually stepping away from the screen is crucial. Also, setting clear boundaries between work time and personal time.",
    "By optimizing images, leveraging browser caching, and minimizing JavaScript, the performance gains were massive.",
    "I've been experimenting with a new art style and would appreciate some constructive criticism, particularly on the color palette.",
    "This routine focuses on high-intensity interval training (HIIT) so you can get a great workout in under 30 minutes.",
    "Someone once told me 'Done is better than perfect'. It really helps me overcome perfectionism and actually ship things.",
    "Away from the crowded tourist spots, there are so many beautiful, quiet temples and gardens. Here is a list of my favorites.",
    "Understanding concepts like pure functions and immutability can completely change how you write code, even in object-oriented languages.",
    "These recipes are not only healthy but also keep well in the fridge for several days, making weekday lunches a breeze.",
    "Breaking the project into small, achievable milestones helps keep the momentum going. Celebrate the small wins!",
    "The cinematography was stunning, but the plot left a bit to be desired. What did you all think?",
    "It's fascinating to see how rapidly the technology is evolving. We need to focus on how we can adapt and use it to enhance our work.",
    "Start small, do your research, and don't panic during market dips. Consistency is key when it comes to long-term investing.",
    "It was a steep learning curve, but totally worth it. If you're considering a career switch, here is what I learned along the way.",
    "I just finished an amazing thriller and need something lighter for my next read. Any recommendations?"
];

const commentContents = [
    "This is absolutely fantastic! Thanks for sharing.",
    "I've been struggling with this lately, so this is very timely.",
    "Great insights! I completely agree.",
    "Interesting perspective, I hadn't thought about it that way before.",
    "Can you elaborate on that last point?",
    "I tried this and it worked perfectly.",
    "Not sure I agree, but I appreciate the detailed write-up.",
    "This looks amazing, I can't wait to try it.",
    "Very helpful, thanks!",
    "This is exactly what I was looking for.",
    "Could you provide some more examples?",
    "Wow, this is incredibly detailed.",
    "I love this approach.",
    "Thanks for the recommendation!",
    "This is a game-changer.",
    "So true! Consistency really is the key.",
    "I have a slightly different take, but I see your point.",
    "Beautiful photos!",
    "This really resonates with me.",
    "Great read, thanks for putting this together."
];

function passwordDocument(password: string) {
  const salt = randomBytes(16).toString("hex");
  return {
    password_hash: createHash("sha256")
      .update(`${salt}:${password}`)
      .digest("hex"),
    salt,
  };
}

async function seed() {
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: timeout });
  try {
    await client.connect();
    const database = client.db(databaseName);
    const usersCollection = database.collection("users");
    const passwordsCollection = database.collection("passwords");
    const communitiesCollection = database.collection("communities");
    const postsCollection = database.collection("posts");
    const commentsCollection = database.collection("comments");
    const notificationsCollection = database.collection("notifications");
    const commentFavoriteStoreCollection = database.collection("comment_favorite_store");

    const recoveryPasswords = new Map<string, string>();
    const users = [];
    for (let i = 0; i < 25; i++) {
        const name = names[i];
        const userMedia = randomElement(mediaPaths.ProfilePictures);
        const password = "password123";
        recoveryPasswords.set(name.user, password);
        users.push({
            _id: new ObjectId(),
            username: name.user,
            email: `${name.user}@example.com`,
            password: passwordDocument(password),
            interests: randomSubset(interests, 3),
            profile_name: `${name.first} ${name.last}`,
            profile_picture: { media_id: 1, media_url: `/${userMedia}`, mime_type: "image/jpeg" },
            profile_description: randomElement(profileDescs),
            follower_count: Math.floor(Math.random() * 500),
            following_count: Math.floor(Math.random() * 300),
            joined_at: randomDate(new Date(2023, 0, 1), new Date())
        });
    }
    await usersCollection.insertMany(users);
    await passwordsCollection.insertMany(
      users.map((user) => ({
        username: user.username,
        password: recoveryPasswords.get(user.username)!,
      })),
    );
    console.log(`[mongo:seed] users: inserted ${users.length}`);

    const communities = [];
    for (let i = 0; i < 5; i++) {
        const data = communityData[i];
        const admin = randomElement(users);
        const banner = randomElement(mediaPaths.CommunityBanners);
        communities.push({
            _id: new ObjectId(),
            community_name: data.name,
            community_desc: data.desc,
            community_guidelines: data.guidelines,
            population: Math.floor(Math.random() * 1000) + 50,
            community_banner: { media_id: 1, media_url: `/${banner}`, mime_type: "image/jpeg" },
            admin_id: admin._id,
            tags: randomSubset(tags, 3),
            post_count: 0,
            timestamp: randomDate(new Date(2023, 0, 1), new Date())
        });
    }
    await communitiesCollection.insertMany(communities);
    console.log(`[mongo:seed] communities: inserted ${communities.length}`);

    const posts = [];
    for (let i = 0; i < 40; i++) {
        const user = randomElement(users);
        const inCommunity = Math.random() > 0.3;
        const community = inCommunity ? randomElement(communities) : null;
        
        const mediaCount = Math.random() > 0.5 ? 1 : 0;
        const postMediaArr = [];
        for(let j=0; j<mediaCount; j++) {
            postMediaArr.push({ media_id: j + 1, media_url: `/${randomElement(mediaPaths.PostMedia)}`, mime_type: "image/jpeg" });
        }

        const title = randomElement(postTitles) + (Math.random() > 0.5 ? "!" : "");
        const content = randomElement(postContents);

        const p = {
            _id: new ObjectId(),
            user_id: user._id,
            community_id: community ? community._id : null,
            title: title,
            content: content,
            tags: randomSubset(tags, 2),
            favorite_count: Math.floor(Math.random() * 100),
            popularity_score: new Double(Math.random() * 10),
            comment_count: 0,
            time_created: randomDate(new Date(2024, 0, 1), new Date()),
            last_edited_at: null,
            media: postMediaArr,
            user_summary: {
                username: user.username,
                profile_picture: user.profile_picture.media_url
            }
        };
        posts.push(p);
    }
    await postsCollection.insertMany(posts);
    console.log(`[mongo:seed] posts: inserted ${posts.length}`);

    const comments = [];
    for (let i = 0; i < 40; i++) {
        const user = randomElement(users);
        const post = randomElement(posts);
        const c = {
            _id: new ObjectId(),
            user_id: user._id,
            post_id: post._id,
            content: randomElement(commentContents),
            root: null,
            user_summary: {
                username: user.username,
                profile_picture: user.profile_picture.media_url
            },
            favorite_count: Math.floor(Math.random() * 20),
            reply_count: 0,
            timestamp: randomDate(new Date(2024, 6, 1), new Date()),
            last_edited_at: null
        };
        comments.push(c);
    }

    const replies = [];
    for (let i = 0; i < 30; i++) {
        const user = randomElement(users);
        const parentComment = randomElement(comments);
        const post = posts.find(p => p._id.equals(parentComment.post_id));
        
        const r = {
            _id: new ObjectId(),
            user_id: user._id,
            post_id: post!._id,
            content: randomElement(commentContents),
            root: parentComment._id,
            user_summary: {
                username: user.username,
                profile_picture: user.profile_picture.media_url
            },
            favorite_count: Math.floor(Math.random() * 10),
            reply_count: 0,
            timestamp: randomDate(new Date(2024, 7, 1), new Date()),
            last_edited_at: null
        };
        replies.push(r);
    }

    const allComments = [...comments, ...replies];
    await commentsCollection.insertMany(allComments);

    const commentCounts = new Map<string, number>();
    const replyCounts = new Map<string, number>();
    for (const comment of comments) {
      const postId = comment.post_id.toHexString();
      commentCounts.set(postId, (commentCounts.get(postId) ?? 0) + 1);
    }
    for (const reply of replies) {
      const postId = reply.post_id.toHexString();
      const rootId = reply.root!.toHexString();
      commentCounts.set(postId, (commentCounts.get(postId) ?? 0) + 1);
      replyCounts.set(rootId, (replyCounts.get(rootId) ?? 0) + 1);
    }

    await Promise.all(
      [...commentCounts].map(([postId, count]) =>
        postsCollection.updateOne(
          { _id: new ObjectId(postId) },
          {
            $inc: { comment_count: count },
            $set: { popularity_score: new Double(count) },
          },
        ),
      ),
    );
    await Promise.all(
      [...replyCounts].map(([rootId, count]) =>
        commentsCollection.updateOne(
          { _id: new ObjectId(rootId) },
          { $inc: { reply_count: count } },
        ),
      ),
    );

    const communityPostCounts = new Map<string, number>();
    for (const post of posts) {
      if (post.community_id) {
        const communityId = post.community_id.toHexString();
        communityPostCounts.set(communityId, (communityPostCounts.get(communityId) ?? 0) + 1);
      }
    }
    await Promise.all(
      [...communityPostCounts].map(([communityId, count]) =>
        communitiesCollection.updateOne(
          { _id: new ObjectId(communityId) },
          { $inc: { post_count: count } },
        ),
      ),
    );
    console.log(`[mongo:seed] comments: inserted ${allComments.length}`);

    const notifications = Array.from({ length: notificationCount }, () => {
      const targetUser = randomElement(users);
      const eventUser = randomElement(users.filter(u => u._id.toString() !== targetUser._id.toString()));
      return {
        _id: new ObjectId(),
        target_id: targetUser._id,
        event_type: "user_follow",
        event_id: eventUser._id,
        read: false,
        timestamp: new Date(),
      };
    });
    await notificationsCollection.insertMany(notifications);
    console.log(`[mongo:seed] notifications: inserted ${notifications.length}`);

    const commentFavorites = [];
    const commentFavoritePairs = new Set<string>();
    while (commentFavorites.length < commentFavoriteCount) {
      const user = randomElement(users);
      const comment = randomElement(allComments);
      const pairKey = `${comment._id.toHexString()}-${user._id.toHexString()}`;
      if (!commentFavoritePairs.has(pairKey)) {
        commentFavoritePairs.add(pairKey);
        commentFavorites.push({
          comment_id: comment._id,
          user_id: user._id,
        });
      }
    }
    await commentFavoriteStoreCollection.insertMany(commentFavorites);
    const commentFavoriteCounts = new Map<string, number>();
    for (const favorite of commentFavorites) {
      const commentId = favorite.comment_id.toHexString();
      commentFavoriteCounts.set(commentId, (commentFavoriteCounts.get(commentId) ?? 0) + 1);
    }
    await Promise.all(
      [...commentFavoriteCounts].map(([commentId, count]) =>
        commentsCollection.updateOne(
          { _id: new ObjectId(commentId) },
          { $inc: { favorite_count: count } },
        ),
      ),
    );
    console.log(`[mongo:seed] comment_favorite_store: inserted ${commentFavorites.length}`);
  } finally {
    await client.close();
  }
}

seed().catch((error) => {
  console.error("[mongo:seed] failed", error);
  process.exitCode = 1;
});
