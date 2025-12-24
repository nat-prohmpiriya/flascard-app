# Svelte 5 Snippets

## Basic Component
- difficulty: easy
- description: Create a basic Svelte 5 component structure

```svelte
<script lang="ts">
  let count = $state(0);

  function increment() {
    count++;
  }
</script>

<button onclick={increment}>
  Count: {count}
</button>

<style>
  button {
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
  }
</style>
```

## $state Rune Basic
- difficulty: easy
- description: Declare reactive state with $state rune

```svelte
<script lang="ts">
  let name = $state("World");
  let count = $state(0);
  let isVisible = $state(true);
</script>

<input bind:value={name} />
<p>Hello, {name}!</p>
<p>Count: {count}</p>
<button onclick={() => count++}>Increment</button>
```

## $state with Objects
- difficulty: easy
- description: Use $state with objects for deep reactivity

```svelte
<script lang="ts">
  let user = $state({
    name: "John",
    email: "john@example.com",
    preferences: {
      theme: "dark",
      notifications: true
    }
  });
</script>

<input bind:value={user.name} />
<input bind:value={user.email} />
<label>
  <input type="checkbox" bind:checked={user.preferences.notifications} />
  Enable notifications
</label>
<p>User: {user.name} ({user.email})</p>
```

## $state with Arrays
- difficulty: easy
- description: Use $state with arrays for reactive lists

```svelte
<script lang="ts">
  let todos = $state([
    { id: 1, text: "Learn Svelte 5", done: false },
    { id: 2, text: "Build an app", done: false }
  ]);

  function addTodo(text: string) {
    todos.push({ id: Date.now(), text, done: false });
  }

  function removeTodo(id: number) {
    todos = todos.filter(t => t.id !== id);
  }
</script>

{#each todos as todo (todo.id)}
  <div>
    <input type="checkbox" bind:checked={todo.done} />
    <span class:done={todo.done}>{todo.text}</span>
    <button onclick={() => removeTodo(todo.id)}>Delete</button>
  </div>
{/each}
```

## $state.raw
- difficulty: medium
- description: Use $state.raw for non-deeply reactive state

```svelte
<script lang="ts">
  let largeDataset = $state.raw([
    { id: 1, values: [1, 2, 3, 4, 5] },
    { id: 2, values: [6, 7, 8, 9, 10] }
  ]);

  function updateDataset() {
    largeDataset = largeDataset.map(item => ({
      ...item,
      values: item.values.map(v => v * 2)
    }));
  }
</script>

<button onclick={updateDataset}>Double all values</button>
{#each largeDataset as item}
  <p>ID: {item.id}, Values: {item.values.join(", ")}</p>
{/each}
```

## $state.snapshot
- difficulty: medium
- description: Get a non-reactive snapshot of state

```svelte
<script lang="ts">
  let formData = $state({
    name: "",
    email: "",
    message: ""
  });

  function handleSubmit() {
    const snapshot = $state.snapshot(formData);
    console.log("Submitting:", snapshot);
    fetch("/api/contact", {
      method: "POST",
      body: JSON.stringify(snapshot)
    });
  }
</script>

<form onsubmit={handleSubmit}>
  <input bind:value={formData.name} placeholder="Name" />
  <input bind:value={formData.email} placeholder="Email" />
  <textarea bind:value={formData.message}></textarea>
  <button type="submit">Submit</button>
</form>
```

## $derived Rune Basic
- difficulty: easy
- description: Create derived reactive values with $derived

```svelte
<script lang="ts">
  let price = $state(100);
  let quantity = $state(2);
  let taxRate = $state(0.07);

  let subtotal = $derived(price * quantity);
  let tax = $derived(subtotal * taxRate);
  let total = $derived(subtotal + tax);
</script>

<input type="number" bind:value={price} />
<input type="number" bind:value={quantity} />
<p>Subtotal: ${subtotal.toFixed(2)}</p>
<p>Tax: ${tax.toFixed(2)}</p>
<p>Total: ${total.toFixed(2)}</p>
```

## $derived with Filtering
- difficulty: easy
- description: Use $derived to filter arrays reactively

```svelte
<script lang="ts">
  let todos = $state([
    { id: 1, text: "Learn Svelte", done: true },
    { id: 2, text: "Build app", done: false },
    { id: 3, text: "Deploy", done: false }
  ]);

  let filter = $state<"all" | "active" | "completed">("all");

  let filteredTodos = $derived(
    filter === "all"
      ? todos
      : filter === "active"
      ? todos.filter(t => !t.done)
      : todos.filter(t => t.done)
  );

  let remaining = $derived(todos.filter(t => !t.done).length);
</script>

<p>{remaining} items remaining</p>
<select bind:value={filter}>
  <option value="all">All</option>
  <option value="active">Active</option>
  <option value="completed">Completed</option>
</select>
{#each filteredTodos as todo (todo.id)}
  <p>{todo.text}</p>
{/each}
```

## $derived.by
- difficulty: medium
- description: Use $derived.by for complex derived values

