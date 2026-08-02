# Preliminary Synchronization Rules



Since the system employs a hybrid MongoDB–Neo4j architecture, MongoDB serves as the **primary data store** for all entity information, while Neo4j stores only graph-oriented many-to-many relationships. The application server is responsible for maintaining consistency between both databases.



## General Synchronization Strategy



1. All requests are validated by the application server.
2. MongoDB is treated as the authoritative source of entity data.
3. Whenever an entity participating in the graph is created or deleted, the corresponding Neo4j node is created or deleted.
4. Whenever a many-to-many interaction occurs, the corresponding Neo4j relationship is created, updated, or removed.
5. Cached or derived attributes (e.g., follower count, member count, like count) are updated in MongoDB after the graph operation succeeds.
6. If synchronization with Neo4j fails, the MongoDB operation is rolled back where feasible. Otherwise, the operation is marked for retry or reported as an internal server error.





## Synchronization Rules





### User Registration



**MongoDB**

* Create User document.



**Neo4j**

* Create corresponding `User` node.



**Result**

* User account successfully created.



### User Deletion

**MongoDB**

* Delete User document.



**Neo4j**

* Delete User node.
* Automatically remove all incident graph relationships.



### Create Community

**MongoDB**

* Create Community document.



**Neo4j**

* Create Community node.
* Create `MEMBER\\\_OF` relationship between creator and community with:

&#x20; - `role = ADMIN`

&#x20; - `joined\\\_at`



### Delete Community



**MongoDB**

* Delete Community document.



**Neo4j**

* Delete Community node.
* Remove all membership relationships.







### Create Post



**MongoDB**

* Insert Post document.



**Neo4j**

* Create corresponding Post node.
* If associated with a community, create:

&#x20; - `(Post)-\\\[:BELONGS\\\_TO]->(Community)`







### Delete Post

**MongoDB**

* Delete Post document.



**Neo4j**

* Delete Post node.
* Remove all incoming and outgoing relationships.









### Follow User



**MongoDB**

* Increment cached follower/following counts.



**Neo4j**

* Create

&#x20; `(:User)-\\\[:FOLLOWS]->(:User)`

&#x20; using `MERGE`.





### Unfollow User



**MongoDB**

* Decrement cached follower/following counts.



**Neo4j**

* Remove corresponding `FOLLOWS` relationship.







### Join Community

**MongoDB**

* Increment cached member count.



**Neo4j**

* Create

&#x20; `(:User)-\\\[:MEMBER\\\_OF]->(:Community)`

&#x20; with relationship properties:

&#x20; - role

&#x20; - joined\_at







### Leave Community



**MongoDB**

* Decrement cached member count.



**Neo4j**

* Delete corresponding `MEMBER\\\_OF` relationship.









### Favorite Post







**MongoDB**

* Increment cached favorite count.



**Neo4j**

* Create

&#x20; `(:User)-\\\[:LIKED]->(:Post)`

&#x20; using `MERGE`.







### Remove Favorite

**MongoDB**



* Decrement cached favorite count.



**Neo4j**

* Remove `LIKED` relationship.







### Save Post

**MongoDB**

* No entity modification required.



**Neo4j**

* Create

&#x20; `(:User)-\\\[:SAVED]->(:Post)`

&#x20; using `MERGE`.





### Remove Saved Post



**MongoDB**

* No entity modification required.



**Neo4j**

* Remove `SAVED` relationship.













### Mention User

**MongoDB**

* Store mention metadata within Post.



**Neo4j**

* Create

&#x20; `(:Post)-\\\[:MENTIONS]->(:User)`.





## Synchronization Notes



* MongoDB remains the authoritative database.
* Neo4j relationships should never exist without corresponding MongoDB entities.
* Duplicate relationships are prevented using `MERGE`.
* Relationship metadata (timestamps, roles, etc.) are stored as relationship properties.
* Cached statistics maintained in MongoDB are considered denormalized data and are regenerated through application logic.







# Preliminary REST API Specification







The application server exposes RESTful endpoints for all system functionality.







## Authentication







| Method | Endpoint | Description |



|---------|----------|-------------|



| POST | `/api/auth/register` | Register a new user |



| POST | `/api/auth/login` | Authenticate user |



| POST | `/api/auth/logout` | Logout current user |









## Users







| Method | Endpoint | Description |



|---------|----------|-------------|



| GET | `/api/users/:id` | Retrieve user profile |



| PUT | `/api/users/:id` | Update user profile |



| DELETE | `/api/users/:id` | Delete user account |



| GET | `/api/users/search` | Search users |



| GET | `/api/users/:id/recommendations` | Recommended users |









## Follow System







| Method | Endpoint | Description |



|---------|----------|-------------|



| POST | `/api/users/:id/follow` | Follow user |



| DELETE | `/api/users/:id/follow` | Unfollow user |



| GET | `/api/users/:id/followers` | Retrieve followers |



| GET | `/api/users/:id/following` | Retrieve following list |







## Posts







| Method | Endpoint | Description |



|---------|----------|-------------|



| POST | `/api/posts` | Create post |



| GET | `/api/posts/:id` | Retrieve post |



| PUT | `/api/posts/:id` | Edit post |



| DELETE | `/api/posts/:id` | Delete post |



| GET | `/api/feed` | Generate user feed |









## Comments







| Method | Endpoint | Description |



|---------|----------|-------------|



| POST | `/api/posts/:id/comments` | Create comment |



| PUT | `/api/comments/:id` | Edit comment |



| DELETE | `/api/comments/:id` | Delete comment |



| GET | `/api/posts/:id/comments` | Retrieve comments |









## Favorites







| Method | Endpoint | Description |



|---------|----------|-------------|



| POST | `/api/posts/:id/favorite` | Favorite post |



| DELETE | `/api/posts/:id/favorite` | Remove favorite |







## Saved Posts







| Method | Endpoint | Description |



|---------|----------|-------------|



| POST | `/api/posts/:id/save` | Save post |



| DELETE | `/api/posts/:id/save` | Remove saved post |



| GET | `/api/users/:id/saved` | Retrieve saved posts |





## Communities







| Method | Endpoint | Description |



|---------|----------|-------------|



| POST | `/api/communities` | Create community |



| GET | `/api/communities/:id` | Retrieve community |



| PUT | `/api/communities/:id` | Update community |



| DELETE | `/api/communities/:id` | Delete community |



| POST | `/api/communities/:id/join` | Join community |



| DELETE | `/api/communities/:id/join` | Leave community |



| GET | `/api/communities/recommendations` | Recommended communities |







## Notifications







| Method | Endpoint | Description |



|---------|----------|-------------|



| GET | `/api/notifications` | Retrieve notifications |



| PUT | `/api/notifications/:id/read` | Mark notification as read |



| DELETE | `/api/notifications/:id` | Delete notification |







## Recommendation Services





| Method | Endpoint | Description |



|---------|----------|-------------|



| GET | `/api/feed` | Personalized feed |



| GET | `/api/users/:id/recommendations` | Recommended users |



| GET | `/api/communities/recommendations` | Recommended communities |





## API Response Format

All endpoints return JSON responses using the following general structure:



```json
{

"success": true,
"message": "Operation completed successfully.",
"data": { }
}

```



Errors are returned as:

```json
{
"success": false,
"message": "Description of the error."
}

```

Appropriate HTTP status codes (200, 201, 400, 401, 403, 404, 409, and 500) are used to indicate the outcome of each request.







## MongoDB Collections Schema:

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



