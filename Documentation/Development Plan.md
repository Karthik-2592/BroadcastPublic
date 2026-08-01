# Development Plan



## PHASES



| Milestone | Deliverable                                                       |

| --------- | ----------------------------------------------------------------- |

| M1        | Authentication and user profiles                                  |

| M2        | Post CRUD with media support                                      |

| M3        | Follow, like, favorite, save relationships                        |

| M4        | Comments and replies                                              |

| M5        | Feed generation                                                   |

| M6        | Search                                                            |

| M7        | Recommendations (followers/posts)                                 |

| M8        | Notifications, blocking, pinned posts, testing, and documentation |



## 

### Design Choice:



##### ER Model.1 Refinement



1. Pinned Posts: Current implementation has decided that number of posts that will be pinned is fixed (a small constant such as 3) and the position of posts will in the order of first pinned (rearrangement is possible although involves unpinning and pinning but this is justifiable with current scope)
2. Hyperlink is posts: Hyperlink will be embedded in text content. If any changes are required for the Content attribute, provide suggestions.
3. Changes to multimedia attribute has been done. Although decision between associating multimedia to a post (as post to media is mostly 1 to many) and separating as entities is undecided (suppose same media is to be shared by multiple posts).
4. Comments: Comments are weak entities that are identified by the Post. Hierarchical structure has been superseded by the timeline structure (where reply section is flat, and nested replies are only identified by the time in which they are posted). For initial build, comment mentions are not implemented.
5. All metadata such as timestamp have been added to relations. Furthermore, Post is not a weak entity (unlike comments) and hence should persist whether creating user account exists or not. Thus the timestamp is associated with the post to indicate the time of creation.
6. Ignore the indication of cardinality and participation constraints in diagram (they are decided)
7. Derived attributes are planned denormalization for performance considerations.
8. Notifications are planned to be fire and forget (FK check is ignored for performance issues, and a common event\_id (FK) that points to comment\_id, post\_id with user\_id). Justification is that application program decides the type of notifications and when to generate notifications.
9. Important considerations is that this prototype is expected to run purely with MongoDB and Neo4j (SQL DB support is limited or simply non existent).  As for notifications, the "Notification type" discriminates the event associated with the notification (whether it is a 'followed' event, 'following account posted' event or 'user comment in post' or 'mention in post'). To be precise, a notification simply defaults to a "error" whenever the FK it "points" to does not exist; it is a "best effort" system and does not guarantee perfect notification. Also notification to a user when 'following' accounts post is not be employed.
10. A comment is indicated by its type as either comment under a post or a reply to a comment
11. A reply is associated with a comment by the "root" attribute: null indicates a comment and <comment\_id> indicates a reply under that particular comment
12. Mentions are associated with posts (with optional comment ID): when user is mentioned in post there is no <comment\_id> associated. But when mentioned in a comment; both post\_id and comment\_id identify the mention



Summary:

1. Added relationship metadata
2. Fire \& Forget notification
3. Timeline structure of comment and replies
4. Separation of multimedia from posts



##### ER Model.2 Augmentation:



1. User interests are to be stored alongside user information. Interests will be mentioned by the user, and not to be tracked based on user activity (for reduced complexity). This is optional: A user can have no interests.
2. Posts to be assigned tags when created by the user. This is optional: posts can have no tags associated with it.
3. Limited tag count for current scope (<40)
4. Feed generation is based on the posts with common interest as user. Follow recommendation is based on users with common interests.



Possible implementations:

1. Multivalued attributes Interests (in user collection) and Tags (in posts collection)
2. Feed generation based on maximum intersection of user interests and post tags
3. Follow recommendation based on maximum intersection of interests of 2 users.



Further more, re-assess the choice of separating multimedia as its own entity. (In a collection, multivalued attributes are easily handled)



##### ER Model.3 Addition:



###### Community feature:

1. Users can create communities to which they become the admin of.
2. An admin has the sole authority and responsibility of moderating the community and its posts (future scope plans moderation via moderators, current scope does not)
3. Other users can join communities
4. Posts made by users can be associated with communities / be independent.
5. Posts made by users when associated with a community can be private to community or public
6. Community also has "tags" associated much like posts
7. Recommendation algorithm now also considers communities to recommend to user
8. Notifications will be issued to community members when community specific posts are made (or other criteria such as community post gathering much attention in the form of likes)



Possible implementation:

1. Community entity with required attributes
2. User-Community relation indicating membership of user
3. Post-Community relation indicating association



Questions:

