# GraphQL Snippets

Comprehensive GraphQL snippets for schema definition, resolvers, and client usage.

---

## Schema Basic Types
- difficulty: easy
- description: Define basic object type with scalar fields

```graphql
type User {
  id: ID!
  name: String!
  email: String!
  age: Int
  isActive: Boolean!
  balance: Float
  createdAt: String!
}
```

---

## Query Type
- difficulty: easy
- description: Define root query type with field resolvers

```graphql
type Query {
  user(id: ID!): User
  users: [User!]!
  me: User
  userByEmail(email: String!): User
  searchUsers(query: String!, limit: Int = 10): [User!]!
}
```

---

## Mutation Type
- difficulty: easy
- description: Define root mutation type for data modifications

```graphql
type Mutation {
  createUser(input: CreateUserInput!): User!
  updateUser(id: ID!, input: UpdateUserInput!): User
  deleteUser(id: ID!): Boolean!
  login(email: String!, password: String!): AuthPayload!
  logout: Boolean!
}
```

---

## Subscription Type
- difficulty: medium
- description: Define subscription type for real-time updates

```graphql
type Subscription {
  userCreated: User!
  userUpdated(id: ID): User!
  messageReceived(channelId: ID!): Message!
  onlineStatusChanged: OnlineStatus!
}
```

---

## Input Type
- difficulty: easy
- description: Define input types for mutation arguments

```graphql
input CreateUserInput {
  name: String!
  email: String!
  password: String!
  age: Int
  role: Role = USER
}

input UpdateUserInput {
  name: String
  email: String
  age: Int
  isActive: Boolean
}

input PaginationInput {
  page: Int = 1
  limit: Int = 20
  sortBy: String
  sortOrder: SortOrder = DESC
}
```

---

## Enum Type
- difficulty: easy
- description: Define enum types for fixed set of values

```graphql
enum Role {
  ADMIN
  MODERATOR
  USER
  GUEST
}

enum Status {
  PENDING
  ACTIVE
  SUSPENDED
  DELETED
}

enum SortOrder {
  ASC
  DESC
}
```

---

## Interface Type
- difficulty: medium
- description: Define interface for shared fields across types

```graphql
interface Node {
  id: ID!
  createdAt: String!
  updatedAt: String!
}

interface Timestamps {
  createdAt: String!
  updatedAt: String!
}

type User implements Node & Timestamps {
  id: ID!
  name: String!
  email: String!
  createdAt: String!
  updatedAt: String!
}

type Post implements Node & Timestamps {
  id: ID!
  title: String!
  content: String!
  author: User!
  createdAt: String!
  updatedAt: String!
}
```

---

## Union Type
- difficulty: medium
- description: Define union type for multiple possible return types

```graphql
union SearchResult = User | Post | Comment | Product

type Query {
  search(query: String!): [SearchResult!]!
}

# Usage in resolver requires __typename
type User {
  id: ID!
  name: String!
}

type Post {
  id: ID!
  title: String!
}
```

---

## Custom Scalar
- difficulty: medium
- description: Define custom scalar types

```graphql
scalar DateTime
scalar JSON
scalar Upload
scalar EmailAddress
scalar URL
scalar UUID
scalar PositiveInt

type User {
  id: UUID!
  email: EmailAddress!
  metadata: JSON
  avatar: URL
  createdAt: DateTime!
}
```

---

## Directive Definition
- difficulty: hard
- description: Define custom directives for schema

```graphql
directive @auth(requires: Role = USER) on FIELD_DEFINITION | OBJECT
directive @deprecated(reason: String) on FIELD_DEFINITION | ENUM_VALUE
directive @cacheControl(maxAge: Int, scope: CacheControlScope) on FIELD_DEFINITION | OBJECT
directive @rateLimit(limit: Int!, duration: Int!) on FIELD_DEFINITION

enum CacheControlScope {
  PUBLIC
  PRIVATE
}

type Query {
  publicData: String

  @auth(requires: USER)
  myProfile: User

  @auth(requires: ADMIN)
  allUsers: [User!]!

  @rateLimit(limit: 100, duration: 60)
  searchUsers(query: String!): [User!]!
}
```

