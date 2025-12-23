# Python Snippets

## Hello World
- difficulty: easy

```python
print("Hello, World!")
```

## Variables and Types
- difficulty: easy

```python
name = "John"
age = 25
height = 1.75
is_active = True

print(f"Name: {name}, Age: {age}")
print(type(name), type(age), type(height))
```

## String Operations
- difficulty: easy

```python
text = "Hello, World!"

print(text.upper())
print(text.lower())
print(text.replace("World", "Python"))
print(text.split(", "))
print(len(text))
```

## List Basics
- difficulty: easy

```python
fruits = ["apple", "banana", "orange"]

fruits.append("grape")
fruits.insert(0, "mango")
print(fruits[0])
print(fruits[-1])
print(len(fruits))
```

## Dictionary Basics
- difficulty: easy

```python
person = {
    "name": "John",
    "age": 30,
    "city": "Tokyo"
}

print(person["name"])
print(person.get("email", "N/A"))
person["email"] = "john@example.com"
print(person.keys())
print(person.values())
```

## For Loop
- difficulty: easy

```python
numbers = [1, 2, 3, 4, 5]

for num in numbers:
    print(num * 2)

for i in range(5):
    print(f"Count: {i}")

for i, fruit in enumerate(["apple", "banana"]):
    print(f"{i}: {fruit}")
```

## While Loop
- difficulty: easy

```python
count = 0

while count < 5:
    print(f"Count: {count}")
    count += 1

# With break and continue
i = 0
while True:
    i += 1
    if i == 3:
        continue
    if i > 5:
        break
    print(i)
```

## If Else Statement
- difficulty: easy

```python
score = 85

if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
elif score >= 70:
    grade = "C"
else:
    grade = "F"

print(f"Grade: {grade}")

# Ternary
status = "Pass" if score >= 60 else "Fail"
```

## Basic Function
- difficulty: easy

```python
def greet(name):
    return f"Hello, {name}!"

def add(a, b):
    return a + b

message = greet("Alice")
result = add(3, 5)

print(message)
print(result)
```

## Function with Default Args
- difficulty: easy

```python
def create_user(name, age=18, active=True):
    return {
        "name": name,
        "age": age,
        "active": active
    }

user1 = create_user("John")
user2 = create_user("Jane", 25)
user3 = create_user("Bob", active=False)

print(user1, user2, user3)
```

## List Comprehension
- difficulty: medium

```python
numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

squares = [x ** 2 for x in numbers]
evens = [x for x in numbers if x % 2 == 0]
doubled_evens = [x * 2 for x in numbers if x % 2 == 0]

print(squares)
print(evens)
print(doubled_evens)
```

## Dictionary Comprehension
- difficulty: medium

```python
names = ["alice", "bob", "charlie"]
scores = [85, 92, 78]

name_lengths = {name: len(name) for name in names}
score_dict = {name: score for name, score in zip(names, scores)}
passed = {k: v for k, v in score_dict.items() if v >= 80}

print(name_lengths)
print(score_dict)
print(passed)
```

## Args and Kwargs
- difficulty: medium

```python
def print_args(*args):
    for arg in args:
        print(arg)

def print_kwargs(**kwargs):
    for key, value in kwargs.items():
        print(f"{key}: {value}")

def combined(*args, **kwargs):
    print(f"Args: {args}")
    print(f"Kwargs: {kwargs}")

print_args(1, 2, 3)
print_kwargs(name="John", age=30)
combined(1, 2, name="John")
```

## Lambda Functions
- difficulty: medium

```python
add = lambda x, y: x + y
square = lambda x: x ** 2

numbers = [3, 1, 4, 1, 5, 9, 2, 6]

sorted_nums = sorted(numbers)
sorted_desc = sorted(numbers, reverse=True)

users = [{"name": "John", "age": 30}, {"name": "Jane", "age": 25}]
sorted_users = sorted(users, key=lambda u: u["age"])

print(sorted_users)
```

## Map Filter Reduce
- difficulty: medium

```python
from functools import reduce

numbers = [1, 2, 3, 4, 5]

doubled = list(map(lambda x: x * 2, numbers))
evens = list(filter(lambda x: x % 2 == 0, numbers))
total = reduce(lambda acc, x: acc + x, numbers, 0)

print(doubled)
print(evens)
print(total)
```

## Try Except
- difficulty: medium

```python
def divide(a, b):
    try:
        result = a / b
        return result
    except ZeroDivisionError:
        print("Cannot divide by zero!")
        return None
    except TypeError as e:
        print(f"Type error: {e}")
        return None
    finally:
        print("Division attempted")

print(divide(10, 2))
print(divide(10, 0))
```

## File Operations
- difficulty: medium

