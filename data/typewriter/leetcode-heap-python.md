# LeetCode Heap Patterns - Python

## Heap Basics - heapq Module

```python
import heapq

nums = [3, 1, 4, 1, 5, 9, 2, 6]

heapq.heapify(nums)

heapq.heappush(nums, 0)

smallest = heapq.heappop(nums)

k_smallest = heapq.nsmallest(3, nums)
k_largest = heapq.nlargest(3, nums)
```

## Max Heap using Negation

```python
import heapq

class MaxHeap:
    def __init__(self):
        self.heap = []

    def push(self, val: int) -> None:
        heapq.heappush(self.heap, -val)

    def pop(self) -> int:
        return -heapq.heappop(self.heap)

    def peek(self) -> int:
        return -self.heap[0]

    def __len__(self) -> int:
        return len(self.heap)
```

## Kth Largest Element

```python
import heapq

def find_kth_largest(nums: list[int], k: int) -> int:
    heap = []

    for num in nums:
        heapq.heappush(heap, num)
        if len(heap) > k:
            heapq.heappop(heap)

    return heap[0]
```

## Kth Smallest Element

```python
import heapq

def find_kth_smallest(nums: list[int], k: int) -> int:
    heap = [-num for num in nums[:k]]
    heapq.heapify(heap)

    for num in nums[k:]:
        if -num > heap[0]:
            heapq.heapreplace(heap, -num)

    return -heap[0]
```

## Top K Frequent Elements

```python
import heapq
from collections import Counter

def top_k_frequent(nums: list[int], k: int) -> list[int]:
    count = Counter(nums)
    return heapq.nlargest(k, count.keys(), key=count.get)
```

## Top K Frequent Elements - Min Heap

```python
import heapq
from collections import Counter

def top_k_frequent_heap(nums: list[int], k: int) -> list[int]:
    count = Counter(nums)
    heap = []

    for num, freq in count.items():
        heapq.heappush(heap, (freq, num))
        if len(heap) > k:
            heapq.heappop(heap)

    return [num for freq, num in heap]
```

## K Closest Points to Origin

```python
import heapq

def k_closest(points: list[list[int]], k: int) -> list[list[int]]:
    heap = []

    for x, y in points:
        dist = -(x * x + y * y)
        heapq.heappush(heap, (dist, x, y))
        if len(heap) > k:
            heapq.heappop(heap)

    return [[x, y] for dist, x, y in heap]
```

## Merge K Sorted Lists

```python
import heapq
from typing import Optional

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def merge_k_lists(lists: list[Optional[ListNode]]) -> Optional[ListNode]:
    heap = []
    for i, node in enumerate(lists):
        if node:
            heapq.heappush(heap, (node.val, i, node))

    dummy = ListNode()
    current = dummy

    while heap:
        val, i, node = heapq.heappop(heap)
        current.next = node
        current = current.next
        if node.next:
            heapq.heappush(heap, (node.next.val, i, node.next))

    return dummy.next
```

## Merge K Sorted Arrays

```python
import heapq

def merge_k_sorted_arrays(arrays: list[list[int]]) -> list[int]:
    heap = []

    for i, arr in enumerate(arrays):
        if arr:
            heapq.heappush(heap, (arr[0], i, 0))

    result = []

    while heap:
        val, arr_idx, elem_idx = heapq.heappop(heap)
        result.append(val)

        if elem_idx + 1 < len(arrays[arr_idx]):
            next_val = arrays[arr_idx][elem_idx + 1]
            heapq.heappush(heap, (next_val, arr_idx, elem_idx + 1))

    return result
```

## Find Median from Data Stream (Two Heaps)

```python
import heapq

class MedianFinder:
    def __init__(self):
        self.small = []
        self.large = []

    def add_num(self, num: int) -> None:
        heapq.heappush(self.small, -num)
        heapq.heappush(self.large, -heapq.heappop(self.small))

        if len(self.large) > len(self.small):
            heapq.heappush(self.small, -heapq.heappop(self.large))

    def find_median(self) -> float:
        if len(self.small) > len(self.large):
            return -self.small[0]
        return (-self.small[0] + self.large[0]) / 2
```

## Sliding Window Median

```python
import heapq
from collections import defaultdict

def median_sliding_window(nums: list[int], k: int) -> list[float]:
    small = []
    large = []
    removed = defaultdict(int)
    result = []

    for i in range(k):
        heapq.heappush(small, -nums[i])

    for _ in range(k // 2):
        heapq.heappush(large, -heapq.heappop(small))

    def get_median() -> float:
        if k % 2:
            return -small[0]
        return (-small[0] + large[0]) / 2

    result.append(get_median())

    for i in range(k, len(nums)):
        out_num = nums[i - k]
        in_num = nums[i]
        removed[out_num] += 1
        balance = -1 if out_num <= -small[0] else 1

        if in_num <= -small[0]:
            heapq.heappush(small, -in_num)
            balance += 1
        else:
            heapq.heappush(large, in_num)
            balance -= 1

        if balance < 0:
            heapq.heappush(small, -heapq.heappop(large))
        elif balance > 0:
            heapq.heappush(large, -heapq.heappop(small))

        while small and removed[-small[0]]:
            removed[-small[0]] -= 1
            heapq.heappop(small)
        while large and removed[large[0]]:
            removed[large[0]] -= 1
            heapq.heappop(large)

        result.append(get_median())

    return result
```

## Kth Largest Element in Stream

```python
import heapq

class KthLargest:
    def __init__(self, k: int, nums: list[int]):
        self.k = k
        self.heap = nums
        heapq.heapify(self.heap)
        while len(self.heap) > k:
            heapq.heappop(self.heap)

    def add(self, val: int) -> int:
        heapq.heappush(self.heap, val)
        if len(self.heap) > self.k:
            heapq.heappop(self.heap)
        return self.heap[0]
```

