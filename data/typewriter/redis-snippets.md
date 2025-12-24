# Redis Snippets

## SET String Value
- difficulty: easy
- description: Store a string value with a key

```redis
SET user:1001:name "John Doe"
```

## SET with Expiration
- difficulty: easy
- description: Store value with automatic expiration in seconds

```redis
SET session:abc123 "user_data_here" EX 3600
```

## SET with Expiration Milliseconds
- difficulty: easy
- description: Store value with expiration in milliseconds

```redis
SET cache:api:response "{\"data\":\"value\"}" PX 30000
```

## SET Only If Not Exists
- difficulty: easy
- description: Set value only if key does not already exist

```redis
SET lock:order:5001 "worker-1" NX EX 30
```

## SET Only If Exists
- difficulty: easy
- description: Update value only if key already exists

```redis
SET user:1001:status "active" XX
```

## GET String Value
- difficulty: easy
- description: Retrieve a string value by key

```redis
GET user:1001:name
```

## GETEX with Expiration
- difficulty: medium
- description: Get value and set new expiration atomically

```redis
GETEX session:abc123 EX 3600
```

## GETDEL Key
- difficulty: easy
- description: Get value and delete key atomically

```redis
GETDEL temp:processing:job123
```

## MSET Multiple Keys
- difficulty: easy
- description: Set multiple key-value pairs atomically

```redis
MSET user:1:name "Alice" user:1:email "alice@example.com" user:1:role "admin"
```

## MGET Multiple Keys
- difficulty: easy
- description: Get multiple values in single command

```redis
MGET user:1:name user:1:email user:1:role user:1:status
```

## INCR Counter
- difficulty: easy
- description: Increment integer value by 1

```redis
INCR stats:page:views:homepage
```

## INCRBY Counter
- difficulty: easy
- description: Increment integer value by specified amount

```redis
INCRBY user:1001:points 50
```

## INCRBYFLOAT
- difficulty: easy
- description: Increment float value by specified amount

```redis
INCRBYFLOAT product:1:rating 0.5
```

## DECR Counter
- difficulty: easy
- description: Decrement integer value by 1

```redis
DECR inventory:product:1001:stock
```

## DECRBY Counter
- difficulty: easy
- description: Decrement integer value by specified amount

```redis
DECRBY user:1001:credits 10
```

## APPEND String
- difficulty: easy
- description: Append value to existing string

```redis
APPEND logs:app:2024-01-15 "\n[INFO] New log entry"
```

## STRLEN
- difficulty: easy
- description: Get length of string value

```redis
STRLEN user:1001:bio
```

## SETRANGE
- difficulty: medium
- description: Overwrite part of string at offset

```redis
SETRANGE user:1001:status 0 "inactive"
```

## GETRANGE
- difficulty: easy
- description: Get substring of string value

```redis
GETRANGE article:1:content 0 255
```

## SETNX Legacy
- difficulty: easy
- description: Set if not exists (legacy command)

```redis
SETNX distributed:lock:resource1 "holder-id-123"
```

## HSET Single Field
- difficulty: easy
- description: Set a single field in a hash

```redis
HSET user:1001 name "John Doe"
```

## HSET Multiple Fields
- difficulty: easy
- description: Set multiple fields in a hash at once

```redis
HSET user:1001 name "John Doe" email "john@example.com" age 30 role "admin"
```

## HGET Single Field
- difficulty: easy
- description: Get value of a single hash field

```redis
HGET user:1001 email
```

## HMGET Multiple Fields
- difficulty: easy
- description: Get values of multiple hash fields

```redis
HMGET user:1001 name email role status
```

## HGETALL
- difficulty: easy
- description: Get all fields and values from a hash

```redis
HGETALL user:1001
```

## HDEL Fields
- difficulty: easy
- description: Delete one or more fields from a hash

```redis
HDEL user:1001 tempToken resetCode lastFailedLogin
```

## HEXISTS
- difficulty: easy
- description: Check if a field exists in a hash

```redis
HEXISTS user:1001 emailVerified
```

## HINCRBY
- difficulty: easy
- description: Increment integer value of a hash field

```redis
HINCRBY user:1001 loginCount 1
```