```python
# Write to file
with open("output.txt", "w") as f:
    f.write("Hello, World!\n")
    f.write("Second line")

# Read from file
with open("output.txt", "r") as f:
    content = f.read()
    print(content)

# Read lines
with open("output.txt", "r") as f:
    lines = f.readlines()
    for line in lines:
        print(line.strip())
```

## JSON Operations
- difficulty: medium

```python
import json

data = {
    "name": "John",
    "age": 30,
    "skills": ["Python", "JavaScript"]
}

# To JSON string
json_string = json.dumps(data, indent=2)
print(json_string)

# From JSON string
parsed = json.loads(json_string)
print(parsed["name"])

# Write to file
with open("data.json", "w") as f:
    json.dump(data, f, indent=2)
```

## Class Basics
- difficulty: medium

```python
class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def greet(self):
        return f"Hello, I'm {self.name}"

    def birthday(self):
        self.age += 1
        return self.age

person = Person("John", 30)
print(person.greet())
print(person.birthday())
```

## Class Inheritance
- difficulty: medium

```python
class Animal:
    def __init__(self, name):
        self.name = name

    def speak(self):
        return f"{self.name} makes a sound"

class Dog(Animal):
    def __init__(self, name, breed):
        super().__init__(name)
        self.breed = breed

    def speak(self):
        return f"{self.name} barks!"

dog = Dog("Max", "Labrador")
print(dog.speak())
print(dog.breed)
```

## Decorators Basic
- difficulty: hard

```python
def logger(func):
    def wrapper(*args, **kwargs):
        print(f"Calling {func.__name__}")
        result = func(*args, **kwargs)
        print(f"Finished {func.__name__}")
        return result
    return wrapper

@logger
def add(a, b):
    return a + b

@logger
def greet(name):
    return f"Hello, {name}!"

print(add(3, 5))
print(greet("John"))
```

## Decorators with Arguments
- difficulty: hard

```python
def repeat(times):
    def decorator(func):
        def wrapper(*args, **kwargs):
            results = []
            for _ in range(times):
                results.append(func(*args, **kwargs))
            return results
        return wrapper
    return decorator

@repeat(3)
def say_hello(name):
    return f"Hello, {name}!"

print(say_hello("John"))
```

## Context Manager
- difficulty: hard

```python
class FileManager:
    def __init__(self, filename, mode):
        self.filename = filename
        self.mode = mode
        self.file = None

    def __enter__(self):
        self.file = open(self.filename, self.mode)
        return self.file

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.file:
            self.file.close()
        return False

with FileManager("test.txt", "w") as f:
    f.write("Hello from context manager!")
```

## Generator Function
- difficulty: hard

```python
def fibonacci(n):
    a, b = 0, 1
    count = 0
    while count < n:
        yield a
        a, b = b, a + b
        count += 1

def infinite_counter():
    n = 0
    while True:
        yield n
        n += 1

fib = fibonacci(10)
print(list(fib))

counter = infinite_counter()
for _ in range(5):
    print(next(counter))
```

## Generator Expression
- difficulty: medium

```python
numbers = range(1, 11)

squares_gen = (x ** 2 for x in numbers)
evens_gen = (x for x in numbers if x % 2 == 0)

print(list(squares_gen))
print(sum(evens_gen))

# Memory efficient for large data
large_sum = sum(x ** 2 for x in range(1000000))
print(large_sum)
```

## Dataclass
- difficulty: medium

```python
from dataclasses import dataclass, field
from typing import List

@dataclass
class User:
    name: str
    email: str
    age: int = 0
    tags: List[str] = field(default_factory=list)

    def is_adult(self):
        return self.age >= 18

user = User("John", "john@example.com", 25)
print(user)
print(user.is_adult())
```

## Type Hints
- difficulty: medium

```python
from typing import List, Dict, Optional, Union, Tuple

def greet(name: str) -> str:
    return f"Hello, {name}!"

def process_items(items: List[int]) -> Dict[str, int]:
    return {
        "sum": sum(items),
        "count": len(items)
    }

def find_user(user_id: int) -> Optional[Dict[str, str]]:
    users = {1: {"name": "John"}}
    return users.get(user_id)

def parse_value(value: Union[str, int]) -> str:
    return str(value)
```

## Enum
- difficulty: medium

```python
from enum import Enum, auto

class Status(Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class Priority(Enum):
    LOW = auto()
    MEDIUM = auto()
    HIGH = auto()

task = {"name": "Review", "status": Status.PENDING}

if task["status"] == Status.PENDING:
    print("Task is pending")

print(Status.APPROVED.value)
print(Priority.HIGH.value)
```

## Regular Expressions
- difficulty: hard

