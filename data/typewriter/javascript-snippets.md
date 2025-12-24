# JavaScript Snippets

## Hello World
- difficulty: easy

```javascript
console.log("Hello, World!");
```

## Variables and Constants
- difficulty: easy

```javascript
const name = "John";
let age = 25;
const isActive = true;

console.log(name, age, isActive);
```

## Basic Function
- difficulty: easy

```javascript
function greet(name) {
  return "Hello, " + name + "!";
}

const message = greet("Alice");
console.log(message);
```

## Array Basics
- difficulty: easy

```javascript
const fruits = ["apple", "banana", "orange"];

fruits.push("grape");
console.log(fruits[0]);
console.log(fruits.length);
```

## For Loop
- difficulty: easy

```javascript
for (let i = 0; i < 5; i++) {
  console.log("Count: " + i);
}
```

## If Else Statement
- difficulty: easy

```javascript
const score = 85;

if (score >= 90) {
  console.log("Grade: A");
} else if (score >= 80) {
  console.log("Grade: B");
} else {
  console.log("Grade: C");
}
```

## Arrow Function
- difficulty: medium

```javascript
const multiply = (a, b) => a * b;

const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);

console.log(multiply(3, 4));
console.log(doubled);
```

## Object Methods
- difficulty: medium

```javascript
const user = {
  name: "John",
  age: 30,
  greet() {
    return `Hello, I'm ${this.name}`;
  }
};

console.log(user.greet());
console.log(Object.keys(user));
```

## Array Methods
- difficulty: medium

```javascript
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const evens = numbers.filter(n => n % 2 === 0);
const sum = numbers.reduce((acc, n) => acc + n, 0);
const found = numbers.find(n => n > 5);

console.log(evens, sum, found);
```

## Destructuring
- difficulty: medium

```javascript
const person = { name: "Alice", age: 25, city: "Tokyo" };
const { name, age } = person;

const colors = ["red", "green", "blue"];
const [first, second, third] = colors;

console.log(name, age);
console.log(first, second, third);
```

## Spread Operator
- difficulty: medium

```javascript
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];
const merged = [...arr1, ...arr2];

const obj1 = { a: 1, b: 2 };
const obj2 = { ...obj1, c: 3 };

console.log(merged);
console.log(obj2);
```

## Promise Basic
- difficulty: medium

```javascript
const fetchData = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({ id: 1, name: "Product" });
    }, 1000);
  });
};

fetchData()
  .then(data => console.log(data))
  .catch(err => console.error(err));
```

## Async Await
- difficulty: hard

```javascript
async function fetchUser(id) {
  try {
    const response = await fetch(`/api/users/${id}`);
    const user = await response.json();
    return user;
  } catch (error) {
    console.error("Failed to fetch user:", error);
    throw error;
  }
}

fetchUser(1).then(user => console.log(user));
```

## Closure
- difficulty: hard

```javascript
function createCounter() {
  let count = 0;

  return {
    increment() {
      count++;
      return count;
    },
    decrement() {
      count--;
      return count;
    },
    getCount() {
      return count;
    }
  };
}

const counter = createCounter();
console.log(counter.increment());
console.log(counter.increment());
console.log(counter.getCount());
```

## Class with Inheritance
- difficulty: hard

```javascript
class Animal {
  constructor(name) {
    this.name = name;
  }

  speak() {
    console.log(`${this.name} makes a sound.`);
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name);
    this.breed = breed;
  }

  speak() {
    console.log(`${this.name} barks!`);
  }
}

const dog = new Dog("Max", "Labrador");
dog.speak();
```

## Higher Order Function
- difficulty: hard

```javascript
function withLogging(fn) {
  return function(...args) {
    console.log(`Calling with args: ${args}`);
    const result = fn(...args);
    console.log(`Result: ${result}`);
    return result;
  };
}

const add = (a, b) => a + b;
const loggedAdd = withLogging(add);

