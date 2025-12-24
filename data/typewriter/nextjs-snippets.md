# Next.js 16 Snippets

## Basic Page Component
- difficulty: easy
- description: Create a simple page component in App Router

```tsx
export default function HomePage() {
  return (
    <main>
      <h1>Welcome to My App</h1>
      <p>This is the home page.</p>
    </main>
  );
}
```

## Page with Params
- difficulty: easy
- description: Access dynamic route parameters (async required in v16)

```tsx
interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div>
      <h1>Product {id}</h1>
    </div>
  );
}
```

## Page with Search Params
- difficulty: easy
- description: Access URL search parameters (async required in v16)

```tsx
interface PageProps {
  searchParams: Promise<{ query?: string; page?: string }>;
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { query, page } = await searchParams;
  const currentPage = Number(page) || 1;

  return (
    <div>
      <h1>Search Results for: {query}</h1>
      <p>Page: {currentPage}</p>
    </div>
  );
}
```

## Root Layout
- difficulty: easy
- description: Create the root layout with HTML structure

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "My Application",
  description: "Built with Next.js 16",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

## Next.js 16 Config
- difficulty: medium
- description: Configure Next.js 16 with new features

```tsx
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "example.com",
        pathname: "/images/**",
      },
    ],
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
```

## Use Cache Directive Basic
- difficulty: medium
- description: Cache a component with the use cache directive

```tsx
async function CachedProductList() {
  "use cache";

  const products = await fetch("https://api.example.com/products");
  const data = await products.json();

  return (
    <ul>
      {data.map((product: { id: string; name: string }) => (
        <li key={product.id}>{product.name}</li>
      ))}
    </ul>
  );
}

export default function ProductsPage() {
  return (
    <div>
      <h1>Products</h1>
      <CachedProductList />
    </div>
  );
}
```

## Use Cache with Tags
- difficulty: medium
- description: Cache component with tags for targeted revalidation

```tsx
import { cacheTag } from "next/cache";

async function UserProfile({ userId }: { userId: string }) {
  "use cache";
  cacheTag(`user-${userId}`, "users");

  const user = await fetch(`https://api.example.com/users/${userId}`);
  const data = await user.json();

  return (
    <div>
      <h2>{data.name}</h2>
      <p>{data.email}</p>
    </div>
  );
}
```

## Use Cache with Life
- difficulty: medium
- description: Set cache duration with cacheLife

```tsx
import { cacheLife, cacheTag } from "next/cache";

async function AnalyticsDashboard() {
  "use cache";
  cacheLife("hours");
  cacheTag("analytics");

  const stats = await fetch("https://api.example.com/analytics");
  const data = await stats.json();

  return (
    <div>
      <h2>Analytics</h2>
      <p>Total Views: {data.totalViews}</p>
      <p>Active Users: {data.activeUsers}</p>
    </div>
  );
}
```

## Cache Life Profiles
- difficulty: medium
- description: Define custom cache life profiles

```tsx
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  cacheLife: {
    short: {
      stale: 30,
      revalidate: 60,
      expire: 300,
    },
    blog: {
      stale: 3600,
      revalidate: 900,
      expire: 86400,
    },
    static: {
      stale: 86400,
      revalidate: 604800,
      expire: 2592000,
    },
  },
};

export default nextConfig;
```

## Use Cache in Function
- difficulty: medium
- description: Cache a data fetching function

```tsx
import { cacheTag, cacheLife } from "next/cache";

async function getPost(postId: string) {
  "use cache";
  cacheTag(`post-${postId}`, "posts");
  cacheLife("blog");

  const res = await fetch(`https://api.example.com/posts/${postId}`);
  return res.json();
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPost(id);

  return (
    <article>
      <h1>{post.title}</h1>
      <div>{post.content}</div>
    </article>
  );
}
```

## Revalidate Tag with Profile
- difficulty: medium
- description: Revalidate cache with stale-while-revalidate support

```tsx
"use server";

import { revalidateTag } from "next/cache";