```python
import re

text = "Contact: john@example.com or jane@test.org"

email_pattern = r'[\w\.-]+@[\w\.-]+\.\w+'
emails = re.findall(email_pattern, text)
print(emails)

phone = "123-456-7890"
if re.match(r'\d{3}-\d{3}-\d{4}', phone):
    print("Valid phone")

replaced = re.sub(r'\d', 'X', phone)
print(replaced)
```

## Async Await Basics
- difficulty: hard

```python
import asyncio

async def fetch_data(url):
    print(f"Fetching {url}")
    await asyncio.sleep(1)
    return f"Data from {url}"

async def main():
    result = await fetch_data("https://api.example.com")
    print(result)

asyncio.run(main())
```

## Async Gather
- difficulty: hard

```python
import asyncio

async def fetch_user(user_id):
    await asyncio.sleep(1)
    return {"id": user_id, "name": f"User{user_id}"}

async def fetch_posts(user_id):
    await asyncio.sleep(1)
    return [{"id": 1, "title": "Post 1"}]

async def main():
    user, posts = await asyncio.gather(
        fetch_user(1),
        fetch_posts(1)
    )
    print(user, posts)

asyncio.run(main())
```

## Property Decorator
- difficulty: hard

```python
class Circle:
    def __init__(self, radius):
        self._radius = radius

    @property
    def radius(self):
        return self._radius

    @radius.setter
    def radius(self, value):
        if value < 0:
            raise ValueError("Radius cannot be negative")
        self._radius = value

    @property
    def area(self):
        return 3.14159 * self._radius ** 2

circle = Circle(5)
print(circle.area)
circle.radius = 10
print(circle.area)
```

## Abstract Base Class
- difficulty: hard

```python
from abc import ABC, abstractmethod

class Shape(ABC):
    @abstractmethod
    def area(self):
        pass

    @abstractmethod
    def perimeter(self):
        pass

class Rectangle(Shape):
    def __init__(self, width, height):
        self.width = width
        self.height = height

    def area(self):
        return self.width * self.height

    def perimeter(self):
        return 2 * (self.width + self.height)

rect = Rectangle(5, 3)
print(rect.area())
print(rect.perimeter())
```

## Collections Module
- difficulty: hard

```python
from collections import Counter, defaultdict, deque, namedtuple

words = ["apple", "banana", "apple", "cherry", "banana", "apple"]
counter = Counter(words)
print(counter.most_common(2))

dd = defaultdict(list)
dd["fruits"].append("apple")
dd["fruits"].append("banana")
print(dd)

queue = deque([1, 2, 3])
queue.append(4)
queue.appendleft(0)
print(queue.popleft())

Point = namedtuple("Point", ["x", "y"])
p = Point(3, 4)
print(p.x, p.y)
```

## Itertools Module
- difficulty: hard

```python
from itertools import chain, cycle, repeat, combinations, permutations

list1 = [1, 2, 3]
list2 = [4, 5, 6]
combined = list(chain(list1, list2))
print(combined)

colors = ["red", "green", "blue"]
combos = list(combinations(colors, 2))
perms = list(permutations(colors, 2))
print(combos)
print(perms)

repeated = list(repeat("hello", 3))
print(repeated)
```

## Unit Testing
- difficulty: hard

```python
import unittest

def add(a, b):
    return a + b

def divide(a, b):
    if b == 0:
        raise ValueError("Cannot divide by zero")
    return a / b

class TestMath(unittest.TestCase):
    def test_add(self):
        self.assertEqual(add(2, 3), 5)
        self.assertEqual(add(-1, 1), 0)

    def test_divide(self):
        self.assertEqual(divide(10, 2), 5)

    def test_divide_by_zero(self):
        with self.assertRaises(ValueError):
            divide(10, 0)

if __name__ == "__main__":
    unittest.main()
```

## Pathlib
- difficulty: medium

```python
from pathlib import Path

current = Path.cwd()
home = Path.home()

file_path = Path("data") / "users" / "config.json"
print(file_path)

if file_path.exists():
    content = file_path.read_text()
    print(content)

for py_file in Path(".").glob("**/*.py"):
    print(py_file)

new_dir = Path("output")
new_dir.mkdir(exist_ok=True)
```

## Datetime
- difficulty: medium

```python
from datetime import datetime, timedelta, date

now = datetime.now()
today = date.today()

print(now.strftime("%Y-%m-%d %H:%M:%S"))
print(today.isoformat())

parsed = datetime.strptime("2024-01-15", "%Y-%m-%d")
print(parsed)

tomorrow = now + timedelta(days=1)
next_week = now + timedelta(weeks=1)
print(tomorrow, next_week)

diff = datetime(2024, 12, 31) - now
print(f"Days until end of year: {diff.days}")
```
