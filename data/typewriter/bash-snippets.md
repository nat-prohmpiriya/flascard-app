# Bash Script Snippets

Comprehensive Bash scripting snippets for automation and system administration.

---

## Shebang and Strict Mode
- difficulty: easy
- description: Start script with shebang and enable strict error handling

```bash
#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

# -e: Exit on error
# -u: Error on undefined variables
# -o pipefail: Fail pipe on first error
# IFS: Set safe field separator
```

---

## Variable Declaration
- difficulty: easy
- description: Declare and use variables with proper quoting

```bash
name="John"
age=25
readonly PI=3.14159

echo "Name: $name"
echo "Age: ${age}"
echo "PI: $PI"

# Unset variable
unset name
```

---

## Local Variables in Functions
- difficulty: easy
- description: Use local keyword to scope variables within functions

```bash
greeting() {
    local name="$1"
    local message="Hello, ${name}!"
    echo "$message"
}

greeting "World"
```

---

## Environment Variables
- difficulty: easy
- description: Export and access environment variables

```bash
export APP_ENV="production"
export DB_HOST="localhost"
export DB_PORT=5432

echo "Environment: $APP_ENV"
echo "Database: $DB_HOST:$DB_PORT"

# Access with default value
echo "${APP_ENV:-development}"
```

---

## Default Values
- difficulty: easy
- description: Provide default values for undefined variables

```bash
# Use default if unset
name="${1:-anonymous}"

# Use default if unset or empty
name="${1:=default_name}"

# Error if unset
name="${1:?Error: name is required}"

# Use alternate value if set
result="${name:+Value is: $name}"
```

---

## String Length
- difficulty: easy
- description: Get the length of a string variable

```bash
text="Hello World"
length=${#text}
echo "Length: $length"
```

---

## Substring Extraction
- difficulty: medium
- description: Extract substring using parameter expansion

```bash
text="Hello World"

# From position 0, length 5
echo "${text:0:5}"    # Hello

# From position 6 to end
echo "${text:6}"      # World

# Last 5 characters
echo "${text: -5}"    # World
```

---

## String Replacement
- difficulty: medium
- description: Replace patterns in strings using parameter expansion

```bash
text="Hello World World"

# Replace first occurrence
echo "${text/World/Universe}"    # Hello Universe World

# Replace all occurrences
echo "${text//World/Universe}"   # Hello Universe Universe

# Replace from beginning
echo "${text/#Hello/Hi}"         # Hi World World

# Replace from end
echo "${text/%World/Universe}"   # Hello World Universe
```

---

## Case Conversion
- difficulty: easy
- description: Convert string case using parameter expansion

```bash
text="Hello World"

# Lowercase
echo "${text,,}"      # hello world

# Uppercase
echo "${text^^}"      # HELLO WORLD

# Capitalize first letter
echo "${text^}"       # Hello World

# Toggle case
echo "${text~~}"      # hELLO wORLD
```

---

## Remove Prefix and Suffix
- difficulty: medium
- description: Strip patterns from beginning or end of strings

```bash
filename="archive.tar.gz"

# Remove shortest match from beginning
echo "${filename#*.}"     # tar.gz

# Remove longest match from beginning
echo "${filename##*.}"    # gz

# Remove shortest match from end
echo "${filename%.*}"     # archive.tar

# Remove longest match from end
echo "${filename%%.*}"    # archive
```

---

## Indexed Array
- difficulty: easy
- description: Create and manipulate indexed arrays

```bash
# Declare array
fruits=("apple" "banana" "cherry")

# Access elements
echo "${fruits[0]}"       # apple
echo "${fruits[1]}"       # banana

# All elements
echo "${fruits[@]}"       # apple banana cherry

# Array length
echo "${#fruits[@]}"      # 3

# Add element
fruits+=("date")

# Remove element
unset fruits[1]
```

---

## Associative Array
- difficulty: medium
- description: Create key-value pair arrays (requires bash 4+)

```bash
declare -A config

config["host"]="localhost"
config["port"]=8080
config["env"]="production"

# Access by key
echo "${config[host]}"

# All keys
echo "${!config[@]}"

# All values
echo "${config[@]}"

# Iterate
for key in "${!config[@]}"; do
    echo "$key: ${config[$key]}"
done
```

---

## Array Iteration
- difficulty: easy
- description: Loop through array elements safely

```bash
files=("file1.txt" "file 2.txt" "file3.txt")

# Iterate with index
for i in "${!files[@]}"; do
    echo "Index $i: ${files[$i]}"
done

# Iterate values only
for file in "${files[@]}"; do
    echo "Processing: $file"
done
```

---

## Array Slicing
- difficulty: medium
- description: Extract subset of array elements

```bash
numbers=(0 1 2 3 4 5 6 7 8 9)

# Elements from index 3, length 4
echo "${numbers[@]:3:4}"    # 3 4 5 6

# Elements from index 5 to end
echo "${numbers[@]:5}"      # 5 6 7 8 9
```

---

## If Statement
- difficulty: easy
- description: Basic conditional branching with if-else

