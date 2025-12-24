# Kafka Go Snippets

Comprehensive Kafka snippets using sarama and segmentio/kafka-go libraries.

---

## Sarama Sync Producer
- difficulty: easy
- description: Create synchronous producer that waits for delivery confirmation

```go
import "github.com/IBM/sarama"

config := sarama.NewConfig()
config.Producer.RequiredAcks = sarama.WaitForAll
config.Producer.Retry.Max = 5
config.Producer.Return.Successes = true

producer, err := sarama.NewSyncProducer([]string{"localhost:9092"}, config)
if err != nil {
    log.Fatal(err)
}
defer producer.Close()

msg := &sarama.ProducerMessage{
    Topic: "my-topic",
    Key:   sarama.StringEncoder("key"),
    Value: sarama.StringEncoder("Hello Kafka"),
}

partition, offset, err := producer.SendMessage(msg)
if err != nil {
    log.Fatal(err)
}
fmt.Printf("Partition: %d, Offset: %d\n", partition, offset)
```

---

## Sarama Async Producer
- difficulty: medium
- description: Create asynchronous producer with success and error channels

```go
import "github.com/IBM/sarama"

config := sarama.NewConfig()
config.Producer.RequiredAcks = sarama.WaitForLocal
config.Producer.Return.Successes = true
config.Producer.Return.Errors = true

producer, err := sarama.NewAsyncProducer([]string{"localhost:9092"}, config)
if err != nil {
    log.Fatal(err)
}

go func() {
    for {
        select {
        case success := <-producer.Successes():
            fmt.Printf("Delivered: %s/%d/%d\n",
                success.Topic, success.Partition, success.Offset)
        case err := <-producer.Errors():
            fmt.Printf("Failed: %v\n", err.Err)
        }
    }
}()

producer.Input() <- &sarama.ProducerMessage{
    Topic: "my-topic",
    Value: sarama.StringEncoder("async message"),
}
```

---

## Sarama Producer with Headers
- difficulty: easy
- description: Send message with custom headers for metadata

```go
import "github.com/IBM/sarama"

msg := &sarama.ProducerMessage{
    Topic: "my-topic",
    Key:   sarama.StringEncoder("user-123"),
    Value: sarama.StringEncoder(`{"action":"login"}`),
    Headers: []sarama.RecordHeader{
        {Key: []byte("correlation-id"), Value: []byte("abc-123")},
        {Key: []byte("source"), Value: []byte("auth-service")},
        {Key: []byte("timestamp"), Value: []byte(time.Now().Format(time.RFC3339))},
    },
}

partition, offset, err := producer.SendMessage(msg)
```

---

## Sarama Custom Partitioner
- difficulty: medium
- description: Implement custom partitioning logic for message distribution

```go
import "github.com/IBM/sarama"

type UserPartitioner struct{}

func (p *UserPartitioner) Partition(msg *sarama.ProducerMessage, numPartitions int32) (int32, error) {
    key, _ := msg.Key.Encode()
    hash := fnv.New32a()
    hash.Write(key)
    return int32(hash.Sum32()) % numPartitions, nil
}

func (p *UserPartitioner) RequiresConsistency() bool {
    return true
}

config := sarama.NewConfig()
config.Producer.Partitioner = func(topic string) sarama.Partitioner {
    return &UserPartitioner{}
}
```

---

## Sarama Producer with Compression
- difficulty: easy
- description: Enable compression to reduce message size and network bandwidth

```go
import "github.com/IBM/sarama"

config := sarama.NewConfig()
config.Producer.Compression = sarama.CompressionSnappy
config.Producer.CompressionLevel = sarama.CompressionLevelDefault
config.Producer.RequiredAcks = sarama.WaitForAll
config.Producer.Return.Successes = true

// Other compression options:
// sarama.CompressionNone
// sarama.CompressionGZIP
// sarama.CompressionLZ4
// sarama.CompressionZSTD
```

---

## Sarama Idempotent Producer
- difficulty: medium
- description: Enable exactly-once semantics with idempotent producer

```go
import "github.com/IBM/sarama"

config := sarama.NewConfig()
config.Producer.Idempotent = true
config.Producer.RequiredAcks = sarama.WaitForAll
config.Producer.Retry.Max = 5
config.Net.MaxOpenRequests = 1
config.Producer.Return.Successes = true

producer, err := sarama.NewSyncProducer([]string{"localhost:9092"}, config)
if err != nil {
    log.Fatal(err)
}
defer producer.Close()
```

---

## Sarama Consumer Group
- difficulty: medium
- description: Consume messages with consumer group for load balancing

```go
import "github.com/IBM/sarama"

type ConsumerHandler struct{}

func (h *ConsumerHandler) Setup(sarama.ConsumerGroupSession) error {
    return nil
}

func (h *ConsumerHandler) Cleanup(sarama.ConsumerGroupSession) error {
    return nil
}

func (h *ConsumerHandler) ConsumeClaim(session sarama.ConsumerGroupSession, claim sarama.ConsumerGroupClaim) error {
    for msg := range claim.Messages() {
        fmt.Printf("Topic: %s, Partition: %d, Offset: %d\n",
            msg.Topic, msg.Partition, msg.Offset)
        fmt.Printf("Key: %s, Value: %s\n", string(msg.Key), string(msg.Value))
        session.MarkMessage(msg, "")
    }
    return nil
}

func main() {
    config := sarama.NewConfig()
    config.Consumer.Group.Rebalance.GroupStrategies = []sarama.BalanceStrategy{
        sarama.NewBalanceStrategyRoundRobin(),
    }
    config.Consumer.Offsets.Initial = sarama.OffsetNewest

    group, err := sarama.NewConsumerGroup(
        []string{"localhost:9092"},
        "my-group",
        config,
    )
    if err != nil {
        log.Fatal(err)
    }
    defer group.Close()

    handler := &ConsumerHandler{}
    for {
        err := group.Consume(context.Background(), []string{"my-topic"}, handler)
        if err != nil {
            log.Printf("Error: %v", err)
        }
    }
}
```