---

## Field Arguments
- difficulty: easy
- description: Define fields with arguments

```graphql
type Query {
  user(id: ID!): User

  users(
    first: Int
    after: String
    filter: UserFilter
    orderBy: UserOrderBy
  ): UserConnection!

  posts(
    authorId: ID
    status: Status = ACTIVE
    limit: Int = 10
    offset: Int = 0
  ): [Post!]!
}

input UserFilter {
  name: String
  email: String
  role: Role
  isActive: Boolean
}

input UserOrderBy {
  field: UserSortField!
  direction: SortOrder!
}

enum UserSortField {
  NAME
  EMAIL
  CREATED_AT
}
```

---

## Relay Connection (Pagination)
- difficulty: hard
- description: Cursor-based pagination following Relay spec

```graphql
type Query {
  users(first: Int, after: String, last: Int, before: String): UserConnection!
}

type UserConnection {
  edges: [UserEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type UserEdge {
  cursor: String!
  node: User!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}
```

---

## Nested Types
- difficulty: easy
- description: Types with relationships to other types

```graphql
type User {
  id: ID!
  name: String!
  email: String!
  posts: [Post!]!
  comments: [Comment!]!
  profile: Profile
  followers: [User!]!
  following: [User!]!
}

type Post {
  id: ID!
  title: String!
  content: String!
  author: User!
  comments: [Comment!]!
  tags: [Tag!]!
  likes: Int!
  isPublished: Boolean!
}

type Comment {
  id: ID!
  text: String!
  author: User!
  post: Post!
  replies: [Comment!]!
  parentComment: Comment
}
```

---

## Query Example
- difficulty: easy
- description: Client-side query with variables

```graphql
query GetUser($id: ID!) {
  user(id: $id) {
    id
    name
    email
    posts {
      id
      title
    }
  }
}

query GetUsers($first: Int!, $after: String) {
  users(first: $first, after: $after) {
    edges {
      cursor
      node {
        id
        name
        email
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
    totalCount
  }
}
```

---

## Mutation Example
- difficulty: easy
- description: Client-side mutation with input variable

```graphql
mutation CreateUser($input: CreateUserInput!) {
  createUser(input: $input) {
    id
    name
    email
    createdAt
  }
}

mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
  updateUser(id: $id, input: $input) {
    id
    name
    email
    updatedAt
  }
}

mutation DeleteUser($id: ID!) {
  deleteUser(id: $id)
}
```

---

## Fragments
- difficulty: medium
- description: Reusable field selections with fragments

```graphql
fragment UserBasic on User {
  id
  name
  email
}

fragment UserFull on User {
  ...UserBasic
  age
  isActive
  createdAt
  profile {
    bio
    avatar
  }
}

query GetUsers {
  users {
    ...UserBasic
  }
}

query GetUser($id: ID!) {
  user(id: $id) {
    ...UserFull
    posts {
      id
      title
    }
  }
}
```

---

## Inline Fragments
- difficulty: medium
- description: Type-specific field selection in unions

```graphql
query Search($query: String!) {
  search(query: $query) {
    __typename
    ... on User {
      id
      name
      email
    }
    ... on Post {
      id
      title
      author {
        name
      }
    }
    ... on Product {
      id
      name
      price
    }
  }
}
```

---

## Aliases
- difficulty: easy
- description: Rename fields in query response

```graphql
query GetUserDetails($id: ID!) {
  currentUser: user(id: $id) {
    id
    name
  }
  adminUser: user(id: "admin-1") {
    id
    name
  }
  recentPosts: posts(limit: 5, orderBy: { field: CREATED_AT, direction: DESC }) {
    id
    title
  }
  popularPosts: posts(limit: 5, orderBy: { field: LIKES, direction: DESC }) {
    id
    title
  }
}
```