```bash
value=10

if [[ $value -gt 5 ]]; then
    echo "Greater than 5"
elif [[ $value -eq 5 ]]; then
    echo "Equal to 5"
else
    echo "Less than 5"
fi
```

---

## String Comparison
- difficulty: easy
- description: Compare strings in conditionals

```bash
str1="hello"
str2="world"

if [[ "$str1" == "$str2" ]]; then
    echo "Equal"
fi

if [[ "$str1" != "$str2" ]]; then
    echo "Not equal"
fi

if [[ -z "$str1" ]]; then
    echo "Empty string"
fi

if [[ -n "$str1" ]]; then
    echo "Not empty"
fi
```

---

## Numeric Comparison
- difficulty: easy
- description: Compare numbers using test operators

```bash
a=10
b=20

if [[ $a -eq $b ]]; then echo "Equal"; fi
if [[ $a -ne $b ]]; then echo "Not equal"; fi
if [[ $a -lt $b ]]; then echo "Less than"; fi
if [[ $a -le $b ]]; then echo "Less or equal"; fi
if [[ $a -gt $b ]]; then echo "Greater than"; fi
if [[ $a -ge $b ]]; then echo "Greater or equal"; fi
```

---

## Arithmetic Comparison
- difficulty: easy
- description: Use arithmetic context for numeric comparisons

```bash
a=10
b=20

if (( a == b )); then echo "Equal"; fi
if (( a != b )); then echo "Not equal"; fi
if (( a < b )); then echo "Less than"; fi
if (( a <= b )); then echo "Less or equal"; fi
if (( a > b )); then echo "Greater than"; fi
if (( a >= b )); then echo "Greater or equal"; fi
```

---

## File Test Operators
- difficulty: medium
- description: Check file existence and properties

```bash
file="/path/to/file"

if [[ -e "$file" ]]; then echo "Exists"; fi
if [[ -f "$file" ]]; then echo "Is regular file"; fi
if [[ -d "$file" ]]; then echo "Is directory"; fi
if [[ -r "$file" ]]; then echo "Is readable"; fi
if [[ -w "$file" ]]; then echo "Is writable"; fi
if [[ -x "$file" ]]; then echo "Is executable"; fi
if [[ -s "$file" ]]; then echo "Size > 0"; fi
if [[ -L "$file" ]]; then echo "Is symlink"; fi
```

---

## Logical Operators
- difficulty: easy
- description: Combine conditions with AND, OR, NOT

```bash
a=5
b=10

# AND
if [[ $a -gt 0 && $b -gt 0 ]]; then
    echo "Both positive"
fi

# OR
if [[ $a -eq 0 || $b -eq 0 ]]; then
    echo "At least one is zero"
fi

# NOT
if [[ ! -f "file.txt" ]]; then
    echo "File does not exist"
fi
```

---

## Case Statement
- difficulty: medium
- description: Pattern matching with case for multiple conditions

```bash
fruit="apple"

case "$fruit" in
    apple)
        echo "Red fruit"
        ;;
    banana|plantain)
        echo "Yellow fruit"
        ;;
    *)
        echo "Unknown fruit"
        ;;
esac
```

---

## Case with Patterns
- difficulty: medium
- description: Use glob patterns in case statements

```bash
filename="image.png"

case "$filename" in
    *.jpg|*.jpeg|*.png|*.gif)
        echo "Image file"
        ;;
    *.mp4|*.avi|*.mkv)
        echo "Video file"
        ;;
    *.txt|*.md|*.log)
        echo "Text file"
        ;;
    *)
        echo "Unknown type"
        ;;
esac
```

---

## For Loop
- difficulty: easy
- description: Iterate over a list of items

```bash
for fruit in apple banana cherry; do
    echo "Fruit: $fruit"
done

# Iterate over files
for file in *.txt; do
    echo "Processing: $file"
done
```

---

## For Loop with Range
- difficulty: easy
- description: Iterate over numeric range using brace expansion

```bash
# Range 1 to 10
for i in {1..10}; do
    echo "Number: $i"
done

# Range with step
for i in {0..100..10}; do
    echo "Number: $i"
done
```

---

## C-style For Loop
- difficulty: easy
- description: Traditional for loop with counter variable

```bash
for ((i = 0; i < 10; i++)); do
    echo "Index: $i"
done

# Multiple variables
for ((i = 0, j = 10; i < j; i++, j--)); do
    echo "i=$i, j=$j"
done
```

---

## While Loop
- difficulty: easy
- description: Loop while condition is true

```bash
count=0

while [[ $count -lt 5 ]]; do
    echo "Count: $count"
    ((count++))
done
```

---

## Until Loop
- difficulty: easy
- description: Loop until condition becomes true

```bash
count=0

until [[ $count -ge 5 ]]; do
    echo "Count: $count"
    ((count++))
done
```

---

## Read File Line by Line
- difficulty: medium
- description: Process file contents line by line

```bash
while IFS= read -r line; do
    echo "Line: $line"
done < "input.txt"

# With line number
linenum=0
while IFS= read -r line; do
    ((linenum++))
    echo "$linenum: $line"
done < "input.txt"
```