export async function updatePost(postId: string, formData: FormData) {
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;

  await fetch(`https://api.example.com/posts/${postId}`, {
    method: "PUT",
    body: JSON.stringify({ title, content }),
  });

  revalidateTag(`post-${postId}`, "hours");
  revalidateTag("posts", "max");
}
```

## Update Tag Server Action
- difficulty: medium
- description: Use updateTag for immediate cache refresh

```tsx
"use server";

import { updateTag } from "next/cache";

export async function updateUserProfile(userId: string, formData: FormData) {
  const name = formData.get("name") as string;
  const bio = formData.get("bio") as string;

  await db.users.update({
    where: { id: userId },
    data: { name, bio },
  });

  updateTag(`user-${userId}`);
}
```

## Refresh Server Action
- difficulty: medium
- description: Refresh uncached data without touching cache

```tsx
"use server";

import { refresh } from "next/cache";

export async function markNotificationAsRead(notificationId: string) {
  await db.notifications.update({
    where: { id: notificationId },
    data: { read: true },
  });

  refresh();
}
```

## Proxy Basic
- difficulty: medium
- description: Create proxy for request interception (replaces middleware)

```tsx
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/dashboard")) {
    const token = request.cookies.get("session-token");

    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
};
```

## Proxy with Headers
- difficulty: medium
- description: Add custom headers in proxy (runs on Node.js runtime)

```tsx
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function proxy(request: NextRequest) {
  const response = NextResponse.next();

  response.headers.set("x-request-id", crypto.randomUUID());
  response.headers.set("x-pathname", request.nextUrl.pathname);

  const country = request.geo?.country || "unknown";
  response.headers.set("x-user-country", country);

  return response;
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico).*)",
};
```

## Proxy Rewrite
- difficulty: medium
- description: Rewrite URL paths in proxy

```tsx
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname === "/old-page") {
    return NextResponse.rewrite(new URL("/new-page", request.url));
  }

  const country = request.geo?.country || "US";
  if (pathname === "/") {
    return NextResponse.rewrite(
      new URL(`/${country.toLowerCase()}`, request.url)
    );
  }

  return NextResponse.next();
}
```

## Proxy Rate Limiting
- difficulty: hard
- description: Implement rate limiting in proxy

```tsx
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const rateLimit = new Map<string, { count: number; timestamp: number }>();

export default function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api")) {
    const ip = request.headers.get("x-forwarded-for") || "anonymous";
    const now = Date.now();
    const windowMs = 60 * 1000;
    const maxRequests = 100;

    const current = rateLimit.get(ip);

    if (current && now - current.timestamp < windowMs) {
      if (current.count >= maxRequests) {
        return NextResponse.json(
          { error: "Too many requests" },
          { status: 429 }
        );
      }
      current.count++;
    } else {
      rateLimit.set(ip, { count: 1, timestamp: now });
    }
  }

  return NextResponse.next();
}
```

## React Compiler Config
- difficulty: easy
- description: Enable React Compiler for automatic memoization

```tsx
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
};

export default nextConfig;
```

## React Compiler Opt-out
- difficulty: medium
- description: Opt-out specific components from React Compiler

```tsx
"use no memo";

export default function LegacyComponent() {
  return <div>This component is not optimized by React Compiler</div>;
}
```

## Loading UI
- difficulty: easy
- description: Create loading state for a route segment

```tsx
export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
    </div>
  );
}
```

## Loading with Skeleton
- difficulty: medium
- description: Create skeleton loading UI for better UX

```tsx
export default function Loading() {
  return (
    <div className="space-y-4 p-4">
      <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
    </div>
  );
}
```

## Error Boundary
- difficulty: medium
- description: Handle errors in a route segment

```tsx
"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <p className="text-gray-600 mb-4">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Try again
      </button>
    </div>
  );
}
```

## Global Error Boundary
- difficulty: medium
- description: Handle errors in root layout

```tsx
"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
          <button
            onClick={reset}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