---

## Sarama Consumer with Context Cancellation
- difficulty: medium
- description: Gracefully shutdown consumer using context cancellation

```go
import "github.com/IBM/sarama"

func main() {
    ctx, cancel := context.WithCancel(context.Background())

    sigchan := make(chan os.Signal, 1)
    signal.Notify(sigchan, syscall.SIGINT, syscall.SIGTERM)

    go func() {
        <-sigchan
        cancel()
    }()

    group, _ := sarama.NewConsumerGroup(brokers, "my-group", config)
    defer group.Close()

    handler := &ConsumerHandler{}

    wg := &sync.WaitGroup{}
    wg.Add(1)
    go func() {
        defer wg.Done()
        for {
            if err := group.Consume(ctx, topics, handler); err != nil {
                log.Printf("Error: %v", err)
            }
            if ctx.Err() != nil {
                return
            }
        }
    }()

    wg.Wait()
}
```

---

## Sarama Manual Offset Commit
- difficulty: medium
- description: Manually commit offsets after successful processing

```go
import "github.com/IBM/sarama"

config := sarama.NewConfig()
config.Consumer.Offsets.AutoCommit.Enable = false

type ManualCommitHandler struct{}

func (h *ManualCommitHandler) ConsumeClaim(session sarama.ConsumerGroupSession, claim sarama.ConsumerGroupClaim) error {
    for msg := range claim.Messages() {
        err := processMessage(msg)
        if err != nil {
            log.Printf("Processing failed: %v", err)
            continue
        }
        session.MarkMessage(msg, "")
        session.Commit()
    }
    return nil
}

func processMessage(msg *sarama.ConsumerMessage) error {
    fmt.Printf("Processing: %s\n", string(msg.Value))
    return nil
}
```

---

## Sarama Batch Offset Commit
- difficulty: medium
- description: Commit offsets in batches for better performance

```go
import "github.com/IBM/sarama"

func (h *BatchCommitHandler) ConsumeClaim(session sarama.ConsumerGroupSession, claim sarama.ConsumerGroupClaim) error {
    batchSize := 100
    count := 0

    for msg := range claim.Messages() {
        if err := processMessage(msg); err != nil {
            log.Printf("Error: %v", err)
            continue
        }

        session.MarkMessage(msg, "")
        count++

        if count >= batchSize {
            session.Commit()
            count = 0
            log.Println("Batch committed")
        }
    }

    if count > 0 {
        session.Commit()
    }
    return nil
}
```

---

## Sarama Read Message Headers
- difficulty: easy
- description: Access message headers in consumer for metadata

```go
import "github.com/IBM/sarama"

func (h *ConsumerHandler) ConsumeClaim(session sarama.ConsumerGroupSession, claim sarama.ConsumerGroupClaim) error {
    for msg := range claim.Messages() {
        fmt.Printf("Message: %s\n", string(msg.Value))

        for _, header := range msg.Headers {
            fmt.Printf("Header: %s = %s\n",
                string(header.Key),
                string(header.Value))
        }

        correlationID := getHeader(msg.Headers, "correlation-id")
        if correlationID != "" {
            fmt.Printf("Correlation ID: %s\n", correlationID)
        }

        session.MarkMessage(msg, "")
    }
    return nil
}

func getHeader(headers []*sarama.RecordHeader, key string) string {
    for _, h := range headers {
        if string(h.Key) == key {
            return string(h.Value)
        }
    }
    return ""
}
```

---

## Sarama Consumer Rebalance Listener
- difficulty: hard
- description: Handle partition assignment and revocation during rebalance

```go
import "github.com/IBM/sarama"

type RebalanceHandler struct {
    ready chan bool
}

func (h *RebalanceHandler) Setup(session sarama.ConsumerGroupSession) error {
    fmt.Println("Rebalance: Setup")
    fmt.Printf("Assigned partitions: %v\n", session.Claims())
    close(h.ready)
    return nil
}

func (h *RebalanceHandler) Cleanup(session sarama.ConsumerGroupSession) error {
    fmt.Println("Rebalance: Cleanup")
    h.ready = make(chan bool)
    return nil
}

func (h *RebalanceHandler) ConsumeClaim(session sarama.ConsumerGroupSession, claim sarama.ConsumerGroupClaim) error {
    for msg := range claim.Messages() {
        fmt.Printf("Partition %d: %s\n", claim.Partition(), string(msg.Value))
        session.MarkMessage(msg, "")
    }
    return nil
}
```

---

## Sarama Seek to Specific Offset
- difficulty: medium
- description: Reset consumer to specific offset for replay or skip

```go
import "github.com/IBM/sarama"

type SeekHandler struct {
    seekOffset int64
}

func (h *SeekHandler) Setup(session sarama.ConsumerGroupSession) error {
    for topic, partitions := range session.Claims() {
        for _, partition := range partitions {
            session.ResetOffset(topic, partition, h.seekOffset, "")
            fmt.Printf("Seek %s/%d to offset %d\n", topic, partition, h.seekOffset)
        }
    }
    return nil
}

// Usage
handler := &SeekHandler{seekOffset: sarama.OffsetOldest}
// Or specific offset: seekOffset: 1000
```

---

## Sarama Pause and Resume Partitions
- difficulty: hard
- description: Dynamically pause and resume partition consumption

```go
import "github.com/IBM/sarama"

type PausableHandler struct {
    paused map[string]map[int32]bool
    mu     sync.RWMutex
}

func (h *PausableHandler) ConsumeClaim(session sarama.ConsumerGroupSession, claim sarama.ConsumerGroupClaim) error {
    for msg := range claim.Messages() {
        h.mu.RLock()
        isPaused := h.paused[msg.Topic][msg.Partition]
        h.mu.RUnlock()

        if isPaused {
            time.Sleep(100 * time.Millisecond)
            continue
        }

        processMessage(msg)
        session.MarkMessage(msg, "")
    }
    return nil
}

func (h *PausableHandler) Pause(topic string, partition int32) {
    h.mu.Lock()
    defer h.mu.Unlock()
    if h.paused[topic] == nil {
        h.paused[topic] = make(map[int32]bool)
    }
    h.paused[topic][partition] = true
}

func (h *PausableHandler) Resume(topic string, partition int32) {
    h.mu.Lock()
    defer h.mu.Unlock()
    h.paused[topic][partition] = false
}
```