---

## Loop Control
- difficulty: easy
- description: Use break and continue in loops

```bash
for i in {1..10}; do
    if [[ $i -eq 5 ]]; then
        continue    # Skip iteration
    fi

    if [[ $i -eq 8 ]]; then
        break       # Exit loop
    fi

    echo "Number: $i"
done
```

---

## Infinite Loop
- difficulty: easy
- description: Create loop that runs forever until interrupted

```bash
while true; do
    echo "Running... (Ctrl+C to stop)"
    sleep 1
done

# Alternative
while :; do
    echo "Running..."
    sleep 1
done
```

---

## Function Definition
- difficulty: easy
- description: Define and call functions

```bash
greet() {
    echo "Hello, World!"
}

# Call function
greet

# Alternative syntax
function greet2 {
    echo "Hello again!"
}

greet2
```

---

## Function with Arguments
- difficulty: easy
- description: Pass and access arguments in functions

```bash
greet() {
    local name="$1"
    local greeting="${2:-Hello}"
    echo "$greeting, $name!"
}

greet "Alice"           # Hello, Alice!
greet "Bob" "Hi"        # Hi, Bob!
```

---

## Function Return Values
- difficulty: medium
- description: Return values from functions using echo or return code

```bash
# Return string via echo
get_date() {
    echo "$(date +%Y-%m-%d)"
}

today=$(get_date)
echo "Today: $today"

# Return status code
is_even() {
    local num=$1
    if (( num % 2 == 0 )); then
        return 0    # Success/true
    else
        return 1    # Failure/false
    fi
}

if is_even 4; then
    echo "4 is even"
fi
```

---

## Function with Nameref
- difficulty: hard
- description: Pass variables by reference using nameref

```bash
modify_array() {
    local -n arr_ref=$1
    arr_ref+=("new_item")
}

my_array=("item1" "item2")
modify_array my_array
echo "${my_array[@]}"    # item1 item2 new_item
```

---

## Command Substitution
- difficulty: easy
- description: Capture command output in a variable

```bash
# Modern syntax (preferred)
current_dir=$(pwd)
file_count=$(ls -1 | wc -l)

# Legacy syntax
current_date=`date +%Y-%m-%d`

echo "Directory: $current_dir"
echo "Files: $file_count"
echo "Date: $current_date"
```

---

## Arithmetic Operations
- difficulty: easy
- description: Perform arithmetic calculations

```bash
a=10
b=3

# Using $(( ))
sum=$((a + b))
diff=$((a - b))
prod=$((a * b))
quot=$((a / b))
mod=$((a % b))

echo "Sum: $sum, Diff: $diff, Prod: $prod, Quot: $quot, Mod: $mod"

# Increment/Decrement
((a++))
((b--))

# Compound assignment
((a += 5))
```

---

## Floating Point Math
- difficulty: medium
- description: Use bc for floating point calculations

```bash
result=$(echo "scale=2; 10 / 3" | bc)
echo "Result: $result"    # 3.33

# Complex calculation
pi=$(echo "scale=10; 4*a(1)" | bc -l)
echo "PI: $pi"

# Using awk
result=$(awk "BEGIN {printf \"%.2f\", 10/3}")
echo "Result: $result"
```

---

## Read User Input
- difficulty: easy
- description: Prompt and read input from user

```bash
read -p "Enter your name: " name
echo "Hello, $name!"

# With timeout
read -t 5 -p "Quick! Enter something: " input

# Silent input (for passwords)
read -s -p "Enter password: " password
echo
```

---

## Read Multiple Values
- difficulty: easy
- description: Read multiple values into separate variables

```bash
echo "Enter first and last name:"
read first last
echo "Hello, $first $last!"

# Read into array
read -a colors -p "Enter colors (space separated): "
echo "Colors: ${colors[@]}"
```

---

## Here Document
- difficulty: medium
- description: Create multi-line string input for commands

```bash
cat <<EOF
This is a multi-line
text block that preserves
formatting and $variable expansion.
EOF

# Without variable expansion
cat <<'EOF'
This preserves $literal text
without expansion.
EOF
```

---

## Here String
- difficulty: easy
- description: Pass string as stdin to command

```bash
# Count words in string
wc -w <<< "Hello World"

# Process with grep
grep "error" <<< "This is an error message"

# Use with read
read -r first rest <<< "Hello World Bash"
echo "First: $first"    # Hello
```

---

## Redirect Output
- difficulty: easy
- description: Redirect stdout and stderr to files

```bash
# Redirect stdout
echo "output" > file.txt

# Append stdout
echo "more output" >> file.txt

# Redirect stderr
command 2> error.log

# Redirect both
command > output.log 2>&1

# Modern syntax (bash 4+)
command &> all.log

# Discard output
command > /dev/null 2>&1
```

---

## Process Substitution
- difficulty: hard
- description: Use command output as file input

```bash
# Compare two command outputs
diff <(ls dir1) <(ls dir2)

# Read from command
while read -r line; do
    echo "$line"
done < <(find . -name "*.txt")

# Write to command
tee >(gzip > file.gz) >(md5sum > file.md5) < input.txt
```