```svelte
<script lang="ts">
  let items = $state([
    { name: "Apple", price: 1.5, quantity: 3 },
    { name: "Banana", price: 0.75, quantity: 5 },
    { name: "Orange", price: 2.0, quantity: 2 }
  ]);

  let cartSummary = $derived.by(() => {
    let totalItems = 0;
    let totalPrice = 0;
    let cheapestItem = items[0];
    let mostExpensiveItem = items[0];

    for (const item of items) {
      totalItems += item.quantity;
      totalPrice += item.price * item.quantity;
      if (item.price < cheapestItem.price) cheapestItem = item;
      if (item.price > mostExpensiveItem.price) mostExpensiveItem = item;
    }

    return { totalItems, totalPrice, cheapestItem, mostExpensiveItem };
  });
</script>

<p>Total items: {cartSummary.totalItems}</p>
<p>Total price: ${cartSummary.totalPrice.toFixed(2)}</p>
<p>Cheapest: {cartSummary.cheapestItem.name}</p>
<p>Most expensive: {cartSummary.mostExpensiveItem.name}</p>
```

## $effect Rune Basic
- difficulty: easy
- description: Run side effects with $effect rune

```svelte
<script lang="ts">
  let count = $state(0);
  let savedCount = $state(0);

  $effect(() => {
    console.log(`Count changed to: ${count}`);
  });

  $effect(() => {
    const timer = setTimeout(() => {
      savedCount = count;
    }, 1000);

    return () => clearTimeout(timer);
  });
</script>

<button onclick={() => count++}>Count: {count}</button>
<p>Saved (debounced): {savedCount}</p>
```

## $effect with Cleanup
- difficulty: medium
- description: Handle cleanup in effects for subscriptions

```svelte
<script lang="ts">
  let isConnected = $state(false);
  let messages = $state<string[]>([]);
  let roomId = $state("general");

  $effect(() => {
    const ws = new WebSocket(`wss://chat.example.com/${roomId}`);

    ws.onopen = () => {
      isConnected = true;
    };

    ws.onmessage = (event) => {
      messages = [...messages, event.data];
    };

    ws.onclose = () => {
      isConnected = false;
    };

    return () => {
      ws.close();
    };
  });
</script>

<p>Status: {isConnected ? "Connected" : "Disconnected"}</p>
<select bind:value={roomId}>
  <option value="general">General</option>
  <option value="random">Random</option>
</select>
{#each messages as message}
  <p>{message}</p>
{/each}
```

## $effect with DOM
- difficulty: medium
- description: Use $effect for DOM manipulation

```svelte
<script lang="ts">
  let canvas: HTMLCanvasElement;
  let color = $state("#ff0000");
  let size = $state(50);

  $effect(() => {
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, size, 0, Math.PI * 2);
    ctx.fill();
  });
</script>

<canvas bind:this={canvas} width={200} height={200}></canvas>
<input type="color" bind:value={color} />
<input type="range" bind:value={size} min={10} max={90} />
```

## $effect.pre
- difficulty: medium
- description: Run effect before DOM updates

```svelte
<script lang="ts">
  let messages = $state<string[]>([]);
  let container: HTMLDivElement;
  let shouldAutoScroll = $state(true);

  $effect.pre(() => {
    if (container && shouldAutoScroll) {
      const isAtBottom =
        container.scrollHeight - container.scrollTop <= container.clientHeight + 50;
      shouldAutoScroll = isAtBottom;
    }
  });

  $effect(() => {
    if (shouldAutoScroll && container) {
      container.scrollTop = container.scrollHeight;
    }
  });

  function addMessage() {
    messages = [...messages, `Message ${messages.length + 1}`];
  }
</script>