---

## Sarama Admin Client Create Topic
- difficulty: medium
- description: Programmatically create Kafka topics with configuration

```go
import "github.com/IBM/sarama"

config := sarama.NewConfig()
config.Version = sarama.V3_0_0_0

admin, err := sarama.NewClusterAdmin([]string{"localhost:9092"}, config)
if err != nil {
    log.Fatal(err)
}
defer admin.Close()

topicDetail := &sarama.TopicDetail{
    NumPartitions:     6,
    ReplicationFactor: 3,
    ConfigEntries: map[string]*string{
        "retention.ms":          strPtr("604800000"),
        "cleanup.policy":        strPtr("delete"),
        "min.insync.replicas":   strPtr("2"),
        "compression.type":      strPtr("snappy"),
    },
}

err = admin.CreateTopic("new-topic", topicDetail, false)
if err != nil {
    log.Fatal(err)
}
fmt.Println("Topic created successfully")

func strPtr(s string) *string { return &s }
```

---

## Sarama Admin Delete Topic
- difficulty: easy
- description: Delete Kafka topic using admin client

```go
import "github.com/IBM/sarama"

admin, err := sarama.NewClusterAdmin(brokers, config)
if err != nil {
    log.Fatal(err)
}
defer admin.Close()

err = admin.DeleteTopic("topic-to-delete")
if err != nil {
    log.Fatal(err)
}
fmt.Println("Topic deleted")
```

---

## Sarama List Topics
- difficulty: easy
- description: List all topics with their metadata

```go
import "github.com/IBM/sarama"

admin, err := sarama.NewClusterAdmin(brokers, config)
if err != nil {
    log.Fatal(err)
}
defer admin.Close()

topics, err := admin.ListTopics()
if err != nil {
    log.Fatal(err)
}

for name, detail := range topics {
    fmt.Printf("Topic: %s\n", name)
    fmt.Printf("  Partitions: %d\n", detail.NumPartitions)
    fmt.Printf("  Replication: %d\n", detail.ReplicationFactor)
}
```

---

## Sarama Describe Consumer Group
- difficulty: medium
- description: Get consumer group details including member assignments

```go
import "github.com/IBM/sarama"

admin, err := sarama.NewClusterAdmin(brokers, config)
if err != nil {
    log.Fatal(err)
}
defer admin.Close()

groups, err := admin.DescribeConsumerGroups([]string{"my-group"})
if err != nil {
    log.Fatal(err)
}

for _, group := range groups {
    fmt.Printf("Group: %s, State: %s\n", group.GroupId, group.State)
    for _, member := range group.Members {
        fmt.Printf("  Member: %s\n", member.ClientId)
        assignment, _ := member.GetMemberAssignment()
        for topic, partitions := range assignment.Topics {
            fmt.Printf("    %s: %v\n", topic, partitions)
        }
    }
}
```

---

## Sarama List Consumer Group Offsets
- difficulty: medium
- description: Get current committed offsets for consumer group

```go
import "github.com/IBM/sarama"

admin, err := sarama.NewClusterAdmin(brokers, config)
if err != nil {
    log.Fatal(err)
}
defer admin.Close()

offsets, err := admin.ListConsumerGroupOffsets("my-group", map[string][]int32{
    "my-topic": {0, 1, 2},
})
if err != nil {
    log.Fatal(err)
}

for topic, partitions := range offsets.Blocks {
    for partition, block := range partitions {
        fmt.Printf("%s/%d: offset=%d\n", topic, partition, block.Offset)
    }
}
```

---

## Sarama SASL PLAIN Authentication
- difficulty: medium
- description: Connect to Kafka with SASL PLAIN authentication

```go
import "github.com/IBM/sarama"

config := sarama.NewConfig()
config.Net.SASL.Enable = true
config.Net.SASL.Mechanism = sarama.SASLTypePlaintext
config.Net.SASL.User = "username"
config.Net.SASL.Password = "password"
config.Net.SASL.Handshake = true

config.Net.TLS.Enable = true
config.Net.TLS.Config = &tls.Config{
    InsecureSkipVerify: false,
}

producer, err := sarama.NewSyncProducer([]string{"kafka:9093"}, config)
if err != nil {
    log.Fatal(err)
}
```

---

## Sarama SASL SCRAM Authentication
- difficulty: hard
- description: Connect to Kafka with SASL SCRAM-SHA-512 authentication

```go
import (
    "github.com/IBM/sarama"
    "github.com/xdg-go/scram"
)

var SHA512 scram.HashGeneratorFcn = sha512.New

type XDGSCRAMClient struct {
    *scram.Client
    *scram.ClientConversation
    scram.HashGeneratorFcn
}

func (x *XDGSCRAMClient) Begin(userName, password, authzID string) error {
    client, err := x.HashGeneratorFcn.NewClient(userName, password, authzID)
    if err != nil {
        return err
    }
    x.Client = client
    x.ClientConversation = x.Client.NewConversation()
    return nil
}

func (x *XDGSCRAMClient) Step(challenge string) (string, error) {
    return x.ClientConversation.Step(challenge)
}

func (x *XDGSCRAMClient) Done() bool {
    return x.ClientConversation.Done()
}

config := sarama.NewConfig()
config.Net.SASL.Enable = true
config.Net.SASL.Mechanism = sarama.SASLTypeSCRAMSHA512
config.Net.SASL.User = "username"
config.Net.SASL.Password = "password"
config.Net.SASL.SCRAMClientGeneratorFunc = func() sarama.SCRAMClient {
    return &XDGSCRAMClient{HashGeneratorFcn: SHA512}
}
```

---

## Sarama TLS Configuration
- difficulty: medium
- description: Configure TLS with custom certificates for secure connection