```

## Not Found Page
- difficulty: easy
- description: Create custom 404 page

```tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-6xl font-bold text-gray-800">404</h1>
      <h2 className="text-2xl font-semibold text-gray-600 mt-4">
        Page Not Found
      </h2>
      <p className="text-gray-500 mt-2">
        The page you're looking for doesn't exist.
      </p>
      <Link
        href="/"
        className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Go Home
      </Link>
    </div>
  );
}
```

## Parallel Routes Default
- difficulty: hard
- description: Required default.tsx for parallel route slots in v16

```tsx
import { notFound } from "next/navigation";

export default function Default() {
  notFound();
}
```

## Programmatic Not Found
- difficulty: medium
- description: Trigger not found from server component

```tsx
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getProduct(id: string) {
  const res = await fetch(`https://api.example.com/products/${id}`);
  if (!res.ok) return null;
  return res.json();
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
    </div>
  );
}
```

## Client Component
- difficulty: easy
- description: Create an interactive client component

```tsx
"use client";

import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={() => setCount(count - 1)}
        className="px-4 py-2 bg-gray-200 rounded"
      >
        -
      </button>
      <span className="text-2xl font-bold">{count}</span>
      <button
        onClick={() => setCount(count + 1)}
        className="px-4 py-2 bg-gray-200 rounded"
      >
        +
      </button>
    </div>
  );
}
```

## Server Component with Cache
- difficulty: medium
- description: Fetch data in server component with caching

```tsx
import { cacheTag, cacheLife } from "next/cache";

interface Post {
  id: number;
  title: string;
  body: string;
}

async function getPosts(): Promise<Post[]> {
  "use cache";
  cacheTag("posts");
  cacheLife("hours");

  const res = await fetch("https://jsonplaceholder.typicode.com/posts");

  if (!res.ok) {
    throw new Error("Failed to fetch posts");
  }

  return res.json();
}

export default async function PostsPage() {
  const posts = await getPosts();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Posts</h1>
      <ul className="space-y-2">
        {posts.map((post) => (
          <li key={post.id} className="p-4 border rounded">
            <h2 className="font-semibold">{post.title}</h2>
            <p className="text-gray-600">{post.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## Parallel Data Fetching with Cache
- difficulty: medium
- description: Fetch multiple cached data sources in parallel

```tsx
import { cacheTag } from "next/cache";

async function getUser(id: string) {
  "use cache";
  cacheTag(`user-${id}`);

  const res = await fetch(`https://api.example.com/users/${id}`);
  return res.json();
}

async function getPosts(userId: string) {
  "use cache";
  cacheTag(`user-${userId}-posts`);

  const res = await fetch(`https://api.example.com/users/${userId}/posts`);
  return res.json();
}

async function getFollowers(userId: string) {
  "use cache";
  cacheTag(`user-${userId}-followers`);

  const res = await fetch(`https://api.example.com/users/${userId}/followers`);
  return res.json();
}

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [user, posts, followers] = await Promise.all([
    getUser(id),
    getPosts(id),
    getFollowers(id),
  ]);

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{posts.length} posts</p>
      <p>{followers.length} followers</p>
    </div>
  );
}
```

## Streaming with Suspense
- difficulty: medium
- description: Stream content with Suspense boundaries

```tsx
import { Suspense } from "react";

async function SlowComponent() {
  "use cache";

  const data = await fetch("https://api.example.com/slow-data");
  const result = await data.json();
  return <div>{result.message}</div>;
}

function LoadingSpinner() {
  return (
    <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent" />
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <section>
        <h2>Quick Stats</h2>
        <Suspense fallback={<LoadingSpinner />}>
          <SlowComponent />
        </Suspense>
      </section>

      <section>
        <h2>Recent Activity</h2>
        <Suspense fallback={<LoadingSpinner />}>
          <SlowComponent />
        </Suspense>
      </section>
    </div>
  );
}
```

## Server Action Basic
- difficulty: medium
- description: Create a basic server action for form submission

```tsx
async function createPost(formData: FormData) {
  "use server";

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;

  await fetch("https://api.example.com/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, content }),
  });
}

export default function NewPostPage() {
  return (
    <form action={createPost} className="space-y-4">
      <div>
        <label htmlFor="title" className="block font-medium">
          Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          required
          className="w-full border rounded px-3 py-2"
        />
      </div>
      <div>
        <label htmlFor="content" className="block font-medium">
          Content
        </label>
        <textarea
          id="content"
          name="content"
          required
          rows={5}
          className="w-full border rounded px-3 py-2"
        />
      </div>
      <button
        type="submit"
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Create Post
      </button>
    </form>
  );
}
```

## Server Action with Validation
- difficulty: hard
- description: Server action with Zod validation and error handling

```tsx
"use server";

import { z } from "zod";
import { revalidateTag } from "next/cache";

const CreateUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type FormState = {
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
  };
  message?: string;
  success?: boolean;
};