---

## Pipe Commands
- difficulty: easy
- description: Chain commands using pipes

```bash
# Filter and count
cat file.txt | grep "error" | wc -l

# Sort and unique
cat names.txt | sort | uniq

# Complex pipeline
ps aux | grep nginx | grep -v grep | awk '{print $2}'
```

---

## Exit Codes
- difficulty: easy
- description: Check and return exit codes

```bash
command_that_might_fail

if [[ $? -eq 0 ]]; then
    echo "Success"
else
    echo "Failed with code: $?"
fi

# Custom exit code
exit 0    # Success
exit 1    # General error
exit 2    # Misuse of command
```

---

## Error Handling with trap
- difficulty: medium
- description: Set up error handlers using trap

```bash
cleanup() {
    echo "Cleaning up..."
    rm -f /tmp/tempfile.$$
}

trap cleanup EXIT

error_handler() {
    echo "Error on line $1"
    exit 1
}

trap 'error_handler $LINENO' ERR

# Script continues...
```

---

## Try-Catch Pattern
- difficulty: medium
- description: Implement error handling similar to try-catch

```bash
try() {
    [[ $- = *e* ]]; SAVED_OPT_E=$?
    set +e
}

catch() {
    export exception_code=$?
    (( SAVED_OPT_E )) && set +e
    return $exception_code
}

try
(
    # Commands that might fail
    false
    echo "This won't print"
)
catch && {
    echo "Caught error: $exception_code"
}
```

---

## Logging Function
- difficulty: medium
- description: Create reusable logging with levels and timestamps

```bash
LOG_LEVEL="${LOG_LEVEL:-INFO}"

log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')

    case "$level" in
        DEBUG) [[ "$LOG_LEVEL" == "DEBUG" ]] && echo "[$timestamp] DEBUG: $message" ;;
        INFO)  echo "[$timestamp] INFO: $message" ;;
        WARN)  echo "[$timestamp] WARN: $message" >&2 ;;
        ERROR) echo "[$timestamp] ERROR: $message" >&2 ;;
    esac
}

log INFO "Application started"
log ERROR "Something went wrong"
```

---

## Parse Command Line Arguments
- difficulty: medium
- description: Process positional and flag arguments

```bash
#!/usr/bin/env bash

usage() {
    echo "Usage: $0 [-v] [-f file] [-h] name"
    exit 1
}

verbose=false
file=""

while [[ $# -gt 0 ]]; do
    case "$1" in
        -v|--verbose)
            verbose=true
            shift
            ;;
        -f|--file)
            file="$2"
            shift 2
            ;;
        -h|--help)
            usage
            ;;
        -*)
            echo "Unknown option: $1"
            usage
            ;;
        *)
            name="$1"
            shift
            ;;
    esac
done

[[ -z "$name" ]] && usage

echo "Name: $name, Verbose: $verbose, File: $file"
```

---

## Parse with getopts
- difficulty: medium
- description: Use builtin getopts for option parsing

```bash
#!/usr/bin/env bash

verbose=0
output=""

while getopts "vo:h" opt; do
    case "$opt" in
        v) verbose=1 ;;
        o) output="$OPTARG" ;;
        h) echo "Usage: $0 [-v] [-o output] file"; exit 0 ;;
        ?) exit 1 ;;
    esac
done

shift $((OPTIND - 1))
file="${1:?Missing file argument}"

echo "File: $file, Verbose: $verbose, Output: $output"
```

---

## Create Temp File
- difficulty: easy
- description: Safely create and cleanup temporary files

```bash
tmpfile=$(mktemp)
tmpdir=$(mktemp -d)

# Cleanup on exit
trap "rm -f $tmpfile; rm -rf $tmpdir" EXIT

echo "data" > "$tmpfile"
echo "Temp file: $tmpfile"
echo "Temp dir: $tmpdir"
```

---

## Check Command Exists
- difficulty: easy
- description: Verify command is available before using

```bash
command_exists() {
    command -v "$1" &> /dev/null
}

if command_exists docker; then
    echo "Docker is installed"
else
    echo "Docker not found"
    exit 1
fi

# Alternative
if ! type jq &> /dev/null; then
    echo "jq is required but not installed"
    exit 1
fi
```

---

## Find and Execute
- difficulty: medium
- description: Find files and execute commands on them

```bash
# Using -exec
find . -name "*.log" -exec rm {} \;

# Using -exec with confirmation
find . -name "*.bak" -exec rm -i {} \;

# Using xargs (more efficient)
find . -name "*.txt" -print0 | xargs -0 wc -l

# With parallel execution
find . -name "*.jpg" -print0 | xargs -0 -P 4 -I {} convert {} -resize 50% {}
```

---

## Process Background Jobs
- difficulty: medium
- description: Run commands in background and manage them

```bash
# Run in background
long_task &
pid=$!

echo "Started background job: $pid"

# Wait for completion
wait $pid
echo "Job completed with status: $?"

# Run multiple and wait all
task1 &
task2 &
task3 &
wait

echo "All tasks completed"
```

---