## HINCRBYFLOAT
- difficulty: easy
- description: Increment float value of a hash field

```redis
HINCRBYFLOAT product:5001 rating 0.1
```

## HLEN
- difficulty: easy
- description: Get number of fields in a hash

```redis
HLEN user:1001
```

## HKEYS
- difficulty: easy
- description: Get all field names in a hash

```redis
HKEYS user:1001
```

## HVALS
- difficulty: easy
- description: Get all values in a hash

```redis
HVALS user:1001
```

## HSETNX
- difficulty: easy
- description: Set hash field only if it does not exist

```redis
HSETNX user:1001 createdAt "2024-01-15T10:30:00Z"
```

## HSCAN Hash
- difficulty: medium
- description: Incrementally iterate hash fields

```redis
HSCAN user:1001 0 MATCH pref:* COUNT 10
```

## LPUSH List
- difficulty: easy
- description: Insert elements at the head of a list

```redis
LPUSH notifications:user:1001 "New message from Alice" "Order shipped"
```

## RPUSH List
- difficulty: easy
- description: Insert elements at the tail of a list

```redis
RPUSH queue:jobs "{\"type\":\"email\",\"to\":\"user@example.com\"}"
```

## LPOP List
- difficulty: easy
- description: Remove and return element from head of list

```redis
LPOP queue:jobs
```

## RPOP List
- difficulty: easy
- description: Remove and return element from tail of list

```redis
RPOP queue:jobs
```

## BLPOP Blocking
- difficulty: medium
- description: Blocking pop from head of list with timeout

```redis
BLPOP queue:high queue:medium queue:low 30
```

## BRPOP Blocking
- difficulty: medium
- description: Blocking pop from tail of list with timeout

```redis
BRPOP queue:jobs 0
```

## LRANGE List
- difficulty: easy
- description: Get range of elements from list

```redis
LRANGE notifications:user:1001 0 9
```

## LRANGE All Elements
- difficulty: easy
- description: Get all elements from list

```redis
LRANGE recent:articles 0 -1
```

## LLEN List
- difficulty: easy
- description: Get length of list

```redis
LLEN queue:pending
```

## LINDEX List
- difficulty: easy
- description: Get element at specific index

```redis
LINDEX playlist:user:1001 0
```

## LSET List
- difficulty: easy
- description: Set element at specific index

```redis
LSET playlist:user:1001 0 "song:5001"
```

## LINSERT List
- difficulty: medium
- description: Insert element before or after pivot value

```redis
LINSERT playlist:user:1001 BEFORE "song:3001" "song:2001"
```

## LREM List
- difficulty: medium
- description: Remove elements matching value from list

```redis
LREM notifications:user:1001 0 "dismissed-notification"
```

## LTRIM List
- difficulty: medium
- description: Trim list to specified range

```redis
LTRIM recent:searches:user:1001 0 99
```

## LMOVE List
- difficulty: medium
- description: Atomically move element between lists

```redis
LMOVE queue:pending queue:processing LEFT RIGHT
```

## BLMOVE Blocking
- difficulty: medium
- description: Blocking move element between lists

```redis
BLMOVE queue:pending queue:processing LEFT RIGHT 30
```

## SADD Set
- difficulty: easy
- description: Add members to a set

```redis
SADD tags:article:1001 "redis" "database" "nosql" "caching"
```

## SREM Set
- difficulty: easy
- description: Remove members from a set

```redis
SREM user:1001:blocked user:2001 user:2002
```

## SMEMBERS Set
- difficulty: easy
- description: Get all members of a set

```redis
SMEMBERS tags:article:1001
```

## SISMEMBER Set
- difficulty: easy
- description: Check if value is member of set

```redis
SISMEMBER user:1001:roles "admin"
```

## SMISMEMBER Set
- difficulty: easy
- description: Check if multiple values are members of set

```redis
SMISMEMBER user:1001:permissions "read" "write" "delete" "admin"
```

## SCARD Set
- difficulty: easy
- description: Get number of members in set

```redis
SCARD online:users
```

## SRANDMEMBER Set
- difficulty: easy
- description: Get random members from set

```redis
SRANDMEMBER products:featured 5
```

## SPOP Set
- difficulty: easy
- description: Remove and return random members from set

