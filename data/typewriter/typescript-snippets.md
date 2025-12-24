# TypeScript Snippets (v5.x - 2025)

## Basic Types
- difficulty: easy

```typescript
const name: string = "John";
const age: number = 25;
const isActive: boolean = true;
const items: string[] = ["a", "b", "c"];
const tuple: [string, number] = ["hello", 42];

console.log(name, age, isActive);
```

## Type Inference
- difficulty: easy

```typescript
let message = "Hello";
let count = 42;
let active = true;
let numbers = [1, 2, 3];

const user = {
  name: "John",
  age: 30
};

// TypeScript infers all types automatically
console.log(typeof message, typeof count);
```

## Union Types
- difficulty: easy

```typescript
type Status = "pending" | "approved" | "rejected";
type ID = string | number;

function printId(id: ID): void {
  if (typeof id === "string") {
    console.log(id.toUpperCase());
  } else {
    console.log(id.toFixed(2));
  }
}

printId("abc");
printId(123);
```

## Interface Basics
- difficulty: easy

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  age?: number;
  readonly createdAt: Date;
}

const user: User = {
  id: 1,
  name: "John",
  email: "john@example.com",
  createdAt: new Date()
};

console.log(user.name);
```

## Type Alias
- difficulty: easy

```typescript
type Point = {
  x: number;
  y: number;
};

type Callback = (data: string) => void;
type Nullable<T> = T | null;
type StringOrNumber = string | number;

const point: Point = { x: 10, y: 20 };
const callback: Callback = (data) => console.log(data);
const value: Nullable<string> = null;
```

## Function Types
- difficulty: easy

```typescript
function add(a: number, b: number): number {
  return a + b;
}

const multiply = (a: number, b: number): number => a * b;

function greet(name: string, greeting?: string): string {
  return `${greeting ?? "Hello"}, ${name}!`;
}

function log(message: string, ...args: unknown[]): void {
  console.log(message, ...args);
}
```

## Array Types
- difficulty: easy

```typescript
const numbers: number[] = [1, 2, 3, 4, 5];
const names: Array<string> = ["Alice", "Bob"];
const matrix: number[][] = [[1, 2], [3, 4]];

const mixed: (string | number)[] = [1, "two", 3];

const readonlyArr: readonly number[] = [1, 2, 3];
// readonlyArr.push(4); // Error!

console.log(numbers, names);
```

## Object Types
- difficulty: easy

```typescript
const user: { name: string; age: number } = {
  name: "John",
  age: 30
};

type Config = {
  readonly apiUrl: string;
  timeout: number;
  headers?: Record<string, string>;
};

const config: Config = {
  apiUrl: "https://api.example.com",
  timeout: 5000
};
```

## Interface Extension
- difficulty: medium

```typescript
interface Animal {
  name: string;
  age: number;
}

interface Dog extends Animal {
  breed: string;
  bark(): void;
}

interface Cat extends Animal {
  color: string;
  meow(): void;
}

const dog: Dog = {
  name: "Max",
  age: 3,
  breed: "Labrador",
  bark: () => console.log("Woof!")
};
```

## Intersection Types
- difficulty: medium

```typescript
type HasName = { name: string };
type HasAge = { age: number };
type HasEmail = { email: string };

type Person = HasName & HasAge & HasEmail;

const person: Person = {
  name: "John",
  age: 30,
  email: "john@example.com"
};

type AdminUser = User & { role: "admin"; permissions: string[] };
```

## Generic Functions
- difficulty: medium

```typescript
function identity<T>(value: T): T {
  return value;
}

function first<T>(arr: T[]): T | undefined {
  return arr[0];
}

function merge<T, U>(obj1: T, obj2: U): T & U {
  return { ...obj1, ...obj2 };
}

const num = identity<number>(42);
const str = identity("hello");
const merged = merge({ a: 1 }, { b: 2 });
```

## Generic Interfaces
- difficulty: medium

```typescript
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
  timestamp: Date;
}

interface User {
  id: number;
  name: string;
}

type UserResponse = ApiResponse<User>;
type UsersResponse = ApiResponse<User[]>;

const response: UserResponse = {
  data: { id: 1, name: "John" },
  status: 200,
  message: "Success",
  timestamp: new Date()
};
```

## Generic Constraints
- difficulty: medium

```typescript
interface HasLength {
  length: number;
}

function logLength<T extends HasLength>(item: T): number {
  console.log(item.length);
  return item.length;
}

logLength("hello");
logLength([1, 2, 3]);
logLength({ length: 10 });