---

## Resolver Basic
- difficulty: easy
- description: Basic resolver functions in JavaScript

```typescript
const resolvers = {
  Query: {
    user: (parent, { id }, context) => {
      return context.db.users.findById(id);
    },
    users: (parent, args, context) => {
      return context.db.users.findAll();
    },
    me: (parent, args, context) => {
      return context.currentUser;
    },
  },
};
```

---

## Resolver with Arguments
- difficulty: easy
- description: Resolver handling query arguments

```typescript
const resolvers = {
  Query: {
    users: async (parent, { first, after, filter, orderBy }, context) => {
      const query = context.db.users.query();

      if (filter?.name) {
        query.where('name', 'like', `%${filter.name}%`);
      }

      if (filter?.role) {
        query.where('role', filter.role);
      }

      if (orderBy) {
        query.orderBy(orderBy.field, orderBy.direction);
      }

      if (after) {
        const cursor = decodeCursor(after);
        query.where('id', '>', cursor);
      }

      return query.limit(first).fetchAll();
    },
  },
};
```

---

## Mutation Resolver
- difficulty: medium
- description: Resolver for mutation operations

```typescript
const resolvers = {
  Mutation: {
    createUser: async (parent, { input }, context) => {
      const { name, email, password } = input;

      const existingUser = await context.db.users.findByEmail(email);
      if (existingUser) {
        throw new Error('Email already exists');
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await context.db.users.create({
        name,
        email,
        password: hashedPassword,
      });

      return user;
    },

    updateUser: async (parent, { id, input }, context) => {
      const user = await context.db.users.findById(id);
      if (!user) {
        throw new Error('User not found');
      }

      return context.db.users.update(id, input);
    },

    deleteUser: async (parent, { id }, context) => {
      await context.db.users.delete(id);
      return true;
    },
  },
};
```

---

## Field Resolver
- difficulty: medium
- description: Resolver for specific fields on a type

```typescript
const resolvers = {
  User: {
    posts: (parent, args, context) => {
      return context.db.posts.findByAuthorId(parent.id);
    },

    comments: (parent, args, context) => {
      return context.db.comments.findByUserId(parent.id);
    },

    fullName: (parent) => {
      return `${parent.firstName} ${parent.lastName}`;
    },

    postCount: async (parent, args, context) => {
      return context.db.posts.countByAuthorId(parent.id);
    },
  },

  Post: {
    author: (parent, args, context) => {
      return context.db.users.findById(parent.authorId);
    },

    comments: (parent, args, context) => {
      return context.db.comments.findByPostId(parent.id);
    },
  },
};
```

---

## Subscription Resolver
- difficulty: hard
- description: Resolver for real-time subscriptions

```typescript
import { PubSub, withFilter } from 'graphql-subscriptions';

const pubsub = new PubSub();

const resolvers = {
  Mutation: {
    createMessage: async (parent, { input }, context) => {
      const message = await context.db.messages.create(input);

      pubsub.publish('MESSAGE_CREATED', {
        messageReceived: message,
      });

      return message;
    },
  },

  Subscription: {
    messageReceived: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(['MESSAGE_CREATED']),
        (payload, variables) => {
          return payload.messageReceived.channelId === variables.channelId;
        }
      ),
    },

    userUpdated: {
      subscribe: () => pubsub.asyncIterator(['USER_UPDATED']),
    },
  },
};
```

---

## Apollo Server Setup
- difficulty: medium
- description: Basic Apollo Server configuration

```typescript
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
  context: async ({ req }) => {
    const token = req.headers.authorization || '';
    const user = await getUserFromToken(token);
    return {
      user,
      db: database,
    };
  },
});

console.log(`Server ready at ${url}`);
```

---

## Apollo Server Express
- difficulty: medium
- description: Apollo Server with Express middleware