## Parallel Execution
- difficulty: hard
- description: Run commands in parallel with job control

```bash
#!/usr/bin/env bash

max_jobs=4
job_count=0

run_parallel() {
    local cmd="$1"

    while (( job_count >= max_jobs )); do
        wait -n
        ((job_count--))
    done

    eval "$cmd" &
    ((job_count++))
}

for i in {1..10}; do
    run_parallel "echo 'Processing $i'; sleep 1"
done

wait
echo "All done"
```

---

## Lock File
- difficulty: medium
- description: Prevent concurrent script execution with lock file

```bash
LOCKFILE="/tmp/$(basename "$0").lock"

acquire_lock() {
    if ! mkdir "$LOCKFILE" 2>/dev/null; then
        echo "Script is already running"
        exit 1
    fi
    trap "rm -rf $LOCKFILE" EXIT
}

acquire_lock
echo "Running with lock..."
sleep 10
```

---

## Lock with flock
- difficulty: medium
- description: Use flock for robust file locking

```bash
#!/usr/bin/env bash

LOCKFILE="/var/lock/$(basename "$0").lock"

exec 200>"$LOCKFILE"

if ! flock -n 200; then
    echo "Another instance is running"
    exit 1
fi

# Script continues with lock held
echo "Running exclusively..."
sleep 10
```

---

## Signal Handling
- difficulty: medium
- description: Handle signals for graceful shutdown

```bash
#!/usr/bin/env bash

shutdown=false

handle_signal() {
    echo "Received signal, shutting down..."
    shutdown=true
}

trap handle_signal SIGINT SIGTERM

while ! $shutdown; do
    echo "Working..."
    sleep 1
done

echo "Cleanup complete"
```

---

## Timeout Command
- difficulty: easy
- description: Run command with timeout limit

```bash
# Timeout after 5 seconds
timeout 5 long_running_command

# With custom signal
timeout -s SIGKILL 10 command

# Check if timed out
if timeout 5 command; then
    echo "Completed"
else
    if [[ $? -eq 124 ]]; then
        echo "Timed out"
    fi
fi
```

---

## Retry Logic
- difficulty: medium
- description: Retry failed commands with exponential backoff

```bash
retry() {
    local max_attempts=$1
    local delay=$2
    shift 2
    local cmd="$@"

    local attempt=1
    while (( attempt <= max_attempts )); do
        echo "Attempt $attempt of $max_attempts"

        if eval "$cmd"; then
            return 0
        fi

        if (( attempt < max_attempts )); then
            echo "Retrying in ${delay}s..."
            sleep "$delay"
            delay=$((delay * 2))
        fi

        ((attempt++))
    done

    echo "All attempts failed"
    return 1
}

retry 3 1 curl -f http://example.com/api
```

---

## Progress Bar
- difficulty: medium
- description: Display progress bar for long operations

```bash
progress_bar() {
    local current=$1
    local total=$2
    local width=50
    local percent=$((current * 100 / total))
    local filled=$((width * current / total))
    local empty=$((width - filled))

    printf "\r["
    printf "%${filled}s" | tr ' ' '#'
    printf "%${empty}s" | tr ' ' '-'
    printf "] %3d%%" "$percent"
}

total=100
for ((i = 1; i <= total; i++)); do
    progress_bar "$i" "$total"
    sleep 0.05
done
echo
```

---

## Spinner Animation
- difficulty: easy
- description: Show spinner while waiting for background process

```bash
spinner() {
    local pid=$1
    local chars="⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏"
    local i=0

    while kill -0 "$pid" 2>/dev/null; do
        printf "\r%s Working..." "${chars:i++%${#chars}:1}"
        sleep 0.1
    done
    printf "\r%s Done!     \n" "✓"
}

long_task &
spinner $!
```

---

## Menu Selection
- difficulty: medium
- description: Create interactive menu with select

```bash
PS3="Select an option: "

options=("Start" "Stop" "Restart" "Status" "Quit")

select opt in "${options[@]}"; do
    case "$opt" in
        Start)   echo "Starting..."; break ;;
        Stop)    echo "Stopping..."; break ;;
        Restart) echo "Restarting..."; break ;;
        Status)  echo "Checking status..." ;;
        Quit)    exit 0 ;;
        *)       echo "Invalid option" ;;
    esac
done
```

---

## Colored Output
- difficulty: easy
- description: Print colored text to terminal

```bash
# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m'  # No Color

echo -e "${RED}Error:${NC} Something went wrong"
echo -e "${GREEN}Success:${NC} Operation completed"
echo -e "${YELLOW}Warning:${NC} Check your input"
echo -e "${BLUE}Info:${NC} Processing..."

# Bold and underline
BOLD='\033[1m'
UNDERLINE='\033[4m'
echo -e "${BOLD}Bold text${NC}"
echo -e "${UNDERLINE}Underlined${NC}"
```

---

## Check Root Privileges
- difficulty: easy
- description: Verify script is running with root permissions

```bash
require_root() {
    if [[ $EUID -ne 0 ]]; then
        echo "This script must be run as root"
        exit 1
    fi
}

require_root
echo "Running as root..."
```