function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
```

## Utility Types
- difficulty: medium

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
}

type PartialUser = Partial<User>;
type RequiredUser = Required<User>;
type ReadonlyUser = Readonly<User>;
type UserPreview = Pick<User, "id" | "name">;
type UserWithoutPassword = Omit<User, "password">;

type StringRecord = Record<string, number>;
type NonNullString = NonNullable<string | null>;
```

## Mapped Types
- difficulty: hard

```typescript
type Optional<T> = {
  [K in keyof T]?: T[K];
};

type ReadonlyProps<T> = {
  readonly [K in keyof T]: T[K];
};

type Nullable<T> = {
  [K in keyof T]: T[K] | null;
};

interface User {
  name: string;
  age: number;
}

type OptionalUser = Optional<User>;
type ReadonlyNullableUser = ReadonlyProps<Nullable<User>>;
```

## Conditional Types
- difficulty: hard

```typescript
type IsString<T> = T extends string ? true : false;
type IsArray<T> = T extends unknown[] ? true : false;

type A = IsString<"hello">;  // true
type B = IsString<42>;       // false

type ExtractArrayType<T> = T extends (infer U)[] ? U : never;
type NumArray = ExtractArrayType<number[]>;  // number

type Flatten<T> = T extends Array<infer U> ? Flatten<U> : T;
type Deep = Flatten<number[][][]>;  // number
```

## Template Literal Types
- difficulty: hard

```typescript
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
type ApiPath = "/users" | "/posts" | "/comments";
type ApiEndpoint = `${HttpMethod} ${ApiPath}`;

type EventName = "click" | "focus" | "blur";
type EventHandler = `on${Capitalize<EventName>}`;
// "onClick" | "onFocus" | "onBlur"

type PropGetter<T extends string> = `get${Capitalize<T>}`;
type NameGetter = PropGetter<"name">;  // "getName"
```

## Type Guards
- difficulty: medium

```typescript
interface Dog {
  kind: "dog";
  bark(): void;
}

interface Cat {
  kind: "cat";
  meow(): void;
}

type Animal = Dog | Cat;

function isDog(animal: Animal): animal is Dog {
  return animal.kind === "dog";
}

function makeSound(animal: Animal): void {
  if (isDog(animal)) {
    animal.bark();
  } else {
    animal.meow();
  }
}
```

## Inferred Type Predicates (TS 5.5+)
- difficulty: hard

```typescript
// TypeScript 5.5+ automatically infers type predicates
const numbers = [1, 2, null, 3, undefined, 4];

// TS 5.5+ infers: (value: number | null | undefined) => value is number
const filtered = numbers.filter((n) => n !== null && n !== undefined);
// filtered: number[]

const users = [
  { name: "John", role: "admin" as const },
  { name: "Jane", role: "user" as const },
  null
];

const admins = users
  .filter((u) => u !== null)
  .filter((u) => u.role === "admin");
```

## Satisfies Operator
- difficulty: medium

```typescript
type Colors = Record<string, [number, number, number] | string>;

const palette = {
  red: [255, 0, 0],
  green: "#00ff00",
  blue: [0, 0, 255]
} satisfies Colors;

// palette.red is still [number, number, number], not string | [...]
const redValue = palette.red[0];  // number
const greenValue = palette.green.toUpperCase();  // string method works!

// Error if doesn't satisfy
// const bad = { red: 123 } satisfies Colors;
```

## Const Type Parameters (TS 5.0+)
- difficulty: hard

```typescript
function createConfig<const T extends readonly string[]>(items: T): T {
  return items;
}

// Without const: string[]
// With const: readonly ["a", "b", "c"]
const config = createConfig(["a", "b", "c"] as const);

function defineRoutes<const T extends Record<string, string>>(routes: T): T {
  return routes;
}

const routes = defineRoutes({
  home: "/",
  about: "/about",
  contact: "/contact"
});
// routes.home is "/" not string
```

## Class with Access Modifiers
- difficulty: medium

```typescript
class User {
  public name: string;
  private password: string;
  protected email: string;
  readonly id: number;

  constructor(name: string, email: string, password: string) {
    this.id = Date.now();
    this.name = name;
    this.email = email;
    this.password = password;
  }

  public greet(): string {
    return `Hello, ${this.name}`;
  }

  private hashPassword(): string {
    return `hashed_${this.password}`;
  }
}
```

## Abstract Class
- difficulty: hard

