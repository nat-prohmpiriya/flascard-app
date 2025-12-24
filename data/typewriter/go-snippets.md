# Go Snippets

## Hello World
- difficulty: easy
- description: Basic print statement using fmt package

```go
package main

import "fmt"

func main() {
	fmt.Println("Hello, World!")
}
```

## Variables and Constants
- difficulty: easy
- description: Declaring variables and constants in Go

```go
package main

import "fmt"

func main() {
	var name string = "Go"
	age := 14
	const pi = 3.14159

	fmt.Println(name, age, pi)
}
```

## Basic Function
- difficulty: easy
- description: Function with parameters and return value

```go
func add(a int, b int) int {
	return a + b
}

func greet(name string) string {
	return "Hello, " + name + "!"
}
```

## Multiple Return Values
- difficulty: easy
- description: Functions returning multiple values

```go
func divide(a, b float64) (float64, error) {
	if b == 0 {
		return 0, errors.New("division by zero")
	}
	return a / b, nil
}
```

## For Loop
- difficulty: easy
- description: Different forms of for loops in Go

```go
// Standard for loop
for i := 0; i < 5; i++ {
	fmt.Println(i)
}

// While-style loop
count := 0
for count < 3 {
	fmt.Println(count)
	count++
}
```

## If Else Statement
- difficulty: easy
- description: Conditional statements with short declaration

```go
func checkScore(score int) string {
	if score >= 90 {
		return "A"
	} else if score >= 80 {
		return "B"
	} else if score >= 70 {
		return "C"
	} else {
		return "F"
	}
}
```

## Arrays and Slices
- difficulty: easy
- description: Working with arrays and slices

```go
// Array (fixed size)
var arr [3]int = [3]int{1, 2, 3}

// Slice (dynamic size)
slice := []string{"apple", "banana", "orange"}
slice = append(slice, "grape")

fmt.Println(arr[0])
fmt.Println(len(slice))
```

## Maps
- difficulty: easy
- description: Creating and using maps (dictionaries)

```go
// Create a map
scores := map[string]int{
	"Alice": 95,
	"Bob":   87,
	"Carol": 92,
}

// Add and access
scores["Dave"] = 88
value, exists := scores["Alice"]

fmt.Println(value, exists)
```

## Range Loop
- difficulty: easy
- description: Iterating with range over slices and maps

```go
numbers := []int{10, 20, 30, 40, 50}

for index, value := range numbers {
	fmt.Printf("Index: %d, Value: %d\n", index, value)
}

// Ignore index with underscore
for _, num := range numbers {
	fmt.Println(num)
}
```

## Switch Statement
- difficulty: easy
- description: Switch with multiple cases and no fallthrough

```go
func getDayType(day string) string {
	switch day {
	case "Saturday", "Sunday":
		return "Weekend"
	case "Monday", "Tuesday", "Wednesday", "Thursday", "Friday":
		return "Weekday"
	default:
		return "Unknown"
	}
}
```

## Struct Definition
- difficulty: medium
- description: Defining and using structs

```go
type Person struct {
	Name    string
	Age     int
	Email   string
	IsAdmin bool
}

func main() {
	p := Person{
		Name:    "Alice",
		Age:     30,
		Email:   "alice@example.com",
		IsAdmin: false,
	}
	fmt.Println(p.Name, p.Age)
}
```

## Methods on Structs
- difficulty: medium
- description: Adding methods to struct types

```go
type Rectangle struct {
	Width  float64
	Height float64
}

func (r Rectangle) Area() float64 {
	return r.Width * r.Height
}

func (r Rectangle) Perimeter() float64 {
	return 2 * (r.Width + r.Height)
}

func (r *Rectangle) Scale(factor float64) {
	r.Width *= factor
	r.Height *= factor
}
```

## Interfaces
- difficulty: medium
- description: Defining and implementing interfaces

```go
type Shape interface {
	Area() float64
	Perimeter() float64
}

type Circle struct {
	Radius float64
}

func (c Circle) Area() float64 {
	return math.Pi * c.Radius * c.Radius
}

func (c Circle) Perimeter() float64 {
	return 2 * math.Pi * c.Radius
}
```

## Pointers
- difficulty: medium
- description: Working with pointers and references

```go
func main() {
	x := 10
	ptr := &x

	fmt.Println("Value:", x)
	fmt.Println("Address:", ptr)
	fmt.Println("Dereferenced:", *ptr)

	*ptr = 20
	fmt.Println("New value:", x)
}
```

## Error Handling
- difficulty: medium
- description: Idiomatic error handling in Go

```go
func readFile(filename string) ([]byte, error) {
	data, err := os.ReadFile(filename)
	if err != nil {
		return nil, fmt.Errorf("failed to read %s: %w", filename, err)
	}
	return data, nil
}

func main() {
	data, err := readFile("config.json")
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println(string(data))
}
```

## Defer Statement
- difficulty: medium
- description: Using defer for cleanup operations

```go
func writeToFile(filename string, data []byte) error {
	file, err := os.Create(filename)
	if err != nil {
		return err
	}
	defer file.Close()

	_, err = file.Write(data)
	return err
}
```

## Goroutines
- difficulty: medium
- description: Running concurrent functions with goroutines

