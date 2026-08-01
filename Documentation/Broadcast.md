### Broadcast



##### Scope:

1. Include User accounts, User profiles
2. Posts (Text and multimedia)
3. Comments/Replies (hierarchical)
4. Likes/Favorites and Saves
5. Friendship/Follow
6. Notifications
7. Community
8. Search
9. Feed Generation \& Recommendation (basic)



##### 

##### Details:

1. ###### Users <MUTABLE>:

   1. Basic User includes Username, Display Name, communication email, Profile Picture.
   2. Additional information such as bio, personal details and other social handles can be mentioned (optional)
   3. User account can follow other user accounts (Follow count visible)
   4. User account can be followed by other user accounts (Follower count visible)
   5. Pinned posts associated with each account for additional customization
   6. User can specify their "interests" which will be used for recommendation <MUTABLE>
2. ###### Posts <MUTABLE>:

   1. Type of content that can be present in a post is rich
   2. Text based posts are expected to be prevalent (UNICODE)
   3. Multimedia in posts are also allowed (.mp3, .mp4, .gif, etc...)
   4. Hyperlink within posts are allowed
   5. Well known and secure document types are allowed.
   6. Any other file format is not allowed for security reasons
   7. Posts can be liked/favorited by users (The count is public)
   8. Users can comment on the posts (This count is also public)
   9. Allow 'user' mentions
   10. Posts can be associated tags during creation.
   11. Posts can be associated with a community, can be public or private
3. ###### Comments and Replies <MUTABLE>:

   1. Timeline structured comment replies for performance considerations
   2. Text based post, with no support for multimedia
   3. Hyperlink within posts are allowed (embedded within above mentioned text).
   4. No attached files with comments/replies
   5. No limit on the number of comments in a post, but a maximum limit exists on the number of replies to a comment.
   6. Both Comments and replies maintain their like/favorite count
4. ###### Favorites/Saves <MUTABLE>:

   1. Posts can be favorited by users
   2. Favorited posts are not special/bookmarked posts for a user.
   3. Any post can be saved by a user.
   4. Saved posts are special/bookmarked for the user.
   5. Bookmarked posts can be accessed by the user at any point
   6. Favorited posts are not accessible under regular circumstances
   7. However, favorited posts are marked as "favorited" when encountered by the user.
5. ###### Friendship/Follow <MUTABLE>:

   1. User account supports both followers and following
   2. Suggested follow based on transitive "following" relation
   3. Indicate posts favorited by following account of user
   4. Recommendation of posts based on followed accounts' favorites
   5. Recommendation of follows based on common favorited posts
   6. Mention all other users that favorited current users posts.
6. ###### Notifications:

   1. Notification when other users follow one's account
   2. Notification when username is @mentioned
   3. Notification when other users comment on user's post
   4. Best effort system, need not guarantee notification
7. ###### Community:

   1. Communities can be created by users
   2. Communities can contain other users
   3. Posts can be associated with communities/independent.
   4. Community has one admin (current scope has one admin with moderation/authority as an admin only responsibility)
   5. Communities are also associated interest
8. ###### Search

   1. Direct user search based on posts
   2. Direct user search based on usernames
   3. Indirect search on posts (feed generations, user account visits, etc...)
   4. Indirect search on usernames (follow recommendation, user account visits, etc...)
9. ###### Feed Generation \& Recommendation:

   1. Posts to be recommended based on popularity (favorite/like count) and randomization
   2. Users to be recommended based on popularity (follower count) and randomization
   3. Posts can be recommended based on transitive relations <favorites relation>
   4. Users can be recommended based on transitive relations <follows relation>
   5. Recommendation of posts based on user interests.
   6. Recommendation of follows based on user interests.
   7. Recommendation of communities based on user interests

#### 

##### Stack:

* ###### MongoDB

  * Responsibility:

    * Store entities
    * Manage CRUD operations for entities
  * Considerations:

    * Entity count under each category/collection is expected to be less than 1k (ranges anywhere from 50-500 normally)
    * Scalability is expected but is the least of priorities.



* ###### Neo4j

  * Responsibility:

    * Store relations
    * Manage CRUD operations for relations
  * Considerations:

    * Edge count under each category/relation is expected to be less than 5k (ranges anywhere from 200-2000 normally)
    * Scalability is expected but is the least of priorities.



*Note:*

* *Likes and Favorites are synonyms in this context*
* *Friendship/Follow are synonyms in this context*
* *Saves/Bookmarks are synonyms in this context*



##### 