```redis
SPOP raffle:entries 3
```

## SINTER Sets
- difficulty: medium
- description: Get intersection of multiple sets

```redis
SINTER user:1001:interests user:1002:interests user:1003:interests
```

## SUNION Sets
- difficulty: medium
- description: Get union of multiple sets

```redis
SUNION tags:category:tech tags:category:programming tags:category:database
```

## SDIFF Sets
- difficulty: medium
- description: Get difference between sets

```redis
SDIFF user:1001:following user:1001:muted
```

## SINTERSTORE
- difficulty: medium
- description: Store intersection of sets in destination

```redis
SINTERSTORE common:interests:1001:1002 user:1001:interests user:1002:interests
```

## SUNIONSTORE
- difficulty: medium
- description: Store union of sets in destination

```redis
SUNIONSTORE all:tags tags:tech tags:business tags:lifestyle
```

## SMOVE Set
- difficulty: medium
- description: Move member from one set to another

```redis
SMOVE queue:pending queue:completed "job:5001"
```

## SSCAN Set
- difficulty: medium
- description: Incrementally iterate set members

```redis
SSCAN large:set 0 MATCH prefix:* COUNT 100
```

## ZADD Sorted Set
- difficulty: easy
- description: Add members with scores to sorted set

```redis
ZADD leaderboard:daily 1500 "player:1001" 1450 "player:1002" 1400 "player:1003"
```

## ZADD with Options
- difficulty: medium
- description: Add to sorted set with update options

```redis
ZADD leaderboard:daily GT CH 1600 "player:1001"
```

## ZSCORE Sorted Set
- difficulty: easy
- description: Get score of member in sorted set

```redis
ZSCORE leaderboard:daily "player:1001"
```

## ZRANK Sorted Set
- difficulty: easy
- description: Get rank of member (0-based, low to high)

```redis
ZRANK leaderboard:daily "player:1001"
```

## ZREVRANK Sorted Set
- difficulty: easy
- description: Get rank of member (0-based, high to low)

```redis
ZREVRANK leaderboard:daily "player:1001"
```

## ZRANGE Sorted Set
- difficulty: easy
- description: Get range of members by index

```redis
ZRANGE leaderboard:daily 0 9 REV WITHSCORES
```

## ZRANGEBYSCORE
- difficulty: medium
- description: Get members with scores in range

```redis
ZRANGEBYSCORE leaderboard:daily 1000 2000 WITHSCORES LIMIT 0 10
```

## ZRANGEBYLEX
- difficulty: medium
- description: Get members in lexicographical range

```redis
ZRANGEBYLEX autocomplete:names [jo (joz
```

## ZINCRBY Sorted Set
- difficulty: easy
- description: Increment score of member

```redis
ZINCRBY leaderboard:daily 50 "player:1001"
```

## ZREM Sorted Set
- difficulty: easy
- description: Remove members from sorted set

```redis
ZREM leaderboard:daily "player:banned:1" "player:banned:2"
```

## ZREMRANGEBYRANK
- difficulty: medium
- description: Remove members by rank range

```redis
ZREMRANGEBYRANK leaderboard:daily 100 -1
```

## ZREMRANGEBYSCORE
- difficulty: medium
- description: Remove members by score range

```redis
ZREMRANGEBYSCORE session:active 0 1705300000
```

## ZCARD Sorted Set
- difficulty: easy
- description: Get number of members in sorted set

```redis
ZCARD leaderboard:daily
```

## ZCOUNT Sorted Set
- difficulty: easy
- description: Count members with scores in range

```redis
ZCOUNT leaderboard:daily 1000 2000
```

## ZPOPMIN Sorted Set
- difficulty: medium
- description: Remove and return members with lowest scores

```redis
ZPOPMIN delayed:jobs 5
```

## ZPOPMAX Sorted Set
- difficulty: medium
- description: Remove and return members with highest scores

```redis
ZPOPMAX priority:queue 1
```

## BZPOPMIN Blocking
- difficulty: medium
- description: Blocking pop member with lowest score

```redis
BZPOPMIN priority:low priority:medium priority:high 30
```

## ZUNIONSTORE
- difficulty: hard
- description: Store union of sorted sets with weights