loggedAdd(5, 3);
```

## Debounce Function
- difficulty: hard

```javascript
function debounce(func, delay) {
  let timeoutId;

  return function(...args) {
    clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

const handleSearch = debounce((query) => {
  console.log("Searching for:", query);
}, 300);

handleSearch("javascript");
```

## DOM Query Selector
- difficulty: medium

```javascript
const button = document.querySelector("#submit-btn");
const items = document.querySelectorAll(".list-item");

button.textContent = "Click Me";
button.classList.add("active");

items.forEach(item => {
  item.style.color = "blue";
});
```

## Event Listeners
- difficulty: medium

```javascript
const button = document.querySelector("#myButton");
const input = document.querySelector("#myInput");

button.addEventListener("click", (event) => {
  console.log("Button clicked!", event.target);
});

input.addEventListener("input", (event) => {
  console.log("Input value:", event.target.value);
});

input.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    console.log("Enter pressed!");
  }
});
```

## Create DOM Elements
- difficulty: medium

```javascript
const container = document.querySelector("#container");

const div = document.createElement("div");
div.className = "card";
div.innerHTML = `
  <h2>Title</h2>
  <p>Description here</p>
`;

container.appendChild(div);
container.insertBefore(div, container.firstChild);
```

## Fetch GET Request
- difficulty: medium

```javascript
async function getUsers() {
  const response = await fetch("https://api.example.com/users");

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const users = await response.json();
  return users;
}

getUsers()
  .then(users => console.log(users))
  .catch(error => console.error(error));
```

## Fetch POST Request
- difficulty: hard

```javascript
async function createUser(userData) {
  const response = await fetch("https://api.example.com/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer token123"
    },
    body: JSON.stringify(userData)
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

createUser({ name: "John", email: "john@example.com" });
```

## Local Storage
- difficulty: easy

```javascript
localStorage.setItem("username", "john_doe");
localStorage.setItem("user", JSON.stringify({ id: 1, name: "John" }));

const username = localStorage.getItem("username");
const user = JSON.parse(localStorage.getItem("user"));

console.log(username, user);

localStorage.removeItem("username");
localStorage.clear();
```

## Session Storage
- difficulty: easy

```javascript
sessionStorage.setItem("token", "abc123");
sessionStorage.setItem("cart", JSON.stringify([1, 2, 3]));

const token = sessionStorage.getItem("token");
const cart = JSON.parse(sessionStorage.getItem("cart"));

console.log(token, cart);

sessionStorage.removeItem("token");
```

## Regular Expression Basics
- difficulty: medium

```javascript
const email = "test@example.com";
const phone = "123-456-7890";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;

console.log(emailRegex.test(email));
console.log(phoneRegex.test(phone));

const text = "Hello World";
console.log(text.match(/\w+/g));
```

## Regex Replace and Extract
- difficulty: hard

```javascript
const text = "Call me at 123-456-7890 or 098-765-4321";
const masked = text.replace(/\d{3}-\d{3}-(\d{4})/g, "***-***-$1");

const html = "<p>Hello</p><span>World</span>";
const stripped = html.replace(/<[^>]*>/g, "");

const url = "https://example.com/users/123/posts/456";
const ids = url.match(/\d+/g);

console.log(masked);
console.log(stripped);
console.log(ids);
```

## ES6 Modules Export
- difficulty: medium

```javascript
export const API_URL = "https://api.example.com";

export function formatDate(date) {
  return date.toISOString().split("T")[0];
}

export class UserService {
  constructor(apiUrl) {
    this.apiUrl = apiUrl;
  }

  async getUser(id) {
    const res = await fetch(`${this.apiUrl}/users/${id}`);
    return res.json();
  }
}

export default UserService;
```

## ES6 Modules Import
- difficulty: medium

```javascript
import UserService, { API_URL, formatDate } from "./userService.js";
import * as utils from "./utils.js";

const service = new UserService(API_URL);

console.log(formatDate(new Date()));
console.log(utils.capitalize("hello"));

service.getUser(1).then(user => console.log(user));
```

## setTimeout and setInterval
- difficulty: easy

```javascript
console.log("Start");

setTimeout(() => {
  console.log("After 2 seconds");
}, 2000);

let count = 0;
const intervalId = setInterval(() => {
  count++;
  console.log("Count:", count);

  if (count >= 5) {
    clearInterval(intervalId);
  }
}, 1000);

console.log("End");
```

## Event Loop Understanding
- difficulty: hard

```javascript
console.log("1 - Sync");

setTimeout(() => console.log("2 - Timeout"), 0);

Promise.resolve().then(() => console.log("3 - Promise"));

queueMicrotask(() => console.log("4 - Microtask"));

console.log("5 - Sync");

// Output: 1, 5, 3, 4, 2
```

## Map Data Structure
- difficulty: medium

```javascript
const userRoles = new Map();

userRoles.set("john", "admin");
userRoles.set("jane", "editor");
userRoles.set("bob", "viewer");

console.log(userRoles.get("john"));
console.log(userRoles.has("jane"));
console.log(userRoles.size);

userRoles.forEach((role, user) => {
  console.log(`${user}: ${role}`);
});

userRoles.delete("bob");
```

## Set Data Structure
- difficulty: medium

```javascript
const uniqueIds = new Set([1, 2, 3, 3, 4, 4, 5]);

uniqueIds.add(6);
uniqueIds.add(1);

console.log(uniqueIds.size);
console.log(uniqueIds.has(3));

const array = [...uniqueIds];
console.log(array);

uniqueIds.forEach(id => console.log(id));
uniqueIds.delete(1);
```

## Try Catch Finally
- difficulty: medium

```javascript
function parseJSON(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    return { success: true, data };
  } catch (error) {
    console.error("Parse error:", error.message);
    return { success: false, error: error.message };
  } finally {
    console.log("Parse attempt completed");
  }
}

