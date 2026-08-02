import { createHash, randomBytes } from "node:crypto";
import {
  MongoClient,
  ObjectId,
  type Collection,
  type Db,
  type Document,
  type UpdateFilter,
} from "mongodb";
import type {
  Comment,
  Community,
  Id,
  Notification,
  Post,
  User,
} from "./types.ts";

type UserDocument = Omit<User, "id" | "password"> & {
  _id: ObjectId;
  password: { password_hash: string; salt: string };
};
type PostDocument = Omit<Post, "id" | "created_at"> & {
  _id: ObjectId;
  created_at: Date;
};
type CommentDocument = Omit<Comment, "id" | "timestamp"> & {
  _id: ObjectId;
  timestamp: Date;
};
type CommunityDocument = Omit<Community, "id" | "timestamp"> & {
  _id: ObjectId;
  timestamp: Date;
};
type NotificationDocument = Omit<Notification, "id" | "timestamp"> & {
  _id: ObjectId;
  timestamp: Date;
};

const uri = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017";
const databaseName = process.env.MONGODB_DATABASE ?? "broadcast";
const oid = (value: string) =>
  ObjectId.isValid(value) ? new ObjectId(value) : null;
const apiId = (value: ObjectId) => value.toHexString();
const hash = (password: string, salt: string) =>
  createHash("sha256").update(`${salt}:${password}`).digest("hex");
const safeUser = (user: UserDocument): User => ({
  id: apiId(user._id),
  username: user.username,
  email: user.email,
  interests: user.interests,
  profile_name: user.profile_name,
  profile_picture: user.profile_picture,
  profile_description: user.profile_description,
  pinned_posts: user.pinned_posts,
  follower_count: user.follower_count,
  following_count: user.following_count,
});
const safePost = (post: PostDocument): Post => {
  const { _id, ...value } = post;
  return {
    ...value,
    id: apiId(_id),
    created_at: post.created_at.toISOString(),
  };
};
const safeComment = (comment: CommentDocument): Comment => {
  const { _id, ...value } = comment;
  return {
    ...value,
    id: apiId(_id),
    timestamp: comment.timestamp.toISOString(),
  };
};
const safeCommunity = (community: CommunityDocument): Community => {
  const { _id, ...value } = community;
  return {
    ...value,
    id: apiId(_id),
    timestamp: community.timestamp.toISOString(),
  };
};
const safeNotification = (notification: NotificationDocument): Notification => {
  const { _id, ...value } = notification;
  return {
    ...value,
    id: apiId(_id),
    timestamp: notification.timestamp.toISOString(),
  };
};