<div bind:this={container} class="messages">
  {#each messages as message}
    <p>{message}</p>
  {/each}
</div>
<button onclick={addMessage}>Add Message</button>
```

## $effect.tracking
- difficulty: hard
- description: Check if code is running in tracking context

```svelte
<script lang="ts">
  import { untrack } from "svelte";

  let count = $state(0);
  let logs = $state<string[]>([]);

  $effect(() => {
    if ($effect.tracking()) {
      logs = [...logs, `Effect tracked count: ${count}`];
    }

    untrack(() => {
      console.log("This won't trigger re-runs:", count);
    });
  });
</script>

<button onclick={() => count++}>Count: {count}</button>
{#each logs as log}
  <p>{log}</p>
{/each}
```

## $effect.root
- difficulty: hard
- description: Create effects outside component lifecycle

```svelte
<script lang="ts">
  let count = $state(0);
  let cleanup: (() => void) | undefined;

  function startTracking() {
    cleanup = $effect.root(() => {
      $effect(() => {
        console.log("Count in root effect:", count);
      });
    });
  }

  function stopTracking() {
    cleanup?.();
    cleanup = undefined;
  }
</script>

<button onclick={() => count++}>Count: {count}</button>
<button onclick={startTracking}>Start Tracking</button>
<button onclick={stopTracking}>Stop Tracking</button>
```

## $props Rune Basic
- difficulty: easy
- description: Define component props with $props rune

```svelte
<script lang="ts">
  interface Props {
    name: string;
    age?: number;
    greeting?: string;
  }

  let { name, age = 0, greeting = "Hello" }: Props = $props();
</script>

<p>{greeting}, {name}!</p>
{#if age > 0}
  <p>Age: {age}</p>
{/if}
```

## $props with Rest
- difficulty: medium
- description: Spread remaining props to element

```svelte
<script lang="ts">
  import type { HTMLButtonAttributes } from "svelte/elements";

  interface Props extends HTMLButtonAttributes {
    variant?: "primary" | "secondary" | "danger";
  }

  let { variant = "primary", children, ...rest }: Props = $props();
</script>

<button class="btn btn-{variant}" {...rest}>
  {@render children?.()}
</button>

<style>
  .btn-primary { background: blue; color: white; }
  .btn-secondary { background: gray; color: white; }
  .btn-danger { background: red; color: white; }
</style>
```

## $bindable Rune
- difficulty: medium
- description: Create two-way bindable props

```svelte
<script lang="ts">
  interface Props {
    value: string;
    onchange?: (value: string) => void;
  }

  let { value = $bindable(""), onchange }: Props = $props();

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    value = target.value;
    onchange?.(value);
  }
</script>

<input {value} oninput={handleInput} class="custom-input" />

<style>
  .custom-input {
    padding: 0.5rem;
    border: 2px solid #ccc;
    border-radius: 0.25rem;
  }
</style>
```

## $bindable with Fallback
- difficulty: medium
- description: Bindable prop with default fallback value

```svelte
<script lang="ts">
  let { count = $bindable(0) } = $props();
</script>

<button onclick={() => count++}>
  Count: {count}
</button>
```

## $inspect Rune
- difficulty: easy
- description: Debug reactive state with $inspect

```svelte
<script lang="ts">
  let user = $state({
    name: "John",
    settings: {
      theme: "dark"
    }
  });

  $inspect(user);

  $inspect(user).with((type, value) => {
    console.log(`${type}:`, value);
    if (type === "update") {
      console.trace("Value updated from:");
    }
  });
</script>

<input bind:value={user.name} />
<select bind:value={user.settings.theme}>
  <option value="light">Light</option>
  <option value="dark">Dark</option>
</select>
```

## $host Rune
- difficulty: hard
- description: Access host element in custom elements

```svelte
<svelte:options customElement="my-counter" />

<script lang="ts">
  let count = $state(0);

  $effect(() => {
    $host().dispatchEvent(
      new CustomEvent("countchange", { detail: count })
    );
  });
</script>

<button onclick={() => count++}>Count: {count}</button>
```

## Snippets Basic
- difficulty: medium
- description: Define reusable template snippets

```svelte
<script lang="ts">
  let items = $state(["Apple", "Banana", "Cherry"]);
</script>

{#snippet listItem(item: string, index: number)}
  <li class="item">
    {index + 1}. {item}
  </li>
{/snippet}

<ul>
  {#each items as item, i}
    {@render listItem(item, i)}
  {/each}
</ul>

<style>
  .item { padding: 0.5rem; }
</style>
```

## Snippets with Children
- difficulty: medium
- description: Use snippets for component composition

```svelte
<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    title: string;
    header?: Snippet;
    children: Snippet;
    footer?: Snippet;
  }

  let { title, header, children, footer }: Props = $props();
</script>

<div class="card">
  <div class="card-header">
    {#if header}
      {@render header()}
    {:else}
      <h2>{title}</h2>
    {/if}
  </div>

  <div class="card-body">
    {@render children()}
  </div>

  {#if footer}
    <div class="card-footer">
      {@render footer()}
    </div>
  {/if}
</div>
```

## Snippets with Parameters
- difficulty: medium
- description: Pass data to snippet through render

```svelte
<script lang="ts">
  import type { Snippet } from "svelte";

  interface User {
    id: number;
    name: string;
    email: string;
  }

  interface Props {
    users: User[];
    row: Snippet<[User, number]>;
  }

  let { users, row }: Props = $props();
</script>

<table>
  <tbody>
    {#each users as user, index}
      {@render row(user, index)}
    {/each}
  </tbody>
</table>
```

## Event Handlers
- difficulty: easy
- description: Handle events with new syntax

```svelte
<script lang="ts">
  let count = $state(0);
  let position = $state({ x: 0, y: 0 });

  function handleClick(event: MouseEvent) {
    count++;
    console.log("Clicked at:", event.clientX, event.clientY);
  }

  function handleMouseMove(event: MouseEvent) {
    position = { x: event.clientX, y: event.clientY };
  }
</script>

<button onclick={handleClick}>
  Clicked {count} times
</button>

<div
  onmousemove={handleMouseMove}
  style="height: 200px; background: #eee;"
>
  Position: {position.x}, {position.y}
</div>
```

## Event Handlers Inline
- difficulty: easy
- description: Use inline arrow functions for events

```svelte
<script lang="ts">
  let items = $state(["Item 1", "Item 2", "Item 3"]);
  let selected = $state<string | null>(null);
</script>

<ul>
  {#each items as item}
    <li
      onclick={() => selected = item}
      class:selected={selected === item}
    >
      {item}
    </li>
  {/each}
</ul>

<button onclick={() => items = [...items, `Item ${items.length + 1}`]}>
  Add Item
</button>
```

## Event Modifiers
- difficulty: medium
- description: Use event modifiers with new syntax

```svelte
<script lang="ts">
  function handleSubmit(event: SubmitEvent) {
    const formData = new FormData(event.target as HTMLFormElement);
    console.log("Form submitted:", Object.fromEntries(formData));
  }

  function handleClick() {
    console.log("Button clicked");
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Enter") {
      console.log("Enter pressed");
    }
  }
</script>

<form onsubmit|preventDefault={handleSubmit}>
  <input name="email" type="email" />
  <button type="submit">Submit</button>
</form>

<button onclick|once={handleClick}>
  Click once only
</button>

<div onkeydown|self={handleKeydown} tabindex="0">
  Press Enter here
</div>
```

## Event Forwarding
- difficulty: medium
- description: Forward events from child to parent

```svelte
<script lang="ts">
  interface Props {
    onclick?: (event: MouseEvent) => void;
    onhover?: () => void;
  }

  let { onclick, onhover }: Props = $props();
  let isHovered = $state(false);
</script>

<button
  {onclick}
  onmouseenter={() => { isHovered = true; onhover?.(); }}
  onmouseleave={() => isHovered = false}
  class:hovered={isHovered}
>
  <slot />
</button>
```

## If Else Blocks
- difficulty: easy
- description: Conditional rendering with if blocks

```svelte
<script lang="ts">
  let user = $state<{ name: string; role: string } | null>(null);
  let loading = $state(true);

  setTimeout(() => {
    loading = false;
    user = { name: "John", role: "admin" };
  }, 1000);
</script>

{#if loading}
  <p>Loading...</p>
{:else if user}
  <p>Welcome, {user.name}!</p>
  {#if user.role === "admin"}
    <p>You have admin privileges.</p>
  {/if}
{:else}
  <p>Please log in.</p>
{/if}
```

## Each Blocks
- difficulty: easy
- description: Iterate over arrays with each blocks

```svelte
<script lang="ts">
  interface Todo {
    id: number;
    text: string;
    done: boolean;
  }

  let todos = $state<Todo[]>([
    { id: 1, text: "Learn Svelte 5", done: false },
    { id: 2, text: "Build something", done: false }
  ]);
</script>

<ul>
  {#each todos as todo, index (todo.id)}
    <li>
      <input type="checkbox" bind:checked={todo.done} />
      <span class:done={todo.done}>{index + 1}. {todo.text}</span>
    </li>
  {:else}
    <li>No todos yet!</li>
  {/each}
</ul>

<style>
  .done { text-decoration: line-through; }
</style>
```

## Await Blocks
- difficulty: medium
- description: Handle promises with await blocks

```svelte
<script lang="ts">
  interface User {
    id: number;
    name: string;
    email: string;
  }

  let userId = $state(1);

  let userPromise = $derived(
    fetch(`https://jsonplaceholder.typicode.com/users/${userId}`)
      .then(r => r.json()) as Promise<User>
  );
</script>

<select bind:value={userId}>
  {#each [1, 2, 3, 4, 5] as id}
    <option value={id}>User {id}</option>
  {/each}
</select>

{#await userPromise}
  <p>Loading user...</p>
{:then user}
  <div>
    <h2>{user.name}</h2>
    <p>{user.email}</p>
  </div>
{:catch error}
  <p class="error">Error: {error.message}</p>
{/await}
```

## Key Blocks
- difficulty: medium
- description: Force component recreation with key blocks

```svelte
<script lang="ts">
  import FadeIn from "./FadeIn.svelte";

  let key = $state(0);
  let message = $state("Hello");

  function reset() {
    key++;
  }
</script>

{#key key}
  <FadeIn>
    <p>{message}</p>
  </FadeIn>
{/key}

<button onclick={reset}>Reset Animation</button>
<input bind:value={message} />
```

## Const Tag
- difficulty: easy
- description: Declare local constants in templates

```svelte
<script lang="ts">
  interface Product {
    name: string;
    price: number;
    quantity: number;
  }

  let products = $state<Product[]>([
    { name: "Apple", price: 1.5, quantity: 3 },
    { name: "Banana", price: 0.75, quantity: 5 }
  ]);
</script>

<ul>
  {#each products as product}
    {@const total = product.price * product.quantity}
    {@const isExpensive = total > 5}
    <li class:expensive={isExpensive}>
      {product.name}: ${total.toFixed(2)}
    </li>
  {/each}
</ul>
```

## HTML Tag
- difficulty: easy
- description: Render raw HTML content

```svelte
<script lang="ts">
  let htmlContent = $state("<strong>Bold</strong> and <em>italic</em>");
</script>

<div class="content">
  {@html htmlContent}
</div>

<textarea bind:value={htmlContent}></textarea>
```

## Debug Tag
- difficulty: easy
- description: Debug values in development

```svelte
<script lang="ts">
  let count = $state(0);
  let user = $state({ name: "John", active: true });
</script>

{@debug count, user}

<button onclick={() => count++}>Count: {count}</button>
<input bind:value={user.name} />
```

## Input Bindings
- difficulty: easy
- description: Two-way bind form inputs

```svelte
<script lang="ts">
  let text = $state("");
  let number = $state(0);
  let checked = $state(false);
  let selected = $state("option1");
  let multiSelected = $state<string[]>([]);
</script>

<input type="text" bind:value={text} />

<input type="number" bind:value={number} />

<input type="checkbox" bind:checked />

<input type="range" bind:value={number} min={0} max={100} />

<select bind:value={selected}>
  <option value="option1">Option 1</option>
  <option value="option2">Option 2</option>
</select>

<select multiple bind:value={multiSelected}>
  <option value="a">A</option>
  <option value="b">B</option>
  <option value="c">C</option>
</select>
```

## Group Bindings
- difficulty: medium
- description: Bind radio and checkbox groups

```svelte
<script lang="ts">
  let selectedColor = $state("red");
  let selectedFruits = $state<string[]>([]);
</script>

<h3>Select Color:</h3>
{#each ["red", "green", "blue"] as color}
  <label>
    <input type="radio" bind:group={selectedColor} value={color} />
    {color}
  </label>
{/each}
<p>Selected: {selectedColor}</p>

<h3>Select Fruits:</h3>
{#each ["apple", "banana", "cherry"] as fruit}
  <label>
    <input type="checkbox" bind:group={selectedFruits} value={fruit} />
    {fruit}
  </label>
{/each}
<p>Selected: {selectedFruits.join(", ")}</p>
```

## Element Bindings
- difficulty: medium
- description: Bind to DOM element properties

```svelte
<script lang="ts">
  let divWidth = $state(0);
  let divHeight = $state(0);
  let inputElement: HTMLInputElement;
  let videoElement: HTMLVideoElement;
  let currentTime = $state(0);
  let duration = $state(0);
  let paused = $state(true);
</script>

<div
  bind:clientWidth={divWidth}
  bind:clientHeight={divHeight}
  style="resize: both; overflow: auto; border: 1px solid black; padding: 1rem;"
>
  Resize me! {divWidth}x{divHeight}
</div>

<input bind:this={inputElement} />
<button onclick={() => inputElement.focus()}>Focus Input</button>

<video
  bind:this={videoElement}
  bind:currentTime
  bind:duration
  bind:paused
  src="/video.mp4"
>
  <track kind="captions" />
</video>
<p>Time: {currentTime.toFixed(1)} / {duration.toFixed(1)}</p>
```

## Component Bindings
- difficulty: medium
- description: Bind to component state

```svelte
<script lang="ts">
  import Counter from "./Counter.svelte";

  let counterValue = $state(0);
</script>

<Counter bind:count={counterValue} />
<p>Parent sees: {counterValue}</p>
```

## Actions Basic
- difficulty: medium
- description: Create custom element actions

```svelte
<script lang="ts">
  import type { Action } from "svelte/action";

  const clickOutside: Action<HTMLElement, () => void> = (node, callback) => {
    function handleClick(event: MouseEvent) {
      if (!node.contains(event.target as Node)) {
        callback();
      }
    }

    document.addEventListener("click", handleClick, true);

    return {
      destroy() {
        document.removeEventListener("click", handleClick, true);
      }
    };
  };

  let showDropdown = $state(false);
</script>

<div use:clickOutside={() => showDropdown = false}>
  <button onclick={() => showDropdown = !showDropdown}>
    Toggle Dropdown
  </button>
  {#if showDropdown}
    <div class="dropdown">Dropdown content</div>
  {/if}
</div>
```

## Actions with Parameters
- difficulty: medium
- description: Create actions with reactive parameters

```svelte
<script lang="ts">
  import type { Action } from "svelte/action";

  interface TooltipParams {
    text: string;
    position?: "top" | "bottom" | "left" | "right";
  }

  const tooltip: Action<HTMLElement, TooltipParams> = (node, params) => {
    let tooltipEl: HTMLDivElement | null = null;

    function show() {
      tooltipEl = document.createElement("div");
      tooltipEl.className = `tooltip tooltip-${params.position || "top"}`;
      tooltipEl.textContent = params.text;
      node.appendChild(tooltipEl);
    }

    function hide() {
      tooltipEl?.remove();
      tooltipEl = null;
    }

    node.addEventListener("mouseenter", show);
    node.addEventListener("mouseleave", hide);

    return {
      update(newParams: TooltipParams) {
        params = newParams;
        if (tooltipEl) {
          tooltipEl.textContent = params.text;
        }
      },
      destroy() {
        hide();
        node.removeEventListener("mouseenter", show);
        node.removeEventListener("mouseleave", hide);
      }
    };
  };

  let tooltipText = $state("Hover me!");
</script>

<button use:tooltip={{ text: tooltipText, position: "bottom" }}>
  Hover for tooltip
</button>
<input bind:value={tooltipText} placeholder="Tooltip text" />
```

## Transitions Basic
- difficulty: easy
- description: Add transitions to elements

```svelte
<script lang="ts">
  import { fade, fly, slide, scale } from "svelte/transition";

  let visible = $state(true);
</script>

<button onclick={() => visible = !visible}>Toggle</button>

{#if visible}
  <p transition:fade>Fade transition</p>
  <p transition:fly={{ y: 200, duration: 500 }}>Fly transition</p>
  <p transition:slide>Slide transition</p>
  <p transition:scale={{ start: 0.5 }}>Scale transition</p>
{/if}
```

## Transitions In/Out
- difficulty: medium
- description: Different transitions for enter and exit

```svelte
<script lang="ts">
  import { fly, fade } from "svelte/transition";

  let items = $state(["Item 1", "Item 2", "Item 3"]);

  function addItem() {
    items = [...items, `Item ${items.length + 1}`];
  }

  function removeItem(index: number) {
    items = items.filter((_, i) => i !== index);
  }
</script>

<button onclick={addItem}>Add Item</button>

<ul>
  {#each items as item, i (item)}
    <li
      in:fly={{ x: -200, duration: 300 }}
      out:fade={{ duration: 200 }}
    >
      {item}
      <button onclick={() => removeItem(i)}>Remove</button>
    </li>
  {/each}
</ul>
```

## Transition Events
- difficulty: medium
- description: Handle transition lifecycle events

```svelte
<script lang="ts">
  import { fly } from "svelte/transition";

  let visible = $state(true);
  let status = $state("");
</script>

<button onclick={() => visible = !visible}>Toggle</button>
<p>Status: {status}</p>

{#if visible}
  <div
    transition:fly={{ y: 200 }}
    onintrostart={() => status = "Intro starting"}
    onintroend={() => status = "Intro ended"}
    onoutrostart={() => status = "Outro starting"}
    onoutroend={() => status = "Outro ended"}
  >
    Watch my transitions!
  </div>
{/if}
```

## Custom Transition
- difficulty: hard
- description: Create custom transition function

```svelte
<script lang="ts">
  import type { TransitionConfig } from "svelte/transition";

  function typewriter(
    node: HTMLElement,
    { speed = 50 }: { speed?: number } = {}
  ): TransitionConfig {
    const text = node.textContent || "";
    const duration = text.length * speed;

    return {
      duration,
      tick: (t: number) => {
        const i = Math.trunc(text.length * t);
        node.textContent = text.slice(0, i);
      }
    };
  }

  let visible = $state(false);
</script>

<button onclick={() => visible = !visible}>Toggle</button>

{#if visible}
  <p transition:typewriter={{ speed: 30 }}>
    Hello! This text will appear one character at a time.
  </p>
{/if}
```

## Animate List
- difficulty: medium
- description: Animate list reordering with flip

```svelte
<script lang="ts">
  import { flip } from "svelte/animate";
  import { fade } from "svelte/transition";

  let items = $state([
    { id: 1, name: "Apple" },
    { id: 2, name: "Banana" },
    { id: 3, name: "Cherry" },
    { id: 4, name: "Date" }
  ]);

  function shuffle() {
    items = items.sort(() => Math.random() - 0.5);
  }

  function remove(id: number) {
    items = items.filter(item => item.id !== id);
  }
</script>

<button onclick={shuffle}>Shuffle</button>

<ul>
  {#each items as item (item.id)}
    <li
      animate:flip={{ duration: 300 }}
      transition:fade
    >
      {item.name}
      <button onclick={() => remove(item.id)}>×</button>
    </li>
  {/each}
</ul>
```

## Context API
- difficulty: medium
- description: Share data with context API

```svelte
<script lang="ts">
  import { setContext } from "svelte";

  interface ThemeContext {
    theme: string;
    toggleTheme: () => void;
  }

  let theme = $state("light");

  function toggleTheme() {
    theme = theme === "light" ? "dark" : "light";
  }

  setContext<ThemeContext>("theme", {
    get theme() { return theme; },
    toggleTheme
  });
</script>

<div class="app" class:dark={theme === "dark"}>
  <slot />
</div>
```

## Get Context
- difficulty: medium
- description: Consume context in child components

```svelte
<script lang="ts">
  import { getContext } from "svelte";

  interface ThemeContext {
    theme: string;
    toggleTheme: () => void;
  }

  const { theme, toggleTheme } = getContext<ThemeContext>("theme");
</script>

<button onclick={toggleTheme}>
  Current theme: {theme}
</button>
```

## Stores Basic
- difficulty: medium
- description: Use Svelte stores for global state

```svelte
<script lang="ts">
  import { writable, derived } from "svelte/store";

  const count = writable(0);
  const doubled = derived(count, $count => $count * 2);

  function increment() {
    count.update(n => n + 1);
  }
</script>

<button onclick={increment}>
  Count: {$count}, Doubled: {$doubled}
</button>
```

## Custom Store
- difficulty: hard
- description: Create custom store with methods

```svelte
<script lang="ts" context="module">
  import { writable } from "svelte/store";

  interface Todo {
    id: number;
    text: string;
    done: boolean;
  }

  function createTodoStore() {
    const { subscribe, set, update } = writable<Todo[]>([]);

    return {
      subscribe,
      add: (text: string) => {
        update(todos => [...todos, { id: Date.now(), text, done: false }]);
      },
      remove: (id: number) => {
        update(todos => todos.filter(t => t.id !== id));
      },
      toggle: (id: number) => {
        update(todos =>
          todos.map(t => t.id === id ? { ...t, done: !t.done } : t)
        );
      },
      reset: () => set([])
    };
  }

  export const todos = createTodoStore();
</script>

<script lang="ts">
  import { todos } from "./stores";

  let newTodo = $state("");

  function handleSubmit() {
    if (newTodo.trim()) {
      todos.add(newTodo);
      newTodo = "";
    }
  }
</script>

<form onsubmit|preventDefault={handleSubmit}>
  <input bind:value={newTodo} />
  <button type="submit">Add</button>
</form>

<ul>
  {#each $todos as todo (todo.id)}
    <li>
      <input type="checkbox" checked={todo.done} onchange={() => todos.toggle(todo.id)} />
      {todo.text}
      <button onclick={() => todos.remove(todo.id)}>Delete</button>
    </li>
  {/each}
</ul>
```

## onMount Lifecycle
- difficulty: easy
- description: Run code when component mounts

```svelte
<script lang="ts">
  import { onMount } from "svelte";

  let data = $state<string[]>([]);
  let loading = $state(true);

  onMount(async () => {
    const response = await fetch("https://api.example.com/data");
    data = await response.json();
    loading = false;

    return () => {
      console.log("Component unmounting");
    };
  });
</script>

{#if loading}
  <p>Loading...</p>
{:else}
  <ul>
    {#each data as item}
      <li>{item}</li>
    {/each}
  </ul>
{/if}
```

## onDestroy Lifecycle
- difficulty: easy
- description: Cleanup when component destroys

```svelte
<script lang="ts">
  import { onDestroy } from "svelte";

  let seconds = $state(0);

  const interval = setInterval(() => {
    seconds++;
  }, 1000);

  onDestroy(() => {
    clearInterval(interval);
  });
</script>

<p>Seconds: {seconds}</p>
```

## tick Function
- difficulty: medium
- description: Wait for DOM updates with tick

```svelte
<script lang="ts">
  import { tick } from "svelte";

  let text = $state("");
  let textarea: HTMLTextAreaElement;

  async function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Tab") {
      event.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      text = text.slice(0, start) + "\t" + text.slice(end);
      await tick();
      textarea.selectionStart = textarea.selectionEnd = start + 1;
    }
  }
</script>

<textarea
  bind:this={textarea}
  bind:value={text}
  onkeydown={handleKeydown}
></textarea>
```

## Class Directive
- difficulty: easy
- description: Conditionally apply CSS classes

```svelte
<script lang="ts">
  let active = $state(false);
  let disabled = $state(false);
  let size = $state<"small" | "medium" | "large">("medium");
</script>

<button
  class:active
  class:disabled
  class:small={size === "small"}
  class:large={size === "large"}
  onclick={() => active = !active}
>
  Toggle Active
</button>

<style>
  button { padding: 0.5rem 1rem; }
  .active { background: blue; color: white; }
  .disabled { opacity: 0.5; pointer-events: none; }
  .small { font-size: 0.75rem; }
  .large { font-size: 1.5rem; }
</style>
```

## Style Directive
- difficulty: easy
- description: Dynamically set inline styles

```svelte
<script lang="ts">
  let color = $state("#ff0000");
  let size = $state(16);
  let rotation = $state(0);
</script>

<div
  style:color
  style:font-size="{size}px"
  style:transform="rotate({rotation}deg)"
  style:--custom-property={color}
>
  Styled text
</div>

<input type="color" bind:value={color} />
<input type="range" bind:value={size} min={12} max={48} />
<input type="range" bind:value={rotation} min={0} max={360} />
```

## Special Elements
- difficulty: medium
- description: Use special Svelte elements

```svelte
<script lang="ts">
  let innerWidth = $state(0);
  let innerHeight = $state(0);
  let online = $state(true);
</script>

<svelte:window
  bind:innerWidth
  bind:innerHeight
  ononline={() => online = true}
  onoffline={() => online = false}
/>

<svelte:document onvisibilitychange={() => console.log("Visibility changed")} />

<svelte:body onmouseenter={() => console.log("Mouse entered body")} />

<svelte:head>
  <title>My App - {innerWidth}x{innerHeight}</title>
  <meta name="description" content="Dynamic meta" />
</svelte:head>

<p>Window: {innerWidth}x{innerHeight}</p>
<p>Online: {online}</p>
```

## Dynamic Component
- difficulty: medium
- description: Render component dynamically

```svelte
<script lang="ts">
  import Home from "./Home.svelte";
  import About from "./About.svelte";
  import Contact from "./Contact.svelte";
  import type { Component } from "svelte";

  const routes: Record<string, Component> = {
    home: Home,
    about: About,
    contact: Contact
  };

  let currentRoute = $state("home");
</script>

<nav>
  {#each Object.keys(routes) as route}
    <button
      onclick={() => currentRoute = route}
      class:active={currentRoute === route}
    >
      {route}
    </button>
  {/each}
</nav>

<svelte:component this={routes[currentRoute]} />
```

## SvelteKit Page
- difficulty: medium
- description: Create a SvelteKit page with load function

```svelte
<script lang="ts">
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
</script>

<h1>{data.title}</h1>
<ul>
  {#each data.items as item}
    <li>{item.name}</li>
  {/each}
</ul>
```

## SvelteKit Page Load
- difficulty: medium
- description: Server-side data loading in SvelteKit

```typescript
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, fetch }) => {
  const response = await fetch(`/api/posts/${params.id}`);
  const post = await response.json();

  return {
    post,
    title: post.title
  };
};
```

## SvelteKit Layout
- difficulty: medium
- description: Create shared layout in SvelteKit

```svelte
<script lang="ts">
  import type { LayoutData } from "./$types";
  import type { Snippet } from "svelte";

  interface Props {
    data: LayoutData;
    children: Snippet;
  }

  let { data, children }: Props = $props();
</script>

<header>
  <nav>
    <a href="/">Home</a>
    <a href="/about">About</a>
    {#if data.user}
      <span>Welcome, {data.user.name}</span>
    {/if}
  </nav>
</header>

<main>
  {@render children()}
</main>

<footer>
  <p>&copy; 2025 My App</p>
</footer>
```

## SvelteKit Form Actions
- difficulty: hard
- description: Handle forms with SvelteKit actions

```typescript
import type { Actions } from "./$types";
import { fail, redirect } from "@sveltejs/kit";

export const actions: Actions = {
  login: async ({ request, cookies }) => {
    const data = await request.formData();
    const email = data.get("email") as string;
    const password = data.get("password") as string;

    if (!email || !password) {
      return fail(400, { email, message: "Missing fields" });
    }

    const user = await authenticateUser(email, password);

    if (!user) {
      return fail(401, { email, message: "Invalid credentials" });
    }

    cookies.set("session", user.token, { path: "/" });
    throw redirect(303, "/dashboard");
  },

  logout: async ({ cookies }) => {
    cookies.delete("session", { path: "/" });
    throw redirect(303, "/");
  }
};
```

## SvelteKit Form Component
- difficulty: medium
- description: Use form actions in Svelte component

```svelte
<script lang="ts">
  import { enhance } from "$app/forms";
  import type { ActionData } from "./$types";

  let { form }: { form: ActionData } = $props();
  let loading = $state(false);
</script>

<form
  method="POST"
  action="?/login"
  use:enhance={() => {
    loading = true;
    return async ({ update }) => {
      loading = false;
      await update();
    };
  }}
>
  <input
    name="email"
    type="email"
    value={form?.email ?? ""}
    required
  />
  <input name="password" type="password" required />

  {#if form?.message}
    <p class="error">{form.message}</p>
  {/if}

  <button type="submit" disabled={loading}>
    {loading ? "Loading..." : "Login"}
  </button>
</form>
```

## SvelteKit API Route
- difficulty: medium
- description: Create API endpoints in SvelteKit

```typescript
import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ url, params }) => {
  const id = params.id;
  const includeDetails = url.searchParams.get("details") === "true";

  const item = await db.items.findUnique({ where: { id } });

  if (!item) {
    throw error(404, "Item not found");
  }

  return json({
    ...item,
    details: includeDetails ? await getDetails(id) : undefined
  });
};

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();

  const newItem = await db.items.create({
    data: body
  });

  return json(newItem, { status: 201 });
};

export const DELETE: RequestHandler = async ({ params }) => {
  await db.items.delete({ where: { id: params.id } });

  return new Response(null, { status: 204 });
};
```

## SvelteKit Hooks
- difficulty: hard
- description: Server hooks for auth and logging

```typescript
import type { Handle } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";

const authHook: Handle = async ({ event, resolve }) => {
  const session = event.cookies.get("session");

  if (session) {
    const user = await verifySession(session);
    event.locals.user = user;
  }

  return resolve(event);
};

const loggingHook: Handle = async ({ event, resolve }) => {
  const start = Date.now();

  const response = await resolve(event);

  const duration = Date.now() - start;
  console.log(`${event.request.method} ${event.url.pathname} - ${duration}ms`);

  return response;
};

export const handle = sequence(authHook, loggingHook);
```

## SvelteKit Error Handling
- difficulty: medium
- description: Handle errors in SvelteKit

```svelte
<script lang="ts">
  import { page } from "$app/stores";
</script>

<div class="error">
  <h1>{$page.status}</h1>
  <p>{$page.error?.message || "Something went wrong"}</p>
  <a href="/">Go back home</a>
</div>

<style>
  .error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
  }
</style>
```

## Async Svelte Experimental
- difficulty: hard
- description: Use async reactivity (experimental in 2025)

```svelte
<script lang="ts">
  interface User {
    id: number;
    name: string;
  }

  let userId = $state(1);

  async function fetchUser(id: number): Promise<User> {
    const res = await fetch(`/api/users/${id}`);
    return res.json();
  }

  let user = $derived(await fetchUser(userId));
</script>

<select bind:value={userId}>
  {#each [1, 2, 3] as id}
    <option value={id}>User {id}</option>
  {/each}
</select>

{#if user}
  <p>Name: {user.name}</p>
{/if}
```

## Component Testing
- difficulty: hard
- description: Test Svelte 5 components

```typescript
import { render, fireEvent } from "@testing-library/svelte";
import { expect, test } from "vitest";
import Counter from "./Counter.svelte";

test("increments count when button is clicked", async () => {
  const { getByText, getByRole } = render(Counter, {
    props: { initialCount: 0 }
  });

  const button = getByRole("button");
  expect(getByText("Count: 0")).toBeTruthy();

  await fireEvent.click(button);
  expect(getByText("Count: 1")).toBeTruthy();

  await fireEvent.click(button);
  expect(getByText("Count: 2")).toBeTruthy();
});

test("accepts initial count prop", () => {
  const { getByText } = render(Counter, {
    props: { initialCount: 10 }
  });

  expect(getByText("Count: 10")).toBeTruthy();
});
```

## TypeScript Generics
- difficulty: hard
- description: Create generic typed components

```svelte
<script lang="ts" generics="T extends { id: string | number }">
  import type { Snippet } from "svelte";

  interface Props {
    items: T[];
    row: Snippet<[T]>;
    keyFn?: (item: T) => string | number;
  }

  let { items, row, keyFn = (item) => item.id }: Props = $props();
</script>

<ul>
  {#each items as item (keyFn(item))}
    <li>
      {@render row(item)}
    </li>
  {/each}
</ul>
```

## Runes Migration
- difficulty: medium
- description: Migrate from Svelte 4 to Svelte 5 runes

```svelte
<script lang="ts">
  // Before (Svelte 4)
  // export let name = 'World';
  // let count = 0;
  // $: doubled = count * 2;
  // $: console.log(count);

  // After (Svelte 5)
  let { name = "World" } = $props();
  let count = $state(0);
  let doubled = $derived(count * 2);

  $effect(() => {
    console.log(count);
  });
</script>

<h1>Hello {name}!</h1>
<p>Count: {count}</p>
<p>Doubled: {doubled}</p>
<button onclick={() => count++}>Increment</button>
```