```go
import (
    "crypto/tls"
    "crypto/x509"
    "github.com/IBM/sarama"
)

func createTLSConfig(certFile, keyFile, caFile string) (*tls.Config, error) {
    cert, err := tls.LoadX509KeyPair(certFile, keyFile)
    if err != nil {
        return nil, err
    }

    caCert, err := os.ReadFile(caFile)
    if err != nil {
        return nil, err
    }

    caCertPool := x509.NewCertPool()
    caCertPool.AppendCertsFromPEM(caCert)

    return &tls.Config{
        Certificates: []tls.Certificate{cert},
        RootCAs:      caCertPool,
        MinVersion:   tls.VersionTLS12,
    }, nil
}

config := sarama.NewConfig()
tlsConfig, _ := createTLSConfig("client.crt", "client.key", "ca.crt")
config.Net.TLS.Enable = true
config.Net.TLS.Config = tlsConfig
```

---

## Kafka-Go Simple Producer
- difficulty: easy
- description: Send messages using segmentio/kafka-go simple API

```go
import "github.com/segmentio/kafka-go"

conn, err := kafka.DialLeader(context.Background(), "tcp", "localhost:9092", "my-topic", 0)
if err != nil {
    log.Fatal(err)
}
defer conn.Close()

conn.SetWriteDeadline(time.Now().Add(10 * time.Second))

_, err = conn.WriteMessages(
    kafka.Message{Value: []byte("message 1")},
    kafka.Message{Value: []byte("message 2")},
    kafka.Message{Value: []byte("message 3")},
)
if err != nil {
    log.Fatal(err)
}
```

---

## Kafka-Go Writer
- difficulty: medium
- description: Use Writer for automatic load balancing and batching

```go
import "github.com/segmentio/kafka-go"

writer := &kafka.Writer{
    Addr:         kafka.TCP("localhost:9092"),
    Topic:        "my-topic",
    Balancer:     &kafka.LeastBytes{},
    BatchSize:    100,
    BatchTimeout: 10 * time.Millisecond,
    RequiredAcks: kafka.RequireAll,
    Async:        false,
}
defer writer.Close()

err := writer.WriteMessages(context.Background(),
    kafka.Message{
        Key:   []byte("user-1"),
        Value: []byte(`{"action":"login"}`),
    },
    kafka.Message{
        Key:   []byte("user-2"),
        Value: []byte(`{"action":"logout"}`),
    },
)
if err != nil {
    log.Fatal(err)
}
```

---

## Kafka-Go Writer with Headers
- difficulty: easy
- description: Send messages with headers using kafka-go Writer

```go
import "github.com/segmentio/kafka-go"

msg := kafka.Message{
    Key:   []byte("order-123"),
    Value: []byte(`{"product":"laptop","qty":1}`),
    Headers: []kafka.Header{
        {Key: "correlation-id", Value: []byte("req-456")},
        {Key: "source", Value: []byte("order-service")},
        {Key: "version", Value: []byte("1.0")},
    },
}

err := writer.WriteMessages(context.Background(), msg)
```

---

## Kafka-Go Async Writer
- difficulty: medium
- description: Asynchronous writer with completion callback

```go
import "github.com/segmentio/kafka-go"

writer := &kafka.Writer{
    Addr:     kafka.TCP("localhost:9092"),
    Topic:    "my-topic",
    Balancer: &kafka.Hash{},
    Async:    true,
    Completion: func(messages []kafka.Message, err error) {
        if err != nil {
            log.Printf("Delivery failed: %v", err)
            return
        }
        for _, msg := range messages {
            log.Printf("Delivered: partition=%d offset=%d",
                msg.Partition, msg.Offset)
        }
    },
}
defer writer.Close()

for i := 0; i < 1000; i++ {
    writer.WriteMessages(context.Background(),
        kafka.Message{Value: []byte(fmt.Sprintf("message %d", i))},
    )
}
```

---

## Kafka-Go Reader
- difficulty: medium
- description: Consume messages using kafka-go Reader with auto commit

```go
import "github.com/segmentio/kafka-go"

reader := kafka.NewReader(kafka.ReaderConfig{
    Brokers:        []string{"localhost:9092"},
    Topic:          "my-topic",
    GroupID:        "my-group",
    MinBytes:       10e3,
    MaxBytes:       10e6,
    CommitInterval: time.Second,
    StartOffset:    kafka.FirstOffset,
})
defer reader.Close()

for {
    msg, err := reader.ReadMessage(context.Background())
    if err != nil {
        log.Printf("Error: %v", err)
        break
    }
    fmt.Printf("Partition: %d, Offset: %d\n", msg.Partition, msg.Offset)
    fmt.Printf("Key: %s, Value: %s\n", string(msg.Key), string(msg.Value))
}
```

---

## Kafka-Go Manual Commit
- difficulty: medium
- description: Explicitly commit offsets after processing

```go
import "github.com/segmentio/kafka-go"

reader := kafka.NewReader(kafka.ReaderConfig{
    Brokers:  []string{"localhost:9092"},
    Topic:    "my-topic",
    GroupID:  "my-group",
    MaxBytes: 10e6,
})
defer reader.Close()

ctx := context.Background()
for {
    msg, err := reader.FetchMessage(ctx)
    if err != nil {
        log.Printf("Error: %v", err)
        break
    }

    if err := processMessage(msg); err != nil {
        log.Printf("Processing failed: %v", err)
        continue
    }

    if err := reader.CommitMessages(ctx, msg); err != nil {
        log.Printf("Commit failed: %v", err)
    }
}
```

---

## Kafka-Go Read Headers
- difficulty: easy
- description: Access message headers in kafka-go consumer

```go
import "github.com/segmentio/kafka-go"

for {
    msg, err := reader.ReadMessage(context.Background())
    if err != nil {
        break
    }

    fmt.Printf("Message: %s\n", string(msg.Value))

    for _, header := range msg.Headers {
        fmt.Printf("Header: %s = %s\n", header.Key, string(header.Value))
    }

    correlationID := findHeader(msg.Headers, "correlation-id")
    fmt.Printf("Correlation ID: %s\n", correlationID)
}

func findHeader(headers []kafka.Header, key string) string {
    for _, h := range headers {
        if h.Key == key {
            return string(h.Value)
        }
    }
    return ""
}
```