export class MongoStore {
  private readonly client = new MongoClient(uri, {
    serverSelectionTimeoutMS: Number(
      process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS ?? 5000,
    ),
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
      console.log(`[mongo] ${operation}: success`);
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
    profile_picture?: unknown;
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
        profile_name: input.profile_name,
        profile_picture: input.profile_picture,
        profile_description: input.profile_description,
        pinned_posts: [],
        follower_count: 0,
        following_count: 0,
      };
      await users.insertOne(user);
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
  async updateUser(id: string, changes: Partial<User>) {
    const objectId = oid(id);
    if (!objectId) return null;
    const update = Object.fromEntries(
      Object.entries(changes).filter(
        ([key, value]) =>
          value !== undefined &&
          !["id", "password", "follower_count", "following_count"].includes(
            key,
          ),
      ),
    );
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
      ).updateMany({ user_id: id }, {
        $set: { user_id: null },
      } as UpdateFilter<PostDocument>);
      await (
        await this.collection<CommentDocument>("comments")
      ).updateMany({ user_id: id }, {
        $set: { user_id: null },
      } as UpdateFilter<CommentDocument>);
      return true;
    });
  }
  async searchUsers(query: string) {
    return this.log("users.search", () =>
      this.collection<UserDocument>("users")
        .then((c) =>
          c
            .find({ username: { $regex: query, $options: "i" } })
            .project({ password: 0 })
            .toArray(),
        )
        .then((users) => users.map((user) => safeUser(user as UserDocument))),
    );
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
  async createPost(
    input: Omit<Post, "id" | "created_at" | "favorite_count" | "comment_count">,
  ) {
    const post: PostDocument = {
      _id: new ObjectId(),
      ...input,
      favorite_count: 0,
      comment_count: 0,
      created_at: new Date(),
    };
    return this.log("posts.insertOne", async () => {
      await (await this.collection<PostDocument>("posts")).insertOne(post);
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
  async updatePost(id: string, changes: Partial<Post>) {
    const objectId = oid(id);
    if (!objectId) return null;
    const update = Object.fromEntries(
      Object.entries(changes).filter(
        ([key, value]) =>
          value !== undefined &&
          ![
            "id",
            "user_id",
            "created_at",
            "favorite_count",
            "comment_count",
          ].includes(key),
      ),
    );
    return this.log("posts.updateOne", async () => {
      const posts = await this.collection<PostDocument>("posts");
      await posts.updateOne({ _id: objectId }, { $set: update });
      const post = await posts.findOne({ _id: objectId });
      return post ? safePost(post) : null;
    });
  }
  async deletePost(id: string) {
    const objectId = oid(id);
    if (!objectId) return false;
    return this.log("posts.deleteOne", async () => {
      const result = await (
        await this.collection<PostDocument>("posts")
      ).deleteOne({ _id: objectId });
      if (result.deletedCount)
        await (
          await this.collection<CommentDocument>("comments")
        ).deleteMany({ post_id: id });
      return Boolean(result.deletedCount);
    });
  }
  async feed() {
    return this.log("posts.find", () =>
      this.collection<PostDocument>("posts")
        .then((c) => c.find().sort({ created_at: -1 }).toArray())
        .then((posts) => posts.map(safePost)),
    );
  }
  async incrementPostFavoriteCount(postId: string, delta: 1 | -1) {
    const objectId = oid(postId);
    if (!objectId) return false;
    const result = await this.log("posts.favorite_count.update", () =>
      this.collection<PostDocument>("posts").then((c) =>
        c.updateOne({ _id: objectId }, { $inc: { favorite_count: delta } }),
      ),
    );
    return result.matchedCount > 0;
  }
  async incrementCommentFavoriteCount(commentId: string, delta: 1 | -1) {
    const objectId = oid(commentId);
    if (!objectId) return false;
    const result = await this.log("comments.favorite_count.update", () =>
      this.collection<CommentDocument>("comments").then((c) =>
        c.updateOne({ _id: objectId }, { $inc: { favorite_count: delta } }),
      ),
    );
    return result.matchedCount > 0;
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
    const ageInMonths = Math.max(
      0,
      (now.getTime() - post.created_at.getTime()) / (1000 * 60 * 60 * 24 * 30),
    );
    const popularityScore =
      ((post.favorite_count ?? 0) + (post.comment_count ?? 0)) *
      Math.exp(-ageInMonths);
    await this.log("posts.popularity_score.update", () =>
      this.collection<PostDocument>("posts").then((c) =>
        c.updateOne(
          { _id: objectId },
          { $set: { popularity_score: popularityScore } },
        ),
      ),
    );
    console.log(
      `[popularity] post ${postId}: score=${popularityScore.toFixed(4)} ageMonths=${ageInMonths.toFixed(4)}`,
    );
    return true;
  }
  async commentsForPost(postId: string) {
    return this.log("comments.find", () =>
      this.collection<CommentDocument>("comments")
        .then((c) =>
          c.find({ post_id: postId }).sort({ timestamp: 1 }).toArray(),
        )
        .then((items) => items.map(safeComment)),
    );
  }
  async createComment(
    input: Omit<Comment, "id" | "timestamp" | "favorite_count" | "reply_count">,
  ) {
    const comment: CommentDocument = {
      _id: new ObjectId(),
      ...input,
      favorite_count: 0,
      reply_count: 0,
      timestamp: new Date(),
    };
    return this.log("comments.insertOne", async () => {
      await (
        await this.collection<CommentDocument>("comments")
      ).insertOne(comment);
      await (
        await this.collection<PostDocument>("posts")
      ).updateOne({ _id: oid(input.post_id)! }, { $inc: { comment_count: 1 } });
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
  async updateComment(id: string, content: string, userSummary?: unknown) {
    const objectId = oid(id);
    if (!objectId) return null;
    return this.log("comments.updateOne", async () => {
      const comments = await this.collection<CommentDocument>("comments");
      await comments.updateOne(
        { _id: objectId },
        {
          $set: {
            content,
            ...(userSummary === undefined ? {} : { user_summary: userSummary }),
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
              .find({ root: id })
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
    const community: CommunityDocument = {
      _id: new ObjectId(),
      ...input,
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
    if (result.deletedCount) {
      await (
        await this.collection<PostDocument>("posts")
      ).updateMany({ visibility: id }, {
        $set: { visibility: null },
      } as UpdateFilter<PostDocument>);
    }
    return Boolean(result.deletedCount);
  }
  async communityRecommendations() {
    return this.log("communities.find", () =>
      this.collection<CommunityDocument>("communities")
        .then((c) => c.find().sort({ population: -1 }).toArray())
        .then((items) => items.map(safeCommunity)),
    );
  }
  async notifications(userId?: string) {
    const filter = userId ? { user_id: userId } : {};
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