```go
func printNumbers() {
	for i := 1; i <= 5; i++ {
		time.Sleep(100 * time.Millisecond)
		fmt.Printf("%d ", i)
	}
}

func printLetters() {
	for i := 'a'; i <= 'e'; i++ {
		time.Sleep(150 * time.Millisecond)
		fmt.Printf("%c ", i)
	}
}

func main() {
	go printNumbers()
	go printLetters()
	time.Sleep(2 * time.Second)
}
```

## Channels
- difficulty: medium
- description: Communication between goroutines using channels

```go
func sum(numbers []int, result chan int) {
	total := 0
	for _, n := range numbers {
		total += n
	}
	result <- total
}

func main() {
	nums := []int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10}
	ch := make(chan int)

	go sum(nums[:5], ch)
	go sum(nums[5:], ch)

	x, y := <-ch, <-ch
	fmt.Println("Total:", x+y)
}
```

## Buffered Channels
- difficulty: medium
- description: Using buffered channels for async communication

```go
func main() {
	messages := make(chan string, 3)

	messages <- "Hello"
	messages <- "World"
	messages <- "Go"

	close(messages)

	for msg := range messages {
		fmt.Println(msg)
	}
}
```

## Select Statement
- difficulty: medium
- description: Handling multiple channel operations

```go
func main() {
	ch1 := make(chan string)
	ch2 := make(chan string)

	go func() {
		time.Sleep(100 * time.Millisecond)
		ch1 <- "one"
	}()

	go func() {
		time.Sleep(200 * time.Millisecond)
		ch2 <- "two"
	}()

	for i := 0; i < 2; i++ {
		select {
		case msg1 := <-ch1:
			fmt.Println("Received:", msg1)
		case msg2 := <-ch2:
			fmt.Println("Received:", msg2)
		}
	}
}
```

## Mutex for Synchronization
- difficulty: hard
- description: Using mutex to protect shared data

```go
type SafeCounter struct {
	mu    sync.Mutex
	count int
}

func (c *SafeCounter) Increment() {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.count++
}

func (c *SafeCounter) Value() int {
	c.mu.Lock()
	defer c.mu.Unlock()
	return c.count
}
```

## WaitGroup
- difficulty: hard
- description: Waiting for multiple goroutines to complete

```go
func worker(id int, wg *sync.WaitGroup) {
	defer wg.Done()
	fmt.Printf("Worker %d starting\n", id)
	time.Sleep(time.Second)
	fmt.Printf("Worker %d done\n", id)
}

func main() {
	var wg sync.WaitGroup

	for i := 1; i <= 5; i++ {
		wg.Add(1)
		go worker(i, &wg)
	}

	wg.Wait()
	fmt.Println("All workers completed")
}
```

## Context for Cancellation
- difficulty: hard
- description: Using context for timeout and cancellation

```go
func longRunningTask(ctx context.Context) error {
	select {
	case <-time.After(5 * time.Second):
		return nil
	case <-ctx.Done():
		return ctx.Err()
	}
}

func main() {
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	if err := longRunningTask(ctx); err != nil {
		fmt.Println("Task cancelled:", err)
	}
}
```

## Generics
- difficulty: hard
- description: Generic functions and types in Go 1.18+

```go
func Min[T constraints.Ordered](a, b T) T {
	if a < b {
		return a
	}
	return b
}

func Map[T, U any](slice []T, fn func(T) U) []U {
	result := make([]U, len(slice))
	for i, v := range slice {
		result[i] = fn(v)
	}
	return result
}
```

## HTTP Server
- difficulty: hard
- description: Creating a basic HTTP server with handlers

```go
func helloHandler(w http.ResponseWriter, r *http.Request) {
	name := r.URL.Query().Get("name")
	if name == "" {
		name = "World"
	}
	fmt.Fprintf(w, "Hello, %s!", name)
}

func main() {
	http.HandleFunc("/hello", helloHandler)
	fmt.Println("Server starting on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
```

## JSON Encoding and Decoding
- difficulty: hard
- description: Working with JSON data using struct tags

```go
type User struct {
	ID        int    `json:"id"`
	Name      string `json:"name"`
	Email     string `json:"email,omitempty"`
	CreatedAt string `json:"created_at"`
}

func main() {
	user := User{ID: 1, Name: "Alice", Email: "alice@example.com"}

	// Encode to JSON
	jsonData, _ := json.Marshal(user)
	fmt.Println(string(jsonData))

	// Decode from JSON
	var decoded User
	json.Unmarshal(jsonData, &decoded)
	fmt.Printf("%+v\n", decoded)
}
```

## HTTP Client with JSON
- difficulty: hard
- description: Making HTTP requests and parsing JSON responses

```go
type APIResponse struct {
	Status string          `json:"status"`
	Data   json.RawMessage `json:"data"`
}

func fetchAPI(url string) (*APIResponse, error) {
	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var result APIResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}
	return &result, nil
}
```

## Worker Pool Pattern
- difficulty: hard
- description: Implementing a worker pool for concurrent processing

```go
func worker(id int, jobs <-chan int, results chan<- int) {
	for job := range jobs {
		fmt.Printf("Worker %d processing job %d\n", id, job)
		time.Sleep(time.Second)
		results <- job * 2
	}
}

func main() {
	jobs := make(chan int, 100)
	results := make(chan int, 100)

	for w := 1; w <= 3; w++ {
		go worker(w, jobs, results)
	}

	for j := 1; j <= 9; j++ {
		jobs <- j
	}
	close(jobs)

	for r := 1; r <= 9; r++ {
		fmt.Println("Result:", <-results)
	}
}
```
