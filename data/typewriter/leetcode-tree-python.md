# LeetCode Tree Patterns - Python

## TreeNode Definition

```python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right
```

## DFS - Preorder Traversal (Recursive)

```python
def preorder_traversal(root: TreeNode) -> list[int]:
    result = []

    def dfs(node: TreeNode) -> None:
        if not node:
            return
        result.append(node.val)
        dfs(node.left)
        dfs(node.right)

    dfs(root)
    return result
```

## DFS - Inorder Traversal (Recursive)

```python
def inorder_traversal(root: TreeNode) -> list[int]:
    result = []

    def dfs(node: TreeNode) -> None:
        if not node:
            return
        dfs(node.left)
        result.append(node.val)
        dfs(node.right)

    dfs(root)
    return result
```

## DFS - Postorder Traversal (Recursive)

```python
def postorder_traversal(root: TreeNode) -> list[int]:
    result = []

    def dfs(node: TreeNode) -> None:
        if not node:
            return
        dfs(node.left)
        dfs(node.right)
        result.append(node.val)

    dfs(root)
    return result
```

## DFS - Inorder Iterative

```python
def inorder_iterative(root: TreeNode) -> list[int]:
    result = []
    stack = []
    current = root

    while current or stack:
        while current:
            stack.append(current)
            current = current.left
        current = stack.pop()
        result.append(current.val)
        current = current.right

    return result
```

## BFS - Level Order Traversal

```python
from collections import deque

def level_order(root: TreeNode) -> list[list[int]]:
    if not root:
        return []

    result = []
    queue = deque([root])

    while queue:
        level = []
        for _ in range(len(queue)):
            node = queue.popleft()
            level.append(node.val)
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        result.append(level)

    return result
```

## Zigzag Level Order

```python
from collections import deque

def zigzag_level_order(root: TreeNode) -> list[list[int]]:
    if not root:
        return []

    result = []
    queue = deque([root])
    left_to_right = True

    while queue:
        level = deque()
        for _ in range(len(queue)):
            node = queue.popleft()
            if left_to_right:
                level.append(node.val)
            else:
                level.appendleft(node.val)
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        result.append(list(level))
        left_to_right = not left_to_right

    return result
```

## Maximum Depth of Binary Tree

```python
def max_depth(root: TreeNode) -> int:
    if not root:
        return 0
    return 1 + max(max_depth(root.left), max_depth(root.right))
```

## Minimum Depth of Binary Tree

```python
def min_depth(root: TreeNode) -> int:
    if not root:
        return 0
    if not root.left:
        return 1 + min_depth(root.right)
    if not root.right:
        return 1 + min_depth(root.left)
    return 1 + min(min_depth(root.left), min_depth(root.right))
```

## Balanced Binary Tree

```python
def is_balanced(root: TreeNode) -> bool:
    def check(node: TreeNode) -> int:
        if not node:
            return 0
        left = check(node.left)
        right = check(node.right)
        if left == -1 or right == -1 or abs(left - right) > 1:
            return -1
        return 1 + max(left, right)

    return check(root) != -1
```

## Same Tree

```python
def is_same_tree(p: TreeNode, q: TreeNode) -> bool:
    if not p and not q:
        return True
    if not p or not q:
        return False
    return p.val == q.val and is_same_tree(p.left, q.left) and is_same_tree(p.right, q.right)
```

## Symmetric Tree

```python
def is_symmetric(root: TreeNode) -> bool:
    def is_mirror(left: TreeNode, right: TreeNode) -> bool:
        if not left and not right:
            return True
        if not left or not right:
            return False
        return (left.val == right.val and
                is_mirror(left.left, right.right) and
                is_mirror(left.right, right.left))

    return is_mirror(root, root) if root else True
```

## Invert Binary Tree

```python
def invert_tree(root: TreeNode) -> TreeNode:
    if not root:
        return None
    root.left, root.right = invert_tree(root.right), invert_tree(root.left)
    return root
```

## Path Sum

```python
def has_path_sum(root: TreeNode, target_sum: int) -> bool:
    if not root:
        return False
    if not root.left and not root.right:
        return root.val == target_sum
    return (has_path_sum(root.left, target_sum - root.val) or
            has_path_sum(root.right, target_sum - root.val))
```

## Path Sum II

```python
def path_sum(root: TreeNode, target_sum: int) -> list[list[int]]:
    result = []

    def dfs(node: TreeNode, current_sum: int, path: list[int]) -> None:
        if not node:
            return
        path.append(node.val)
        if not node.left and not node.right and current_sum == node.val:
            result.append(path[:])
        dfs(node.left, current_sum - node.val, path)
        dfs(node.right, current_sum - node.val, path)
        path.pop()

    dfs(root, target_sum, [])
    return result
```

## Binary Tree Maximum Path Sum

```python
def max_path_sum(root: TreeNode) -> int:
    max_sum = float('-inf')

    def dfs(node: TreeNode) -> int:
        nonlocal max_sum
        if not node:
            return 0
        left = max(dfs(node.left), 0)
        right = max(dfs(node.right), 0)
        max_sum = max(max_sum, node.val + left + right)
        return node.val + max(left, right)

    dfs(root)
    return max_sum
```

## Diameter of Binary Tree

```python
def diameter_of_binary_tree(root: TreeNode) -> int:
    diameter = 0

    def depth(node: TreeNode) -> int:
        nonlocal diameter
        if not node:
            return 0
        left = depth(node.left)
        right = depth(node.right)
        diameter = max(diameter, left + right)
        return 1 + max(left, right)

    depth(root)
    return diameter
```