1. Effective implementation of "community-private" posts (precisely: posts that are not shown to general users unless they are a member of the community; usually posts dealing with community moderation).
2. Current choice of an attribute of POST pointing to a community and checking whether that post is private is logically sound, but has practical implications of redundancy as many post might not be part of community/ performance if each post is to be checked for its private status. Assess whether the tradeoff is worth for this choice
3. There isn't a necessity for making certain post community-private except for the possibility where a simple announcement for a community may find it way to a general users feed. If a solution for this is possible, then there is no need for community-private posts.



Results:

1. Addition of 'visibility' attribute to POST entity
2. Separate Membership and ownership of communities (allows admins and moderators now) with authorization attribute
3. Finalization of ER diagram (not definite)
4. Semantic changes: The concept of community specific posts is no longer valid. Posts can be associated with community, but there is no-longer a post only visible to community. Invisible posts need to be made private instead.



## SCHEMA MAPPING:

| ER Component                |       MongoDB      |                Neo4j                |

| --------------------------- | :----------------: | :---------------------------------: |

| User                        |          ✓         |        Node (identifier only)       |

| Post                        |          ✓         |        Node (identifier only)       |

| Community                   |          ✓         |        Node (identifier only)       |

| Notification                |          ✓         |                  —                  |

| Comment                     |  Embedded in Post  |                  —                  |

| Multimedia                  |  Embedded in Post  |                  —                  |

| User Interests              |   Embedded array   |                  —                  |

| Post Tags                   |   Embedded array   |                  —                  |

| Community Tags              |   Embedded array   |                  —                  |

| FOLLOWS                     |          —         |                  ✓                  |

| FAVORITED                   |          —         |                  ✓                  |

| SAVED                       |          —         |                  ✓                  |

| MENTIONED                   |          —         |                  ✓                  |

| ADMIN\_OF (membership/role)  |          —         |                  ✓                  |

| BELONGS\_TO (Post–Community) | ✓ (`community\\\\\\\_id`) | ✓ (recommended dual representation) |



Questions:

1. Although logical to include comments as part of Posts as they are weak entities, consider the performance implications, when the number of comments exceeds 100s, 1000s, or more



Results:

1. Although Comments are modeled as weak entities in the conceptual ER diagram because their existence depends on a Post, they are implemented as an independent MongoDB collection to avoid unbounded document growth, facilitate efficient pagination, reduce write contention, and comply with MongoDB's document size limitations. The identifying relationship is maintained through the combination of post\_id and the comment's partial key
2. Denormalization of User collection is maintained as redundancy in retrieved user documents can be avoided by projection.
3. Comments now store user summary to remove additional queries when displaying comments
4. Posts now contain user summary to remove additional queried when displaying posts
5. Communities now have a "Community banner"
6. Each multimedia field is a pointer to the actual multimedia object present in a storage service.
7. The visibility field in posts points to community\_id if community\_specific, null if private or a special value when public. This special value is the "PUBLIC COMMUNITY" which is the default community every post belongs to.



### PHASE 1: DATABASE CREATION

#### 

1. #### Creating MongoDB Collections:

Validation is implemented both in application side as well as DBMS side (for extra robustness)



##### Validators for entities:

1. ###### USER

{

&#x20; $jsonSchema: {

&#x20;   bsonType: 'object',

&#x20;   required: \[

&#x20;     'username',

&#x20;     'email',

&#x20;     'password'

&#x20;   ],

&#x20;   properties: {

&#x20;     username: {

&#x20;       bsonType: 'string',

&#x20;       maxLength: 24,

&#x20;       minLength: 4,

&#x20;       description: 'username must be a string'

&#x20;     },

&#x20;     password: {

&#x20;       bsonType: 'object',

&#x20;       properties: {

&#x20;         password\_hash: {

&#x20;           bsonType: 'string'

&#x20;         },

&#x20;         salt: {

&#x20;           bsonType: 'string'

&#x20;         }

&#x20;       }

&#x20;     },

&#x20;     email: {

&#x20;       bsonType: 'string',

&#x20;       description: 'email must be valid'

&#x20;     },

&#x20;     interests: {

&#x20;       bsonType: 'array',

&#x20;       items: {

&#x20;         bsonType: 'string'

&#x20;       }

&#x20;     },

&#x20;     profile\_name: {

&#x20;       bsonType: 'string',

&#x20;       maxLength: 64

&#x20;     },

&#x20;     profile\_picture: {

&#x20;       bsonType: 'object',

&#x20;       required: \[

&#x20;         'media\_id',

&#x20;         'media\_url',

&#x20;         'mime\_type'

&#x20;       ],

&#x20;       properties: {

&#x20;         media\_id: {

&#x20;           bsonType: 'int'

&#x20;         },

&#x20;         mime\_type: {

&#x20;           bsonType: 'string'

&#x20;         },

&#x20;         media\_url: {

&#x20;           bsonType: 'string'

&#x20;         }

&#x20;       }

&#x20;     },

&#x20;     profile\_description: {

&#x20;       bsonType: 'string',

&#x20;       maxLength: 200

&#x20;     },

&#x20;     follower\_count: {

&#x20;       bsonType: 'int'

&#x20;     },

&#x20;     following\_count: {

&#x20;       bsonType: 'int'

&#x20;     },

&#x20;     pinned\_posts: {

&#x20;       bsonType: 'array',

&#x20;       items: {

&#x20;         bsonType: 'objectId'

&#x20;       }

&#x20;     }

&#x20;   }

&#x20; }

}