---

## Get Script Directory
- difficulty: easy
- description: Get the directory containing the script

```bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPT_NAME="$(basename "${BASH_SOURCE[0]}")"

echo "Script: $SCRIPT_NAME"
echo "Directory: $SCRIPT_DIR"

# Change to script directory
cd "$SCRIPT_DIR" || exit 1
```

---

## Source Configuration File
- difficulty: easy
- description: Load variables from external config file

```bash
CONFIG_FILE="${CONFIG_FILE:-/etc/myapp/config}"

if [[ -f "$CONFIG_FILE" ]]; then
    source "$CONFIG_FILE"
else
    echo "Config file not found: $CONFIG_FILE"
    exit 1
fi

echo "Loaded: DB_HOST=$DB_HOST"
```

---

## INI File Parser
- difficulty: hard
- description: Parse INI configuration file format

```bash
parse_ini() {
    local file="$1"
    local section=""

    while IFS='=' read -r key value; do
        key=$(echo "$key" | tr -d '[:space:]')
        value=$(echo "$value" | tr -d '[:space:]')

        if [[ $key =~ ^\[(.*)\]$ ]]; then
            section="${BASH_REMATCH[1]}"
        elif [[ -n $key && ! $key =~ ^# ]]; then
            if [[ -n $section ]]; then
                declare -g "${section}_${key}=$value"
            else
                declare -g "$key=$value"
            fi
        fi
    done < "$file"
}

parse_ini "config.ini"
echo "Database host: $database_host"
```

---

## JSON Parsing with jq
- difficulty: medium
- description: Extract values from JSON using jq

```bash
json='{"name":"John","age":30,"city":"NYC"}'

# Extract single value
name=$(echo "$json" | jq -r '.name')
echo "Name: $name"

# Extract multiple values
read -r name age <<< $(echo "$json" | jq -r '[.name, .age] | @tsv')

# Iterate array
echo '[{"id":1},{"id":2}]' | jq -r '.[].id'

# Filter and transform
echo "$json" | jq '{fullName: .name, location: .city}'
```

---

## CSV Processing
- difficulty: medium
- description: Read and process CSV files

```bash
# Read CSV with header
{
    read -r header
    while IFS=, read -r name age city; do
        echo "Name: $name, Age: $age, City: $city"
    done
} < data.csv

# Using awk
awk -F',' 'NR>1 {print $1, $2}' data.csv

# Convert to JSON
awk -F',' 'NR==1{split($0,h);next}{printf "{";for(i=1;i<=NF;i++)printf "\"%s\":\"%s\"%s",h[i],$i,(i<NF?",":"");print "}"}' data.csv
```

---

## Date Manipulation
- difficulty: medium
- description: Work with dates and timestamps

```bash
# Current date/time
now=$(date +%Y-%m-%d)
timestamp=$(date +%s)

# Format date
date +"%Y-%m-%d %H:%M:%S"

# Date arithmetic
yesterday=$(date -d "yesterday" +%Y-%m-%d)
next_week=$(date -d "+7 days" +%Y-%m-%d)

# Parse date
date -d "2024-01-15" +%A    # Day name

# Time difference
start=$(date +%s)
sleep 2
end=$(date +%s)
echo "Elapsed: $((end - start)) seconds"
```

---

## UUID Generation
- difficulty: easy
- description: Generate unique identifiers

```bash
# Using uuidgen
uuid=$(uuidgen)

# Using /proc/sys/kernel/random/uuid (Linux)
uuid=$(cat /proc/sys/kernel/random/uuid)

# Using openssl
uuid=$(openssl rand -hex 16 | sed 's/\(..\)/\1-/g; s/-$//')

echo "UUID: $uuid"
```

---

## Random Number
- difficulty: easy
- description: Generate random numbers

```bash
# Random number 0-32767
echo $RANDOM

# Random in range (0-99)
echo $((RANDOM % 100))

# Random in range (10-50)
min=10
max=50
echo $((RANDOM % (max - min + 1) + min))

# Cryptographically secure
openssl rand -base64 32
```

---

## Hash String
- difficulty: easy
- description: Generate hash of string or file

```bash
# MD5
echo -n "password" | md5sum | cut -d' ' -f1

# SHA256
echo -n "password" | sha256sum | cut -d' ' -f1

# File hash
sha256sum file.txt

# Base64 encode/decode
echo "text" | base64
echo "dGV4dAo=" | base64 -d
```

---

## URL Encode/Decode
- difficulty: medium
- description: Encode and decode URL strings

```bash
urlencode() {
    local string="$1"
    local length="${#string}"
    local encoded=""

    for ((i = 0; i < length; i++)); do
        local c="${string:i:1}"
        case "$c" in
            [a-zA-Z0-9.~_-]) encoded+="$c" ;;
            *) encoded+=$(printf '%%%02X' "'$c") ;;
        esac
    done
    echo "$encoded"
}

urldecode() {
    local encoded="$1"
    printf '%b' "${encoded//%/\\x}"
}

urlencode "Hello World!"    # Hello%20World%21
urldecode "Hello%20World%21"
```