## Last Stone Weight

```python
import heapq

def last_stone_weight(stones: list[int]) -> int:
    heap = [-s for s in stones]
    heapq.heapify(heap)

    while len(heap) > 1:
        first = -heapq.heappop(heap)
        second = -heapq.heappop(heap)
        if first != second:
            heapq.heappush(heap, -(first - second))

    return -heap[0] if heap else 0
```

## Task Scheduler

```python
import heapq
from collections import Counter

def least_interval(tasks: list[str], n: int) -> int:
    count = Counter(tasks)
    heap = [-c for c in count.values()]
    heapq.heapify(heap)

    time = 0
    queue = []

    while heap or queue:
        time += 1

        if heap:
            cnt = heapq.heappop(heap) + 1
            if cnt != 0:
                queue.append((cnt, time + n))

        if queue and queue[0][1] == time:
            heapq.heappush(heap, queue.pop(0)[0])

    return time
```

## Reorganize String

```python
import heapq
from collections import Counter

def reorganize_string(s: str) -> str:
    count = Counter(s)
    heap = [(-cnt, char) for char, cnt in count.items()]
    heapq.heapify(heap)

    result = []
    prev_cnt, prev_char = 0, ''

    while heap:
        cnt, char = heapq.heappop(heap)
        result.append(char)

        if prev_cnt < 0:
            heapq.heappush(heap, (prev_cnt, prev_char))

        prev_cnt = cnt + 1
        prev_char = char

    return ''.join(result) if len(result) == len(s) else ''
```

## Sort Characters By Frequency

```python
import heapq
from collections import Counter

def frequency_sort(s: str) -> str:
    count = Counter(s)
    heap = [(-freq, char) for char, freq in count.items()]
    heapq.heapify(heap)

    result = []
    while heap:
        freq, char = heapq.heappop(heap)
        result.append(char * (-freq))

    return ''.join(result)
```

## Minimum Cost to Connect Sticks

```python
import heapq

def connect_sticks(sticks: list[int]) -> int:
    heapq.heapify(sticks)
    total_cost = 0

    while len(sticks) > 1:
        first = heapq.heappop(sticks)
        second = heapq.heappop(sticks)
        cost = first + second
        total_cost += cost
        heapq.heappush(sticks, cost)

    return total_cost
```

## Find K Pairs with Smallest Sums

```python
import heapq

def k_smallest_pairs(nums1: list[int], nums2: list[int], k: int) -> list[list[int]]:
    if not nums1 or not nums2:
        return []

    heap = [(nums1[0] + nums2[0], 0, 0)]
    visited = {(0, 0)}
    result = []

    while heap and len(result) < k:
        _, i, j = heapq.heappop(heap)
        result.append([nums1[i], nums2[j]])

        if i + 1 < len(nums1) and (i + 1, j) not in visited:
            heapq.heappush(heap, (nums1[i + 1] + nums2[j], i + 1, j))
            visited.add((i + 1, j))

        if j + 1 < len(nums2) and (i, j + 1) not in visited:
            heapq.heappush(heap, (nums1[i] + nums2[j + 1], i, j + 1))
            visited.add((i, j + 1))

    return result
```

## Ugly Number II

```python
import heapq

def nth_ugly_number(n: int) -> int:
    heap = [1]
    seen = {1}
    factors = [2, 3, 5]

    for _ in range(n):
        ugly = heapq.heappop(heap)
        for factor in factors:
            new_ugly = ugly * factor
            if new_ugly not in seen:
                seen.add(new_ugly)
                heapq.heappush(heap, new_ugly)

    return ugly
```

## Super Ugly Number

```python
import heapq

def nth_super_ugly_number(n: int, primes: list[int]) -> int:
    heap = [1]
    seen = {1}

    for _ in range(n):
        ugly = heapq.heappop(heap)
        for prime in primes:
            new_ugly = ugly * prime
            if new_ugly not in seen:
                seen.add(new_ugly)
                heapq.heappush(heap, new_ugly)

    return ugly
```

## IPO (Maximize Capital)

```python
import heapq

def find_maximized_capital(k: int, w: int, profits: list[int], capital: list[int]) -> int:
    projects = sorted(zip(capital, profits))
    heap = []
    i = 0

    for _ in range(k):
        while i < len(projects) and projects[i][0] <= w:
            heapq.heappush(heap, -projects[i][1])
            i += 1

        if not heap:
            break

        w += -heapq.heappop(heap)

    return w
```

## Meeting Rooms II

```python
import heapq

def min_meeting_rooms(intervals: list[list[int]]) -> int:
    if not intervals:
        return 0

    intervals.sort(key=lambda x: x[0])
    heap = []

    for start, end in intervals:
        if heap and heap[0] <= start:
            heapq.heapreplace(heap, end)
        else:
            heapq.heappush(heap, end)

    return len(heap)
```

## Smallest Range Covering Elements from K Lists

```python
import heapq

def smallest_range(nums: list[list[int]]) -> list[int]:
    heap = []
    max_val = float('-inf')

    for i, row in enumerate(nums):
        heapq.heappush(heap, (row[0], i, 0))
        max_val = max(max_val, row[0])

    result = [float('-inf'), float('inf')]

    while True:
        min_val, row, idx = heapq.heappop(heap)

        if max_val - min_val < result[1] - result[0]:
            result = [min_val, max_val]

        if idx + 1 == len(nums[row]):
            break

        next_val = nums[row][idx + 1]
        heapq.heappush(heap, (next_val, row, idx + 1))
        max_val = max(max_val, next_val)

    return result
```
