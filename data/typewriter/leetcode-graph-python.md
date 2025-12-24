# LeetCode Graph Patterns - Python

## BFS - Shortest Path (Unweighted)

```python
from collections import deque

def shortest_path(graph: dict[int, list[int]], start: int, end: int) -> int:
    if start == end:
        return 0

    visited = {start}
    queue = deque([(start, 0)])

    while queue:
        node, distance = queue.popleft()
        for neighbor in graph[node]:
            if neighbor == end:
                return distance + 1
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append((neighbor, distance + 1))

    return -1
```

## BFS - Level Order on Graph

```python
from collections import deque

def bfs_levels(graph: dict[int, list[int]], start: int) -> list[list[int]]:
    visited = {start}
    queue = deque([start])
    levels = []

    while queue:
        level = []
        for _ in range(len(queue)):
            node = queue.popleft()
            level.append(node)
            for neighbor in graph[node]:
                if neighbor not in visited:
                    visited.add(neighbor)
                    queue.append(neighbor)
        levels.append(level)

    return levels
```

## DFS - Connected Components

```python
def count_components(n: int, edges: list[list[int]]) -> int:
    graph = {i: [] for i in range(n)}
    for u, v in edges:
        graph[u].append(v)
        graph[v].append(u)

    visited = set()
    components = 0

    def dfs(node: int) -> None:
        visited.add(node)
        for neighbor in graph[node]:
            if neighbor not in visited:
                dfs(neighbor)

    for node in range(n):
        if node not in visited:
            dfs(node)
            components += 1

    return components
```

## DFS - Detect Cycle in Undirected Graph

```python
def has_cycle_undirected(n: int, edges: list[list[int]]) -> bool:
    graph = {i: [] for i in range(n)}
    for u, v in edges:
        graph[u].append(v)
        graph[v].append(u)

    visited = set()

    def dfs(node: int, parent: int) -> bool:
        visited.add(node)
        for neighbor in graph[node]:
            if neighbor not in visited:
                if dfs(neighbor, node):
                    return True
            elif neighbor != parent:
                return True
        return False

    for node in range(n):
        if node not in visited:
            if dfs(node, -1):
                return True

    return False
```

## DFS - Detect Cycle in Directed Graph

```python
def has_cycle_directed(n: int, edges: list[list[int]]) -> bool:
    graph = {i: [] for i in range(n)}
    for u, v in edges:
        graph[u].append(v)

    WHITE, GRAY, BLACK = 0, 1, 2
    color = [WHITE] * n

    def dfs(node: int) -> bool:
        color[node] = GRAY
        for neighbor in graph[node]:
            if color[neighbor] == GRAY:
                return True
            if color[neighbor] == WHITE and dfs(neighbor):
                return True
        color[node] = BLACK
        return False

    for node in range(n):
        if color[node] == WHITE:
            if dfs(node):
                return True

    return False
```

## Topological Sort - DFS

```python
def topological_sort(n: int, edges: list[list[int]]) -> list[int]:
    graph = {i: [] for i in range(n)}
    for u, v in edges:
        graph[u].append(v)

    visited = set()
    result = []

    def dfs(node: int) -> None:
        visited.add(node)
        for neighbor in graph[node]:
            if neighbor not in visited:
                dfs(neighbor)
        result.append(node)

    for node in range(n):
        if node not in visited:
            dfs(node)

    return result[::-1]
```

## Topological Sort - Kahn's Algorithm (BFS)

```python
from collections import deque

def topological_sort_bfs(n: int, edges: list[list[int]]) -> list[int]:
    graph = {i: [] for i in range(n)}
    in_degree = [0] * n

    for u, v in edges:
        graph[u].append(v)
        in_degree[v] += 1

    queue = deque([node for node in range(n) if in_degree[node] == 0])
    result = []

    while queue:
        node = queue.popleft()
        result.append(node)
        for neighbor in graph[node]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)

    return result if len(result) == n else []
```

## Course Schedule (Cycle Detection)

```python
from collections import deque

def can_finish(num_courses: int, prerequisites: list[list[int]]) -> bool:
    graph = {i: [] for i in range(num_courses)}
    in_degree = [0] * num_courses

    for course, prereq in prerequisites:
        graph[prereq].append(course)
        in_degree[course] += 1

    queue = deque([i for i in range(num_courses) if in_degree[i] == 0])
    count = 0

    while queue:
        node = queue.popleft()
        count += 1
        for neighbor in graph[node]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)

    return count == num_courses
```

## Union-Find (Disjoint Set)

