import { randomUUID } from "node:crypto";
import type {
  Comment,
  Community,
  Id,
  Notification,
  Post,
  Relation,
  User,
} from "./types.ts";

export class Store {
  users = new Map<Id, User>();
  posts = new Map<Id, Post>();
  comments = new Map<Id, Comment>();
  communities = new Map<Id, Community>();
  notifications = new Map<Id, Notification>();
  relations = new Map<Relation, Set<string>>();
  constructor() {
    for (const type of [
      "follow",
      "favorite",
      "save",
      "member",
      "moderator",
    ] as Relation[])
      this.relations.set(type, new Set());
  }
  id() {
    return randomUUID();
  }
  key(a: Id, b: Id) {
    return `${a}:${b}`;
  }
  has(type: Relation, a: Id, b: Id) {
    return this.relations.get(type)?.has(this.key(a, b)) ?? false;
  }
  toggle(type: Relation, a: Id, b: Id, enabled: boolean) {
    const set = this.relations.get(type)!;
    enabled ? set.add(this.key(a, b)) : set.delete(this.key(a, b));
  }
  related(type: Relation, a: Id, reverse = false) {
    return [...this.relations.get(type)!]
      .filter((k) => (reverse ? k.endsWith(`:${a}`) : k.startsWith(`${a}:`)))
      .map((k) => (reverse ? k.split(":")[0] : k.split(":")[1]));
  }
}

export const store = new Store();