###### 2\. POST

{

&#x20; $jsonSchema: {

&#x20;   bsonType: 'object',

&#x20;   required: \[

&#x20;     'user\_id',

&#x20;     'visibility'

&#x20;   ],

&#x20;   properties: {

&#x20;     visibility: {

&#x20;       bsonType: 'bool'

&#x20;     },

&#x20;     tags: {

&#x20;       bsonType: 'array',

&#x20;       items: {

&#x20;         bsonType: 'string'

&#x20;       }

&#x20;     },

&#x20;     user\_id: {

&#x20;       bsonType: 'objectId'

&#x20;     },

&#x20;     favorite\_count: {

&#x20;       bsonType: 'int'

&#x20;     },

&#x20;     comment\_count: {

&#x20;       bsonType: 'int'

&#x20;     },

&#x20;     time\_created: {

&#x20;       bsonType: 'date'

&#x20;     },

&#x20;     content: {

&#x20;       bsonType: 'string',

&#x20;       maxLength: 200

&#x20;     },

&#x20;     media: {

&#x20;       bsonType: 'array',

&#x20;       items: {

&#x20;         bsonType: 'object',

&#x20;         required: \[

&#x20;           'media\_id',

&#x20;           'media\_url',

&#x20;           'mime\_type'

&#x20;         ],

&#x20;         properties: {

&#x20;           media\_id: {

&#x20;             bsonType: 'int'

&#x20;           },

&#x20;           mime\_type: {

&#x20;             bsonType: 'string'

&#x20;           },

&#x20;           media\_url: {

&#x20;             bsonType: 'string'

&#x20;           }

&#x20;         }

&#x20;       }

&#x20;     },

&#x20;     user\_summary: {

&#x20;       bsonType: 'object',

&#x20;       required: \[

&#x20;         'username',

&#x20;         'profile\_picture'

&#x20;       ],

&#x20;       properties: {

&#x20;         username: {

&#x20;           bsonType: 'string'

&#x20;         },

&#x20;         profile\_picture: {

&#x20;           bsonType: 'string'

&#x20;         }

&#x20;       }

&#x20;     }

&#x20;   }

&#x20; }

}



###### 3\. NOTIFICATION

{

&#x20; $jsonSchema: {

&#x20;   bsonType: 'object',

&#x20;   required: \[

&#x20;     'user\_id',

&#x20;     'event\_type',

&#x20;     'event\_id'

&#x20;   ],

&#x20;   properties: {

&#x20;     user\_id: {

&#x20;       bsonType: 'objectId'

&#x20;     },

&#x20;     event\_type: {

&#x20;       bsonType: 'string'

&#x20;     },

&#x20;     timestamp: {

&#x20;       bsonType: 'date'

&#x20;     },

&#x20;     event\_id: {

&#x20;       bsonType: 'objectId'

&#x20;     }

&#x20;   }

&#x20; }

}



###### 4\. COMMUNITY