```redis
ZUNIONSTORE combined:score 3 score:game1 score:game2 score:game3 WEIGHTS 1 2 3 AGGREGATE SUM
```

## ZINTERSTORE
- difficulty: hard
- description: Store intersection of sorted sets

```redis
ZINTERSTORE active:premium 2 users:active users:premium AGGREGATE MIN
```

## ZSCAN Sorted Set
- difficulty: medium
- description: Incrementally iterate sorted set

```redis
ZSCAN leaderboard:all 0 MATCH player:* COUNT 100
```

## EXPIRE Key
- difficulty: easy
- description: Set key expiration in seconds

```redis
EXPIRE session:user:1001 3600
```

## PEXPIRE Key
- difficulty: easy
- description: Set key expiration in milliseconds

```redis
PEXPIRE rate:limit:user:1001 60000
```

## EXPIREAT Key
- difficulty: medium
- description: Set key expiration at Unix timestamp

```redis
EXPIREAT cache:daily:report 1705449600
```

## TTL Key
- difficulty: easy
- description: Get remaining time to live in seconds

```redis
TTL session:user:1001
```

## PTTL Key
- difficulty: easy
- description: Get remaining time to live in milliseconds

```redis
PTTL rate:limit:user:1001
```

## PERSIST Key
- difficulty: easy
- description: Remove expiration from key

```redis
PERSIST user:1001:data
```

## EXISTS Key
- difficulty: easy
- description: Check if key exists

```redis
EXISTS user:1001 user:1002 user:1003
```

## DEL Keys
- difficulty: easy
- description: Delete one or more keys

```redis
DEL temp:cache:1 temp:cache:2 temp:cache:3
```

## UNLINK Keys
- difficulty: medium
- description: Delete keys asynchronously

```redis
UNLINK large:hash large:set large:list
```

## KEYS Pattern
- difficulty: easy
- description: Find keys matching pattern (use carefully)

```redis
KEYS user:*:session
```

## SCAN Iterator
- difficulty: medium
- description: Incrementally iterate keys

```redis
SCAN 0 MATCH cache:* COUNT 100
```

## TYPE Key
- difficulty: easy
- description: Get the type of a key

```redis
TYPE user:1001
```

## RENAME Key
- difficulty: easy
- description: Rename a key

```redis
RENAME temp:result final:result
```

## RENAMENX Key
- difficulty: easy
- description: Rename key only if new name doesn't exist

```redis
RENAMENX user:old:1001 user:1001
```

## COPY Key
- difficulty: medium
- description: Copy value to another key

```redis
COPY template:user user:new:1001
```

## DUMP and RESTORE
- difficulty: hard
- description: Serialize and restore key value

```redis
DUMP user:1001
RESTORE user:1001:backup 0 "\x00\x0bHello World\t\x00..."
```

## MULTI Transaction
- difficulty: medium
- description: Start a transaction block

```redis
MULTI
SET user:1001:balance 100
INCR user:1001:transactions
SET user:1001:lastUpdate "2024-01-15"
EXEC
```

## WATCH Optimistic Locking
- difficulty: hard
- description: Watch keys for changes before transaction

```redis
WATCH user:1001:balance
GET user:1001:balance
MULTI
DECRBY user:1001:balance 50
INCRBY user:1002:balance 50
EXEC
```

## PUBLISH Message
- difficulty: easy
- description: Publish message to a channel

```redis
PUBLISH notifications:user:1001 "{\"type\":\"message\",\"from\":\"user:1002\"}"
```

## SUBSCRIBE Channel
- difficulty: easy
- description: Subscribe to one or more channels

```redis
SUBSCRIBE notifications:user:1001 system:broadcasts
```

## PSUBSCRIBE Pattern
- difficulty: medium
- description: Subscribe to channels matching pattern

```redis
PSUBSCRIBE notifications:* alerts:*
```

## XADD Stream
- difficulty: medium
- description: Append entry to a stream

```redis
XADD events:orders * action "created" orderId "5001" userId "1001" total "99.99"
```

## XADD with Max Length
- difficulty: medium
- description: Append to stream with automatic trimming

```redis
XADD logs:app MAXLEN ~ 10000 * level "info" message "User logged in" userId "1001"
```