```python
class UnionFind:
    def __init__(self, n: int):
        self.parent = list(range(n))
        self.rank = [0] * n

    def find(self, x: int) -> int:
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])
        return self.parent[x]

    def union(self, x: int, y: int) -> bool:
        px, py = self.find(x), self.find(y)
        if px == py:
            return False
        if self.rank[px] < self.rank[py]:
            px, py = py, px
        self.parent[py] = px
        if self.rank[px] == self.rank[py]:
            self.rank[px] += 1
        return True

    def connected(self, x: int, y: int) -> bool:
        return self.find(x) == self.find(y)
```

## Number of Islands

```python
def num_islands(grid: list[list[str]]) -> int:
    if not grid:
        return 0

    m, n = len(grid), len(grid[0])
    count = 0

    def dfs(i: int, j: int) -> None:
        if i < 0 or i >= m or j < 0 or j >= n or grid[i][j] != '1':
            return
        grid[i][j] = '0'
        dfs(i + 1, j)
        dfs(i - 1, j)
        dfs(i, j + 1)
        dfs(i, j - 1)

    for i in range(m):
        for j in range(n):
            if grid[i][j] == '1':
                dfs(i, j)
                count += 1

    return count
```

## Number of Islands - BFS

```python
from collections import deque

def num_islands_bfs(grid: list[list[str]]) -> int:
    if not grid:
        return 0

    m, n = len(grid), len(grid[0])
    count = 0
    directions = [(0, 1), (0, -1), (1, 0), (-1, 0)]

    def bfs(start_i: int, start_j: int) -> None:
        queue = deque([(start_i, start_j)])
        grid[start_i][start_j] = '0'
        while queue:
            i, j = queue.popleft()
            for di, dj in directions:
                ni, nj = i + di, j + dj
                if 0 <= ni < m and 0 <= nj < n and grid[ni][nj] == '1':
                    grid[ni][nj] = '0'
                    queue.append((ni, nj))

    for i in range(m):
        for j in range(n):
            if grid[i][j] == '1':
                bfs(i, j)
                count += 1

    return count
```

## Surrounded Regions

```python
def solve(board: list[list[str]]) -> None:
    if not board:
        return

    m, n = len(board), len(board[0])

    def dfs(i: int, j: int) -> None:
        if i < 0 or i >= m or j < 0 or j >= n or board[i][j] != 'O':
            return
        board[i][j] = 'T'
        dfs(i + 1, j)
        dfs(i - 1, j)
        dfs(i, j + 1)
        dfs(i, j - 1)

    for i in range(m):
        dfs(i, 0)
        dfs(i, n - 1)
    for j in range(n):
        dfs(0, j)
        dfs(m - 1, j)

    for i in range(m):
        for j in range(n):
            if board[i][j] == 'O':
                board[i][j] = 'X'
            elif board[i][j] == 'T':
                board[i][j] = 'O'
```

## Clone Graph

```python
class GraphNode:
    def __init__(self, val=0, neighbors=None):
        self.val = val
        self.neighbors = neighbors if neighbors else []

def clone_graph(node: GraphNode) -> GraphNode:
    if not node:
        return None

    visited = {}

    def dfs(node: GraphNode) -> GraphNode:
        if node in visited:
            return visited[node]

        clone = GraphNode(node.val)
        visited[node] = clone

        for neighbor in node.neighbors:
            clone.neighbors.append(dfs(neighbor))

        return clone

    return dfs(node)
```

## Pacific Atlantic Water Flow

```python
def pacific_atlantic(heights: list[list[int]]) -> list[list[int]]:
    if not heights:
        return []

    m, n = len(heights), len(heights[0])
    pacific = set()
    atlantic = set()

    def dfs(i: int, j: int, visited: set, prev_height: int) -> None:
        if (i, j) in visited or i < 0 or i >= m or j < 0 or j >= n:
            return
        if heights[i][j] < prev_height:
            return
        visited.add((i, j))
        dfs(i + 1, j, visited, heights[i][j])
        dfs(i - 1, j, visited, heights[i][j])
        dfs(i, j + 1, visited, heights[i][j])
        dfs(i, j - 1, visited, heights[i][j])

    for i in range(m):
        dfs(i, 0, pacific, heights[i][0])
        dfs(i, n - 1, atlantic, heights[i][n - 1])
    for j in range(n):
        dfs(0, j, pacific, heights[0][j])
        dfs(m - 1, j, atlantic, heights[m - 1][j])

    return list(pacific & atlantic)
```

## Word Ladder - BFS