---

## Kafka-Go Reader with Context Timeout
- difficulty: medium
- description: Read messages with timeout for graceful handling

```go
import "github.com/segmentio/kafka-go"

reader := kafka.NewReader(kafka.ReaderConfig{
    Brokers: []string{"localhost:9092"},
    Topic:   "my-topic",
    GroupID: "my-group",
})
defer reader.Close()

for {
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)

    msg, err := reader.ReadMessage(ctx)
    cancel()

    if err != nil {
        if err == context.DeadlineExceeded {
            fmt.Println("No messages available, continuing...")
            continue
        }
        log.Printf("Error: %v", err)
        break
    }

    processMessage(msg)
}
```

---

## Kafka-Go Set Offset
- difficulty: medium
- description: Seek to specific offset or timestamp

```go
import "github.com/segmentio/kafka-go"

reader := kafka.NewReader(kafka.ReaderConfig{
    Brokers: []string{"localhost:9092"},
    Topic:   "my-topic",
    GroupID: "my-group",
})
defer reader.Close()

// Seek to specific offset
err := reader.SetOffset(1000)
if err != nil {
    log.Fatal(err)
}

// Seek to beginning
err = reader.SetOffset(kafka.FirstOffset)

// Seek to end
err = reader.SetOffset(kafka.LastOffset)

// Seek to timestamp
err = reader.SetOffsetAt(context.Background(), time.Now().Add(-1*time.Hour))
```

---

## Kafka-Go Create Topic
- difficulty: medium
- description: Create topic programmatically using kafka-go

```go
import "github.com/segmentio/kafka-go"

conn, err := kafka.Dial("tcp", "localhost:9092")
if err != nil {
    log.Fatal(err)
}
defer conn.Close()

controller, err := conn.Controller()
if err != nil {
    log.Fatal(err)
}

controllerConn, err := kafka.Dial("tcp", net.JoinHostPort(controller.Host, strconv.Itoa(controller.Port)))
if err != nil {
    log.Fatal(err)
}
defer controllerConn.Close()

topicConfigs := []kafka.TopicConfig{
    {
        Topic:             "new-topic",
        NumPartitions:     6,
        ReplicationFactor: 3,
    },
}

err = controllerConn.CreateTopics(topicConfigs...)
if err != nil {
    log.Fatal(err)
}
fmt.Println("Topic created")
```

---

## Kafka-Go Delete Topic
- difficulty: easy
- description: Delete topic using kafka-go connection

```go
import "github.com/segmentio/kafka-go"

conn, err := kafka.Dial("tcp", "localhost:9092")
if err != nil {
    log.Fatal(err)
}
defer conn.Close()

controller, _ := conn.Controller()
controllerConn, _ := kafka.Dial("tcp", net.JoinHostPort(controller.Host, strconv.Itoa(controller.Port)))
defer controllerConn.Close()

err = controllerConn.DeleteTopics("topic-to-delete")
if err != nil {
    log.Fatal(err)
}
```

---

## Kafka-Go List Topics
- difficulty: easy
- description: Get list of all topics in cluster

```go
import "github.com/segmentio/kafka-go"

conn, err := kafka.Dial("tcp", "localhost:9092")
if err != nil {
    log.Fatal(err)
}
defer conn.Close()

partitions, err := conn.ReadPartitions()
if err != nil {
    log.Fatal(err)
}

topics := make(map[string][]int)
for _, p := range partitions {
    topics[p.Topic] = append(topics[p.Topic], p.ID)
}

for topic, partitions := range topics {
    fmt.Printf("Topic: %s, Partitions: %v\n", topic, partitions)
}
```

---

## Kafka-Go TLS Configuration
- difficulty: medium
- description: Configure TLS for secure connection in kafka-go

```go
import (
    "crypto/tls"
    "github.com/segmentio/kafka-go"
)

dialer := &kafka.Dialer{
    Timeout:   10 * time.Second,
    DualStack: true,
    TLS: &tls.Config{
        InsecureSkipVerify: false,
        MinVersion:         tls.VersionTLS12,
    },
}

reader := kafka.NewReader(kafka.ReaderConfig{
    Brokers: []string{"kafka:9093"},
    Topic:   "my-topic",
    GroupID: "my-group",
    Dialer:  dialer,
})
```

---

## Kafka-Go SASL PLAIN
- difficulty: medium
- description: Configure SASL PLAIN authentication for kafka-go

```go
import (
    "github.com/segmentio/kafka-go"
    "github.com/segmentio/kafka-go/sasl/plain"
)

mechanism := plain.Mechanism{
    Username: "username",
    Password: "password",
}

dialer := &kafka.Dialer{
    Timeout:       10 * time.Second,
    DualStack:     true,
    SASLMechanism: mechanism,
    TLS:           &tls.Config{},
}

writer := &kafka.Writer{
    Addr:     kafka.TCP("kafka:9093"),
    Topic:    "my-topic",
    Balancer: &kafka.LeastBytes{},
    Transport: &kafka.Transport{
        SASL: mechanism,
        TLS:  &tls.Config{},
    },
}
```

---

## Kafka-Go SASL SCRAM
- difficulty: hard
- description: Configure SASL SCRAM-SHA-512 authentication

```go
import (
    "github.com/segmentio/kafka-go"
    "github.com/segmentio/kafka-go/sasl/scram"
)

mechanism, err := scram.Mechanism(scram.SHA512, "username", "password")
if err != nil {
    log.Fatal(err)
}

dialer := &kafka.Dialer{
    Timeout:       10 * time.Second,
    DualStack:     true,
    SASLMechanism: mechanism,
    TLS:           &tls.Config{},
}

reader := kafka.NewReader(kafka.ReaderConfig{
    Brokers: []string{"kafka:9093"},
    Topic:   "my-topic",
    GroupID: "my-group",
    Dialer:  dialer,
})
```

