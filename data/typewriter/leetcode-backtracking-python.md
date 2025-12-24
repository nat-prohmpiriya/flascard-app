# LeetCode Backtracking Patterns - Python

## Backtracking Template

```python
def backtrack_template(candidates: list[int]) -> list[list[int]]:
    result = []

    def backtrack(start: int, path: list[int]) -> None:
        if is_valid_solution(path):
            result.append(path[:])
            return

        for i in range(start, len(candidates)):
            path.append(candidates[i])
            backtrack(i + 1, path)
            path.pop()

    backtrack(0, [])
    return result
```

## Subsets

```python
def subsets(nums: list[int]) -> list[list[int]]:
    result = []

    def backtrack(start: int, path: list[int]) -> None:
        result.append(path[:])
        for i in range(start, len(nums)):
            path.append(nums[i])
            backtrack(i + 1, path)
            path.pop()

    backtrack(0, [])
    return result
```

## Subsets II (with Duplicates)

```python
def subsets_with_dup(nums: list[int]) -> list[list[int]]:
    nums.sort()
    result = []

    def backtrack(start: int, path: list[int]) -> None:
        result.append(path[:])
        for i in range(start, len(nums)):
            if i > start and nums[i] == nums[i - 1]:
                continue
            path.append(nums[i])
            backtrack(i + 1, path)
            path.pop()

    backtrack(0, [])
    return result
```

## Permutations

```python
def permute(nums: list[int]) -> list[list[int]]:
    result = []

    def backtrack(path: list[int], used: set) -> None:
        if len(path) == len(nums):
            result.append(path[:])
            return

        for num in nums:
            if num in used:
                continue
            used.add(num)
            path.append(num)
            backtrack(path, used)
            path.pop()
            used.remove(num)

    backtrack([], set())
    return result
```

## Permutations II (with Duplicates)

```python
def permute_unique(nums: list[int]) -> list[list[int]]:
    nums.sort()
    result = []
    used = [False] * len(nums)

    def backtrack(path: list[int]) -> None:
        if len(path) == len(nums):
            result.append(path[:])
            return

        for i in range(len(nums)):
            if used[i]:
                continue
            if i > 0 and nums[i] == nums[i - 1] and not used[i - 1]:
                continue
            used[i] = True
            path.append(nums[i])
            backtrack(path)
            path.pop()
            used[i] = False

    backtrack([])
    return result
```

## Combinations

```python
def combine(n: int, k: int) -> list[list[int]]:
    result = []

    def backtrack(start: int, path: list[int]) -> None:
        if len(path) == k:
            result.append(path[:])
            return

        for i in range(start, n + 1):
            path.append(i)
            backtrack(i + 1, path)
            path.pop()

    backtrack(1, [])
    return result
```

## Combination Sum

```python
def combination_sum(candidates: list[int], target: int) -> list[list[int]]:
    result = []

    def backtrack(start: int, path: list[int], remaining: int) -> None:
        if remaining == 0:
            result.append(path[:])
            return
        if remaining < 0:
            return

        for i in range(start, len(candidates)):
            path.append(candidates[i])
            backtrack(i, path, remaining - candidates[i])
            path.pop()

    backtrack(0, [], target)
    return result
```

## Combination Sum II

```python
def combination_sum2(candidates: list[int], target: int) -> list[list[int]]:
    candidates.sort()
    result = []

    def backtrack(start: int, path: list[int], remaining: int) -> None:
        if remaining == 0:
            result.append(path[:])
            return

        for i in range(start, len(candidates)):
            if candidates[i] > remaining:
                break
            if i > start and candidates[i] == candidates[i - 1]:
                continue
            path.append(candidates[i])
            backtrack(i + 1, path, remaining - candidates[i])
            path.pop()

    backtrack(0, [], target)
    return result
```

## Combination Sum III

```python
def combination_sum3(k: int, n: int) -> list[list[int]]:
    result = []

    def backtrack(start: int, path: list[int], remaining: int) -> None:
        if len(path) == k and remaining == 0:
            result.append(path[:])
            return
        if len(path) >= k or remaining <= 0:
            return

        for i in range(start, 10):
            path.append(i)
            backtrack(i + 1, path, remaining - i)
            path.pop()

    backtrack(1, [], n)
    return result
```

## Letter Combinations of Phone Number

```python
def letter_combinations(digits: str) -> list[str]:
    if not digits:
        return []

    phone_map = {
        '2': 'abc', '3': 'def', '4': 'ghi', '5': 'jkl',
        '6': 'mno', '7': 'pqrs', '8': 'tuv', '9': 'wxyz'
    }
    result = []

    def backtrack(index: int, path: list[str]) -> None:
        if index == len(digits):
            result.append(''.join(path))
            return

        for char in phone_map[digits[index]]:
            path.append(char)
            backtrack(index + 1, path)
            path.pop()

    backtrack(0, [])
    return result
```

## Generate Parentheses

```python
def generate_parenthesis(n: int) -> list[str]:
    result = []

    def backtrack(path: list[str], open_count: int, close_count: int) -> None:
        if len(path) == 2 * n:
            result.append(''.join(path))
            return

        if open_count < n:
            path.append('(')
            backtrack(path, open_count + 1, close_count)
            path.pop()

        if close_count < open_count:
            path.append(')')
            backtrack(path, open_count, close_count + 1)
            path.pop()

    backtrack([], 0, 0)
    return result
```

## Palindrome Partitioning