{

&#x20; $jsonSchema: {

&#x20;   bsonType: 'object',

&#x20;   required: \[

&#x20;     'community\_name',

&#x20;     'admin\_id'

&#x20;   ],

&#x20;   properties: {

&#x20;     population: {

&#x20;       bsonType: 'int'

&#x20;     },

&#x20;     community\_banner: {

&#x20;       bsonType: 'object',

&#x20;       required: \[

&#x20;         'media\_id',

&#x20;         'media\_url',

&#x20;         'mime\_type'

&#x20;       ],

&#x20;       properties: {

&#x20;         media\_id: {

&#x20;           bsonType: 'objectId'

&#x20;         },

&#x20;         mime\_type: {

&#x20;           bsonType: 'string'

&#x20;         },

&#x20;         media\_url: {

&#x20;           bsonType: 'string'

&#x20;         }

&#x20;       }

&#x20;     },

&#x20;     timestamp: {

&#x20;       bsonType: 'date'

&#x20;     },

&#x20;     post\_count: {

&#x20;       bsonType: 'int'

&#x20;     },

&#x20;     tags: {

&#x20;       bsonType: 'array',

&#x20;       items: {

&#x20;         bsonType: 'string'

&#x20;       }

&#x20;     },

&#x20;     community\_name: {

&#x20;       bsonType: 'string'

&#x20;     },

&#x20;     admin\_id: {

&#x20;       bsonType: 'objectId'

&#x20;     },

&#x20;     community\_desc: {

&#x20;       bsonType: 'string'

&#x20;     }

&#x20;   }

&#x20; }

}



###### 5\. COMMENT

{

&#x20; $jsonSchema: {

&#x20;   bsonType: 'object',

&#x20;   required: \[

&#x20;     'type',

&#x20;     'post\_id',

&#x20;     'user\_id'

&#x20;   ],

&#x20;   properties: {

&#x20;     post\_id: {

&#x20;       bsonType: 'objectId'

&#x20;     },

&#x20;     type: {

&#x20;       bsonType: 'bool'

&#x20;     },

&#x20;     user\_id: {

&#x20;       bsonType: 'objectId'

&#x20;     },

&#x20;     root: {

&#x20;       bsonType: 'objectId'

&#x20;     },

&#x20;     content: {

&#x20;       bsonType: 'string',

&#x20;       maxLength: 500

&#x20;     },

&#x20;     reply\_count: {

&#x20;       bsonType: 'int'

&#x20;     },

&#x20;     favorite\_count: {

&#x20;       bsonType: 'int'

&#x20;     },

&#x20;     timestamp: {

&#x20;       bsonType: 'date'

&#x20;     },

&#x20;     user\_summary: {

&#x20;       bsonType: 'object',

&#x20;       required: \[

&#x20;         'user\_id',

&#x20;         'username',

&#x20;         'profile\_picture'

&#x20;       ],

&#x20;       properties: {

&#x20;         username: {

&#x20;           bsonType: 'string'

&#x20;         },

&#x20;         profile\_picture: {

&#x20;           bsonType: 'string'

&#x20;         }

&#x20;       }

&#x20;     }

&#x20;   }

&#x20; }

}



#### 2\. Creating Neo4j: Node labels \& Relations

Validation is implemented on both application layer and DBMS layer for robustness.



1. ###### User node label:

   1. CREATE CONSTRAINT USER\_KEY for (u:USER) REQUIRE u.user\_id is node KEY
2. ###### Post node label:

   1. CREATE CONSTRAINT POST\_KEY for (p:POST) REQUIRE p.post\_id is node KEY
3. ###### Community node label:

   1. CREATE CONSTRAINT COMMUNITY\_KEY for (c:COMMUNITY) REQUIRE c.community\_id is node KEY



Experimentation with Neo4j complete



### PHASE 2: APPLICATION SERVER CREATION



##### Frontend:

1. Framework = React + Tailwindcss
2. Build tool = Vite
3. <Other tools not yet decided>



##### Backend:

1. Framework = Express.js
2. MongoDB driver
3. Neo4j driver
4. <Other tools not yet decided>



##### Database:

1. MongoDB
2. Neo4j
3. Local Disk Drive; for media (This will be replaced with a cloud object storage service)



##### Interconnection:

1. Frontend interacts with backend via RESTful API calls
2. Backend contains API handlers and can interact with databases through official drivers (as well as the local disk)
3. Databases interact with Backend through the official drivers.



*Note:*

1. *Password attribute has been added to the user entity.*
2. *The process of authentication, the actual collections stores password\_hash and associated salt for verification.*
3. *Choice of hashing? Yet to be decided.*



#### Backend API Handlers Description

1. Collection management involves communicating with MongoDB

2\. Relation management involves communicating with Neo4j



##### USER COLLECTION MANAGEMENT:

1. ###### User account creation/registration: POST method

   1. request object contains mandatory:

      1. username
      2. password
      3. email
   2. request object contains optional:

      1. interests
      2. profile\_picture (media)
      3. profile\_description
   3. **Behaviour**

      1. Password hash is stored instead of password: A random salt is associated with each account, hash is then calculated for given password and salt, this hash is stored with as password\_hash entity.
      2. Profile picture is a media object that is sent embedded within json. When received, the database is updated to contain media type and its URL, while separate object storage contains the media
      3. A unique user\_id is created for the user with by the database
      4. Default values are used when optional properties are absent.
      5. Server-side logic initializes unmentioned properties to their default values.
      6. Invalid details cause backend to send a error message (with reasons embedded when possible, otherwise generic 'bad request' error)
2. ###### User account modification: PUT/PATCH method

   1. request object contains mandatory:

      1. user\_id #
      2. password?
   2. request object contains optional:

      1. interests
      2. profile\_picture
      3. profile\_description
      4. pinned\_posts
      5. new\_password?
   3. **Behaviour**

      1. Every field other than mandatory field present in the .json object are field that need to be modified. Corresponding logic needs to be handled via subroutines
      2. Field values are checked if they violated integrity constraints. If found to be violating, error message is sent back.
      3. Invalid details cause backend to send a error message (with reasons embedded when possible, otherwise generic 'bad request' error)
      4. Special procedure for when password is being modified (Involves checking password requirements both frontend and backend; followed by password hashing before inserting into DB)
3. ###### User account deletion: DELETE method

   1. request object contains mandatory:

      1. user\_id #
      2. password
   2. **Behaviour:**

      1. User account deletion is a cascading delete operation: all posts, comments, and communities where user\_id is referenced are **set null**. All follows, saves, moderates, member\_of relation edges are deleted.
      2. Cascading delete may be initiated immediately or batched during inactivity (batched operations requires a new collection 'deleted\_documentss')
      3. Deletion requires both username match and password authentication (separate subroutine)
      4. Invalid details cause backend to send a error message (with reasons embedded when possible, otherwise generic 'bad request' error)



##### POST COLLECTION MANAGEMENT:

1. ###### Post creation: POST method

   1. request object contains mandatory:

      1. user\_id #
      2. content
      3. user\_summary
   2. request object contains optional:

      1. tags
      2. media
      3. visibility
   3. **Behaviour:**

      1. Post creation checks for field value to be in domains (both frontend and backend)
      2. A unique post\_id is created for each post by database
      3. Optional fields take default values is not present in request
2. ###### Post modification: PUT/PATCH method

   1. request object contains mandatory:

      1. user\_id #
      2. post\_id
      3. content
      4. user\_summary
   2. request object contains optional:

      1. tags
      2. visibility
   3. **Behaviour:**

      1. Only authenticated users can edit their posts.
      2. PUT method is used by default (where to use PATCH is to be determined later)
      3. Default visibility value is 'public'
3. ###### Post deletion: DELETE method

   1. requst object contains mandatory:

      1. user\_id #
      2. post\_id
   2. **Behaviour:**

      1. Deleting a post requires the uesr\_id of the post to match the user\_id in the request.
      2. Post deletion is cascading: Each comment associated with a post is deleted when a post is deleted
      3. Cascading delete may be immediate or can be batched (batched via the "deleted\_documents" collection)
      4. Unlike deleting user, deleting post must delete all associated comments (instead of setting field values to null).
      5. Deletion of post by community admin/moderator is a valid operation



##### COMMENT COLLECTION MANAGEMENT:

1. ###### Comment creation: POST method

   1. request object contains mandatory

      1. user\_id #
      2. post\_id
      3. type
      4. root
      5. content
      6. user\_summary
   2. **Behaviour**

      1. Comment creation request must include both user\_id and post\_id
      2. When associated user account is deleted, the user\_id is set to 'null'
      3. A unique <post\_id, comment\_id> composite primary key (mimicked by use of indices (or other features) in MongoDB)
      4. user\_summary can be constructed in the frontend or backend
      5. root is to be 'null' when 'type' = comment
2. ###### Comment modification: PUT/PATCH method

   1. request object contains mandatory

      1. user\_id #
      2. post\_id
      3. comment\_id
      4. content
      5. user\_summary?
   2. **Behaviour**

      1. Comment modification requires both post\_id, comment\_id
      2. user\_summary can be constructed in the frontend or backend
      3. user\_summary will be outdated when associated user's information changes.
      4. Batched updates / background periodic maintenance services correct/update the information to the most recent