---

## JSON Message Serialization
- difficulty: easy
- description: Serialize and deserialize JSON messages in Go

```go
import (
    "encoding/json"
    "github.com/segmentio/kafka-go"
)

type Event struct {
    ID        string    `json:"id"`
    Type      string    `json:"type"`
    Payload   any       `json:"payload"`
    Timestamp time.Time `json:"timestamp"`
}

func produceJSON(writer *kafka.Writer, event Event) error {
    data, err := json.Marshal(event)
    if err != nil {
        return err
    }

    return writer.WriteMessages(context.Background(),
        kafka.Message{
            Key:   []byte(event.ID),
            Value: data,
        },
    )
}

func consumeJSON(msg kafka.Message) (*Event, error) {
    var event Event
    if err := json.Unmarshal(msg.Value, &event); err != nil {
        return nil, err
    }
    return &event, nil
}
```

---

## Retry with Dead Letter Queue
- difficulty: hard
- description: Implement retry mechanism with DLQ for failed messages

```go
import "github.com/segmentio/kafka-go"

type RetryProcessor struct {
    reader    *kafka.Reader
    writer    *kafka.Writer
    dlqWriter *kafka.Writer
    maxRetry  int
}

func (p *RetryProcessor) Process(ctx context.Context) error {
    for {
        msg, err := p.reader.FetchMessage(ctx)
        if err != nil {
            return err
        }

        retryCount := getRetryCount(msg.Headers)

        if err := processMessage(msg); err != nil {
            if retryCount < p.maxRetry {
                p.sendToRetry(ctx, msg, retryCount+1)
            } else {
                p.sendToDLQ(ctx, msg, err)
            }
        }

        p.reader.CommitMessages(ctx, msg)
    }
}

func (p *RetryProcessor) sendToRetry(ctx context.Context, msg kafka.Message, retry int) {
    headers := append(msg.Headers, kafka.Header{
        Key:   "retry-count",
        Value: []byte(strconv.Itoa(retry)),
    })
    p.writer.WriteMessages(ctx, kafka.Message{
        Key:     msg.Key,
        Value:   msg.Value,
        Headers: headers,
    })
}

func (p *RetryProcessor) sendToDLQ(ctx context.Context, msg kafka.Message, err error) {
    headers := append(msg.Headers,
        kafka.Header{Key: "error", Value: []byte(err.Error())},
        kafka.Header{Key: "original-topic", Value: []byte(msg.Topic)},
    )
    p.dlqWriter.WriteMessages(ctx, kafka.Message{
        Key:     msg.Key,
        Value:   msg.Value,
        Headers: headers,
    })
}

func getRetryCount(headers []kafka.Header) int {
    for _, h := range headers {
        if h.Key == "retry-count" {
            count, _ := strconv.Atoi(string(h.Value))
            return count
        }
    }
    return 0
}
```

---

## Graceful Shutdown Pattern
- difficulty: medium
- description: Properly shutdown producer and consumer on termination

```go
import (
    "github.com/segmentio/kafka-go"
    "os/signal"
)

func main() {
    ctx, cancel := context.WithCancel(context.Background())

    sigchan := make(chan os.Signal, 1)
    signal.Notify(sigchan, syscall.SIGINT, syscall.SIGTERM)

    reader := kafka.NewReader(kafka.ReaderConfig{
        Brokers: []string{"localhost:9092"},
        Topic:   "my-topic",
        GroupID: "my-group",
    })

    writer := &kafka.Writer{
        Addr:  kafka.TCP("localhost:9092"),
        Topic: "output-topic",
    }

    var wg sync.WaitGroup
    wg.Add(1)

    go func() {
        defer wg.Done()
        for {
            select {
            case <-ctx.Done():
                return
            default:
                msg, err := reader.ReadMessage(ctx)
                if err != nil {
                    if ctx.Err() != nil {
                        return
                    }
                    log.Printf("Error: %v", err)
                    continue
                }
                processMessage(msg)
            }
        }
    }()

    <-sigchan
    fmt.Println("Shutting down...")
    cancel()

    wg.Wait()
    reader.Close()
    writer.Close()
    fmt.Println("Shutdown complete")
}
```

---

## Worker Pool Consumer
- difficulty: hard
- description: Consume messages with concurrent worker pool for parallel processing

```go
import "github.com/segmentio/kafka-go"

type WorkerPool struct {
    reader   *kafka.Reader
    workers  int
    jobs     chan kafka.Message
    results  chan error
}

func NewWorkerPool(reader *kafka.Reader, workers int) *WorkerPool {
    return &WorkerPool{
        reader:  reader,
        workers: workers,
        jobs:    make(chan kafka.Message, workers*2),
        results: make(chan error, workers*2),
    }
}

func (p *WorkerPool) Start(ctx context.Context) {
    var wg sync.WaitGroup

    for i := 0; i < p.workers; i++ {
        wg.Add(1)
        go func(id int) {
            defer wg.Done()
            for msg := range p.jobs {
                err := processMessage(msg)
                p.results <- err
            }
        }(i)
    }

    go func() {
        for {
            msg, err := p.reader.FetchMessage(ctx)
            if err != nil {
                if ctx.Err() != nil {
                    close(p.jobs)
                    return
                }
                continue
            }
            p.jobs <- msg
        }
    }()

    go func() {
        for err := range p.results {
            if err != nil {
                log.Printf("Processing error: %v", err)
            }
        }
    }()

    wg.Wait()
}
```

---

## Stream Processing Pipeline
- difficulty: hard
- description: Build stream processing pipeline with filter, map, and aggregate

