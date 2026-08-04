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

| BELONGS\_TO (Post–Community) | ✓ (`community\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\_id`) | ✓ (recommended dual representation) |



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

&#x20;     popularity\_score: {

&#x09;bsonType: 'NumberDouble'

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



### PHASE 2: SERVER DATABASE CONNECTION	



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



#### LOGS:

* As per the specifications and context in the \[Development Plan.md](Documentation/Development Plan.md) , create RESTful API endpoints and the corresponding route handlers. Clearly modularize the handlers into corresponding directories. Ask for clarifications whenever ambiguity arises.
* Both databases are configured with corresponding schema setup, although are not present in the same location as the project. Concerns regarding database, and authentication are to be ignored for now. Proceed with option 2: in-memory database to validate api endpoints and route handlers.
* Create a index.html page with forms for creation/deletion of each entity to verify the operations of the route handlers. The page need not be styled, and verification will be manual.

\---



* Check whether the current endpoints and routes satisfy the recommended practice for RESTful APIs:

  * All lowercase letters
  * Nouns to be used instead of verbs
  * Nesting of resources whenever there is a dependency or hierarchy
  * Filtering and Pagination (although these will be implemented when GET methods are designed, which is further down in the development timeline)
* Also, instead of having a common api/ prefix, replace it with a version indicator (which is v1/ for this current (first) version).

\---



* Testing of endpoint calls and their corresponding route handlers is a success. Next step is to connect the backend server to a dedicated MongoDB server

  * The mongoDB server currently runs within the local machine listening to address localhost:27017
  * Future plan involves migrating to a cloud DBMS (MongoDB atlas), so implementation is expected to be portable.
* Importantly, during the development period, additional logging of result of database queries is required, whether an addition was successful, or if a certain query failed, etc..

  * This logging is not permanent, rather temporary to the current backend session. Thus logging can be implemented with just console.log(). (This will be removed in production).
* For increased robustness, transactions server and database occur with 'typed JSON objects', that is clearly annotate the type each handler returns/ receives via corresponding typescript interfaces. Note that transactions from client to server (or) server to database need not be the same. Implement interfaces for within-server object passing as of now.
* Use the RESTful API.md as reference for the collections present and the fields within each collection (and its validators).
* Remove the redundant "in-memory" database implementation



\---



* Relation storage is the task of Neo4j DBMS, not MongoDB. Remove the relation collection as well as the subroutines handling relations from backend. Verification will be done only for entity storage (via collections) and this is done manually (no need to perform automated checks).
* The backend assumes that all necessary indices and collections are already present. Separate the index creation, and collection creation from the query logic and place it in a separate initialization script. (Also, ignore the location of index.ts file, it is present in a separate directory).





*Additional:*