```typescript
abstract class Shape {
  abstract area(): number;
  abstract perimeter(): number;

  describe(): string {
    return `Area: ${this.area()}, Perimeter: ${this.perimeter()}`;
  }
}

class Rectangle extends Shape {
  constructor(private width: number, private height: number) {
    super();
  }

  area(): number {
    return this.width * this.height;
  }

  perimeter(): number {
    return 2 * (this.width + this.height);
  }
}

const rect = new Rectangle(5, 3);
console.log(rect.describe());
```

## Enum
- difficulty: easy

```typescript
enum Status {
  Pending = "PENDING",
  Approved = "APPROVED",
  Rejected = "REJECTED"
}

enum HttpStatus {
  OK = 200,
  NotFound = 404,
  ServerError = 500
}

const status: Status = Status.Pending;

if (status === Status.Pending) {
  console.log("Waiting for approval");
}

const code: HttpStatus = HttpStatus.OK;
```

## Const Enum
- difficulty: medium

```typescript
const enum Direction {
  Up = "UP",
  Down = "DOWN",
  Left = "LEFT",
  Right = "RIGHT"
}

const enum Priority {
  Low = 1,
  Medium = 2,
  High = 3
}

// Inlined at compile time - no runtime object
const dir = Direction.Up;
const priority = Priority.High;

function move(direction: Direction): void {
  console.log(`Moving ${direction}`);
}

move(Direction.Left);
```

## Discriminated Unions
- difficulty: hard

```typescript
type SuccessResult = {
  status: "success";
  data: unknown;
};

type ErrorResult = {
  status: "error";
  error: string;
};

type LoadingResult = {
  status: "loading";
};

type Result = SuccessResult | ErrorResult | LoadingResult;

function handleResult(result: Result): void {
  switch (result.status) {
    case "success":
      console.log(result.data);
      break;
    case "error":
      console.error(result.error);
      break;
    case "loading":
      console.log("Loading...");
      break;
  }
}
```

## Async Types
- difficulty: medium

```typescript
interface User {
  id: number;
  name: string;
}

async function fetchUser(id: number): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}

async function fetchUsers(): Promise<User[]> {
  const response = await fetch("/api/users");
  return response.json();
}

type AsyncFunction<T> = () => Promise<T>;
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

type UserType = UnwrapPromise<ReturnType<typeof fetchUser>>;
```

## Index Signatures
- difficulty: medium

```typescript
interface StringMap {
  [key: string]: string;
}

interface NumberMap {
  [key: string]: number;
  total: number;  // Must be compatible with index signature
}

type FlexibleObject = {
  id: number;
  name: string;
  [key: string]: string | number;
};

const translations: StringMap = {
  hello: "สวัสดี",
  goodbye: "ลาก่อน"
};
```

## Keyof and Typeof
- difficulty: medium

```typescript
const config = {
  apiUrl: "https://api.example.com",
  timeout: 5000,
  retries: 3
} as const;

type ConfigKeys = keyof typeof config;
// "apiUrl" | "timeout" | "retries"

type ConfigType = typeof config;

function getConfig<K extends ConfigKeys>(key: K): (typeof config)[K] {
  return config[key];
}

const url = getConfig("apiUrl");  // string
const timeout = getConfig("timeout");  // 5000 (literal type)
```

## ReturnType and Parameters
- difficulty: hard

```typescript
function createUser(name: string, age: number, active: boolean) {
  return { id: Date.now(), name, age, active };
}

type CreateUserReturn = ReturnType<typeof createUser>;
type CreateUserParams = Parameters<typeof createUser>;

// [string, number, boolean]
const params: CreateUserParams = ["John", 30, true];

// { id: number; name: string; age: number; active: boolean }
const user: CreateUserReturn = createUser(...params);

type FirstParam = CreateUserParams[0];  // string
```

## Awaited Type (TS 4.5+)
- difficulty: medium

```typescript
type A = Awaited<Promise<string>>;  // string
type B = Awaited<Promise<Promise<number>>>;  // number
type C = Awaited<string | Promise<number>>;  // string | number

async function fetchData(): Promise<{ id: number }> {
  return { id: 1 };
}

type FetchResult = Awaited<ReturnType<typeof fetchData>>;
// { id: number }

async function processAll<T>(promises: Promise<T>[]): Promise<Awaited<T>[]> {
  return Promise.all(promises);
}
```

## NoInfer (TS 5.4+)
- difficulty: hard