## XREAD Stream
- difficulty: medium
- description: Read entries from streams

```redis
XREAD COUNT 10 STREAMS events:orders 0
```

## XREAD Blocking
- difficulty: medium
- description: Blocking read from streams

```redis
XREAD BLOCK 5000 STREAMS events:orders $
```

## XRANGE Stream
- difficulty: medium
- description: Read range of entries from stream

```redis
XRANGE events:orders 1705300000000-0 1705400000000-0 COUNT 100
```

## XGROUP CREATE
- difficulty: hard
- description: Create consumer group for stream

```redis
XGROUP CREATE events:orders order-processors $ MKSTREAM
```

## XREADGROUP Consumer
- difficulty: hard
- description: Read from stream as consumer group member

```redis
XREADGROUP GROUP order-processors worker-1 COUNT 10 BLOCK 5000 STREAMS events:orders >
```

## XACK Stream
- difficulty: medium
- description: Acknowledge processed stream entries

```redis
XACK events:orders order-processors 1705300000000-0 1705300000001-0
```

## XPENDING Stream
- difficulty: hard
- description: Get information about pending entries

```redis
XPENDING events:orders order-processors - + 10 worker-1
```

## XCLAIM Stream
- difficulty: hard
- description: Claim pending entries for processing

```redis
XCLAIM events:orders order-processors worker-2 3600000 1705300000000-0
```

## XLEN Stream
- difficulty: easy
- description: Get number of entries in stream

```redis
XLEN events:orders
```

## XTRIM Stream
- difficulty: medium
- description: Trim stream to specified length

```redis
XTRIM events:orders MAXLEN ~ 10000
```

## XINFO STREAM
- difficulty: medium
- description: Get information about a stream

```redis
XINFO STREAM events:orders
```

## PFADD HyperLogLog
- difficulty: medium
- description: Add elements to HyperLogLog

```redis
PFADD unique:visitors:2024-01-15 "user:1001" "user:1002" "user:1003"
```

## PFCOUNT HyperLogLog
- difficulty: medium
- description: Get approximate cardinality

```redis
PFCOUNT unique:visitors:2024-01-15
```

## PFMERGE HyperLogLog
- difficulty: medium
- description: Merge multiple HyperLogLogs

```redis
PFMERGE unique:visitors:2024-01 unique:visitors:2024-01-01 unique:visitors:2024-01-02 unique:visitors:2024-01-03
```

## GEOADD Location
- difficulty: medium
- description: Add geospatial items

```redis
GEOADD stores:locations 100.5018 13.7563 "store:bangkok:1" 100.4927 13.7248 "store:bangkok:2"
```

## GEODIST Distance
- difficulty: medium
- description: Get distance between two members

```redis
GEODIST stores:locations "store:bangkok:1" "store:bangkok:2" km
```

## GEOSEARCH Location
- difficulty: medium
- description: Search for members within radius

```redis
GEOSEARCH stores:locations FROMMEMBER "store:bangkok:1" BYRADIUS 10 km ASC COUNT 5 WITHDIST
```

## GEOPOS Position
- difficulty: easy
- description: Get coordinates of members

```redis
GEOPOS stores:locations "store:bangkok:1" "store:bangkok:2"
```

## SETBIT Bitmap
- difficulty: medium
- description: Set bit at offset in string

```redis
SETBIT user:1001:features 0 1
SETBIT user:1001:features 5 1
SETBIT user:1001:features 10 1
```

## GETBIT Bitmap
- difficulty: medium
- description: Get bit value at offset

```redis
GETBIT user:1001:features 5
```

## BITCOUNT Bitmap
- difficulty: medium
- description: Count set bits in string

```redis
BITCOUNT user:1001:logins:2024-01
```

## BITOP Bitmap
- difficulty: hard
- description: Perform bitwise operations

```redis
BITOP AND users:active:premium users:active:2024-01 users:premium
```

## Lua Rate Limiter
- difficulty: hard
- description: Implement sliding window rate limiter with Lua

```lua
local key = KEYS[1]
local limit = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local now = tonumber(ARGV[3])

redis.call('ZREMRANGEBYSCORE', key, 0, now - window)

local count = redis.call('ZCARD', key)

if count < limit then
    redis.call('ZADD', key, now, now .. '-' .. math.random())
    redis.call('EXPIRE', key, window / 1000)
    return 1
else
    return 0
end
```