```typescript
import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import { typeDefs, resolvers } from './schema';

const app = express();

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

await server.start();

app.use(
  '/graphql',
  cors(),
  express.json(),
  expressMiddleware(server, {
    context: async ({ req }) => ({
      user: await getUserFromToken(req.headers.authorization),
      db: database,
    }),
  })
);

app.listen(4000, () => {
  console.log('Server running on http://localhost:4000/graphql');
});
```

---

## Apollo Client Setup
- difficulty: medium
- description: Apollo Client configuration for React

```typescript
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql',
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});

export default client;
```

---

## useQuery Hook
- difficulty: easy
- description: Fetch data with useQuery in React

```typescript
import { useQuery, gql } from '@apollo/client';

const GET_USERS = gql`
  query GetUsers($first: Int!, $after: String) {
    users(first: $first, after: $after) {
      edges {
        node {
          id
          name
          email
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

function UserList() {
  const { loading, error, data, fetchMore } = useQuery(GET_USERS, {
    variables: { first: 10 },
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <ul>
      {data.users.edges.map(({ node }) => (
        <li key={node.id}>{node.name}</li>
      ))}
    </ul>
  );
}
```

---

## useMutation Hook
- difficulty: easy
- description: Execute mutations with useMutation in React

```typescript
import { useMutation, gql } from '@apollo/client';

const CREATE_USER = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      name
      email
    }
  }
`;

function CreateUserForm() {
  const [createUser, { loading, error }] = useMutation(CREATE_USER, {
    refetchQueries: ['GetUsers'],
    onCompleted: (data) => {
      console.log('User created:', data.createUser);
    },
    onError: (error) => {
      console.error('Error:', error.message);
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    createUser({
      variables: {
        input: { name, email, password },
      },
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create User'}
      </button>
      {error && <p>Error: {error.message}</p>}
    </form>
  );
}
```

---

## useSubscription Hook
- difficulty: medium
- description: Subscribe to real-time updates in React

```typescript
import { useSubscription, gql } from '@apollo/client';

const MESSAGE_SUBSCRIPTION = gql`
  subscription OnMessageReceived($channelId: ID!) {
    messageReceived(channelId: $channelId) {
      id
      text
      author {
        id
        name
      }
      createdAt
    }
  }
`;

function MessageList({ channelId }) {
  const { data, loading, error } = useSubscription(MESSAGE_SUBSCRIPTION, {
    variables: { channelId },
    onData: ({ data }) => {
      console.log('New message:', data.data.messageReceived);
    },
  });

  if (loading) return <p>Connecting...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      {data && <NewMessage message={data.messageReceived} />}
    </div>
  );
}
```

---

## useLazyQuery Hook
- difficulty: easy
- description: Execute query on demand

```typescript
import { useLazyQuery, gql } from '@apollo/client';

const SEARCH_USERS = gql`
  query SearchUsers($query: String!) {
    searchUsers(query: $query) {
      id
      name
      email
    }
  }
`;

function UserSearch() {
  const [searchUsers, { loading, data }] = useLazyQuery(SEARCH_USERS);
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    searchUsers({ variables: { query } });
  };

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search users..."
      />
      <button onClick={handleSearch} disabled={loading}>
        Search
      </button>

      {data?.searchUsers.map((user) => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}
```

---

## Cache Update After Mutation
- difficulty: hard
- description: Update Apollo cache after mutation

```typescript
const CREATE_POST = gql`
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      id
      title
      content
      author {
        id
        name
      }
    }
  }
`;

const GET_POSTS = gql`
  query GetPosts {
    posts {
      id
      title
      content
    }
  }
`;

function CreatePost() {
  const [createPost] = useMutation(CREATE_POST, {
    update(cache, { data: { createPost } }) {
      const existingPosts = cache.readQuery({ query: GET_POSTS });

      cache.writeQuery({
        query: GET_POSTS,
        data: {
          posts: [createPost, ...existingPosts.posts],
        },
      });
    },
  });
}
```

---

## Optimistic Response
- difficulty: hard
- description: Show immediate UI update before server response

```typescript
const UPDATE_TODO = gql`
  mutation UpdateTodo($id: ID!, $completed: Boolean!) {
    updateTodo(id: $id, completed: $completed) {
      id
      text
      completed
    }
  }
`;

function TodoItem({ todo }) {
  const [updateTodo] = useMutation(UPDATE_TODO);

  const handleToggle = () => {
    updateTodo({
      variables: {
        id: todo.id,
        completed: !todo.completed,
      },
      optimisticResponse: {
        updateTodo: {
          __typename: 'Todo',
          id: todo.id,
          text: todo.text,
          completed: !todo.completed,
        },
      },
    });
  };

  return (
    <div onClick={handleToggle}>
      {todo.completed ? '✓' : '○'} {todo.text}
    </div>
  );
}
```

---

## Error Handling
- difficulty: medium
- description: GraphQL error handling in resolvers

```typescript
import { GraphQLError } from 'graphql';

const resolvers = {
  Mutation: {
    createUser: async (parent, { input }, context) => {
      if (!context.user) {
        throw new GraphQLError('You must be logged in', {
          extensions: {
            code: 'UNAUTHENTICATED',
          },
        });
      }

      if (!context.user.isAdmin) {
        throw new GraphQLError('Not authorized', {
          extensions: {
            code: 'FORBIDDEN',
          },
        });
      }

      const existing = await context.db.users.findByEmail(input.email);
      if (existing) {
        throw new GraphQLError('Email already exists', {
          extensions: {
            code: 'BAD_USER_INPUT',
            field: 'email',
          },
        });
      }

      return context.db.users.create(input);
    },
  },
};
```

---

## Custom Error Formatting
- difficulty: medium
- description: Format errors in Apollo Server

```typescript
import { ApolloServer } from '@apollo/server';

const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError: (formattedError, error) => {
    if (formattedError.extensions?.code === 'INTERNAL_SERVER_ERROR') {
      console.error('Internal error:', error);
      return {
        message: 'An unexpected error occurred',
        extensions: {
          code: 'INTERNAL_SERVER_ERROR',
        },
      };
    }

    if (process.env.NODE_ENV === 'production') {
      delete formattedError.extensions?.stacktrace;
    }

    return formattedError;
  },
});
```

---

## DataLoader for Batching
- difficulty: hard
- description: Batch and cache database requests

```typescript
import DataLoader from 'dataloader';

const createLoaders = () => ({
  userLoader: new DataLoader(async (userIds: string[]) => {
    const users = await db.users.findByIds(userIds);
    const userMap = new Map(users.map(u => [u.id, u]));
    return userIds.map(id => userMap.get(id) || null);
  }),

  postsByAuthorLoader: new DataLoader(async (authorIds: string[]) => {
    const posts = await db.posts.findByAuthorIds(authorIds);
    const postsMap = new Map<string, Post[]>();
    posts.forEach(post => {
      const existing = postsMap.get(post.authorId) || [];
      postsMap.set(post.authorId, [...existing, post]);
    });
    return authorIds.map(id => postsMap.get(id) || []);
  }),
});

const resolvers = {
  Post: {
    author: (parent, args, context) => {
      return context.loaders.userLoader.load(parent.authorId);
    },
  },
  User: {
    posts: (parent, args, context) => {
      return context.loaders.postsByAuthorLoader.load(parent.id);
    },
  },
};
```

---

## Authentication Directive
- difficulty: hard
- description: Implement auth directive with schema transformer

```typescript
import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils';
import { defaultFieldResolver, GraphQLSchema } from 'graphql';

function authDirectiveTransformer(schema: GraphQLSchema) {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      const authDirective = getDirective(schema, fieldConfig, 'auth')?.[0];

      if (authDirective) {
        const { requires } = authDirective;
        const { resolve = defaultFieldResolver } = fieldConfig;

        fieldConfig.resolve = async function (source, args, context, info) {
          if (!context.user) {
            throw new GraphQLError('Not authenticated');
          }

          if (requires && context.user.role !== requires) {
            throw new GraphQLError('Not authorized');
          }

          return resolve(source, args, context, info);
        };
      }
      return fieldConfig;
    },
  });
}
```

---

## File Upload
- difficulty: hard
- description: Handle file uploads with graphql-upload

```typescript
import { GraphQLUpload } from 'graphql-upload-ts';
import { createWriteStream } from 'fs';

const typeDefs = gql`
  scalar Upload

  type File {
    filename: String!
    mimetype: String!
    encoding: String!
    url: String!
  }

  type Mutation {
    uploadFile(file: Upload!): File!
    uploadFiles(files: [Upload!]!): [File!]!
  }
`;

const resolvers = {
  Upload: GraphQLUpload,

  Mutation: {
    uploadFile: async (parent, { file }) => {
      const { createReadStream, filename, mimetype, encoding } = await file;

      const stream = createReadStream();
      const path = `./uploads/${Date.now()}-${filename}`;

      await new Promise((resolve, reject) => {
        stream
          .pipe(createWriteStream(path))
          .on('finish', resolve)
          .on('error', reject);
      });

      return {
        filename,
        mimetype,
        encoding,
        url: `http://localhost:4000/${path}`,
      };
    },
  },
};
```

---

## Pagination Resolver
- difficulty: hard
- description: Implement cursor-based pagination

```typescript
const resolvers = {
  Query: {
    users: async (parent, { first, after, last, before }, context) => {
      let query = context.db.users.query();
      let hasNextPage = false;
      let hasPreviousPage = false;

      if (after) {
        const cursor = Buffer.from(after, 'base64').toString('utf8');
        query = query.where('id', '>', cursor);
        hasPreviousPage = true;
      }

      if (before) {
        const cursor = Buffer.from(before, 'base64').toString('utf8');
        query = query.where('id', '<', cursor);
      }

      const limit = first || last || 10;
      const users = await query.limit(limit + 1).fetchAll();

      if (users.length > limit) {
        hasNextPage = true;
        users.pop();
      }

      const edges = users.map((user) => ({
        cursor: Buffer.from(user.id).toString('base64'),
        node: user,
      }));

      return {
        edges,
        pageInfo: {
          hasNextPage,
          hasPreviousPage,
          startCursor: edges[0]?.cursor,
          endCursor: edges[edges.length - 1]?.cursor,
        },
        totalCount: await context.db.users.count(),
      };
    },
  },
};
```

---

## Schema Stitching
- difficulty: hard
- description: Combine multiple GraphQL schemas

```typescript
import { stitchSchemas } from '@graphql-tools/stitch';
import { delegateToSchema } from '@graphql-tools/delegate';