* Posts to be displayed in order of their popularity? (favorites). There are implementations, such as sorting on the client side given a group of posts, but this does not guarantee a 'global' best is displayed to the user. One interesting feature is that; this method reflects actual region/interest based ranking of posts rather than global count.
* Popularity of posts will be used in both public/user feed or when a user visits a community. Until a custom algorithm is created, feed generation will be based on the popularity. Furthermore, introduction of "Trending" page requires this feature be a must.
* Comments too need to be sorted based on their popularity within posts. (Assume 'Oldest first' order is not required). Since update costs are expensive, suggest a solution / search for solutions where this updating a highly volatile indexed field does not incur heavy write penalty.
* Notifications are expected to be the very volatile, as in they experience insertions and deletions just as often (i.e an object does not have a long lifespan within this collection). Choice of index should consider this.
* As for Post filtering by community: all posts with community\_id field are public (GLOBAL\_COMMUNITY is a special community that everyone belongs to 'logically (it does not exist actually, but illusion is created by server logic), while any other community\_id refers to a specific community). A null field indicates a private posts, and is never accessed for feed generation until it is made public.
* Communities are also sorted by their population. This is required as a "TOP communities" feature will be implemented. The same issue of indexing volatile field is present here.



Results:

* Popularity score added as a field for posts, which is a time-decaying field that is updated periodically instead of every interaction.
* Comments and Communities will be ranked based purely on the magnitude of the their likes and population respectively.\\

\---



* Consider this approach: With the relaxation that comments and community ranking need not be globally correct, what can be said about client side sorting? Precisely, a fixed amount of comment and community objects will be returned as response to a request from client. Client then sorts the objects based on the required field, and when client demands more, new objects will be responded. This will create bursts of sorted sequences but not once contiguous sorted sequence.
* Note: This approach seems favorable for comments as comments are not as important entities as communities. However ranking communities needs to be global and purely based on magnitude of population, not some composite factor such as popularity score. Give your thoughts on this.



Results:

* Use client side sorting to rank comments under posts. Deemed acceptable under any implementation.
* Community popularity is based on total population, and the tradeoff of write performance is assumed to be negligible due to the lower volatility of the field.

\---



An important consideration: Comments are classified as 'Comments' and 'Replies'.

**Current implementation:**

* A self referencing relation between comments: N replies can point to 1 Comment.
* This is implemented via the 'root' attribute within each comment: 'null' value indicates a post comment, while 'comment\_id' indicates a reply belonging to comment with comment\_id.
* Furthermore, each comment has a 'post\_id' which is used to retrieve comments for a post.
* Since comment is a weak entity, (dependent on post\_id) replies cannot have 'null' post\_id.

*Note: Replies still count towards the 'comment\_count' of post. Cascade update is required when a reply is favorited.*

Question is: How can index take into account the difference between comment and reply



Another question: Implementation of "popularity\_score"?

* MongoDB data type?
* Expression?
* Update period
* Update mechanism
* Update subroutine location



Result:

* Composite index (post\_id, comment\_id), this also takes 'null' values into considerations.
* Popularity scores includes both 'favorites' and 'comment count' with 'age decay factor'.
* Expression is as follows: (favorites \* comment\_count)\* e^(-age); where unit of age is decided later.
* Update period is every 10-30 minutes. (Favorites for posts and comments are updated instantly, it is only the 'popularity\_score' field that requires a scheduler task)
* Update mechanism is via a scheduled task (period 15 minutes as of now)
* Update subroutine is located in backend-server and works via a server-maintained 'recently\_modified\_queue' which contains all the post\_ids that need their popularity\_score updated.



Changes to POST entity:

* The popularity\_score attributes serves as a field to rank posts instead of favorites. Reason being that indexing a high volatile field is bad for performance.
* popularity\_score for a post is calculated as follows: (post-favorites + post-comment\_count)\*e^(-age), where unit of age will be decided later (for now assume months). The rationale is that posts' popularity decays with age: this prevents a old post with large amount of favorites to dominate over small posts in ranking
* Unlike favorites, popularity\_score is indiced and is updated via a background process in the server. The process is as follows:

  * Server maintains a queue/set of posts that had their favorites\_count changed.
  * Whenever a post is favorited by a user, its id is added to this set. (same for a comment/reply made)
  * The favorite\_count of the post is incremented immediately and the corresponding relation edge is also created (same for a comment/reply made)
  * However its popularity\_score remains the same
  * When a predetermined timer expires (assume a period of 15 minutes) or when the set/queue becomes large enough (past a threshold) the background task executes.
  * This task then queries each post in the set (via its id), gets its favorites and comment-count, calculates its new popularity\_score and updates it.



Make the following changes.

Backend acts as the intermediate between both databases as well as the client. Although earlier, relations and their handlers were removed, they will be present in the final build, though they will be introduced later down the development timeline. Until a detailed behaviour on management of each relation is given, implementing relation handlers should be paused.



\---



### RELATIONS MANAGEMENT

1. All nodes representing entities of a collection, use the objectID of the corresponding entity they represent.
2. Few edges store the "timestamp" as an relation attribute
3. Only 'Moderates' relation stores an attribute other than timestamp in the edge. This attribute is the authorization level for a user within a community
4. Debounced API calls are necessary to prevent overloading server with useless writes. (This is frontend task, ignored when dealing with backend).



##### FOLLOW RELATION MANAGEMENT <Edge label: FOLLOWS>

1. ###### Follow edge creation: POST method

   1. request object contains mandatory

      1. user\_id (follower) #
      2. user\_id (followed)
   2. Behaviour:

      1. A new relation edge from follower\_user to followed\_user is created. (Node label: USER)
      2. To prevent erroneous subsequent request from creating multiple edges between 2 nodes, MERGE is used.
      3. No data is associated with this edge
      4. The 'follower\_count' derived attribute is incremented for the follower\_user document (MongoDB).
2. ###### Follow edge deletion: DELETE method

   1. request object contains mandatory

      1. user\_id (follower) #
      2. user\_id (followed)
   2. Behaviour:

      1. A existing relation edge from follower\_user to follower\_user is deleted.
      2. The derived attribute 'follower\_count' is decremted for the follower\_user document (MongoDB)



##### LIKE (POST/COMMENT) RELATION MANAGEMENT <Edge label: LIKES>

1. ###### Like edge creation for posts: POST method

   1. request object contains mandatory

      1. user\_id #
      2. post\_id
   2. Behaviour:

      1. A new relation edge from user to post is created (Node label: POST)
      2. To prevent erroneous subsequent request from creating multiple edges between 2 nodes, MERGE is used.
      3. No data is associated with this edge
      4. The 'favorite\_count' derived attribute is incremented for the post  document (MongoDB).



1. ###### Like edge creation for comments: POST method

   1. request object contains mandatory

      1. user\_id #
      2. post\_id
      3. comment\_id
   2. Behaviour:

      1. A new relation edge from user to comment is created (Node label: COMMENT)
      2. To prevent erroneous subsequent request from creating multiple edges between 2 nodes, MERGE is used.
      3. No data is associated with this edge
      4. The 'favorite\_count' derived attribute is incremented for the comment document (MongoDB).



1. ###### Like edge deletion for posts: DELETE method

   1. request object contains mandatory:

      1. user\_id #
      2. post\_id
      3. comment\_id?
   2. Behaviour:

      1. An existing relation edge from user to post/comment is deleted
      2. The 'favorite\_count' derived attribute is decremented for the comment/post document (MongoDB).



##### SAVE RELATION MANAGEMENT <Edge label: SAVES>

1. ###### Save edge creation: POST method

   1. request object contains mandatory

      1. user\_id (follower) #
      2. post\_id
   2. Behaviour:

      1. A new relation edge from user to post is created
      2. To prevent erroneous subsequent request from creating multiple edges between 2 nodes, MERGE is used.
      3. Timestamp is associated with this edge



1. ###### Save edge deletion: DELETE method

   1. request object contains mandatory

      1. user\_id (follower) #
      2. post\_id
   2. Behaviour:

      1. An existing relation edge from user to post is deleted



##### MODERATOR RELATION MANAGEMENT <Edge label: MODERATES>

1. ###### Moderation edge creation: POST method

   1. request object contains mandatory:

      1. admin\_id #
      2. user\_id
      3. community\_id
   2. Behaviour:

      1. A new relation edge from user to community <Node label: COMMUNITY> is created
      2. Authorization data is added to this edge
      3. To prevent erroneous subsequence request from creating multiple edges between 2 nodes, MERGE is used.



1. ###### Moderation edge deletion: DELETE method

   1. request object contains mandatory:

      1. admin\_id #
      2. user\_id
      3. community\_id
   2. Behaviour:

      1. An existing relation between user and community is removed.



##### MEMBERSHIP RELATION MANAGEMENT <Edge label: PARTICIPATES>

1. ###### Membership edge creation: POST method

   1. request object contains mandatory:

      1. user\_id #
      2. community\_id
   2. Behaviour:

      1. A new relation between user and community nodes is created
      2. To prevent erroneous subsequence request from creating multiple edges between 2 nodes, MERGE is used.
      3. timestamp is added to this edge.
      4. 'population' of the community document is incremented.
2. ###### Membership edge deletion: DELETE method

   1. request object contains mandatory:

      1. user\_id #
      2. community\_id
   2. Behaviour:

      1. An existing edge between user and community is deleted.
      2. 'population' of the community document is decremented.



* Since there is no concrete schema / constraint that can be imposed on the node labels and edges in Neo4j, this falls under backend's responsibility.
* Also, delete operations are now cascading: deleting entity documents will result in nodes and corresponding edges connected to the document (via objectID) be deleted as well.
* Cascading nature for each entity deletion procedure will be mentioned in detail later.
* 'Title' field added to the POST entity.
* Schema validation ensured.

\---



##### **Insert sample documents into MongoDB:**

1. For each collection, create a random set of values that can used for creating objects.

   1. For USER collection:

      1. User name can be a combination of <Random adjective + random noun + random 4 digit number>
      2. Email can be any valid email address
      3. Password can be random 8-12 letter string.
      4. Follower count = following count = 0
      5. Interests = empty
      6. Pinned posts = empty
      7. Profile picture = profile description = empty
      8. Profile name = username
   2. For COMMUNITY Collection:

      1. Community name can be combination of <Random Noun+ Random Noun>
      2. Community description = empty
      3. Population = 0
      4. Banner = null
      5. Admin id = a random user id (after creating users)
      6. tags = empty
      7. post\_count = 0
      8. timestamp = timestamp when object is created.
      9. Note: Create one a special community (called public community, with community\_id = "public\_community)
   3. For Post Collection:

      1. Random user id (after creating users)
      2. Community id = "public\_community"
      3. favoritecount = comment\_count = 0
      4. timestamp = timestamp when object is created
      5. Title = <random noun + random noun + random noun>
      6. Content = empty
      7. Media = empty
      8. user summary = {username/profilename= username of the random\_user\_id assigned, profilepicture = null}
   4. For Comment Collection:

      1. Random user\_id (after creating users)
      2. Random post\_id (after creating posts)
      3. Content = <Random Noun + Random noun + Random Noun>
      4. Root = 'null'
      5. user summary = {username/profilename= username of the random\_user\_id assigned, profilepicture = null}
      6. favorite count = reply count = 0;
      7. timestamp = creation time



1. A special Community (collection) document with that particular ID is to be created. Then every post documents points to this special document.
2. Yes,  post.community\_id should be added to POST schema as an ObjectID reference.
3. Yes, infact, every media object (or field referring to media objects) should allow null value as well
4. Popularity\_score had its data type changed from integer to Double (NumberDouble) wherever used.

\---



* For recovery purposes, store the password of each user document in a separate new collection called 'passwords'.
* The structure is very simple {username: string, string: password}.
* This collection requires no indices. This collection will never have any handlers retrieve from it (handlers only add documents to this collection).



Insertion of objects fail (for example user creation) fails document validation (in \[store.ts](B:/Projects/Broadcast/backend/src/store.ts)  at register() method). Check whether all the methods in store.ts match the validations applied in \[initialize-mongodb.ts](B:/Projects/Broadcast/backend/scripts/initialize-mongodb.ts) .  Furthermore, instead of storing all DB access methods in \[store.ts](B:/Projects/Broadcast/backend/src/store.ts) modularize this so that each collection access is stored in its own directory (or provide a reason on why this may not be ideal).



* Logging messages are inconsistent: Server responds with "Conflict" error to client, however server also logs "success" for insertion (Fortunately, the error is only with the logging, DB is consistent).
* Update POST entity's create post methods.
* Logging messages for database modifications is present. However, bad requests are not logged server-side. (Currently a failed User Delete request leaves no trace in the server logs).
* remove the current community\_id of the special community document. Instead, declare an environment variable that contains the ID of this special document. Any reference to its ID is now accessed via the environment variable.

\---



* Ensure that admin can delete posts (and comments) associated with their community. This is to be done via checking whether requesting user's id is community's admin\_id.



#### Major Schema Changes:

1. Include a new "comment\_favorite\_store"  document, this document contains all comment\_favorites by users.
2. No longer is the favorite\_count of the either post/comment incremented immediately, both operation occur as the result of a scheduled task by a background worker.
3. For posts/comments, likes create new entries in a server side set that tracks all events where each event represents that actions like <post liked by user> or <comment unliked by user>, and so on. This is done through (comment-user) , (post-user) pairs as key, and event result as value. (LIke, Dislike) etc..
4. Important behaviour of the set is that addition of a existing (key-value) pairs results in overwrite.
5. A background worker periodically processes each entry in the set and performs the following:

   1. (comment:user) pair results in a (comment, user0 entry added to 'comment\_favorite\_store' in mongoDB. Vice versa for deletion
   2. (post:user) pair results in a <post, user> edge added to Neo4j. Vice versa for deletion. (This is to considered for now, and implemented in future when asked).
6. Another background worker also periodically processes the same set and performs the following:

   1. for each distinct <comment> in the queue, collect all its pairs (representing likes/dislikes), find the resultant of all operations, and add this sum to the comment entity.
   2. for each distinct <post> in the queue, collect all its pairs (representing likes/dislikes), find the resultant of all operations, and add this sum to the comment entity.





Result:

1. comment\_favorite\_store collection added
2. Background works for creating relations and aggregation of counts are added
3. Population\_score calculating background worker is integrated under favorite\_aggregator for posts.
4. Server-maintained event set is implemented (Snapshots are given to workers, and set is cleared when all works succeed).
5. Asynchrounous background workers respond with their status every <30s> and this is logged by the server program.



##### Inserting sample relations into Neo4j.

1. Create another initializer script, similar to seed-mongodb.ts, which will insert the sample data into neo4j graph DB.
2. Note that will be executed after seed-mongodb.ts is executed, as entities need to be present before they are added to graph.
3. Each entity should have its corresponding node label, with ObjectID of the entity also as an attribute of the node.
4. All relation handlers should now modify underlying neo4j DB.
5. Consider the cached write-back (background services) implemented when implementing these relations.
6. Comments are not added as nodes within neo4j graph database.



* Restructure the \[index.html](broadcast/index.html) to now allow testing of all handlers (both entity and relations). Add moderate amount of styling for ease of use. Implement a simple login / registration mechanism for liking posts, joining communities and follow users as one of the users.
* Frontend should not have an input for "user summary JSON", instead it should be handled based on current user in the session. Modify as required. Ask for clarification



*Note: Environment variable configuration. (Know what environment variable is)'*





##### **TESTING:**



* Efficient use of CPU (aggregation worker to flush/execute immediately when backend is idle beyond a threshold)
* Ensure that both MongoDB and Neo4j servers respond with successful connection. If at any point they fail, terminate server process (i.e stop serving).





**Store:**

* 