3. ###### Comment deletion: DELETE method

   1. request object contains mandatory:

      1. user\_id #
      2. post\_id
      3. comment\_id
   2. **Behaviour**

      1. When root = 'null', (i.e type = 'comment') all comments with root pointing to <currently being deleted>'s comment\_id are also deleted. (i.e replies are weak entities)
      2. Cascade delete can be immediate or batched (uses the "deleted\_documents" collection)
      3. When root != 'null' (i.e type = 'reply') only that particular reply is deleted.
      4. Deletion of comments under a community-specific post



##### COMMUNITY COLLECTION MANAGEMENT:

1. ###### Community creation: POST method

   1. request object contains mandatory

      1. user\_id #
      2. community\_name
      3. community\_desc
   2. request object contains optional:

      1. tags
      2. community\_banner (media)
   3. **Behaviour:**

      1. user\_id is a must in the creation of community, and is mapped to the admin\_id of the created community
      2. Community\_name, Community\_desc are must and its attribute value undergoes domain check both frontend and backend
      3. Optional fields are set to default values
      4. Invalid fields are handled by a 'bad request' response from the backend
2. ###### Community modification: PUT/PATCH method

   1. request object contains mandatory

      1. admin\_id #
      2. community\_id
      3. community\_desc
   2. request object contains optional:

      1. community\_banner (media)
   3. **Behaviour:**

      1. PUT method is preferred, although PATCH may be used whenever is felt necessary
      2. Media also undergoes format and size check both frontend and backend.
      3. Invalid fields are handled by a 'bad request' response from the backend.
3. ###### Community deletion: DELETE method

   1. request object contains mandatory

      1. admin\_id #
      2. community\_id
   2. **Behaviour**

      1. Community deletion is cascading: all community specific posts are made private (rather then being deleted themselves) by setting their visibility to 'null'
      2. Community deletion removes all MODERATES and MEMBERSHIP relation edges from Neo4j database
      3. JWT authentication to ensure that malicious response does not delete a community





##### FOLLOW RELATION MANAGEMENT:

1. ###### Follow edge creation: POST method

   1. request object contains mandatory

      1. user\_id (follower) #
      2. user\_id (followed)
2. ###### Follow edge deletion: DELETE method

   1. request object contains mandatory

      1. user\_id (follower) #
      2. user\_id (followed)



##### LIKE (POST/COMMENT) RELATION MANAGEMENT:

1. ###### Like edge creation for posts: POST method

   1. request object contains mandatory

      1. user\_id #
      2. post\_id
2. ###### Like edge creation for comments: POST method

   1. request object contains mandatory

      1. user\_id #
      2. post\_id
      3. comment\_id
3. ###### Like edge deletion for posts: DELETE method

   1. request object contains mandatory:

      1. user\_id #
      2. post\_id
      3. comment\_id



##### SAVE RELATION MANAGEMENT:

1. ###### Save edge creation: POST method

   1. request object contains mandatory

      1. user\_id (follower) #
      2. post\_id
2. ###### Save edge deletion: DELETE method

   1. request object contains mandatory

      1. user\_id (follower) #
      2. post\_id



##### MODERATOR RELATION MANAGEMENT:

1. ###### Moderation edge creation: POST method

   1. request object contains mandatory:

      1. admin\_id #
      2. user\_id
      3. community\_id
2. ###### Moderation edge deletion: DELETE method

   1. request object contains mandatory:

      1. admin\_id #
      2. user\_id
      3. community\_id



##### MEMBERSHIP RELATION MANAGEMENT:

1. ###### Membership edge creation: POST method

   1. request object contains mandatory:

      1. user\_id #
      2. community\_id
2. ###### Membership edge deletion: DELETE method

   1. request object contains mandatory:

      1. user\_id #
      2. community\_id



*Note:*