export async function createUser(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = CreateUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed",
    };
  }

  try {
    await db.user.create({ data: validatedFields.data });
    revalidateTag("users", "max");
    return { success: true, message: "User created successfully" };
  } catch (error) {
    return { message: "Failed to create user" };
  }
}
```

## useActionState Hook
- difficulty: hard
- description: Use useActionState for form state management

```tsx
"use client";

import { useActionState } from "react";
import { createUser, FormState } from "./actions";

const initialState: FormState = {};

export default function SignUpForm() {
  const [state, formAction, pending] = useActionState(createUser, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="name">Name</label>
        <input
          type="text"
          id="name"
          name="name"
          className="w-full border rounded px-3 py-2"
        />
        {state.errors?.name && (
          <p className="text-red-500 text-sm">{state.errors.name[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          className="w-full border rounded px-3 py-2"
        />
        {state.errors?.email && (
          <p className="text-red-500 text-sm">{state.errors.email[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          className="w-full border rounded px-3 py-2"
        />
        {state.errors?.password && (
          <p className="text-red-500 text-sm">{state.errors.password[0]}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
      >
        {pending ? "Creating..." : "Create Account"}
      </button>

      {state.message && (
        <p className={state.success ? "text-green-500" : "text-red-500"}>
          {state.message}
        </p>
      )}
    </form>
  );
}
```

## Server Action with UpdateTag
- difficulty: medium
- description: Use updateTag for read-your-writes semantics

```tsx
"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";

export async function updateProfile(userId: string, formData: FormData) {
  const name = formData.get("name") as string;
  const bio = formData.get("bio") as string;

  await db.user.update({
    where: { id: userId },
    data: { name, bio },
  });

  updateTag(`user-${userId}`);
}

export async function deletePost(postId: string) {
  await db.post.delete({ where: { id: postId } });

  updateTag("posts");
  redirect("/posts");
}
```

## Route Handler GET
- difficulty: easy
- description: Create a GET API route handler

```tsx
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");
  const page = searchParams.get("page") || "1";

  const data = await fetch(
    `https://api.example.com/search?q=${query}&page=${page}`
  );
  const results = await data.json();

  return NextResponse.json(results);
}
```

## Route Handler POST
- difficulty: easy
- description: Create a POST API route handler

```tsx
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const user = await authenticateUser(email, password);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    return NextResponse.json({ user, token: generateToken(user) });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

## Route Handler with Params
- difficulty: medium
- description: Access dynamic route params in API handler

```tsx
import { NextResponse } from "next/server";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  const { id } = await context.params;

  const product = await db.product.findUnique({
    where: { id },
  });

  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(product);
}

export async function DELETE(request: Request, context: RouteContext) {
  const { id } = await context.params;

  await db.product.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
```

## Route Handler with Cookies
- difficulty: medium
- description: Read and set cookies in API handler

```tsx
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session-token");

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true });
}

export async function POST(request: Request) {
  const { username, password } = await request.json();
  const token = await authenticate(username, password);

  const response = NextResponse.json({ success: true });

  response.cookies.set("session-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
```

## Route Handler Streaming
- difficulty: hard
- description: Stream response from API route

```tsx
export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      for (let i = 0; i < 10; i++) {
        const chunk = encoder.encode(
          `data: ${JSON.stringify({ count: i })}\n\n`
        );
        controller.enqueue(chunk);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
```

## Static Metadata
- difficulty: easy
- description: Define static metadata for SEO

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Amazing App",
  description: "The best app for doing amazing things",
  keywords: ["next.js", "react", "typescript"],
  authors: [{ name: "John Doe" }],
  openGraph: {
    title: "My Amazing App",
    description: "The best app for doing amazing things",
    url: "https://example.com",
    siteName: "My Amazing App",
    images: [
      {
        url: "https://example.com/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "My Amazing App",
    description: "The best app for doing amazing things",
    images: ["https://example.com/og-image.png"],
  },
};
```

## Dynamic Metadata
- difficulty: medium
- description: Generate metadata based on route params

```tsx
import type { Metadata } from "next";
import { cacheTag } from "next/cache";

interface Props {
  params: Promise<{ id: string }>;
}

async function getProduct(id: string) {
  "use cache";
  cacheTag(`product-${id}`);

  const res = await fetch(`https://api.example.com/products/${id}`);
  return res.json();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [product.imageUrl],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = await getProduct(id);

  return <div>{product.name}</div>;
}
```

## Generate Static Params
- difficulty: medium
- description: Pre-render dynamic routes at build time

```tsx
import { cacheTag } from "next/cache";

interface Post {
  id: string;
  title: string;
  content: string;
}

export async function generateStaticParams() {
  const posts: Post[] = await fetch("https://api.example.com/posts").then(
    (res) => res.json()
  );

  return posts.map((post) => ({
    slug: post.id,
  }));
}

async function getPost(slug: string) {
  "use cache";
  cacheTag(`post-${slug}`);

  return fetch(`https://api.example.com/posts/${slug}`).then((res) =>
    res.json()
  );
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);

  return (
    <article>
      <h1>{post.title}</h1>
      <div>{post.content}</div>
    </article>
  );
}
```

## useRouter Hook
- difficulty: easy
- description: Use router for client-side navigation

```tsx
"use client";

import { useRouter } from "next/navigation";

export default function NavigationButtons() {
  const router = useRouter();

  return (
    <div className="space-x-4">
      <button onClick={() => router.back()}>Go Back</button>
      <button onClick={() => router.forward()}>Go Forward</button>
      <button onClick={() => router.push("/dashboard")}>Dashboard</button>
      <button onClick={() => router.replace("/home")}>Home (Replace)</button>
      <button onClick={() => router.refresh()}>Refresh</button>
      <button onClick={() => router.prefetch("/about")}>Prefetch About</button>
    </div>
  );
}
```

## usePathname Hook
- difficulty: easy
- description: Get current pathname for active link styling

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav>
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={pathname === link.href ? "text-blue-500 font-bold" : ""}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
```

## useSearchParams Hook
- difficulty: medium
- description: Read and update URL search params

```tsx
"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";

export default function FilterComponent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const currentCategory = searchParams.get("category") || "all";

  const updateFilter = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (category === "all") {
      params.delete("category");
    } else {
      params.set("category", category);
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex gap-2">
      {["all", "tech", "lifestyle", "business"].map((cat) => (
        <button
          key={cat}
          onClick={() => updateFilter(cat)}
          className={currentCategory === cat ? "bg-blue-500 text-white" : ""}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
```

## useParams Hook
- difficulty: easy
- description: Access route params in client component

```tsx
"use client";

import { useParams } from "next/navigation";

export default function ProductActions() {
  const params = useParams<{ id: string; category: string }>();

  return (
    <div>
      <p>Product ID: {params.id}</p>
      <p>Category: {params.category}</p>
    </div>
  );
}
```

## Link Component
- difficulty: easy
- description: Use Link component for navigation with prefetching

```tsx
import Link from "next/link";

export default function Navigation() {
  return (
    <nav className="flex gap-4">
      <Link href="/">Home</Link>

      <Link href="/about" prefetch={false}>
        About
      </Link>

      <Link href="/products/123" replace>
        Product 123
      </Link>

      <Link
        href={{
          pathname: "/search",
          query: { q: "nextjs", page: 1 },
        }}
      >
        Search
      </Link>

      <Link href="/external" target="_blank" rel="noopener noreferrer">
        External
      </Link>
    </nav>
  );
}
```

## Image Component
- difficulty: easy
- description: Optimize images with Next.js Image

```tsx
import Image from "next/image";

export default function ImageGallery() {
  return (
    <div className="space-y-8">
      <Image
        src="/hero.jpg"
        alt="Hero image"
        width={1200}
        height={600}
        priority
      />

      <div className="relative h-96">
        <Image
          src="/background.jpg"
          alt="Background"
          fill
          className="object-cover"
        />
      </div>

      <Image
        src="https://example.com/external.jpg"
        alt="External image"
        width={400}
        height={300}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j..."
      />

      <Image
        src="/avatar.png"
        alt="Avatar"
        width={100}
        height={100}
        sizes="(max-width: 768px) 50px, 100px"
        className="rounded-full"
      />
    </div>
  );
}
```

## Font Optimization
- difficulty: medium
- description: Optimize fonts with next/font

```tsx
import { Inter, Roboto_Mono } from "next/font/google";
import localFont from "next/font/local";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto-mono",
});

const customFont = localFont({
  src: [
    { path: "./fonts/CustomFont-Regular.woff2", weight: "400" },
    { path: "./fonts/CustomFont-Bold.woff2", weight: "700" },
  ],
  variable: "--font-custom",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${robotoMono.variable} ${customFont.variable}`}
    >
      <body className="font-sans">{children}</body>
    </html>
  );
}
```

## Script Component
- difficulty: medium
- description: Load third-party scripts optimally

```tsx
import Script from "next/script";

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=GA_ID"
        strategy="afterInteractive"
      />

      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'GA_ID');
        `}
      </Script>

      <Script
        src="https://example.com/critical.js"
        strategy="beforeInteractive"
      />

      <Script
        src="https://example.com/widget.js"
        strategy="lazyOnload"
        onLoad={() => console.log("Widget loaded")}
      />

      {children}
    </>
  );
}
```

## Parallel Routes
- difficulty: hard
- description: Render multiple pages simultaneously

```tsx
export default function DashboardLayout({
  children,
  analytics,
  team,
}: {
  children: React.ReactNode;
  analytics: React.ReactNode;
  team: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-12 gap-4">
      <main className="col-span-8">{children}</main>
      <aside className="col-span-4 space-y-4">
        <div>{analytics}</div>
        <div>{team}</div>
      </aside>
    </div>
  );
}
```

## Intercepting Routes Modal
- difficulty: hard
- description: Intercept route for modal display

```tsx
import { Modal } from "@/components/Modal";

export default function PhotoModal({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Modal>
      <PhotoContent params={params} />
    </Modal>
  );
}

async function PhotoContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const photo = await getPhoto(id);

  return (
    <div>
      <img src={photo.url} alt={photo.title} />
      <h2>{photo.title}</h2>
    </div>
  );
}
```

## Route Groups
- difficulty: medium
- description: Organize routes without affecting URL

```tsx
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="marketing-layout">
      <header className="bg-gradient-to-r from-blue-500 to-purple-500">
        <nav>Marketing Navigation</nav>
      </header>
      <main>{children}</main>
      <footer>Marketing Footer</footer>
    </div>
  );
}
```

## Catch-All Segments
- difficulty: medium
- description: Handle catch-all dynamic segments

```tsx
interface PageProps {
  params: Promise<{ slug: string[] }>;
}

export default async function DocsPage({ params }: PageProps) {
  const { slug } = await params;
  const path = slug?.join("/") || "";

  return (
    <div>
      <h1>Documentation</h1>
      <p>Current path: {path}</p>
      <p>Segments: {slug?.length || 0}</p>
    </div>
  );
}
```

## Sitemap Generation
- difficulty: medium
- description: Generate dynamic sitemap

```tsx
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://example.com";

  const posts = await fetch("https://api.example.com/posts").then((res) =>
    res.json()
  );

  const postUrls = posts.map((post: { id: string; updatedAt: string }) => ({
    url: `${baseUrl}/posts/${post.id}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...postUrls,
  ];
}
```

## Robots.txt Generation
- difficulty: easy
- description: Generate robots.txt dynamically

```tsx
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/private/"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
      },
    ],
    sitemap: "https://example.com/sitemap.xml",
  };
}
```

## Auth Session Check
- difficulty: hard
- description: Check authentication in server components

```tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";