## Lowest Common Ancestor

```python
def lowest_common_ancestor(root: TreeNode, p: TreeNode, q: TreeNode) -> TreeNode:
    if not root or root == p or root == q:
        return root

    left = lowest_common_ancestor(root.left, p, q)
    right = lowest_common_ancestor(root.right, p, q)

    if left and right:
        return root
    return left or right
```

## LCA of BST

```python
def lowest_common_ancestor_bst(root: TreeNode, p: TreeNode, q: TreeNode) -> TreeNode:
    while root:
        if p.val < root.val and q.val < root.val:
            root = root.left
        elif p.val > root.val and q.val > root.val:
            root = root.right
        else:
            return root
    return None
```

## Validate Binary Search Tree

```python
def is_valid_bst(root: TreeNode) -> bool:
    def validate(node: TreeNode, min_val: float, max_val: float) -> bool:
        if not node:
            return True
        if node.val <= min_val or node.val >= max_val:
            return False
        return (validate(node.left, min_val, node.val) and
                validate(node.right, node.val, max_val))

    return validate(root, float('-inf'), float('inf'))
```

## Kth Smallest Element in BST

```python
def kth_smallest(root: TreeNode, k: int) -> int:
    stack = []
    current = root

    while current or stack:
        while current:
            stack.append(current)
            current = current.left
        current = stack.pop()
        k -= 1
        if k == 0:
            return current.val
        current = current.right

    return -1
```

## Construct Binary Tree from Preorder and Inorder

```python
def build_tree(preorder: list[int], inorder: list[int]) -> TreeNode:
    inorder_map = {val: idx for idx, val in enumerate(inorder)}
    preorder_idx = [0]

    def build(left: int, right: int) -> TreeNode:
        if left > right:
            return None

        root_val = preorder[preorder_idx[0]]
        preorder_idx[0] += 1
        root = TreeNode(root_val)

        root.left = build(left, inorder_map[root_val] - 1)
        root.right = build(inorder_map[root_val] + 1, right)

        return root

    return build(0, len(inorder) - 1)
```

## Serialize and Deserialize Binary Tree

```python
class Codec:
    def serialize(self, root: TreeNode) -> str:
        result = []

        def dfs(node: TreeNode) -> None:
            if not node:
                result.append('null')
                return
            result.append(str(node.val))
            dfs(node.left)
            dfs(node.right)

        dfs(root)
        return ','.join(result)

    def deserialize(self, data: str) -> TreeNode:
        values = iter(data.split(','))

        def dfs() -> TreeNode:
            val = next(values)
            if val == 'null':
                return None
            node = TreeNode(int(val))
            node.left = dfs()
            node.right = dfs()
            return node

        return dfs()
```

## Flatten Binary Tree to Linked List

```python
def flatten(root: TreeNode) -> None:
    current = root

    while current:
        if current.left:
            rightmost = current.left
            while rightmost.right:
                rightmost = rightmost.right
            rightmost.right = current.right
            current.right = current.left
            current.left = None
        current = current.right
```

## Binary Tree Right Side View

```python
from collections import deque

def right_side_view(root: TreeNode) -> list[int]:
    if not root:
        return []

    result = []
    queue = deque([root])

    while queue:
        level_size = len(queue)
        for i in range(level_size):
            node = queue.popleft()
            if i == level_size - 1:
                result.append(node.val)
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)

    return result
```

## Count Complete Tree Nodes

```python
def count_nodes(root: TreeNode) -> int:
    if not root:
        return 0

    def get_height(node: TreeNode) -> int:
        height = 0
        while node:
            height += 1
            node = node.left
        return height

    left_height = get_height(root.left)
    right_height = get_height(root.right)

    if left_height == right_height:
        return (1 << left_height) + count_nodes(root.right)
    else:
        return (1 << right_height) + count_nodes(root.left)
```

## Sum Root to Leaf Numbers

```python
def sum_numbers(root: TreeNode) -> int:
    def dfs(node: TreeNode, current: int) -> int:
        if not node:
            return 0
        current = current * 10 + node.val
        if not node.left and not node.right:
            return current
        return dfs(node.left, current) + dfs(node.right, current)

    return dfs(root, 0)
```

## Binary Tree Cameras

```python
def min_camera_cover(root: TreeNode) -> int:
    cameras = 0
    NOT_MONITORED = 0
    MONITORED = 1
    HAS_CAMERA = 2

    def dfs(node: TreeNode) -> int:
        nonlocal cameras
        if not node:
            return MONITORED

        left = dfs(node.left)
        right = dfs(node.right)

        if left == NOT_MONITORED or right == NOT_MONITORED:
            cameras += 1
            return HAS_CAMERA

        if left == HAS_CAMERA or right == HAS_CAMERA:
            return MONITORED

        return NOT_MONITORED

    if dfs(root) == NOT_MONITORED:
        cameras += 1

    return cameras
```

## House Robber III

```python
def rob(root: TreeNode) -> int:
    def dfs(node: TreeNode) -> tuple[int, int]:
        if not node:
            return (0, 0)

        left = dfs(node.left)
        right = dfs(node.right)

        rob_current = node.val + left[1] + right[1]
        skip_current = max(left) + max(right)

        return (rob_current, skip_current)

    return max(dfs(root))
```