const gatewaySchema = stitchSchemas({
  subschemas: [
    {
      schema: usersSchema,
      executor: usersExecutor,
    },
    {
      schema: postsSchema,
      executor: postsExecutor,
    },
  ],
  typeDefs: `
    extend type Post {
      author: User
    }
  `,
  resolvers: {
    Post: {
      author: {
        selectionSet: '{ authorId }',
        resolve(post, args, context, info) {
          return delegateToSchema({
            schema: usersSchema,
            operation: 'query',
            fieldName: 'user',
            args: { id: post.authorId },
            context,
            info,
          });
        },
      },
    },
  },
});
```

---

## Federation Subgraph
- difficulty: hard
- description: Apollo Federation subgraph setup

```typescript
import { buildSubgraphSchema } from '@apollo/subgraph';
import { ApolloServer } from '@apollo/server';
import gql from 'graphql-tag';

const typeDefs = gql`
  extend schema
    @link(url: "https://specs.apollo.dev/federation/v2.0", import: ["@key", "@shareable"])

  type User @key(fields: "id") {
    id: ID!
    name: String!
    email: String!
  }

  type Query {
    users: [User!]!
    user(id: ID!): User
  }
`;

const resolvers = {
  Query: {
    users: () => users,
    user: (_, { id }) => users.find((u) => u.id === id),
  },
  User: {
    __resolveReference: (user) => users.find((u) => u.id === user.id),
  },
};