## Lua Atomic Counter with Limit
- difficulty: hard
- description: Increment counter with maximum limit atomically

```lua
local key = KEYS[1]
local increment = tonumber(ARGV[1])
local max_value = tonumber(ARGV[2])

local current = tonumber(redis.call('GET', key) or 0)
local new_value = current + increment

if new_value > max_value then
    return -1
end

redis.call('SET', key, new_value)
return new_value
```

## Lua Distributed Lock
- difficulty: hard
- description: Acquire distributed lock with automatic release

```lua
local key = KEYS[1]
local token = ARGV[1]
local ttl = tonumber(ARGV[2])

if redis.call('SET', key, token, 'NX', 'PX', ttl) then
    return 1
else
    return 0
end
```

## Lua Lock Release
- difficulty: hard
- description: Release lock only if owned by requester

```lua
local key = KEYS[1]
local token = ARGV[1]

if redis.call('GET', key) == token then
    return redis.call('DEL', key)
else
    return 0
end
```

## Lua Inventory Reservation
- difficulty: hard
- description: Reserve inventory atomically with rollback

```lua
local product_key = KEYS[1]
local reservation_key = KEYS[2]
local quantity = tonumber(ARGV[1])
local reservation_id = ARGV[2]
local ttl = tonumber(ARGV[3])

local stock = tonumber(redis.call('GET', product_key) or 0)

if stock < quantity then
    return {0, stock}
end

redis.call('DECRBY', product_key, quantity)
redis.call('HSET', reservation_key, reservation_id, quantity)
redis.call('EXPIRE', reservation_key, ttl)

return {1, stock - quantity}
```

## Lua Leaky Bucket
- difficulty: hard
- description: Implement leaky bucket rate limiting

```lua
local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local leak_rate = tonumber(ARGV[2])
local now = tonumber(ARGV[3])

local bucket = redis.call('HMGET', key, 'tokens', 'last_update')
local tokens = tonumber(bucket[1]) or capacity
local last_update = tonumber(bucket[2]) or now

local elapsed = now - last_update
local leaked = elapsed * leak_rate / 1000
tokens = math.min(capacity, tokens + leaked)

if tokens >= 1 then
    tokens = tokens - 1
    redis.call('HMSET', key, 'tokens', tokens, 'last_update', now)
    redis.call('EXPIRE', key, 3600)
    return {1, tokens}
else
    redis.call('HMSET', key, 'tokens', tokens, 'last_update', now)
    return {0, tokens}
end
```

## Lua Moving Average
- difficulty: hard
- description: Calculate and update moving average

```lua
local key = KEYS[1]
local value = tonumber(ARGV[1])
local window_size = tonumber(ARGV[2])

redis.call('LPUSH', key, value)
redis.call('LTRIM', key, 0, window_size - 1)

local values = redis.call('LRANGE', key, 0, -1)
local sum = 0
for i, v in ipairs(values) do
    sum = sum + tonumber(v)
end

return tostring(sum / #values)
```

## Lua Batch Get or Set
- difficulty: hard
- description: Get cached values or compute and store missing ones

```lua
local result = {}
local missing = {}
local missing_indices = {}

for i, key in ipairs(KEYS) do
    local value = redis.call('GET', key)
    if value then
        result[i] = value
    else
        table.insert(missing, key)
        table.insert(missing_indices, i)
    end
end

return cjson.encode({
    found = result,
    missing = missing,
    missing_indices = missing_indices
})
```

## Lua Priority Queue
- difficulty: hard
- description: Atomic priority queue operations

```lua
local queue_key = KEYS[1]
local action = ARGV[1]

if action == 'push' then
    local item = ARGV[2]
    local priority = tonumber(ARGV[3])
    redis.call('ZADD', queue_key, priority, item)
    return redis.call('ZCARD', queue_key)

elseif action == 'pop' then
    local items = redis.call('ZRANGE', queue_key, 0, 0)
    if #items > 0 then
        redis.call('ZREM', queue_key, items[1])
        return items[1]
    end
    return nil

elseif action == 'peek' then
    local items = redis.call('ZRANGE', queue_key, 0, 0, 'WITHSCORES')
    return items
end
```