```typescript
function createStore<T>(initial: T, defaultValue: NoInfer<T>): T {
  return initial ?? defaultValue;
}

// Without NoInfer, T would be inferred as string | number
// With NoInfer, T is inferred only from 'initial'
const store = createStore("hello", "default");  // string

function compare<T>(a: T, b: NoInfer<T>): boolean {
  return a === b;
}

compare("hello", "world");  // OK
// compare("hello", 42);  // Error: number not assignable to string
```

## Iterator Helpers (TS 5.6+)
- difficulty: hard

```typescript
function* generateNumbers(max: number): Generator<number> {
  for (let i = 1; i <= max; i++) {
    yield i;
  }
}

const numbers = generateNumbers(100);

// Iterator helper methods (TS 5.6+)
const result = numbers
  .filter((n) => n % 2 === 0)
  .map((n) => n * 2)
  .take(5)
  .toArray();

console.log(result);  // [4, 8, 12, 16, 20]

// Also works with Iterator.from()
const mapped = Iterator.from([1, 2, 3])
  .map((x) => x * 10)
  .toArray();
```

## Module Declarations
- difficulty: medium

```typescript
// Declare module for CSS modules
declare module "*.css" {
  const classes: { [key: string]: string };
  export default classes;
}

// Declare module for images
declare module "*.png" {
  const src: string;
  export default src;
}

// Augment existing module
declare module "express" {
  interface Request {
    user?: { id: string; name: string };
  }
}
```

## Assertion Functions
- difficulty: hard

```typescript
function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== "string") {
    throw new Error("Value must be a string");
  }
}

function assertIsDefined<T>(value: T): asserts value is NonNullable<T> {
  if (value === null || value === undefined) {
    throw new Error("Value must be defined");
  }
}

function processValue(value: unknown): void {
  assertIsString(value);
  // value is now string
  console.log(value.toUpperCase());
}
```

## Decorators (TS 5.0+)
- difficulty: hard

```typescript
function logged<T extends (...args: unknown[]) => unknown>(
  target: T,
  context: ClassMethodDecoratorContext
): T {
  return function (this: unknown, ...args: unknown[]) {
    console.log(`Calling ${String(context.name)}`);
    const result = target.apply(this, args);
    console.log(`Finished ${String(context.name)}`);
    return result;
  } as T;
}

class Calculator {
  @logged
  add(a: number, b: number): number {
    return a + b;
  }
}

const calc = new Calculator();
calc.add(2, 3);
```

## Strict Null Checks
- difficulty: medium

```typescript
function getUser(id: number): User | null {
  return id === 1 ? { id: 1, name: "John" } : null;
}

const user = getUser(1);

// Must check for null
if (user) {
  console.log(user.name);
}

// Non-null assertion (use carefully!)
const name = user!.name;

// Optional chaining
const email = user?.email;

// Nullish coalescing
const displayName = user?.name ?? "Anonymous";
```

## Branded Types
- difficulty: hard

```typescript
type Brand<T, B> = T & { __brand: B };

type UserId = Brand<string, "UserId">;
type PostId = Brand<string, "PostId">;

function createUserId(id: string): UserId {
  return id as UserId;
}

function createPostId(id: string): PostId {
  return id as PostId;
}

function getUser(id: UserId): void {
  console.log(`Fetching user ${id}`);
}

const userId = createUserId("user-123");
const postId = createPostId("post-456");

getUser(userId);  // OK
// getUser(postId);  // Error! PostId not assignable to UserId
```

## Variadic Tuple Types
- difficulty: hard

```typescript
type Concat<T extends unknown[], U extends unknown[]> = [...T, ...U];

type A = Concat<[1, 2], [3, 4]>;  // [1, 2, 3, 4]

function concat<T extends unknown[], U extends unknown[]>(
  arr1: T,
  arr2: U
): [...T, ...U] {
  return [...arr1, ...arr2];
}

const result = concat([1, 2] as const, ["a", "b"] as const);
// readonly [1, 2, "a", "b"]

type Prepend<T, U extends unknown[]> = [T, ...U];
type Append<T extends unknown[], U> = [...T, U];
```

## Using Declaration (TS 5.2+)
- difficulty: hard

```typescript
class FileHandle implements Disposable {
  constructor(private filename: string) {
    console.log(`Opening ${filename}`);
  }

  read(): string {
    return "file contents";
  }

  [Symbol.dispose](): void {
    console.log(`Closing ${this.filename}`);
  }
}

function processFile(): void {
  using file = new FileHandle("data.txt");
  const content = file.read();
  console.log(content);
  // file is automatically disposed when scope exits
}

processFile();
```