const server = new ApolloServer({
  schema: buildSubgraphSchema({ typeDefs, resolvers }),
});
```

---

## Type Definitions with codegen
- difficulty: medium
- description: GraphQL Code Generator configuration

```yaml
# codegen.yml
schema: "./src/schema/**/*.graphql"
documents: "./src/**/*.tsx"
generates:
  ./src/generated/graphql.ts:
    plugins:
      - typescript
      - typescript-operations
      - typescript-react-apollo
    config:
      withHooks: true
      withComponent: false
      withHOC: false
      skipTypename: false
      dedupeOperationSuffix: true
```

---

## Generated Types Usage
- difficulty: medium
- description: Using generated TypeScript types

```typescript
import {
  useGetUsersQuery,
  useCreateUserMutation,
  GetUsersDocument,
  User,
} from './generated/graphql';

function UserList() {
  const { data, loading, error } = useGetUsersQuery({
    variables: { first: 10 },
  });

  const [createUser] = useCreateUserMutation({
    refetchQueries: [{ query: GetUsersDocument }],
  });

  const handleCreate = async (input: CreateUserInput) => {
    const result = await createUser({ variables: { input } });
    const newUser: User = result.data?.createUser;
    console.log('Created:', newUser);
  };

  return (
    <ul>
      {data?.users.edges.map(({ node }) => (
        <li key={node.id}>{node.name}</li>
      ))}
    </ul>
  );
}
```

---

## Testing Resolvers
- difficulty: medium
- description: Unit testing GraphQL resolvers

```typescript
import { describe, it, expect, vi } from 'vitest';
import { resolvers } from './resolvers';