```go
import "github.com/segmentio/kafka-go"

type Pipeline struct {
    reader *kafka.Reader
    writer *kafka.Writer
}

type Event struct {
    UserID string  `json:"user_id"`
    Action string  `json:"action"`
    Amount float64 `json:"amount"`
}

func (p *Pipeline) Process(ctx context.Context) error {
    for {
        msg, err := p.reader.FetchMessage(ctx)
        if err != nil {
            return err
        }

        var event Event
        json.Unmarshal(msg.Value, &event)

        // Filter
        if event.Amount < 100 {
            p.reader.CommitMessages(ctx, msg)
            continue
        }

        // Transform
        enriched := map[string]any{
            "user_id":     event.UserID,
            "action":      event.Action,
            "amount":      event.Amount,
            "category":    categorize(event.Amount),
            "processed":   time.Now(),
        }

        // Output
        output, _ := json.Marshal(enriched)
        p.writer.WriteMessages(ctx, kafka.Message{
            Key:   []byte(event.UserID),
            Value: output,
        })

        p.reader.CommitMessages(ctx, msg)
    }
}

func categorize(amount float64) string {
    switch {
    case amount >= 1000:
        return "premium"
    case amount >= 500:
        return "standard"
    default:
        return "basic"
    }
}
```

---

## Metrics and Monitoring
- difficulty: medium
- description: Add Prometheus metrics to Kafka producer and consumer

```go
import (
    "github.com/prometheus/client_golang/prometheus"
    "github.com/prometheus/client_golang/prometheus/promauto"
    "github.com/segmentio/kafka-go"
)

var (
    messagesProduced = promauto.NewCounterVec(
        prometheus.CounterOpts{
            Name: "kafka_messages_produced_total",
            Help: "Total messages produced",
        },
        []string{"topic"},
    )

    messagesConsumed = promauto.NewCounterVec(
        prometheus.CounterOpts{
            Name: "kafka_messages_consumed_total",
            Help: "Total messages consumed",
        },
        []string{"topic", "partition"},
    )

    processingDuration = promauto.NewHistogramVec(
        prometheus.HistogramOpts{
            Name:    "kafka_message_processing_seconds",
            Help:    "Message processing duration",
            Buckets: prometheus.DefBuckets,
        },
        []string{"topic"},
    )
)

func produceWithMetrics(writer *kafka.Writer, msg kafka.Message) error {
    err := writer.WriteMessages(context.Background(), msg)
    if err == nil {
        messagesProduced.WithLabelValues(writer.Topic).Inc()
    }
    return err
}

func consumeWithMetrics(reader *kafka.Reader) {
    for {
        msg, err := reader.ReadMessage(context.Background())
        if err != nil {
            continue
        }

        start := time.Now()
        processMessage(msg)

        messagesConsumed.WithLabelValues(
            msg.Topic,
            strconv.Itoa(msg.Partition),
        ).Inc()

        processingDuration.WithLabelValues(msg.Topic).Observe(
            time.Since(start).Seconds(),
        )
    }
}
```

---

## Schema Registry Integration
- difficulty: hard
- description: Use Schema Registry with Avro serialization in Go

```go
import (
    "github.com/linkedin/goavro/v2"
    "github.com/riferrei/srclient"
    "github.com/segmentio/kafka-go"
)

type SchemaProducer struct {
    writer       *kafka.Writer
    schemaClient *srclient.SchemaRegistryClient
    codec        *goavro.Codec
    schemaID     int
}

func NewSchemaProducer(brokers []string, topic, schemaURL string) (*SchemaProducer, error) {
    client := srclient.CreateSchemaRegistryClient(schemaURL)

    schema, err := client.GetLatestSchema(topic + "-value")
    if err != nil {
        return nil, err
    }

    codec, err := goavro.NewCodec(schema.Schema())
    if err != nil {
        return nil, err
    }

    return &SchemaProducer{
        writer: &kafka.Writer{
            Addr:  kafka.TCP(brokers...),
            Topic: topic,
        },
        schemaClient: client,
        codec:        codec,
        schemaID:     schema.ID(),
    }, nil
}

func (p *SchemaProducer) Produce(ctx context.Context, key string, data map[string]any) error {
    binary, err := p.codec.BinaryFromNative(nil, data)
    if err != nil {
        return err
    }

    // Prepend schema ID (Confluent wire format)
    payload := make([]byte, 5+len(binary))
    payload[0] = 0 // Magic byte
    binary.BigEndian.PutUint32(payload[1:5], uint32(p.schemaID))
    copy(payload[5:], binary)

    return p.writer.WriteMessages(ctx, kafka.Message{
        Key:   []byte(key),
        Value: payload,
    })
}
```

---

## Consumer Lag Monitoring
- difficulty: medium
- description: Monitor consumer group lag for alerting

```go
import "github.com/segmentio/kafka-go"

func GetConsumerLag(brokers []string, topic, groupID string) (map[int]int64, error) {
    conn, err := kafka.Dial("tcp", brokers[0])
    if err != nil {
        return nil, err
    }
    defer conn.Close()

    partitions, err := conn.ReadPartitions(topic)
    if err != nil {
        return nil, err
    }

    lag := make(map[int]int64)

    for _, p := range partitions {
        leader, _ := kafka.DialLeader(context.Background(), "tcp",
            net.JoinHostPort(p.Leader.Host, strconv.Itoa(p.Leader.Port)),
            topic, p.ID)

        // Get latest offset
        latestOffset, _ := leader.ReadLastOffset()

        // Get committed offset
        groupConn, _ := kafka.DialLeader(context.Background(), "tcp",
            brokers[0], topic, p.ID)

        offsetFetchReq := kafka.OffsetFetchRequest{
            GroupID: groupID,
            Topics:  map[string][]int{topic: {p.ID}},
        }
        offsetFetchResp, _ := groupConn.OffsetFetch(offsetFetchReq)

        committedOffset := offsetFetchResp.Topics[topic][p.ID].CommittedOffset
        lag[p.ID] = latestOffset - committedOffset

        leader.Close()
        groupConn.Close()
    }

    return lag, nil
}
```

---

## Exactly-Once Processing
- difficulty: hard
- description: Implement exactly-once semantics with idempotent writes