```python
def partition(s: str) -> list[list[str]]:
    result = []

    def is_palindrome(start: int, end: int) -> bool:
        while start < end:
            if s[start] != s[end]:
                return False
            start += 1
            end -= 1
        return True

    def backtrack(start: int, path: list[str]) -> None:
        if start == len(s):
            result.append(path[:])
            return

        for end in range(start, len(s)):
            if is_palindrome(start, end):
                path.append(s[start:end + 1])
                backtrack(end + 1, path)
                path.pop()

    backtrack(0, [])
    return result
```

## N-Queens

```python
def solve_n_queens(n: int) -> list[list[str]]:
    result = []
    board = [['.' for _ in range(n)] for _ in range(n)]
    cols = set()
    diag1 = set()
    diag2 = set()

    def backtrack(row: int) -> None:
        if row == n:
            result.append([''.join(r) for r in board])
            return

        for col in range(n):
            if col in cols or (row - col) in diag1 or (row + col) in diag2:
                continue

            cols.add(col)
            diag1.add(row - col)
            diag2.add(row + col)
            board[row][col] = 'Q'

            backtrack(row + 1)

            cols.remove(col)
            diag1.remove(row - col)
            diag2.remove(row + col)
            board[row][col] = '.'

    backtrack(0)
    return result
```

## Sudoku Solver

```python
def solve_sudoku(board: list[list[str]]) -> None:
    def is_valid(row: int, col: int, num: str) -> bool:
        for i in range(9):
            if board[row][i] == num:
                return False
            if board[i][col] == num:
                return False
            box_row = 3 * (row // 3) + i // 3
            box_col = 3 * (col // 3) + i % 3
            if board[box_row][box_col] == num:
                return False
        return True

    def backtrack() -> bool:
        for i in range(9):
            for j in range(9):
                if board[i][j] == '.':
                    for num in '123456789':
                        if is_valid(i, j, num):
                            board[i][j] = num
                            if backtrack():
                                return True
                            board[i][j] = '.'
                    return False
        return True

    backtrack()
```

## Word Search

```python
def exist(board: list[list[str]], word: str) -> bool:
    m, n = len(board), len(board[0])

    def backtrack(i: int, j: int, k: int) -> bool:
        if k == len(word):
            return True
        if i < 0 or i >= m or j < 0 or j >= n or board[i][j] != word[k]:
            return False

        temp = board[i][j]
        board[i][j] = '#'

        found = (backtrack(i + 1, j, k + 1) or
                 backtrack(i - 1, j, k + 1) or
                 backtrack(i, j + 1, k + 1) or
                 backtrack(i, j - 1, k + 1))

        board[i][j] = temp
        return found

    for i in range(m):
        for j in range(n):
            if backtrack(i, j, 0):
                return True
    return False
```

## Word Search II

```python
def find_words(board: list[list[str]], words: list[str]) -> list[str]:
    class TrieNode:
        def __init__(self):
            self.children = {}
            self.word = None

    root = TrieNode()
    for word in words:
        node = root
        for char in word:
            if char not in node.children:
                node.children[char] = TrieNode()
            node = node.children[char]
        node.word = word

    m, n = len(board), len(board[0])
    result = []

    def backtrack(i: int, j: int, node: TrieNode) -> None:
        char = board[i][j]
        if char not in node.children:
            return

        next_node = node.children[char]
        if next_node.word:
            result.append(next_node.word)
            next_node.word = None

        board[i][j] = '#'
        for di, dj in [(0, 1), (0, -1), (1, 0), (-1, 0)]:
            ni, nj = i + di, j + dj
            if 0 <= ni < m and 0 <= nj < n and board[ni][nj] != '#':
                backtrack(ni, nj, next_node)
        board[i][j] = char

    for i in range(m):
        for j in range(n):
            backtrack(i, j, root)

    return result
```

## Restore IP Addresses

```python
def restore_ip_addresses(s: str) -> list[str]:
    result = []

    def backtrack(start: int, path: list[str]) -> None:
        if len(path) == 4:
            if start == len(s):
                result.append('.'.join(path))
            return

        for length in range(1, 4):
            if start + length > len(s):
                break
            segment = s[start:start + length]
            if (len(segment) > 1 and segment[0] == '0') or int(segment) > 255:
                continue
            path.append(segment)
            backtrack(start + length, path)
            path.pop()

    backtrack(0, [])
    return result
```

## Partition to K Equal Sum Subsets

```python
def can_partition_k_subsets(nums: list[int], k: int) -> bool:
    total = sum(nums)
    if total % k != 0:
        return False

    target = total // k
    nums.sort(reverse=True)
    buckets = [0] * k

    def backtrack(index: int) -> bool:
        if index == len(nums):
            return all(b == target for b in buckets)

        for i in range(k):
            if buckets[i] + nums[index] <= target:
                buckets[i] += nums[index]
                if backtrack(index + 1):
                    return True
                buckets[i] -= nums[index]

            if buckets[i] == 0:
                break

        return False

    return backtrack(0)
```

## Expression Add Operators

```python
def add_operators(num: str, target: int) -> list[str]:
    result = []

    def backtrack(index: int, path: str, value: int, prev: int) -> None:
        if index == len(num):
            if value == target:
                result.append(path)
            return

        for i in range(index, len(num)):
            if i > index and num[index] == '0':
                break

            curr_str = num[index:i + 1]
            curr = int(curr_str)

            if index == 0:
                backtrack(i + 1, curr_str, curr, curr)
            else:
                backtrack(i + 1, path + '+' + curr_str, value + curr, curr)
                backtrack(i + 1, path + '-' + curr_str, value - curr, -curr)
                backtrack(i + 1, path + '*' + curr_str, value - prev + prev * curr, prev * curr)

    backtrack(0, '', 0, 0)
    return result
```
