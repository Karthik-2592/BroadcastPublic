# Broadcast — Project Overview

## Executive summary

Broadcast is a social publishing and discovery platform. Users create profiles, publish text and multimedia posts, interact through follows, likes/favorites, saves, comments, and mentions, participate in communities, receive notifications, and discover content through feeds, search, and basic recommendations.

The documentation presents the project as a prototype with the data model and database strategy substantially defined. Database creation and Neo4j experimentation are described as complete. The application-server phase is specified at the architecture and API-design level, but the documentation does not confirm end-to-end implementation, testing, or deployment completion.

## Product scope

The current scope includes:

- User accounts and profiles, including interests, profile pictures, follower/following counts, and pinned posts.
- Posts containing Unicode text, hyperlinks, approved multimedia and document types, mentions, and tags.
- Comments and replies represented using a timeline-oriented structure. Comments are text-only and support hyperlinks and like/favorite counts.
- Likes/favorites and saved/bookmarked posts. Favorites are visible as interaction state; saves provide a personal bookmark list.
- Following relationships, follow suggestions, and recommendations influenced by network activity.
- Notifications for follows, mentions, and comments. Notifications are intentionally best-effort/fire-and-forget.
- Communities with membership, ownership/admin authority, moderator authorization, tags, banners, and community-associated posts.
- User and post search, including direct and indirect discovery paths.
- Basic feed and recommendation generation using popularity, randomization, follows/favorites, interests, tags, and community relevance.

Out of scope or explicitly deferred includes advanced moderation through multiple moderators, cloud object storage, fully specified auxiliary tooling, and a finalized password-hashing choice.

## Technical direction

The system uses a hybrid MongoDB–Neo4j design:

- MongoDB is the authoritative store for users, posts, communities, notifications, comments, multimedia references, interests, and tags.
- Neo4j stores graph-oriented relationships such as follows, favorites, saves, mentions, membership, administration, and moderation.
- The application server owns validation and synchronization between the two databases.
- Multimedia is represented by metadata/pointers in the database, with the actual objects stored on a local disk during the prototype; cloud object storage is planned later.
- The frontend is planned as React with Vite and Tailwind CSS.
- The backend is planned as Express.js using MongoDB and Neo4j official drivers, exposing RESTful JSON APIs.

The design uses denormalized user summaries and cached counts for read performance. Entity validation is intended at both the application and database layers. Neo4j node keys are defined for users, posts, and communities, and duplicate relationships are prevented with `MERGE`.

## Data-model decisions

The documentation records these current decisions:

- Comments were initially modeled as weak entities but are implemented as an independent MongoDB collection to support pagination, avoid unbounded post documents, reduce write contention, and respect document-size limits.
- Multimedia is separated conceptually from posts; each multimedia field points to stored media.
- Replies are identified through a `root` reference rather than deeply nested documents.
- Posts have visibility semantics for public/private/community association. Community-associated posts are not inherently community-only; private content should use post visibility.
- Communities have separate membership and ownership/authorization concepts.
- User interests and post/community tags are optional and have bounded scope.
- MongoDB remains authoritative; Neo4j relationships must not outlive their corresponding MongoDB entities.

## Delivery plan and status

The documented milestones are:

| Milestone | Planned deliverable | Documentation status |
| --- | --- | --- |
| M1 | Authentication and user profiles | Planned; detailed API behavior specified |
| M2 | Post CRUD with media support | Planned; detailed API behavior specified |
| M3 | Follow, like/favorite, and save relationships | Planned; graph synchronization rules specified |
| M4 | Comments and replies | Planned; timeline model specified |
| M5 | Feed generation | Planned |
| M6 | Search | Planned |
| M7 | Follower/post recommendations | Planned |
| M8 | Notifications, blocking, pinned posts, testing, and documentation | Planned; several design notes exist |

### Current status assessment

**Completed or substantially settled in the documentation**

- Core product scope and terminology.
- ER-model refinement, including users, posts, comments, communities, notifications, tags, interests, visibility, and relationship metadata.
- MongoDB schema-validation direction and entity validators.
- Neo4j node labels, key constraints, and relationship strategy.
- Hybrid-database synchronization rules and preliminary business rules.
- Preliminary REST API surface across authentication, users, follows, posts, comments, favorites, saves, communities, notifications, and recommendations.
- Neo4j experimentation, explicitly marked complete in the development plan.

**In progress or not verified by the documentation**

- Working frontend implementation.
- Working Express backend and database integrations.
- Authentication implementation and password-hashing selection.
- Feed, search, recommendation, and notification implementations.
- Automated tests and integration testing.
- Production media storage, deployment configuration, and operational readiness.

## Key risks and open decisions

1. The two-database synchronization path is a major consistency risk. Rollback, retry, and failure-reporting behavior is described but needs implementation and testing.
2. Notification delivery is intentionally best-effort, so consumers need to tolerate missing or stale notifications.
3. The password-hashing algorithm is still undecided in the development plan and should be resolved before authentication is treated as production-ready.
4. Local-disk media storage is suitable for a prototype but is not a durable deployment strategy.
5. Feed and recommendation logic is only defined at a basic/rules level; ranking quality, pagination, freshness, and abuse controls remain unspecified.
6. Community visibility and moderation rules have evolved during design and should be locked down in executable authorization rules.
7. The documentation does not provide a completed deployment plan, test results, release criteria, or a confirmed milestone checklist.

## Recommended next focus

1. Lock the authentication/security decisions, especially password hashing and session/token behavior.
2. Implement and test the MongoDB–Neo4j synchronization layer, including failure and retry cases.
3. Deliver the M1–M4 vertical slice: registration/login, profiles, posts/media, relationships, comments, and replies.
4. Replace local media storage with an abstraction that can later target cloud object storage.
5. Add automated API, database, authorization, and synchronization tests.
6. Turn the preliminary API and business rules into an explicit acceptance checklist and release/deployment plan.

## Source documents

- [Broadcast scope and stack](Broadcast.md)
- [Development plan and schema decisions](Development%20Plan.md)
- [Deployment plan](Deployment%20Plan.md)
- [Web application notes](WebApp.md)
- [ER model](ER/Broadcast-ER.svg)