describe('User resolvers', () => {
  const mockContext = {
    db: {
      users: {
        findById: vi.fn(),
        findAll: vi.fn(),
        create: vi.fn(),
      },
    },
    user: { id: '1', role: 'ADMIN' },
  };

  it('should return user by id', async () => {
    const mockUser = { id: '1', name: 'John', email: 'john@example.com' };
    mockContext.db.users.findById.mockResolvedValue(mockUser);

    const result = await resolvers.Query.user(null, { id: '1' }, mockContext);

    expect(result).toEqual(mockUser);
    expect(mockContext.db.users.findById).toHaveBeenCalledWith('1');
  });

  it('should create user', async () => {
    const input = { name: 'Jane', email: 'jane@example.com', password: 'pass' };
    const mockUser = { id: '2', ...input };
    mockContext.db.users.create.mockResolvedValue(mockUser);

    const result = await resolvers.Mutation.createUser(
      null,
      { input },
      mockContext
    );

    expect(result).toEqual(mockUser);
  });
});
```

---

## Integration Testing
- difficulty: hard
- description: Integration testing with Apollo Server

```typescript
import { ApolloServer } from '@apollo/server';
import { describe, it, expect, beforeAll } from 'vitest';
import { typeDefs, resolvers } from './schema';

describe('GraphQL API', () => {
  let server: ApolloServer;

  beforeAll(() => {
    server = new ApolloServer({
      typeDefs,
      resolvers,
    });
  });

  it('should fetch users', async () => {
    const response = await server.executeOperation({
      query: `
        query GetUsers {
          users {
            id
            name
            email
          }
        }
      `,
    });

    expect(response.body.kind).toBe('single');
    expect(response.body.singleResult.errors).toBeUndefined();
    expect(response.body.singleResult.data?.users).toBeDefined();
  });

  it('should create user', async () => {
    const response = await server.executeOperation({
      query: `
        mutation CreateUser($input: CreateUserInput!) {
          createUser(input: $input) {
            id
            name
            email
          }
        }
      `,
      variables: {
        input: {
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
        },
      },
    });

    expect(response.body.singleResult.data?.createUser).toBeDefined();
  });
});
```
