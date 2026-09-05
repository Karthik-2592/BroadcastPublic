import { createHash, randomBytes } from "node:crypto";
import {
  MongoClient,
  Double,
  ObjectId,
  type Collection,
  type Db,
  type Document,
  type Filter,
  type UpdateFilter,
} from "mongodb";
import type {
  Comment,
  Community,
  Id,
  Notification,
  Post,
  User,
  MediaMetadata,
  UserSummary,
} from "./types.ts";
import { env } from "./config/env.ts";
import { decodeCursor, nextCursor } from "./cursor.ts";

type UserDocument = Omit<User, "id" | "pinned_posts"> & {
  _id: ObjectId;
  pinned_posts: ObjectId[];
  password: { password_hash: string; salt: string };
  joined_at?: Date;
};
type PostDocument = Omit<
  Post,
  "id" | "user_id" | "community_id" | "time_created" | "last_edited_at" | "popularity_score"
> & {
  _id: ObjectId;
  user_id: ObjectId | null;
  community_id?: ObjectId | null;
  time_created: Date;
  last_edited_at?: Date | null;
  popularity_score: Double | number;
};
type CommentDocument = Omit<
  Comment,
  "id" | "post_id" | "user_id" | "root" | "timestamp" | "last_edited_at"
> & {
  _id: ObjectId;
  post_id: ObjectId;
  user_id: ObjectId | null;
  root: ObjectId | null;
  timestamp: Date;
  last_edited_at?: Date | null;
};
type CommunityDocument = Omit<Community, "id" | "admin_id" | "timestamp"> & {
  _id: ObjectId;
  admin_id: ObjectId | null;
  timestamp: Date;
};
type NotificationDocument = Omit<
  Notification,
  "id" | "user_id" | "event_id" | "timestamp"
> & {
  _id: ObjectId;
  user_id: ObjectId;
  event_id: ObjectId;
  timestamp: Date;
};
type CommentFavoriteDocument = {
  comment_id: ObjectId;
  user_id: ObjectId;
};

const uri = env.mongoUri;
const databaseName = env.mongoDatabase;
const oid = (value: string) =>
  ObjectId.isValid(value) ? new ObjectId(value) : null;
const FEED_LIMIT = 50;
const COMMUNITY_LIMIT = 50;
const apiId = (value: ObjectId) => value.toHexString();
const hash = (password: string, salt: string) =>
  createHash("sha256").update(`${salt}:${password}`).digest("hex");
const defaultMedia: MediaMetadata | null = null;
const userSummary = (user: User): UserSummary => ({
  id: user.id,
  username: user.username,
  profile_name: user.profile_name,
  profile_picture: user.profile_picture?.media_url ?? null,
});
const safeUser = (user: UserDocument): User => ({
  id: apiId(user._id),
  username: user.username,
  email: user.email,
  interests: user.interests,
  profile_name: user.profile_name,
  profile_picture: user.profile_picture ?? defaultMedia,
  profile_description: user.profile_description,
  pinned_posts: user.pinned_posts.map(apiId),
  follower_count: user.follower_count,
  following_count: user.following_count,
  joined_at: user.joined_at ? user.joined_at.toISOString() : undefined,
});
const safePost = (post: PostDocument): Post => {
  const { _id, ...value } = post;
  return {
    ...value,
    id: apiId(_id),
    user_id: post.user_id ? apiId(post.user_id) : null,
    community_id: post.community_id ? apiId(post.community_id) : null,
    popularity_score: Number(post.popularity_score.valueOf()),
    time_created: post.time_created.toISOString(),
    last_edited_at: post.last_edited_at?.toISOString() ?? null,
  };
};
const safeComment = (comment: CommentDocument): Comment => {
  const { _id, ...value } = comment;
  return {
    ...value,
    id: apiId(_id),
    post_id: apiId(comment.post_id),
    user_id: comment.user_id ? apiId(comment.user_id) : null,
    root: comment.root ? apiId(comment.root) : null,
    timestamp: comment.timestamp.toISOString(),
    last_edited_at: comment.last_edited_at?.toISOString() ?? null,
  };
};
const safeCommunity = (community: CommunityDocument): Community => {
  const { _id, ...value } = community;
  return {
    ...value,
    id: apiId(_id),
    admin_id: community.admin_id ? apiId(community.admin_id) : null,
    timestamp: community.timestamp.toISOString(),
  };
};
const safeNotification = (notification: NotificationDocument): Notification => {
  const { _id, ...value } = notification;
  return {
    ...value,
    id: apiId(_id),
    user_id: apiId(notification.user_id),
    event_id: apiId(notification.event_id),
    timestamp: notification.timestamp.toISOString(),
  };
};