async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session-token")?.value;

  if (!token) return null;

  try {
    const session = await verifyToken(token);
    return session;
  } catch {
    return null;
  }
}

export default async function ProtectedPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div>
      <h1>Welcome, {session.user.name}</h1>
      <p>This is a protected page.</p>
    </div>
  );
}
```

## useOptimistic Hook
- difficulty: hard
- description: Optimistic UI updates with useOptimistic

```tsx
"use client";

import { useOptimistic, useTransition } from "react";
import { likePost } from "./actions";

interface Post {
  id: string;
  title: string;
  likes: number;
  liked: boolean;
}

export default function PostCard({ post }: { post: Post }) {
  const [isPending, startTransition] = useTransition();
  const [optimisticPost, addOptimisticLike] = useOptimistic(
    post,
    (state, newLiked: boolean) => ({
      ...state,
      liked: newLiked,
      likes: newLiked ? state.likes + 1 : state.likes - 1,
    })
  );

  const handleLike = () => {
    startTransition(async () => {
      addOptimisticLike(!optimisticPost.liked);
      await likePost(post.id, !optimisticPost.liked);
    });
  };

  return (
    <div className="p-4 border rounded">
      <h2>{optimisticPost.title}</h2>
      <button
        onClick={handleLike}
        disabled={isPending}
        className={optimisticPost.liked ? "text-red-500" : "text-gray-500"}
      >
        {optimisticPost.liked ? "❤️" : "🤍"} {optimisticPost.likes}
      </button>
    </div>
  );
}
```

## useTransition Hook
- difficulty: medium
- description: Handle non-blocking UI updates

```tsx
"use client";