```python
from collections import deque

def ladder_length(begin_word: str, end_word: str, word_list: list[str]) -> int:
    word_set = set(word_list)
    if end_word not in word_set:
        return 0

    queue = deque([(begin_word, 1)])
    visited = {begin_word}

    while queue:
        word, length = queue.popleft()
        if word == end_word:
            return length

        for i in range(len(word)):
            for c in 'abcdefghijklmnopqrstuvwxyz':
                new_word = word[:i] + c + word[i + 1:]
                if new_word in word_set and new_word not in visited:
                    visited.add(new_word)
                    queue.append((new_word, length + 1))

    return 0
```

## Dijkstra's Algorithm

```python
import heapq

def dijkstra(graph: dict[int, list[tuple[int, int]]], start: int, n: int) -> list[int]:
    dist = [float('inf')] * n
    dist[start] = 0
    heap = [(0, start)]

    while heap:
        d, node = heapq.heappop(heap)
        if d > dist[node]:
            continue
        for neighbor, weight in graph[node]:
            new_dist = dist[node] + weight
            if new_dist < dist[neighbor]:
                dist[neighbor] = new_dist
                heapq.heappush(heap, (new_dist, neighbor))

    return dist
```

## Network Delay Time

```python
import heapq

def network_delay_time(times: list[list[int]], n: int, k: int) -> int:
    graph = {i: [] for i in range(1, n + 1)}
    for u, v, w in times:
        graph[u].append((v, w))

    dist = {i: float('inf') for i in range(1, n + 1)}
    dist[k] = 0
    heap = [(0, k)]

    while heap:
        d, node = heapq.heappop(heap)
        if d > dist[node]:
            continue
        for neighbor, weight in graph[node]:
            new_dist = dist[node] + weight
            if new_dist < dist[neighbor]:
                dist[neighbor] = new_dist
                heapq.heappush(heap, (new_dist, neighbor))

    max_time = max(dist.values())
    return max_time if max_time != float('inf') else -1
```

## Bellman-Ford Algorithm

```python
def bellman_ford(n: int, edges: list[list[int]], start: int) -> list[int]:
    dist = [float('inf')] * n
    dist[start] = 0

    for _ in range(n - 1):
        for u, v, w in edges:
            if dist[u] != float('inf') and dist[u] + w < dist[v]:
                dist[v] = dist[u] + w

    for u, v, w in edges:
        if dist[u] != float('inf') and dist[u] + w < dist[v]:
            return []

    return dist
```

## Minimum Spanning Tree - Kruskal

```python
def kruskal_mst(n: int, edges: list[list[int]]) -> int:
    edges.sort(key=lambda x: x[2])
    parent = list(range(n))

    def find(x: int) -> int:
        if parent[x] != x:
            parent[x] = find(parent[x])
        return parent[x]

    def union(x: int, y: int) -> bool:
        px, py = find(x), find(y)
        if px == py:
            return False
        parent[px] = py
        return True

    mst_weight = 0
    edges_used = 0

    for u, v, w in edges:
        if union(u, v):
            mst_weight += w
            edges_used += 1
            if edges_used == n - 1:
                break

    return mst_weight if edges_used == n - 1 else -1
```

## Bipartite Graph Check

```python
from collections import deque

def is_bipartite(graph: list[list[int]]) -> bool:
    n = len(graph)
    color = [-1] * n

    for start in range(n):
        if color[start] != -1:
            continue
        queue = deque([start])
        color[start] = 0

        while queue:
            node = queue.popleft()
            for neighbor in graph[node]:
                if color[neighbor] == -1:
                    color[neighbor] = 1 - color[node]
                    queue.append(neighbor)
                elif color[neighbor] == color[node]:
                    return False

    return True
```

## Alien Dictionary

```python
from collections import deque

def alien_order(words: list[str]) -> str:
    graph = {c: set() for word in words for c in word}
    in_degree = {c: 0 for c in graph}

    for i in range(len(words) - 1):
        w1, w2 = words[i], words[i + 1]
        min_len = min(len(w1), len(w2))
        if len(w1) > len(w2) and w1[:min_len] == w2[:min_len]:
            return ""
        for j in range(min_len):
            if w1[j] != w2[j]:
                if w2[j] not in graph[w1[j]]:
                    graph[w1[j]].add(w2[j])
                    in_degree[w2[j]] += 1
                break

    queue = deque([c for c in in_degree if in_degree[c] == 0])
    result = []

    while queue:
        c = queue.popleft()
        result.append(c)
        for neighbor in graph[c]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)

    return ''.join(result) if len(result) == len(graph) else ""
```