## Lua Session Management
- difficulty: hard
- description: Create or refresh session with user data

```lua
local session_key = KEYS[1]
local user_sessions_key = KEYS[2]
local session_id = ARGV[1]
local user_id = ARGV[2]
local data = ARGV[3]
local ttl = tonumber(ARGV[4])
local max_sessions = tonumber(ARGV[5])

local sessions = redis.call('ZRANGE', user_sessions_key, 0, -1)
if #sessions >= max_sessions then
    local oldest = sessions[1]
    redis.call('DEL', 'session:' .. oldest)
    redis.call('ZREM', user_sessions_key, oldest)
end

redis.call('HSET', session_key, 'user_id', user_id, 'data', data, 'created_at', ARGV[6])
redis.call('EXPIRE', session_key, ttl)

redis.call('ZADD', user_sessions_key, ARGV[6], session_id)
redis.call('EXPIRE', user_sessions_key, ttl)

return 1
```

## Lua Token Bucket
- difficulty: hard
- description: Token bucket rate limiting algorithm

```lua
local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local refill_rate = tonumber(ARGV[2])
local requested = tonumber(ARGV[3])
local now = tonumber(ARGV[4])

local data = redis.call('HMGET', key, 'tokens', 'last_refill')
local tokens = tonumber(data[1]) or capacity
local last_refill = tonumber(data[2]) or now

local elapsed = now - last_refill
local refill = elapsed * refill_rate / 1000
tokens = math.min(capacity, tokens + refill)

if tokens >= requested then
    tokens = tokens - requested
    redis.call('HMSET', key, 'tokens', tokens, 'last_refill', now)
    redis.call('EXPIRE', key, 3600)
    return {1, math.floor(tokens)}
else
    redis.call('HMSET', key, 'tokens', tokens, 'last_refill', now)
    redis.call('EXPIRE', key, 3600)
    return {0, math.floor(tokens)}
end
```

## Lua Atomic Transfer
- difficulty: hard
- description: Transfer balance between accounts atomically

```lua
local from_key = KEYS[1]
local to_key = KEYS[2]
local amount = tonumber(ARGV[1])

local from_balance = tonumber(redis.call('GET', from_key) or 0)

if from_balance < amount then
    return {0, 'INSUFFICIENT_FUNDS', from_balance}
end

redis.call('DECRBY', from_key, amount)
redis.call('INCRBY', to_key, amount)

local new_from = tonumber(redis.call('GET', from_key))
local new_to = tonumber(redis.call('GET', to_key))

return {1, 'SUCCESS', new_from, new_to}
```

## Lua Deduplicate Events
- difficulty: hard
- description: Process event only if not seen within window

```lua
local dedup_key = KEYS[1]
local event_id = ARGV[1]
local window_seconds = tonumber(ARGV[2])

local exists = redis.call('SISMEMBER', dedup_key, event_id)

if exists == 1 then
    return 0
end

redis.call('SADD', dedup_key, event_id)
redis.call('EXPIRE', dedup_key, window_seconds)

return 1
```

## Lua Sliding Window Counter
- difficulty: hard
- description: Count events in sliding time window

```lua
local key = KEYS[1]
local window_ms = tonumber(ARGV[1])
local now = tonumber(ARGV[2])
local event_id = ARGV[3]

local window_start = now - window_ms

redis.call('ZREMRANGEBYSCORE', key, '-inf', window_start)

redis.call('ZADD', key, now, event_id)
redis.call('PEXPIRE', key, window_ms)

return redis.call('ZCARD', key)
```

## Lua Conditional Update
- difficulty: hard
- description: Update fields only if version matches

```lua
local key = KEYS[1]
local expected_version = tonumber(ARGV[1])
local new_data = ARGV[2]
local new_version = tonumber(ARGV[3])

local current_version = tonumber(redis.call('HGET', key, 'version') or 0)

if current_version ~= expected_version then
    return {0, current_version}
end

redis.call('HSET', key, 'data', new_data, 'version', new_version, 'updated_at', ARGV[4])

return {1, new_version}
```