import { useState, useTransition } from "react";
import { updateProfile } from "./actions";

export default function ProfileForm() {
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    startTransition(async () => {
      const result = await updateProfile({ name });
      setMessage(result.message);
    });
  };

  return (
    <div className="space-y-4">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border rounded px-3 py-2"
        placeholder="Enter name"
      />
      <button
        onClick={handleSubmit}
        disabled={isPending}
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
      >
        {isPending ? "Saving..." : "Save"}
      </button>
      {message && <p>{message}</p>}
    </div>
  );
}
```

## Context Provider Pattern
- difficulty: medium
- description: Set up context providers in App Router

```tsx
"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (user: User) => setUser(user);
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
```

## Providers Wrapper
- difficulty: medium
- description: Combine multiple providers in root layout

```tsx
"use client";

import { ThemeProvider } from "next-themes";
import { AuthProvider } from "./AuthProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthProvider>{children}</AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
```

## DevTools MCP Integration
- difficulty: hard
- description: Configure Next.js DevTools MCP for AI debugging

```tsx
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  reactCompiler: true,
  devtools: {
    mcp: {
      enabled: true,
      providers: ["claude", "cursor"],
    },
  },
  logging: {
    fetches: {
      fullUrl: true,
      hmrRefreshes: true,
    },
  },
};

export default nextConfig;
```

## Turbopack Configuration
- difficulty: medium
- description: Configure Turbopack (default in v16)

```tsx
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
    resolveAlias: {
      "@components": "./src/components",
      "@lib": "./src/lib",
    },
  },
};

export default nextConfig;
```

## Environment Variables
- difficulty: easy
- description: Access environment variables properly

```tsx
const apiUrl = process.env.API_URL;
const secretKey = process.env.SECRET_KEY;

const publicApiUrl = process.env.NEXT_PUBLIC_API_URL;

export async function getServerData() {
  const res = await fetch(apiUrl!, {
    headers: {
      Authorization: `Bearer ${secretKey}`,
    },
  });
  return res.json();
}

export function ClientComponent() {
  return <div>API URL: {publicApiUrl}</div>;
}
```