---

## HTTP Request with curl
- difficulty: medium
- description: Make HTTP requests using curl

```bash
# GET request
response=$(curl -s "https://api.example.com/data")

# POST with JSON
curl -X POST \
    -H "Content-Type: application/json" \
    -d '{"name":"John"}' \
    "https://api.example.com/users"

# With authentication
curl -u "user:pass" "https://api.example.com/private"

# Check response code
status=$(curl -s -o /dev/null -w "%{http_code}" "https://api.example.com")
if [[ $status -eq 200 ]]; then
    echo "Success"
fi
```

---

## Download with Progress
- difficulty: easy
- description: Download file with progress indicator

```bash
# With progress bar
curl -# -O "https://example.com/file.zip"

# With wget
wget --progress=bar "https://example.com/file.zip"

# Resume interrupted download
curl -C - -O "https://example.com/large-file.zip"
wget -c "https://example.com/large-file.zip"
```

---

## SSH Remote Command
- difficulty: medium
- description: Execute commands on remote servers via SSH

```bash
# Single command
ssh user@host "ls -la /var/log"

# Multiple commands
ssh user@host << 'EOF'
cd /var/www
git pull
systemctl restart nginx
EOF

# With options
ssh -o StrictHostKeyChecking=no \
    -o ConnectTimeout=10 \
    user@host "uptime"
```

---

## Archive and Compress
- difficulty: easy
- description: Create and extract archives

```bash
# Create tar.gz
tar -czvf archive.tar.gz directory/

# Extract tar.gz
tar -xzvf archive.tar.gz

# Create zip
zip -r archive.zip directory/

# Extract zip
unzip archive.zip

# List contents
tar -tvf archive.tar.gz
```

---

## Disk Usage Check
- difficulty: easy
- description: Monitor disk space and alert on threshold

```bash
check_disk() {
    local threshold="${1:-80}"
    local mount="${2:-/}"

    local usage=$(df -h "$mount" | awk 'NR==2 {print $5}' | tr -d '%')

    if (( usage > threshold )); then
        echo "WARNING: Disk usage at ${usage}% (threshold: ${threshold}%)"
        return 1
    fi

    echo "OK: Disk usage at ${usage}%"
    return 0
}

check_disk 80 /
```

---

## Process Monitor
- difficulty: medium
- description: Monitor and restart process if not running

```bash
#!/usr/bin/env bash

PROCESS_NAME="nginx"
CHECK_INTERVAL=60

monitor_process() {
    while true; do
        if ! pgrep -x "$PROCESS_NAME" > /dev/null; then
            echo "$(date): $PROCESS_NAME not running, restarting..."
            systemctl restart "$PROCESS_NAME"
        fi
        sleep "$CHECK_INTERVAL"
    done
}

monitor_process
```

---

## Service Health Check
- difficulty: medium
- description: Check if service is responding on port

```bash
check_service() {
    local host="$1"
    local port="$2"
    local timeout="${3:-5}"

    if timeout "$timeout" bash -c "cat < /dev/null > /dev/tcp/$host/$port" 2>/dev/null; then
        echo "Service $host:$port is UP"
        return 0
    else
        echo "Service $host:$port is DOWN"
        return 1
    fi
}

check_service localhost 80
check_service localhost 5432
```

---

## Validate IP Address
- difficulty: medium
- description: Check if string is valid IPv4 address

```bash
is_valid_ip() {
    local ip="$1"
    local IFS='.'
    read -ra octets <<< "$ip"

    [[ ${#octets[@]} -ne 4 ]] && return 1

    for octet in "${octets[@]}"; do
        [[ ! $octet =~ ^[0-9]+$ ]] && return 1
        (( octet < 0 || octet > 255 )) && return 1
    done

    return 0
}

if is_valid_ip "192.168.1.1"; then
    echo "Valid IP"
fi
```

---

## Validate Email
- difficulty: medium
- description: Check if string matches email format

```bash
is_valid_email() {
    local email="$1"
    local regex="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"

    if [[ $email =~ $regex ]]; then
        return 0
    fi
    return 1
}

if is_valid_email "user@example.com"; then
    echo "Valid email"
fi
```

---

## Debug Mode
- difficulty: easy
- description: Enable verbose debugging output

```bash
#!/usr/bin/env bash

DEBUG="${DEBUG:-false}"

debug() {
    if [[ "$DEBUG" = true ]]; then
        echo "[DEBUG] $*" >&2
    fi
}

# Enable trace mode
[[ "$DEBUG" = true ]] && set -x

debug "Starting script"
debug "Variable value: $somevar"

# Run with: DEBUG=true ./script.sh
```

---

## Assert Function
- difficulty: medium
- description: Add assertions for testing and validation

```bash
assert() {
    local condition="$1"
    local message="${2:-Assertion failed}"

    if ! eval "$condition"; then
        echo "ASSERT FAILED: $message"
        echo "  Condition: $condition"
        echo "  Line: ${BASH_LINENO[0]}"
        exit 1
    fi
}

assert "[[ -n \"\$HOME\" ]]" "HOME must be set"
assert "[[ -d /tmp ]]" "/tmp must exist"
assert "[[ 5 -lt 10 ]]" "5 should be less than 10"

echo "All assertions passed"
```