export class MongoStore {
  private readonly client = new MongoClient(uri, {
    serverSelectionTimeoutMS: Number(
      env.mongoServerSelectionTimeoutMs,
    ),
    ignoreUndefined: true,
  });
  private database?: Db;
  private async db(): Promise<Db> {
    if (!this.database) {
      await this.client.connect();
      this.database = this.client.db(databaseName);
      console.log(`[mongo] connected to ${databaseName}`);
    }
    return this.database;
  }
  private async collection<T extends Document>(
    name: string,
  ): Promise<Collection<T>> {
    return (await this.db()).collection<T>(name);
  }
  private async log<T>(
    operation: string,
    action: () => Promise<T>,
  ): Promise<T> {
    try {
      const result = await action();
      const outcome =
        result === null || result === false || result === 0 ? "no-op" : "success";
      console.log(`[mongo] ${operation}: ${outcome}`);
      return result;
    } catch (error) {
      console.log(`[mongo] ${operation}: failed`, error);
      throw error;
    }
  }
  async register(input: {
    username: string;
    email: string;
    password: string;
    interests?: string[];
    profile_name?: string;
    profile_picture?: MediaMetadata | null;
    profile_description?: string;
  }) {
    return this.log("users.insertOne", async () => {
      const users = await this.collection<UserDocument>("users");
      if (
        await users.findOne({
          $or: [{ username: input.username }, { email: input.email }],
        })
      )
        return null;
      const salt = randomBytes(16).toString("hex");
      const user: UserDocument = {
        _id: new ObjectId(),
        username: input.username,
        email: input.email,
        password: { password_hash: hash(input.password, salt), salt },
        interests: input.interests ?? [],
        profile_name: input.profile_name ?? "",
        profile_picture: input.profile_picture ?? defaultMedia,
        profile_description: input.profile_description ?? "",
        pinned_posts: [],
        follower_count: 0,
        following_count: 0,
        joined_at: new Date(),
      };
      await users.insertOne(user);
      await this.log("passwords.insertOne", () =>
        this.collection("passwords").then((passwords) =>
          passwords.insertOne({
            username: input.username,
            password: input.password,
          }),
        ),
      );
      return safeUser(user);
    });
  }
  async authenticate(identity: string, password: string) {
    return this.log("users.authenticate", async () => {
      const user = await (
        await this.collection<UserDocument>("users")
      ).findOne({ $or: [{ username: identity }, { email: identity }] });
      return user &&
        hash(password, user.password.salt) === user.password.password_hash
        ? safeUser(user)
        : null;
    });
  }
  async user(id: string) {
    const objectId = oid(id);
    return objectId
      ? this.log("users.findOne", () =>
        this.collection<UserDocument>("users")
          .then((c) => c.findOne({ _id: objectId }))
          .then((user) => (user ? safeUser(user) : null)),
      )
      : null;
  }
  async usersByIds(ids: string[]) {
    const objectIds = ids.map(oid).filter((value): value is ObjectId => value !== null);
    if (!objectIds.length) return [];
    return this.log("users.findByIds", () =>
      this.collection<UserDocument>("users")
        .then((c) => c.find({ _id: { $in: objectIds } }).project({ password: 0 }).toArray())
        .then((users) => users.map((user) => safeUser(user as UserDocument))),
    );
  }
  async updateUser(id: string, changes: Partial<User>) {
    const objectId = oid(id);
    if (!objectId) return null;
    const update: Record<string, unknown> = Object.fromEntries(
      Object.entries(changes).filter(
        ([key, value]) =>
          value !== undefined &&
          !["id", "password", "follower_count", "following_count"].includes(
            key,
          ),
      ),
    );
    if (Array.isArray(changes.pinned_posts)) {
      const pinnedPosts = changes.pinned_posts.map((postId) => oid(postId));
      if (pinnedPosts.some((postId) => !postId)) return null;
      update.pinned_posts = pinnedPosts;
    }
    return this.log("users.updateOne", async () => {
      const users = await this.collection<UserDocument>("users");
      await users.updateOne({ _id: objectId }, { $set: update });
      const user = await users.findOne({ _id: objectId });
      return user ? safeUser(user) : null;
    });
  }
  async deleteUser(id: string) {
    const objectId = oid(id);
    if (!objectId) return false;
    return this.log("users.deleteOne", async () => {
      const result = await (
        await this.collection<UserDocument>("users")
      ).deleteOne({ _id: objectId });
      if (!result.deletedCount) return false;
      await (
        await this.collection<PostDocument>("posts")
      ).updateMany({ user_id: objectId }, {
        $set: { user_id: null },
      } as UpdateFilter<PostDocument>);
      await (
        await this.collection<CommentDocument>("comments")
      ).updateMany({ user_id: objectId }, {
        $set: { user_id: null },
      } as UpdateFilter<CommentDocument>);
      return true;
    });
  }
  async searchUsers(query: string) {
    return this.log("users.search", async () => {
      const users = await (
        await this.collection<UserDocument>("users")
      )
        .find({ username: { $regex: query, $options: "i" } })
        .project({ password: 0 })
        .toArray();
      console.log(`[mongo] users.search: ${users.length ? `found ${users.length}` : "not found"}`);
      return users.map((user) => safeUser(user as UserDocument));
    });
  }
  async search(query: string) {
    const expression = { $regex: query, $options: "i" };
    const [users, posts, communities] = await Promise.all([
      this.collection<UserDocument>("users").then((c) => c.find({ $or: [{ username: expression }, { profile_name: expression }] }).project({ password: 0 }).limit(10).toArray()),
      this.collection<PostDocument>("posts").then((c) => c.find({ title: expression }).limit(10).toArray()),
      this.collection<CommunityDocument>("communities").then((c) => c.find({ community_name: expression }).limit(10).toArray()),
    ]);
    return {
      users: users.map((user) => safeUser(user as UserDocument)),
      posts: posts.map((post) => safePost(post)),
      communities: communities.map((community) => safeCommunity(community)),
    };
  }
  async recommendations(id: string) {
    const user = await this.user(id);
    if (!user) return null;
    return this.log("users.recommendations", () =>
      this.collection<UserDocument>("users")
        .then((c) =>
          c
            .find({
              _id: { $ne: oid(id)! },
              interests: { $in: user.interests },
            })
            .project({ password: 0 })
            .toArray(),
        )
        .then((users) => users.map((item) => safeUser(item as UserDocument))),
    );
  }
  async incrementCommunityPostCount(communityId: string, delta: 1 | -1) {
    const objectId = oid(communityId);
    if (!objectId) return false;
    const result = await this.log("communities.post_count.update", () =>
      this.collection<CommunityDocument>("communities").then((c) =>
        c.updateOne({ _id: objectId }, { $inc: { post_count: delta } }),
      ),
    );
    return result.matchedCount > 0;
  }
  async createPost(
    input: Omit<
      Post,
      "id" | "time_created" | "favorite_count" | "comment_count" | "user_summary"
    >,
  ) {
    const userId = oid(input.user_id ?? "");
    if (!userId) throw new Error("Invalid post user_id");
    const user = await this.user(input.user_id!);
    if (!user) throw new Error("Post user not found");
    const communityId = input.community_id ? oid(input.community_id) : null;
    if (input.community_id && !communityId) throw new Error("Invalid post community_id");
    const post: PostDocument = {
      _id: new ObjectId(),
      user_id: userId,
      community_id: communityId,
      title: input.title,
      content: input.content,
      user_summary: userSummary(user),
      tags: input.tags,
      media: input.media ?? [],
      popularity_score: new Double(input.popularity_score),
      favorite_count: 0,
      comment_count: 0,
      time_created: new Date(),
      last_edited_at: null,
    };
    return this.log("posts.insertOne", async () => {
      await (await this.collection<PostDocument>("posts")).insertOne(post);
      if (communityId) await this.incrementCommunityPostCount(communityId.toHexString(), 1);
      return safePost(post);
    });
  }
  async post(id: string) {
    const objectId = oid(id);
    return objectId
      ? this.log("posts.findOne", () =>
        this.collection<PostDocument>("posts")
          .then((c) => c.findOne({ _id: objectId }))
          .then((post) => (post ? safePost(post) : null)),
      )
      : null;
  }
  async postsByIds(ids: string[]) {
    const objectIds = ids.map(oid).filter((value): value is ObjectId => value !== null);
    if (!objectIds.length) return [];
    return this.log("posts.findByIds", () =>
      this.collection<PostDocument>("posts")
        .then((c) => c.find({ _id: { $in: objectIds } }).toArray())
        .then((posts) => posts.map((post) => safePost(post))),
    );
  }
  async postsByUserIds(userIds: string[]) {
    const objectIds = userIds.map(oid).filter((value): value is ObjectId => value !== null);
    if (!objectIds.length) return [];
    return this.log("posts.findByUserIds", () =>
      this.collection<PostDocument>("posts")
        .then((c) => c.find({ user_id: { $in: objectIds } }).sort({ time_created: -1 }).toArray())
        .then((posts) => posts.map((post) => safePost(post))),
    );
  }
  async postsByUserId(userId: string) {
    const objectId = oid(userId);
    if (!objectId) return [];
    return this.log("posts.findByUserId", () =>
      this.collection<PostDocument>("posts")
        .then((c) => c.find({ user_id: objectId }).sort({ time_created: -1, _id: -1 }).toArray())
        .then((posts) => posts.map((post) => safePost(post))),
    );
  }
  async postsByCommunityIds(communityIds: string[]) {
    const objectIds = communityIds.map(oid).filter((value): value is ObjectId => value !== null);
    if (!objectIds.length) return [];
    return this.log("posts.findByCommunityIds", () =>
      this.collection<PostDocument>("posts")
        .then((c) => c.find({ community_id: { $in: objectIds } }).sort({ time_created: -1 }).toArray())
        .then((posts) => posts.map((post) => safePost(post))),
    );
  }
  async updatePost(id: string, changes: Partial<Post>) {
    const objectId = oid(id);
    if (!objectId) return null;
    const existing = await this.post(id);
    const update = Object.fromEntries(
      Object.entries(changes).filter(
        ([key, value]) =>
          value !== undefined &&
          ![
            "id",
            "user_id",
            "time_created",
            "last_edited_at",
            "favorite_count",
            "comment_count",
            "popularity_score",
          ].includes(key),
      ),
    );
    return this.log("posts.updateOne", async () => {
      const posts = await this.collection<PostDocument>("posts");
      const before = await posts.findOne({ _id: objectId }, { projection: { community_id: 1 } });
      const previousCommunityId = before?.community_id?.toHexString();
      await posts.updateOne(
        { _id: objectId },
        { $set: { ...update, last_edited_at: new Date() } },
      );
      const post = await posts.findOne({ _id: objectId });
      return post ? safePost(post) : null;
    });
  }
  async deletePost(id: string) {
    const objectId = oid(id);
    if (!objectId) return false;
    return this.log("posts.deleteOne", async () => {
      const post = await this.collection<PostDocument>("posts").then((c) =>
        c.findOne({ _id: objectId }, { projection: { community_id: 1 } }),
      );
      const result = await (
        await this.collection<PostDocument>("posts")
      ).deleteOne({ _id: objectId });
      if (result.deletedCount) {
        if (post?.community_id) {
          await this.incrementCommunityPostCount(post.community_id.toHexString(), -1);
        }
        await (
          await this.collection<CommentDocument>("comments")
        ).deleteMany({ post_id: objectId });
      }
      return Boolean(result.deletedCount);
    });
  }
  async feed(cursor?: string) {
    const page = decodeCursor(cursor, { sort: "time_created" });
    const limit = 10;
    const posts = await this.log("posts.find", () =>
      this.collection<PostDocument>("posts")
        .then((c) => c.find().sort({ time_created: -1, _id: -1 }).skip(page.offset).limit(limit + 1).toArray())
        .then((items) => items.map(safePost)),
    );
    const items = posts.slice(0, limit);
    return { items, nextCursor: nextCursor(page.offset, posts.length, limit, { sort: "time_created" }) };
  }
  async trending(cursor?: string) {
    const filters = { sort: "popularity_score" };
    const page = decodeCursor(cursor, filters);
    const limit = 10;
    const posts = await this.log("posts.trending.find", () =>
      this.collection<PostDocument>("posts")
        .then((c) => c.find().sort({ popularity_score: -1, _id: -1 }).skip(page.offset).limit(limit + 1).toArray())
        .then((items) => items.map(safePost)),
    );
    const items = posts.slice(0, limit);
    return { items, nextCursor: nextCursor(page.offset, posts.length, limit, filters) };
  }
  async incrementPostFavoriteCount(postId: string, delta: number) {
    const objectId = oid(postId);
    if (!objectId) return false;
    const result = await this.log("posts.favorite_count.update", () =>
      this.collection<PostDocument>("posts").then((c) =>
        c.updateOne({ _id: objectId }, { $inc: { favorite_count: delta } }),
      ),
    );
    return result.matchedCount > 0;
  }
  async incrementCommentFavoriteCount(commentId: string, delta: number) {
    const objectId = oid(commentId);
    if (!objectId) return false;
    const result = await this.log("comments.favorite_count.update", () =>
      this.collection<CommentDocument>("comments").then((c) =>
        c.updateOne({ _id: objectId }, { $inc: { favorite_count: delta } }),
      ),
    );
    return result.matchedCount > 0;
  }
  async setCommentFavorite(
    commentId: string,
    userId: string,
    favorited: boolean,
  ): Promise<1 | 0 | -1> {
    const commentObjectId = oid(commentId);
    const userObjectId = oid(userId);
    if (!commentObjectId || !userObjectId) return 0;
    return this.log("comment_favorite_store.update", async () => {
      const favorites = await this.collection<CommentFavoriteDocument>(
        "comment_favorite_store",
      );
      if (favorited) {
        const result = await favorites.updateOne(
          { comment_id: commentObjectId, user_id: userObjectId },
          { $setOnInsert: { comment_id: commentObjectId, user_id: userObjectId } },
          { upsert: true },
        );
        return result.upsertedCount ? 1 : 0;
      }
      const result = await favorites.deleteOne({
        comment_id: commentObjectId,
        user_id: userObjectId,
      });
      return result.deletedCount ? -1 : 0;
    });
  }
  async updateFollowCounts(
    followerId: string,
    followedId: string,
    delta: 1 | -1,
  ) {
    const followerObjectId = oid(followerId);
    const followedObjectId = oid(followedId);
    if (!followerObjectId || !followedObjectId) return false;
    await this.log("users.follow_counts.update", () =>
      Promise.all([
        this.collection<UserDocument>("users").then((c) =>
          c.updateOne(
            { _id: followerObjectId },
            { $inc: { following_count: delta } },
          ),
        ),
        this.collection<UserDocument>("users").then((c) =>
          c.updateOne(
            { _id: followedObjectId },
            { $inc: { follower_count: delta } },
          ),
        ),
      ]).then(() => true),
    );
    return true;
  }
  async incrementCommunityPopulation(communityId: string, delta: 1 | -1) {
    const objectId = oid(communityId);
    if (!objectId) return false;
    const result = await this.log("communities.population.update", () =>
      this.collection<CommunityDocument>("communities").then((c) =>
        c.updateOne({ _id: objectId }, { $inc: { population: delta } }),
      ),
    );
    return result.matchedCount > 0;
  }
  async recalculatePopularityScore(postId: string, now = new Date()) {
    const objectId = oid(postId);
    if (!objectId) return false;
    const post = await this.collection<PostDocument>("posts").then((c) =>
      c.findOne({ _id: objectId }),
    );
    if (!post) return false;
    const ageInWeeks = Math.max(
      0,
      (now.getTime() - post.time_created.getTime()) /
      (1000 * 60 * 60 * 24 * 7),
    );
    const popularityScore =
      ((post.favorite_count ?? 0) + (post.comment_count ?? 0)) *
      Math.exp(-ageInWeeks);
    await this.log("posts.popularity_score.update", () =>
      this.collection<PostDocument>("posts").then((c) =>
        c.updateOne(
          { _id: objectId },
          { $set: { popularity_score: new Double(popularityScore) } },
        ),
      ),
    );
    console.log(
      `[popularity] post ${postId}: score=${popularityScore.toFixed(4)} ageWeeks=${ageInWeeks.toFixed(4)}`,
    );
    return true;
  }
  async commentsForPost(postId: string, root: string | null = null, cursor?: string) {
    const filters = { post_id: postId, root: root ?? "null" };
    const page = decodeCursor(cursor, filters);
    const limit = 10;
    const comments = await this.log("comments.find", () =>
      this.collection<CommentDocument>("comments")
        .then((c) => c.find({ post_id: oid(postId)!, root: root ? oid(root) : null }).sort({ timestamp: 1, _id: 1 }).skip(page.offset).limit(limit + 1).toArray())
        .then((items) => items.map(safeComment)),
    );
    const items = comments.slice(0, limit);
    return { items, nextCursor: nextCursor(page.offset, comments.length, limit, filters) };
  }
  async isCommentFavorited(commentId: string, userId: string) {
    const commentObjectId = oid(commentId);
    const userObjectId = oid(userId);
    if (!commentObjectId || !userObjectId) return false;
    return Boolean(await (await this.collection<CommentFavoriteDocument>("comment_favorite_store")).findOne({ comment_id: commentObjectId, user_id: userObjectId }));
  }
  async feedIds(limit = 50) {
    return this.log("posts.feedIds", () =>
      this.collection<PostDocument>("posts")
        .then((c) => c.find().sort({ time_created: -1, _id: -1 }).limit(limit).project({ _id: 1 }).toArray())
        .then((posts) => posts.map((post) => post._id.toHexString())),
    );
  }
  async postsForCommunity(communityId: string, cursor?: string, sort: "new" | "top" = "new") {
    const filters = { community_id: communityId, sort };
    const page = decodeCursor(cursor, filters);
    const limit = 10;
    const posts = await this.log("posts.findByCommunity", () =>
      this.collection<PostDocument>("posts")
        .then((c) => c.find({ community_id: oid(communityId)! }).sort(sort === "top" ? { favorite_count: -1, _id: -1 } : { time_created: -1, _id: -1 }).skip(page.offset).limit(limit + 1).toArray())
        .then((items) => items.map(safePost)),
    );
    const items = posts.slice(0, limit);
    return { items, nextCursor: nextCursor(page.offset, posts.length, limit, filters) };
  }
  async repliesForComment(commentId: string, cursor?: string) {
    const filters = { root: commentId };
    const page = decodeCursor(cursor, filters);
    const limit = 5;
    const replies = await this.log("comments.replies.find", () =>
      this.collection<CommentDocument>("comments")
        .then((c) => c.find({ root: oid(commentId)! }).sort({ timestamp: 1, _id: 1 }).skip(page.offset).limit(limit + 1).toArray())
        .then((items) => items.map(safeComment)),
    );
    const items = replies.slice(0, limit);
    return { items, nextCursor: nextCursor(page.offset, replies.length, limit, filters) };
  }
  async createComment(
    input: Omit<Comment, "id" | "timestamp" | "last_edited_at" | "favorite_count" | "reply_count" | "user_summary">,
  ) {
    const user = input.user_id ? await this.user(input.user_id) : null;
    if (!user) throw new Error("Comment user not found");
    const comment: CommentDocument = {
      _id: new ObjectId(),
      post_id: oid(input.post_id)!,
      user_id: input.user_id ? oid(input.user_id) : null,
      root: input.root ? oid(input.root) : null,
      content: input.content,
      user_summary: userSummary(user),
      favorite_count: 0,
      reply_count: 0,
      timestamp: new Date(),
      last_edited_at: null,
    };
    return this.log("comments.insertOne", async () => {
      await (
        await this.collection<CommentDocument>("comments")
      ).insertOne(comment);
      await (
        await this.collection<PostDocument>("posts")
      ).updateOne({ _id: oid(input.post_id)! }, { $inc: { comment_count: 1 } });
      if(comment.root) await (
        await this.collection<CommentDocument>("comments")
      ).updateOne({_id: comment.root!}, {$inc: {reply_count: 1}})
      return safeComment(comment);
    });
  }
  async comment(id: string) {
    const objectId = oid(id);
    return objectId
      ? this.log("comments.findOne", () =>
        this.collection<CommentDocument>("comments")
          .then((c) => c.findOne({ _id: objectId }))
          .then((item) => (item ? safeComment(item) : null)),
      )
      : null;
  }
  async commentsByIds(ids: string[]) {
    const objectIds = ids.map(oid).filter((value): value is ObjectId => value !== null);
    if (!objectIds.length) return [];
    return this.log("comments.findByIds", () =>
      this.collection<CommentDocument>("comments")
        .then((c) => c.find({ _id: { $in: objectIds } }).toArray())
        .then((comments) => comments.map((comment) => safeComment(comment))),
    );
  }
  async commentsByPostIds(postIds: string[]) {
    const objectIds = postIds.map(oid).filter((value): value is ObjectId => value !== null);
    if (!objectIds.length) return [];
    return this.log("comments.findByPostIds", () =>
      this.collection<CommentDocument>("comments")
        .then((c) => c.find({ post_id: { $in: objectIds } }).sort({ timestamp: 1 }).toArray())
        .then((comments) => comments.map((comment) => safeComment(comment))),
    );
  }
  async commentsByUserId(userId: string) {
    const objectId = oid(userId);
    if (!objectId) return [];
    return this.log("comments.findByUserId", () =>
      this.collection<CommentDocument>("comments")
        .then((c) => c.find({ user_id: objectId }).sort({ timestamp: -1, _id: -1 }).toArray())
        .then((comments) => comments.map((comment) => safeComment(comment))),
    );
  }
  async updateComment(id: string, content: string) {
    const objectId = oid(id);
    if (!objectId) return null;
    return this.log("comments.updateOne", async () => {
      const comments = await this.collection<CommentDocument>("comments");
      await comments.updateOne(
        { _id: objectId },
        {
          $set: {
            content,
            last_edited_at: new Date(),
          },
        },
      );
      const item = await comments.findOne({ _id: objectId });
      return item ? safeComment(item) : null;
    });
  }
  async deleteComment(id: string) {
    const comment = await this.comment(id);
    if (!comment) return false;
    const ids = [
      id,
      ...(!comment.root
        ? (
          await (
            await this.collection<CommentDocument>("comments")
          )
            .find({ root: oid(id)! })
            .project({ _id: 1 })
            .toArray()
        ).map((item) => apiId(item._id))
        : []),
    ];
    await this.log("comments.deleteMany", () =>
      this.collection<CommentDocument>("comments").then((c) =>
        c.deleteMany({ _id: { $in: ids.map((item) => oid(item)!) } }),
      ),
    );
    await this.log("posts.comment_count.update", () =>
      this.collection<PostDocument>("posts").then((c) =>
        c.updateOne(
          { _id: oid(comment.post_id)! },
          { $inc: { comment_count: -ids.length } },
        ),
      ),
    );
    return true;
  }
  async createCommunity(
    input: Omit<Community, "id" | "timestamp" | "population" | "post_count">,
  ) {
    const adminId = input.admin_id ? oid(input.admin_id) : null;
    if (!adminId) throw new Error("Invalid community admin_id");
    if (!input.community_name) throw new Error("Invalid community_name");
    const community: CommunityDocument = {
      _id: new ObjectId(),
      community_name: input.community_name,
      community_desc: input.community_desc ?? "",
      community_guidelines: input.community_guidelines ?? "",
      tags: input.tags ?? [],
      community_banner: input.community_banner ?? defaultMedia,
      admin_id: adminId,
      population: 1,
      post_count: 0,
      timestamp: new Date(),
    };
    return this.log("communities.insertOne", async () => {
      await (
        await this.collection<CommunityDocument>("communities")
      ).insertOne(community);
      return safeCommunity(community);
    });
  }
  async community(id: string) {
    const objectId = oid(id);
    return objectId
      ? this.log("communities.findOne", () =>
        this.collection<CommunityDocument>("communities")
          .then((c) => c.findOne({ _id: objectId }))
          .then((item) => (item ? safeCommunity(item) : null)),
      )
      : null;
  }
  async communityByName(name: string) {
    return this.log("communities.findOneByName", () =>
      this.collection<CommunityDocument>("communities")
        .then((c) => c.findOne({ community_name: name }))
        .then((item) => (item ? safeCommunity(item) : null)),
    );
  }
  async updateCommunity(id: string, changes: Partial<Community>) {
    const objectId = oid(id);
    if (!objectId) return null;
    const update = Object.fromEntries(
      Object.entries(changes).filter(
        ([key, value]) =>
          value !== undefined &&
          !["id", "admin_id", "population", "post_count", "timestamp"].includes(
            key,
          ),
      ),
    );
    return this.log("communities.updateOne", async () => {
      const c = await this.collection<CommunityDocument>("communities");
      await c.updateOne({ _id: objectId }, { $set: update });
      const item = await c.findOne({ _id: objectId });
      return item ? safeCommunity(item) : null;
    });
  }
  async deleteCommunity(id: string) {
    const objectId = oid(id);
    if (!objectId) return false;
    const result = await this.log("communities.deleteOne", () =>
      this.collection<CommunityDocument>("communities").then((c) =>
        c.deleteOne({ _id: objectId }),
      ),
    );
    return Boolean(result.deletedCount);
  }
  async communityRecommendations(cursor?: string) {
    const page = decodeCursor(cursor, { sort: "population" });
    const limit = 10;
    const communities = await this.log("communities.find", () =>
      this.collection<CommunityDocument>("communities")
        .then((c) => c.find().sort({ population: -1, _id: -1 }).skip(page.offset).limit(limit + 1).toArray())
        .then((items) => items.map(safeCommunity)),
    );
    const items = communities.slice(0, limit);
    return { items, nextCursor: nextCursor(page.offset, communities.length, limit, { sort: "population" }) };
  }
  async communitiesByIds(ids: string[]) {
    const objectIds = ids.map(oid).filter((value): value is ObjectId => value !== null);
    if (!objectIds.length) return [];
    return this.log("communities.findByIds", () =>
      this.collection<CommunityDocument>("communities")
        .then((c) => c.find({ _id: { $in: objectIds } }).toArray())
        .then((items) => items.map((item) => safeCommunity(item))),
    );
  }
  async notifications(userId?: string) {
    const userObjectId = userId ? oid(userId) : null;
    const filter: Filter<NotificationDocument> = userObjectId
      ? { user_id: userObjectId }
      : {};
    return this.log("notifications.find", () =>
      this.collection<NotificationDocument>("notifications")
        .then((c) => c.find(filter).sort({ timestamp: -1 }).toArray())
        .then((items) => items.map(safeNotification)),
    );
  }
  async notification(id: string, read: boolean) {
    const objectId = oid(id);
    if (!objectId) return null;
    return this.log("notifications.updateOne", async () => {
      const c = await this.collection<NotificationDocument>("notifications");
      await c.updateOne({ _id: objectId }, { $set: { read } });
      const item = await c.findOne({ _id: objectId });
      return item ? safeNotification(item) : null;
    });
  }
  async deleteNotification(id: string) {
    const objectId = oid(id);
    return objectId
      ? this.log("notifications.deleteOne", () =>
        this.collection<NotificationDocument>("notifications")
          .then((c) => c.deleteOne({ _id: objectId }))
          .then((result) => Boolean(result.deletedCount)),
      )
      : false;
  }
  async ping() {
    return this.log("ping", () =>
      this.db()
        .then((db) => db.command({ ping: 1 }))
        .then(() => true),
    );
  }
}

export const store = new MongoStore();