1. *Debounced API calls and Batched actions are to used where suitable. Use JWT for authentication, instead of just using client supplied identity fields (marked # in the requirements)*
2. *Detailed behaviour for each API endpoint handler will be mentioned after scaffolding basic structure for each endpoint handler()*
3. *Several domain checks for attributes are done in frontend before requests are made. This will be implemented during frontend design.*
4. *Backend checks are also performed for security reasons (Invalid fields are handled via 'bad request' error sent back)*
5. *Default values for collections are to be decided later.*
6. *Several derived attributes are denormalized and stored in collections for faster lookups*
7. *Optional fields marked with '?' (above) require special procedures when present in request object.*



##### BUSINESS LOGIC

1. ###### Users

   1. Users cannot follow self
   2. Pinned posts for a user is a maximum of 4
   3. Only one follow-edge for a follower-followed relation (user cannot follow the same account more than once)
   4. Email must be unique
   5. Username must be unique
   6. Profile name need not be unqiue
   7. Other entities use default values whenever they try to reference a non-existent/deleted user (i.e null FKs)
2. ###### Communitites

   1. Community needs to be created by a user (which will be the admin)
   2. Community need not always have an admin. When a community has no admin, post cannot be made community-specific for this post.
   3. Moderators other than admins can delete posts within







# Preliminary Synchronization Rules



Since the system employs a hybrid MongoDB–Neo4j architecture, MongoDB serves as the \*\*primary data store\*\* for all entity information, while Neo4j stores only graph-oriented many-to-many relationships. The application server is responsible for maintaining consistency between both databases.



## General Synchronization Strategy



1. All requests are validated by the application server.
2. MongoDB is treated as the authoritative source of entity data.
3. Whenever an entity participating in the graph is created or deleted, the corresponding Neo4j node is created or deleted.
4. Whenever a many-to-many interaction occurs, the corresponding Neo4j relationship is created, updated, or removed.
5. Cached or derived attributes (e.g., follower count, member count, like count) are updated in MongoDB after the graph operation succeeds.
6. If synchronization with Neo4j fails, the MongoDB operation is rolled back where feasible. Otherwise, the operation is marked for retry or reported as an internal server error.



\---



## Synchronization Rules



### User Registration



\*\*MongoDB\*\*

\- Create User document.



\*\*Neo4j\*\*

\- Create corresponding `User` node.



\*\*Result\*\*

\- User account successfully created.



\---



\### User Deletion



\*\*MongoDB\*\*

\- Delete User document.



\*\*Neo4j\*\*

\- Delete User node.

\- Automatically remove all incident graph relationships.



\---



\### Create Community



\*\*MongoDB\*\*

\- Create Community document.



\*\*Neo4j\*\*

\- Create Community node.

\- Create `MEMBER\\\\\\\_OF` relationship between creator and community with:

&#x20; - `role = ADMIN`

&#x20; - `joined\\\\\\\_at`



\---



\### Delete Community



\*\*MongoDB\*\*

\- Delete Community document.



\*\*Neo4j\*\*

\- Delete Community node.

\- Remove all membership relationships.



\---



\### Create Post



\*\*MongoDB\*\*

\- Insert Post document.



\*\*Neo4j\*\*

\- Create corresponding Post node.

\- If associated with a community, create:

&#x20; - `(Post)-\\\\\\\[:BELONGS\\\\\\\_TO]->(Community)`



\---



\### Delete Post



\*\*MongoDB\*\*

\- Delete Post document.



\*\*Neo4j\*\*

\- Delete Post node.

\- Remove all incoming and outgoing relationships.



\---



\### Follow User



\*\*MongoDB\*\*

\- Increment cached follower/following counts.



\*\*Neo4j\*\*

\- Create

&#x20; `(:User)-\\\\\\\[:FOLLOWS]->(:User)`

&#x20; using `MERGE`.



\---



\### Unfollow User



\*\*MongoDB\*\*

\- Decrement cached follower/following counts.



\*\*Neo4j\*\*

\- Remove corresponding `FOLLOWS` relationship.



\---



\### Join Community



\*\*MongoDB\*\*

\- Increment cached member count.



\*\*Neo4j\*\*

\- Create

&#x20; `(:User)-\\\\\\\[:MEMBER\\\\\\\_OF]->(:Community)`

&#x20; with relationship properties:

&#x20; - role

&#x20; - joined\_at



\---



\### Leave Community



\*\*MongoDB\*\*

\- Decrement cached member count.



\*\*Neo4j\*\*

\- Delete corresponding `MEMBER\\\\\\\_OF` relationship.



\---



\### Favorite Post



\*\*MongoDB\*\*

\- Increment cached favorite count.



\*\*Neo4j\*\*

\- Create

&#x20; `(:User)-\\\\\\\[:LIKED]->(:Post)`

&#x20; using `MERGE`.



\---



\### Remove Favorite



\*\*MongoDB\*\*

\- Decrement cached favorite count.



\*\*Neo4j\*\*

\- Remove `LIKED` relationship.



\---



\### Save Post



\*\*MongoDB\*\*

\- No entity modification required.



\*\*Neo4j\*\*

\- Create

&#x20; `(:User)-\\\\\\\[:SAVED]->(:Post)`

&#x20; using `MERGE`.



\---



\### Remove Saved Post



\*\*MongoDB\*\*

\- No entity modification required.



\*\*Neo4j\*\*

\- Remove `SAVED` relationship.



\---



\### Mention User



\*\*MongoDB\*\*

\- Store mention metadata within Post.



\*\*Neo4j\*\*

\- Create

&#x20; `(:Post)-\\\\\\\[:MENTIONS]->(:User)`.



\---



\## Synchronization Notes



\- MongoDB remains the authoritative database.

\- Neo4j relationships should never exist without corresponding MongoDB entities.

\- Duplicate relationships are prevented using `MERGE`.

\- Relationship metadata (timestamps, roles, etc.) are stored as relationship properties.

\- Cached statistics maintained in MongoDB are considered denormalized data and are regenerated through application logic.



\---



\# Preliminary REST API Specification



The application server exposes RESTful endpoints for all system functionality.



\## Authentication



| Method | Endpoint | Description |

|---------|----------|-------------|

| POST | `/api/auth/register` | Register a new user |

| POST | `/api/auth/login` | Authenticate user |

| POST | `/api/auth/logout` | Logout current user |



\---



\## Users



| Method | Endpoint | Description |

|---------|----------|-------------|

| GET | `/api/users/:id` | Retrieve user profile |

| PUT | `/api/users/:id` | Update user profile |

| DELETE | `/api/users/:id` | Delete user account |

| GET | `/api/users/search` | Search users |

| GET | `/api/users/:id/recommendations` | Recommended users |



\---



\## Follow System



| Method | Endpoint | Description |

|---------|----------|-------------|

| POST | `/api/users/:id/follow` | Follow user |

| DELETE | `/api/users/:id/follow` | Unfollow user |

| GET | `/api/users/:id/followers` | Retrieve followers |

| GET | `/api/users/:id/following` | Retrieve following list |



\---



\## Posts



| Method | Endpoint | Description |

|---------|----------|-------------|

| POST | `/api/posts` | Create post |

| GET | `/api/posts/:id` | Retrieve post |

| PUT | `/api/posts/:id` | Edit post |

| DELETE | `/api/posts/:id` | Delete post |

| GET | `/api/feed` | Generate user feed |



\---



\## Comments



| Method | Endpoint | Description |

|---------|----------|-------------|

| POST | `/api/posts/:id/comments` | Create comment |

| PUT | `/api/comments/:id` | Edit comment |

| DELETE | `/api/comments/:id` | Delete comment |

| GET | `/api/posts/:id/comments` | Retrieve comments |



\---



\## Favorites



| Method | Endpoint | Description |

|---------|----------|-------------|

| POST | `/api/posts/:id/favorite` | Favorite post |

| DELETE | `/api/posts/:id/favorite` | Remove favorite |



\---



\## Saved Posts



| Method | Endpoint | Description |

|---------|----------|-------------|

| POST | `/api/posts/:id/save` | Save post |

| DELETE | `/api/posts/:id/save` | Remove saved post |

| GET | `/api/users/:id/saved` | Retrieve saved posts |



\---



\## Communities



| Method | Endpoint | Description |

|---------|----------|-------------|

| POST | `/api/communities` | Create community |

| GET | `/api/communities/:id` | Retrieve community |

| PUT | `/api/communities/:id` | Update community |

| DELETE | `/api/communities/:id` | Delete community |

| POST | `/api/communities/:id/join` | Join community |

| DELETE | `/api/communities/:id/join` | Leave community |

| GET | `/api/communities/recommendations` | Recommended communities |



\---



\## Notifications



| Method | Endpoint | Description |

|---------|----------|-------------|

| GET | `/api/notifications` | Retrieve notifications |

| PUT | `/api/notifications/:id/read` | Mark notification as read |

| DELETE | `/api/notifications/:id` | Delete notification |



\---



\## Recommendation Services



| Method | Endpoint | Description |

|---------|----------|-------------|

| GET | `/api/feed` | Personalized feed |

| GET | `/api/users/:id/recommendations` | Recommended users |

| GET | `/api/communities/recommendations` | Recommended communities |



\---



\## API Response Format



All endpoints return JSON responses using the following general structure:



```json

{

\\\&#x20;   "success": true,

\\\&#x20;   "message": "Operation completed successfully.",

\\\&#x20;   "data": { }

}

```



Errors are returned as:



```json

{

\\\&#x20;   "success": false,

\\\&#x20;   "message": "Description of the error."

}

```



Appropriate HTTP status codes (200, 201, 400, 401, 403, 404, 409, and 500) are used to indicate the outcome of each request.