console.log(parseJSON('{"name": "John"}'));
console.log(parseJSON('invalid json'));
```

## Custom Error Class
- difficulty: hard

```javascript
class ValidationError extends Error {
  constructor(field, message) {
    super(message);
    this.name = "ValidationError";
    this.field = field;
  }
}

function validateUser(user) {
  if (!user.email) {
    throw new ValidationError("email", "Email is required");
  }
  if (!user.email.includes("@")) {
    throw new ValidationError("email", "Invalid email format");
  }
  return true;
}

try {
  validateUser({ name: "John" });
} catch (error) {
  if (error instanceof ValidationError) {
    console.log(`${error.field}: ${error.message}`);
  }
}
```

## Optional Chaining
- difficulty: easy

```javascript
const user = {
  name: "John",
  address: {
    city: "Tokyo"
  }
};

console.log(user?.address?.city);
console.log(user?.profile?.avatar);
console.log(user?.getName?.());

const users = [{ name: "John" }];
console.log(users?.[0]?.name);
console.log(users?.[1]?.name);
```

## Nullish Coalescing
- difficulty: easy

```javascript
const name = null ?? "Anonymous";
const count = 0 ?? 10;
const empty = "" ?? "default";

console.log(name);
console.log(count);
console.log(empty);

const config = {
  timeout: undefined,
  retries: 0
};

const timeout = config.timeout ?? 5000;
const retries = config.retries ?? 3;

console.log(timeout, retries);
```

## Promise.all and Promise.race
- difficulty: hard

```javascript
const fetchUser = () => fetch("/api/user").then(r => r.json());
const fetchPosts = () => fetch("/api/posts").then(r => r.json());
const fetchComments = () => fetch("/api/comments").then(r => r.json());

Promise.all([fetchUser(), fetchPosts(), fetchComments()])
  .then(([user, posts, comments]) => {
    console.log(user, posts, comments);
  })
  .catch(error => console.error(error));

Promise.race([
  fetch("/api/fast"),
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Timeout")), 5000)
  )
]).then(response => console.log(response));
```

## Array Flat and FlatMap
- difficulty: medium

```javascript
const nested = [1, [2, 3], [4, [5, 6]]];

console.log(nested.flat());
console.log(nested.flat(2));

const sentences = ["Hello World", "Foo Bar"];
const words = sentences.flatMap(s => s.split(" "));

console.log(words);

const users = [
  { name: "John", hobbies: ["coding", "gaming"] },
  { name: "Jane", hobbies: ["reading", "music"] }
];

const allHobbies = users.flatMap(u => u.hobbies);
console.log(allHobbies);
```

## Object Methods Advanced
- difficulty: hard

```javascript
const source = { a: 1, b: 2 };
const target = { b: 3, c: 4 };

const merged = Object.assign({}, source, target);
console.log(merged);

const entries = Object.entries(source);
const fromEntries = Object.fromEntries([["x", 1], ["y", 2]]);

console.log(entries);
console.log(fromEntries);

const frozen = Object.freeze({ name: "John" });
const sealed = Object.seal({ age: 30 });

console.log(Object.isFrozen(frozen));
console.log(Object.isSealed(sealed));
```