```go
import (
    "github.com/segmentio/kafka-go"
    "sync"
)

type ExactlyOnceProcessor struct {
    reader     *kafka.Reader
    writer     *kafka.Writer
    processed  map[string]bool
    mu         sync.RWMutex
    checkpoint *CheckpointStore
}

func (p *ExactlyOnceProcessor) Process(ctx context.Context) error {
    for {
        msg, err := p.reader.FetchMessage(ctx)
        if err != nil {
            return err
        }

        msgID := generateMessageID(msg)

        p.mu.RLock()
        if p.processed[msgID] {
            p.mu.RUnlock()
            p.reader.CommitMessages(ctx, msg)
            continue
        }
        p.mu.RUnlock()

        result, err := processMessage(msg)
        if err != nil {
            log.Printf("Error: %v", err)
            continue
        }

        // Atomic: write output + mark as processed + commit
        p.mu.Lock()
        if err := p.writer.WriteMessages(ctx, kafka.Message{
            Key:   msg.Key,
            Value: result,
            Headers: []kafka.Header{
                {Key: "source-offset", Value: []byte(strconv.FormatInt(msg.Offset, 10))},
            },
        }); err != nil {
            p.mu.Unlock()
            continue
        }

        p.processed[msgID] = true
        p.checkpoint.Save(msgID)
        p.mu.Unlock()

        p.reader.CommitMessages(ctx, msg)
    }
}

func generateMessageID(msg kafka.Message) string {
    return fmt.Sprintf("%s-%d-%d", msg.Topic, msg.Partition, msg.Offset)
}
```

---

## Transactional Producer Sarama
- difficulty: hard
- description: Use transactions for atomic writes across multiple topics

```go
import "github.com/IBM/sarama"

config := sarama.NewConfig()
config.Producer.Idempotent = true
config.Producer.RequiredAcks = sarama.WaitForAll
config.Net.MaxOpenRequests = 1
config.Producer.Transaction.ID = "my-transaction-id"
config.Producer.Return.Successes = true

producer, err := sarama.NewAsyncProducer(brokers, config)
if err != nil {
    log.Fatal(err)
}

err = producer.BeginTxn()
if err != nil {
    log.Fatal(err)
}

producer.Input() <- &sarama.ProducerMessage{
    Topic: "topic-1",
    Value: sarama.StringEncoder("message 1"),
}

producer.Input() <- &sarama.ProducerMessage{
    Topic: "topic-2",
    Value: sarama.StringEncoder("message 2"),
}

err = producer.CommitTxn()
if err != nil {
    producer.AbortTxn()
    log.Fatal(err)
}
```

---

## Health Check Endpoint
- difficulty: easy
- description: HTTP health check for Kafka connectivity

```go
import (
    "github.com/segmentio/kafka-go"
    "net/http"
)

func healthCheck(brokers []string) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        conn, err := kafka.Dial("tcp", brokers[0])
        if err != nil {
            w.WriteHeader(http.StatusServiceUnavailable)
            json.NewEncoder(w).Encode(map[string]string{
                "status": "unhealthy",
                "error":  err.Error(),
            })
            return
        }
        defer conn.Close()

        _, err = conn.Brokers()
        if err != nil {
            w.WriteHeader(http.StatusServiceUnavailable)
            json.NewEncoder(w).Encode(map[string]string{
                "status": "unhealthy",
                "error":  err.Error(),
            })
            return
        }

        w.WriteHeader(http.StatusOK)
        json.NewEncoder(w).Encode(map[string]string{
            "status": "healthy",
        })
    }
}

func main() {
    http.HandleFunc("/health", healthCheck([]string{"localhost:9092"}))
    http.ListenAndServe(":8080", nil)
}
```

---

## Rate Limited Producer
- difficulty: medium
- description: Limit message production rate to avoid overwhelming consumers

```go
import (
    "github.com/segmentio/kafka-go"
    "golang.org/x/time/rate"
)

type RateLimitedProducer struct {
    writer  *kafka.Writer
    limiter *rate.Limiter
}

func NewRateLimitedProducer(writer *kafka.Writer, rps int) *RateLimitedProducer {
    return &RateLimitedProducer{
        writer:  writer,
        limiter: rate.NewLimiter(rate.Limit(rps), rps),
    }
}

func (p *RateLimitedProducer) Produce(ctx context.Context, msgs ...kafka.Message) error {
    for _, msg := range msgs {
        if err := p.limiter.Wait(ctx); err != nil {
            return err
        }

        if err := p.writer.WriteMessages(ctx, msg); err != nil {
            return err
        }
    }
    return nil
}

// Usage
producer := NewRateLimitedProducer(writer, 1000) // 1000 msg/sec
producer.Produce(ctx, kafka.Message{Value: []byte("limited message")})
```

---

## Batch Consumer with Timeout
- difficulty: medium
- description: Consume messages in batches with timeout for efficiency

```go
import "github.com/segmentio/kafka-go"

type BatchConsumer struct {
    reader    *kafka.Reader
    batchSize int
    timeout   time.Duration
}

func (c *BatchConsumer) ConsumeBatch(ctx context.Context) ([]kafka.Message, error) {
    var batch []kafka.Message
    deadline := time.Now().Add(c.timeout)

    for len(batch) < c.batchSize && time.Now().Before(deadline) {
        readCtx, cancel := context.WithDeadline(ctx, deadline)

        msg, err := c.reader.FetchMessage(readCtx)
        cancel()

        if err != nil {
            if err == context.DeadlineExceeded {
                break
            }
            if ctx.Err() != nil {
                return batch, ctx.Err()
            }
            continue
        }

        batch = append(batch, msg)
    }

    return batch, nil
}

func (c *BatchConsumer) ProcessBatches(ctx context.Context) error {
    for {
        batch, err := c.ConsumeBatch(ctx)
        if err != nil {
            return err
        }

        if len(batch) == 0 {
            continue
        }

        if err := processBatch(batch); err != nil {
            log.Printf("Batch processing failed: %v", err)
            continue
        }

        if err := c.reader.CommitMessages(ctx, batch...); err != nil {
            log.Printf("Commit failed: %v", err)
        }

        log.Printf("Processed batch of %d messages", len(batch))
    }
}
```