---

## Unit Test Framework
- difficulty: hard
- description: Simple test framework for bash scripts

```bash
#!/usr/bin/env bash

TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

test_case() {
    local name="$1"
    local result="$2"

    ((TESTS_RUN++))

    if [[ "$result" == "0" ]]; then
        ((TESTS_PASSED++))
        echo "✓ $name"
    else
        ((TESTS_FAILED++))
        echo "✗ $name"
    fi
}

assert_equals() {
    [[ "$1" == "$2" ]]
    echo $?
}

# Tests
test_case "Addition" $(assert_equals "$((2+2))" "4")
test_case "String compare" $(assert_equals "hello" "hello")

echo
echo "Tests: $TESTS_RUN, Passed: $TESTS_PASSED, Failed: $TESTS_FAILED"
```

---

## Cron Job Setup
- difficulty: easy
- description: Template for cron-compatible script

```bash
#!/usr/bin/env bash

# Cron job script template
# Add to crontab: 0 * * * * /path/to/script.sh

LOGFILE="/var/log/myjob.log"
LOCKFILE="/tmp/myjob.lock"

exec >> "$LOGFILE" 2>&1

echo "=== Job started at $(date) ==="

# Prevent concurrent execution
if ! mkdir "$LOCKFILE" 2>/dev/null; then
    echo "Job already running"
    exit 0
fi
trap "rm -rf $LOCKFILE" EXIT

# Main job logic here
echo "Running job..."

echo "=== Job completed at $(date) ==="
```

---

## Systemd Service Script
- difficulty: medium
- description: Script compatible with systemd service

```bash
#!/usr/bin/env bash

PIDFILE="/var/run/myservice.pid"
LOGFILE="/var/log/myservice.log"

start() {
    if [[ -f "$PIDFILE" ]]; then
        echo "Service already running"
        return 1
    fi

    echo "Starting service..."
    nohup ./service_loop.sh >> "$LOGFILE" 2>&1 &
    echo $! > "$PIDFILE"
    echo "Started with PID $(cat $PIDFILE)"
}

stop() {
    if [[ ! -f "$PIDFILE" ]]; then
        echo "Service not running"
        return 1
    fi

    echo "Stopping service..."
    kill "$(cat $PIDFILE)"
    rm -f "$PIDFILE"
    echo "Stopped"
}

status() {
    if [[ -f "$PIDFILE" ]] && kill -0 "$(cat $PIDFILE)" 2>/dev/null; then
        echo "Service running (PID: $(cat $PIDFILE))"
    else
        echo "Service not running"
        rm -f "$PIDFILE"
    fi
}

case "${1:-}" in
    start)  start ;;
    stop)   stop ;;
    status) status ;;
    restart) stop; start ;;
    *) echo "Usage: $0 {start|stop|status|restart}" ;;
esac
```

---

## Deployment Script Template
- difficulty: hard
- description: Complete deployment script with rollback support

```bash
#!/usr/bin/env bash
set -euo pipefail

APP_NAME="myapp"
DEPLOY_DIR="/var/www/$APP_NAME"
BACKUP_DIR="/var/backups/$APP_NAME"
RELEASES_TO_KEEP=5

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }

backup() {
    log "Creating backup..."
    local backup_name="${APP_NAME}_$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    tar -czf "$BACKUP_DIR/$backup_name.tar.gz" -C "$DEPLOY_DIR" . 2>/dev/null || true

    # Cleanup old backups
    ls -t "$BACKUP_DIR"/*.tar.gz 2>/dev/null | tail -n +$((RELEASES_TO_KEEP + 1)) | xargs -r rm
}

deploy() {
    log "Deploying..."
    cd "$DEPLOY_DIR"
    git fetch origin
    git reset --hard origin/main
    npm ci --production
    npm run build
}

restart_service() {
    log "Restarting service..."
    systemctl restart "$APP_NAME"
    sleep 5

    if ! systemctl is-active --quiet "$APP_NAME"; then
        log "ERROR: Service failed to start"
        return 1
    fi
}

rollback() {
    local latest_backup=$(ls -t "$BACKUP_DIR"/*.tar.gz 2>/dev/null | head -1)
    if [[ -z "$latest_backup" ]]; then
        log "ERROR: No backup found"
        exit 1
    fi

    log "Rolling back to: $latest_backup"
    rm -rf "$DEPLOY_DIR"/*
    tar -xzf "$latest_backup" -C "$DEPLOY_DIR"
    restart_service
}

main() {
    backup

    if ! deploy; then
        log "Deploy failed, rolling back..."
        rollback
        exit 1
    fi

    if ! restart_service; then
        log "Service restart failed, rolling back..."
        rollback
        exit 1
    fi

    log "Deployment successful!"
}

case "${1:-deploy}" in
    deploy)   main ;;
    rollback) rollback ;;
    *) echo "Usage: $0 {deploy|rollback}" ;;
esac
```
