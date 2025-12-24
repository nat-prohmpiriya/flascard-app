# gRPC Snippets

Comprehensive gRPC snippets for Protocol Buffers and implementations in Go, TypeScript, and Python.

---

## Proto3 Basic Message
- difficulty: easy
- description: Define basic message type with scalar fields

```protobuf
syntax = "proto3";

package user;

option go_package = "github.com/example/user";

message User {
  string id = 1;
  string name = 2;
  string email = 3;
  int32 age = 4;
  bool is_active = 5;
  double balance = 6;
}
```

---

## Proto3 Nested Message
- difficulty: easy
- description: Message with nested message types

```protobuf
syntax = "proto3";

package order;

message Order {
  string id = 1;
  Customer customer = 2;
  repeated OrderItem items = 3;
  Address shipping_address = 4;
  OrderStatus status = 5;
}

message Customer {
  string id = 1;
  string name = 2;
  string email = 3;
}

message OrderItem {
  string product_id = 1;
  string name = 2;
  int32 quantity = 3;
  double price = 4;
}

message Address {
  string street = 1;
  string city = 2;
  string state = 3;
  string zip_code = 4;
  string country = 5;
}
```

---

## Proto3 Enum
- difficulty: easy
- description: Define enum types in protobuf

```protobuf
syntax = "proto3";

package order;

enum OrderStatus {
  ORDER_STATUS_UNSPECIFIED = 0;
  ORDER_STATUS_PENDING = 1;
  ORDER_STATUS_CONFIRMED = 2;
  ORDER_STATUS_SHIPPED = 3;
  ORDER_STATUS_DELIVERED = 4;
  ORDER_STATUS_CANCELLED = 5;
}

enum PaymentMethod {
  PAYMENT_METHOD_UNSPECIFIED = 0;
  PAYMENT_METHOD_CREDIT_CARD = 1;
  PAYMENT_METHOD_DEBIT_CARD = 2;
  PAYMENT_METHOD_PAYPAL = 3;
  PAYMENT_METHOD_BANK_TRANSFER = 4;
}

message Order {
  string id = 1;
  OrderStatus status = 2;
  PaymentMethod payment_method = 3;
}
```

---

## Proto3 Repeated Fields
- difficulty: easy
- description: Arrays and lists using repeated keyword

```protobuf
syntax = "proto3";

package blog;

message Post {
  string id = 1;
  string title = 2;
  string content = 3;
  repeated string tags = 4;
  repeated Comment comments = 5;
  repeated int64 view_timestamps = 6;
}

message Comment {
  string id = 1;
  string author = 2;
  string text = 3;
}
```

---

## Proto3 Map Fields
- difficulty: medium
- description: Key-value pairs using map type

```protobuf
syntax = "proto3";

package config;

message Configuration {
  string id = 1;
  map<string, string> settings = 2;
  map<string, int32> feature_flags = 3;
  map<int32, User> users_by_id = 4;
}

message User {
  string name = 1;
  string email = 2;
}
```

---

## Proto3 Oneof
- difficulty: medium
- description: Define mutually exclusive fields

```protobuf
syntax = "proto3";

package notification;

message Notification {
  string id = 1;
  string title = 2;

  oneof content {
    EmailContent email = 3;
    SmsContent sms = 4;
    PushContent push = 5;
  }
}

message EmailContent {
  string subject = 1;
  string body = 2;
  repeated string attachments = 3;
}

message SmsContent {
  string message = 1;
}

message PushContent {
  string body = 1;
  string action_url = 2;
}
```

---

## Proto3 Optional Fields
- difficulty: easy
- description: Optional fields with presence tracking

```protobuf
syntax = "proto3";

package user;

message UpdateUserRequest {
  string id = 1;
  optional string name = 2;
  optional string email = 3;
  optional int32 age = 4;
  optional bool is_active = 5;
}
```

---

## Proto3 Well-Known Types
- difficulty: medium
- description: Use Google's well-known types

```protobuf
syntax = "proto3";

package event;

import "google/protobuf/timestamp.proto";
import "google/protobuf/duration.proto";
import "google/protobuf/empty.proto";
import "google/protobuf/wrappers.proto";
import "google/protobuf/any.proto";

message Event {
  string id = 1;
  string name = 2;
  google.protobuf.Timestamp created_at = 3;
  google.protobuf.Timestamp updated_at = 4;
  google.protobuf.Duration duration = 5;
  google.protobuf.StringValue description = 6;
  google.protobuf.Int32Value priority = 7;
  google.protobuf.Any payload = 8;
}

service EventService {
  rpc DeleteAll(google.protobuf.Empty) returns (google.protobuf.Empty);
}
```

---

## Proto3 Service Definition
- difficulty: easy
- description: Define gRPC service with RPC methods

```protobuf
syntax = "proto3";

package user;

service UserService {
  rpc GetUser(GetUserRequest) returns (User);
  rpc ListUsers(ListUsersRequest) returns (ListUsersResponse);
  rpc CreateUser(CreateUserRequest) returns (User);
  rpc UpdateUser(UpdateUserRequest) returns (User);
  rpc DeleteUser(DeleteUserRequest) returns (DeleteUserResponse);
}

message GetUserRequest {
  string id = 1;
}

message ListUsersRequest {
  int32 page = 1;
  int32 page_size = 2;
}

message ListUsersResponse {
  repeated User users = 1;
  int32 total_count = 2;
}

message CreateUserRequest {
  string name = 1;
  string email = 2;
  string password = 3;
}

message UpdateUserRequest {
  string id = 1;
  optional string name = 2;
  optional string email = 3;
}

message DeleteUserRequest {
  string id = 1;
}

message DeleteUserResponse {
  bool success = 1;
}
```

---

## Proto3 Streaming RPC
- difficulty: medium
- description: Server, client, and bidirectional streaming

```protobuf
syntax = "proto3";

package stream;

service StreamService {
  // Unary RPC
  rpc GetData(GetDataRequest) returns (DataResponse);

  // Server streaming
  rpc StreamData(StreamDataRequest) returns (stream DataChunk);

  // Client streaming
  rpc UploadData(stream DataChunk) returns (UploadResponse);

  // Bidirectional streaming
  rpc Chat(stream ChatMessage) returns (stream ChatMessage);
}

message GetDataRequest {
  string id = 1;
}

message DataResponse {
  bytes data = 1;
}

message StreamDataRequest {
  string id = 1;
  int32 chunk_size = 2;
}

message DataChunk {
  bytes data = 1;
  int32 sequence = 2;
  bool is_last = 3;
}

message UploadResponse {
  string id = 1;
  int64 total_bytes = 2;
  bool success = 3;
}

message ChatMessage {
  string user_id = 1;
  string message = 2;
  int64 timestamp = 3;
}
```

---

## Proto3 Field Options
- difficulty: medium
- description: Custom field options and validation

```protobuf
syntax = "proto3";

package user;

import "google/protobuf/descriptor.proto";

extend google.protobuf.FieldOptions {
  optional bool required = 50001;
  optional int32 min_length = 50002;
  optional int32 max_length = 50003;
}

message CreateUserRequest {
  string name = 1 [(required) = true, (min_length) = 2, (max_length) = 100];
  string email = 2 [(required) = true];
  string password = 3 [(required) = true, (min_length) = 8];
}
```

---

## Go Server Unary RPC
- difficulty: medium
- description: Implement unary RPC server in Go

```go
package main

import (
	"context"
	"log"
	"net"

	"google.golang.org/grpc"
	pb "github.com/example/proto/user"
)

type userServer struct {
	pb.UnimplementedUserServiceServer
}

func (s *userServer) GetUser(ctx context.Context, req *pb.GetUserRequest) (*pb.User, error) {
	user := &pb.User{
		Id:       req.Id,
		Name:     "John Doe",
		Email:    "john@example.com",
		IsActive: true,
	}
	return user, nil
}

func (s *userServer) CreateUser(ctx context.Context, req *pb.CreateUserRequest) (*pb.User, error) {
	user := &pb.User{
		Id:       "new-id",
		Name:     req.Name,
		Email:    req.Email,
		IsActive: true,
	}
	return user, nil
}

func main() {
	lis, err := net.Listen("tcp", ":50051")
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}

	grpcServer := grpc.NewServer()
	pb.RegisterUserServiceServer(grpcServer, &userServer{})

	log.Println("Server listening on :50051")
	if err := grpcServer.Serve(lis); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
}
```

---

## Go Client Unary RPC
- difficulty: easy
- description: Call unary RPC from Go client

```go
package main

import (
	"context"
	"log"
	"time"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	pb "github.com/example/proto/user"
)

func main() {
	conn, err := grpc.Dial("localhost:50051",
		grpc.WithTransportCredentials(insecure.NewCredentials()),
	)
	if err != nil {
		log.Fatalf("failed to connect: %v", err)
	}
	defer conn.Close()

	client := pb.NewUserServiceClient(conn)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	user, err := client.GetUser(ctx, &pb.GetUserRequest{Id: "123"})
	if err != nil {
		log.Fatalf("GetUser failed: %v", err)
	}

	log.Printf("User: %v", user)
}
```

---

## Go Server Streaming
- difficulty: medium
- description: Implement server-side streaming in Go

```go
func (s *streamServer) StreamData(req *pb.StreamDataRequest, stream pb.StreamService_StreamDataServer) error {
	data := generateData(req.Id)
	chunkSize := int(req.ChunkSize)

	for i := 0; i < len(data); i += chunkSize {
		end := i + chunkSize
		if end > len(data) {
			end = len(data)
		}

		chunk := &pb.DataChunk{
			Data:     data[i:end],
			Sequence: int32(i / chunkSize),
			IsLast:   end >= len(data),
		}

		if err := stream.Send(chunk); err != nil {
			return err
		}

		time.Sleep(100 * time.Millisecond)
	}

	return nil
}
```

---

## Go Client Server Streaming
- difficulty: medium
- description: Receive server-side streaming in Go client

```go
func receiveStream(client pb.StreamServiceClient) error {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	stream, err := client.StreamData(ctx, &pb.StreamDataRequest{
		Id:        "file-123",
		ChunkSize: 1024,
	})
	if err != nil {
		return err
	}

	var totalBytes int64
	for {
		chunk, err := stream.Recv()
		if err == io.EOF {
			break
		}
		if err != nil {
			return err
		}

		totalBytes += int64(len(chunk.Data))
		log.Printf("Received chunk %d, %d bytes", chunk.Sequence, len(chunk.Data))

		if chunk.IsLast {
			break
		}
	}

	log.Printf("Total bytes received: %d", totalBytes)
	return nil
}
```

---

## Go Client Streaming
- difficulty: medium
- description: Implement client-side streaming in Go

```go
func (s *streamServer) UploadData(stream pb.StreamService_UploadDataServer) error {
	var totalBytes int64
	var chunks [][]byte

	for {
		chunk, err := stream.Recv()
		if err == io.EOF {
			return stream.SendAndClose(&pb.UploadResponse{
				Id:         "upload-123",
				TotalBytes: totalBytes,
				Success:    true,
			})
		}
		if err != nil {
			return err
		}

		chunks = append(chunks, chunk.Data)
		totalBytes += int64(len(chunk.Data))
		log.Printf("Received chunk %d", chunk.Sequence)
	}
}
```

---

## Go Send Client Streaming
- difficulty: medium
- description: Send client-side streaming from Go client

```go
func uploadFile(client pb.StreamServiceClient, filePath string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()

	stream, err := client.UploadData(ctx)
	if err != nil {
		return err
	}

	file, err := os.Open(filePath)
	if err != nil {
		return err
	}
	defer file.Close()

	buffer := make([]byte, 1024)
	sequence := int32(0)

	for {
		n, err := file.Read(buffer)
		if err == io.EOF {
			break
		}
		if err != nil {
			return err
		}

		chunk := &pb.DataChunk{
			Data:     buffer[:n],
			Sequence: sequence,
		}

		if err := stream.Send(chunk); err != nil {
			return err
		}
		sequence++
	}

	response, err := stream.CloseAndRecv()
	if err != nil {
		return err
	}

	log.Printf("Upload complete: %d bytes", response.TotalBytes)
	return nil
}
```

---

## Go Bidirectional Streaming
- difficulty: hard
- description: Implement bidirectional streaming in Go

```go
func (s *streamServer) Chat(stream pb.StreamService_ChatServer) error {
	for {
		msg, err := stream.Recv()
		if err == io.EOF {
			return nil
		}
		if err != nil {
			return err
		}

		log.Printf("Received from %s: %s", msg.UserId, msg.Message)

		response := &pb.ChatMessage{
			UserId:    "server",
			Message:   fmt.Sprintf("Echo: %s", msg.Message),
			Timestamp: time.Now().Unix(),
		}

		if err := stream.Send(response); err != nil {
			return err
		}
	}
}
```

---

## Go Bidirectional Client
- difficulty: hard
- description: Handle bidirectional streaming in Go client

```go
func chat(client pb.StreamServiceClient) error {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	stream, err := client.Chat(ctx)
	if err != nil {
		return err
	}

	waitc := make(chan struct{})

	go func() {
		for {
			msg, err := stream.Recv()
			if err == io.EOF {
				close(waitc)
				return
			}
			if err != nil {
				log.Printf("Receive error: %v", err)
				return
			}
			log.Printf("Server: %s", msg.Message)
		}
	}()

	messages := []string{"Hello", "How are you?", "Goodbye"}
	for _, msg := range messages {
		if err := stream.Send(&pb.ChatMessage{
			UserId:    "client-1",
			Message:   msg,
			Timestamp: time.Now().Unix(),
		}); err != nil {
			return err
		}
		time.Sleep(time.Second)
	}

	stream.CloseSend()
	<-waitc
	return nil
}
```

---

## Go Error Handling
- difficulty: medium
- description: Return gRPC status errors in Go

```go
import (
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func (s *userServer) GetUser(ctx context.Context, req *pb.GetUserRequest) (*pb.User, error) {
	if req.Id == "" {
		return nil, status.Error(codes.InvalidArgument, "user ID is required")
	}

	user, err := s.db.FindUser(req.Id)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "database error: %v", err)
	}

	if user == nil {
		return nil, status.Errorf(codes.NotFound, "user %s not found", req.Id)
	}

	return user, nil
}

func (s *userServer) CreateUser(ctx context.Context, req *pb.CreateUserRequest) (*pb.User, error) {
	if req.Email == "" {
		return nil, status.Error(codes.InvalidArgument, "email is required")
	}

	exists, _ := s.db.EmailExists(req.Email)
	if exists {
		return nil, status.Error(codes.AlreadyExists, "email already registered")
	}

	user, err := s.db.CreateUser(req)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to create user: %v", err)
	}

	return user, nil
}
```

---

## Go Error Handling Client
- difficulty: medium
- description: Handle gRPC errors in Go client

```go
import (
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func getUser(client pb.UserServiceClient, id string) (*pb.User, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	user, err := client.GetUser(ctx, &pb.GetUserRequest{Id: id})
	if err != nil {
		st, ok := status.FromError(err)
		if !ok {
			return nil, fmt.Errorf("unknown error: %v", err)
		}

		switch st.Code() {
		case codes.NotFound:
			return nil, fmt.Errorf("user not found: %s", id)
		case codes.InvalidArgument:
			return nil, fmt.Errorf("invalid request: %s", st.Message())
		case codes.DeadlineExceeded:
			return nil, fmt.Errorf("request timed out")
		case codes.Unavailable:
			return nil, fmt.Errorf("service unavailable")
		default:
			return nil, fmt.Errorf("RPC error: %s", st.Message())
		}
	}

	return user, nil
}
```

---

## Go Metadata
- difficulty: medium
- description: Send and receive metadata (headers) in Go

```go
import "google.golang.org/grpc/metadata"

// Server: Read metadata
func (s *userServer) GetUser(ctx context.Context, req *pb.GetUserRequest) (*pb.User, error) {
	md, ok := metadata.FromIncomingContext(ctx)
	if ok {
		if tokens := md.Get("authorization"); len(tokens) > 0 {
			token := tokens[0]
			log.Printf("Auth token: %s", token)
		}

		if requestID := md.Get("x-request-id"); len(requestID) > 0 {
			log.Printf("Request ID: %s", requestID[0])
		}
	}

	// Send response metadata
	header := metadata.Pairs("x-response-id", "resp-123")
	grpc.SendHeader(ctx, header)

	trailer := metadata.Pairs("x-processing-time", "50ms")
	grpc.SetTrailer(ctx, trailer)

	return &pb.User{Id: req.Id, Name: "John"}, nil
}

// Client: Send metadata
func getUser(client pb.UserServiceClient) {
	md := metadata.Pairs(
		"authorization", "Bearer token123",
		"x-request-id", "req-456",
	)
	ctx := metadata.NewOutgoingContext(context.Background(), md)

	var header, trailer metadata.MD
	user, err := client.GetUser(ctx, &pb.GetUserRequest{Id: "123"},
		grpc.Header(&header),
		grpc.Trailer(&trailer),
	)

	log.Printf("Response header: %v", header)
	log.Printf("Response trailer: %v", trailer)
}
```

---

## Go Interceptor Unary
- difficulty: hard
- description: Implement unary server interceptor for logging

```go
func loggingInterceptor(
	ctx context.Context,
	req interface{},
	info *grpc.UnaryServerInfo,
	handler grpc.UnaryHandler,
) (interface{}, error) {
	start := time.Now()

	md, _ := metadata.FromIncomingContext(ctx)
	log.Printf("Method: %s, Metadata: %v", info.FullMethod, md)

	resp, err := handler(ctx, req)

	duration := time.Since(start)
	if err != nil {
		log.Printf("Method: %s, Duration: %v, Error: %v", info.FullMethod, duration, err)
	} else {
		log.Printf("Method: %s, Duration: %v, Success", info.FullMethod, duration)
	}

	return resp, err
}

func main() {
	server := grpc.NewServer(
		grpc.UnaryInterceptor(loggingInterceptor),
	)
}
```

---

## Go Interceptor Chain
- difficulty: hard
- description: Chain multiple interceptors in Go

```go
import "google.golang.org/grpc/middleware"

func authInterceptor(
	ctx context.Context,
	req interface{},
	info *grpc.UnaryServerInfo,
	handler grpc.UnaryHandler,
) (interface{}, error) {
	md, ok := metadata.FromIncomingContext(ctx)
	if !ok {
		return nil, status.Error(codes.Unauthenticated, "missing metadata")
	}

	tokens := md.Get("authorization")
	if len(tokens) == 0 {
		return nil, status.Error(codes.Unauthenticated, "missing token")
	}

	user, err := validateToken(tokens[0])
	if err != nil {
		return nil, status.Error(codes.Unauthenticated, "invalid token")
	}

	ctx = context.WithValue(ctx, "user", user)
	return handler(ctx, req)
}

func rateLimitInterceptor(
	ctx context.Context,
	req interface{},
	info *grpc.UnaryServerInfo,
	handler grpc.UnaryHandler,
) (interface{}, error) {
	if !limiter.Allow() {
		return nil, status.Error(codes.ResourceExhausted, "rate limit exceeded")
	}
	return handler(ctx, req)
}

func main() {
	server := grpc.NewServer(
		grpc.ChainUnaryInterceptor(
			loggingInterceptor,
			authInterceptor,
			rateLimitInterceptor,
		),
	)
}
```

---

## Go Stream Interceptor
- difficulty: hard
- description: Implement stream server interceptor

```go
func streamLoggingInterceptor(
	srv interface{},
	ss grpc.ServerStream,
	info *grpc.StreamServerInfo,
	handler grpc.StreamHandler,
) error {
	start := time.Now()
	log.Printf("Stream started: %s", info.FullMethod)

	err := handler(srv, &wrappedStream{ServerStream: ss})

	duration := time.Since(start)
	log.Printf("Stream ended: %s, Duration: %v, Error: %v", info.FullMethod, duration, err)

	return err
}

type wrappedStream struct {
	grpc.ServerStream
}

func (w *wrappedStream) RecvMsg(m interface{}) error {
	log.Printf("Received message: %T", m)
	return w.ServerStream.RecvMsg(m)
}

func (w *wrappedStream) SendMsg(m interface{}) error {
	log.Printf("Sending message: %T", m)
	return w.ServerStream.SendMsg(m)
}

func main() {
	server := grpc.NewServer(
		grpc.StreamInterceptor(streamLoggingInterceptor),
	)
}
```

---

## Go TLS Server
- difficulty: medium
- description: Configure TLS for secure gRPC server

```go
import "google.golang.org/grpc/credentials"

func main() {
	creds, err := credentials.NewServerTLSFromFile("server.crt", "server.key")
	if err != nil {
		log.Fatalf("failed to load TLS: %v", err)
	}

	server := grpc.NewServer(
		grpc.Creds(creds),
	)

	pb.RegisterUserServiceServer(server, &userServer{})

	lis, _ := net.Listen("tcp", ":50051")
	server.Serve(lis)
}
```

---

## Go TLS Client
- difficulty: medium
- description: Configure TLS for secure gRPC client

```go
import "google.golang.org/grpc/credentials"

func main() {
	creds, err := credentials.NewClientTLSFromFile("ca.crt", "")
	if err != nil {
		log.Fatalf("failed to load TLS: %v", err)
	}

	conn, err := grpc.Dial("localhost:50051",
		grpc.WithTransportCredentials(creds),
	)
	if err != nil {
		log.Fatalf("failed to connect: %v", err)
	}
	defer conn.Close()

	client := pb.NewUserServiceClient(conn)
}
```

---

## Go Health Check
- difficulty: medium
- description: Implement gRPC health check service

```go
import (
	"google.golang.org/grpc/health"
	"google.golang.org/grpc/health/grpc_health_v1"
)

func main() {
	server := grpc.NewServer()

	healthServer := health.NewServer()
	grpc_health_v1.RegisterHealthServer(server, healthServer)

	healthServer.SetServingStatus("user.UserService", grpc_health_v1.HealthCheckResponse_SERVING)

	pb.RegisterUserServiceServer(server, &userServer{})

	lis, _ := net.Listen("tcp", ":50051")
	server.Serve(lis)
}
```

---

## Go Reflection
- difficulty: easy
- description: Enable gRPC reflection for debugging

```go
import "google.golang.org/grpc/reflection"

func main() {
	server := grpc.NewServer()

	pb.RegisterUserServiceServer(server, &userServer{})

	reflection.Register(server)

	lis, _ := net.Listen("tcp", ":50051")
	server.Serve(lis)
}
```

---

## TypeScript Server
- difficulty: medium
- description: Implement gRPC server in TypeScript with @grpc/grpc-js

```typescript
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';

const packageDefinition = protoLoader.loadSync('user.proto', {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const userProto = grpc.loadPackageDefinition(packageDefinition).user as any;

const users: Map<string, any> = new Map();

const userService: grpc.UntypedServiceImplementation = {
  getUser: (call: grpc.ServerUnaryCall<any, any>, callback: grpc.sendUnaryData<any>) => {
    const user = users.get(call.request.id);
    if (!user) {
      callback({
        code: grpc.status.NOT_FOUND,
        message: 'User not found',
      });
      return;
    }
    callback(null, user);
  },

  createUser: (call: grpc.ServerUnaryCall<any, any>, callback: grpc.sendUnaryData<any>) => {
    const user = {
      id: crypto.randomUUID(),
      name: call.request.name,
      email: call.request.email,
      is_active: true,
    };
    users.set(user.id, user);
    callback(null, user);
  },
};

const server = new grpc.Server();
server.addService(userProto.UserService.service, userService);

server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
  console.log('Server running on port 50051');
});
```

---

## TypeScript Client
- difficulty: medium
- description: Call gRPC service from TypeScript client

```typescript
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';

const packageDefinition = protoLoader.loadSync('user.proto', {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const userProto = grpc.loadPackageDefinition(packageDefinition).user as any;

const client = new userProto.UserService(
  'localhost:50051',
  grpc.credentials.createInsecure()
);

async function getUser(id: string): Promise<any> {
  return new Promise((resolve, reject) => {
    client.getUser({ id }, (error: grpc.ServiceError | null, response: any) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(response);
    });
  });
}

async function createUser(name: string, email: string): Promise<any> {
  return new Promise((resolve, reject) => {
    client.createUser({ name, email }, (error: grpc.ServiceError | null, response: any) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(response);
    });
  });
}

async function main() {
  const user = await createUser('John', 'john@example.com');
  console.log('Created:', user);

  const fetched = await getUser(user.id);
  console.log('Fetched:', fetched);
}

main();
```

---

## TypeScript Server Streaming
- difficulty: medium
- description: Implement server streaming in TypeScript

```typescript
const streamService: grpc.UntypedServiceImplementation = {
  streamData: (call: grpc.ServerWritableStream<any, any>) => {
    const data = Buffer.alloc(10000);
    const chunkSize = call.request.chunk_size || 1024;

    let sequence = 0;
    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, Math.min(i + chunkSize, data.length));
      call.write({
        data: chunk,
        sequence: sequence++,
        is_last: i + chunkSize >= data.length,
      });
    }

    call.end();
  },
};
```

---

## TypeScript Client Streaming
- difficulty: medium
- description: Send client streaming in TypeScript

```typescript
async function uploadData(chunks: Buffer[]): Promise<any> {
  return new Promise((resolve, reject) => {
    const call = client.uploadData((error: grpc.ServiceError | null, response: any) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(response);
    });

    chunks.forEach((chunk, index) => {
      call.write({
        data: chunk,
        sequence: index,
        is_last: index === chunks.length - 1,
      });
    });

    call.end();
  });
}
```

---

## Python Server
- difficulty: medium
- description: Implement gRPC server in Python

```python
import grpc
from concurrent import futures
import user_pb2
import user_pb2_grpc

class UserServicer(user_pb2_grpc.UserServiceServicer):
    def __init__(self):
        self.users = {}

    def GetUser(self, request, context):
        user = self.users.get(request.id)
        if not user:
            context.abort(grpc.StatusCode.NOT_FOUND, f"User {request.id} not found")
        return user

    def CreateUser(self, request, context):
        user_id = str(uuid.uuid4())
        user = user_pb2.User(
            id=user_id,
            name=request.name,
            email=request.email,
            is_active=True,
        )
        self.users[user_id] = user
        return user

    def ListUsers(self, request, context):
        users = list(self.users.values())
        return user_pb2.ListUsersResponse(
            users=users,
            total_count=len(users),
        )


def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    user_pb2_grpc.add_UserServiceServicer_to_server(UserServicer(), server)
    server.add_insecure_port("[::]:50051")
    server.start()
    print("Server started on port 50051")
    server.wait_for_termination()


if __name__ == "__main__":
    serve()
```

---

## Python Client
- difficulty: easy
- description: Call gRPC service from Python client

```python
import grpc
import user_pb2
import user_pb2_grpc


def run():
    with grpc.insecure_channel("localhost:50051") as channel:
        stub = user_pb2_grpc.UserServiceStub(channel)

        # Create user
        response = stub.CreateUser(
            user_pb2.CreateUserRequest(
                name="John Doe",
                email="john@example.com",
                password="secret",
            )
        )
        print(f"Created user: {response.id}")

        # Get user
        user = stub.GetUser(user_pb2.GetUserRequest(id=response.id))
        print(f"User: {user.name}, {user.email}")

        # List users
        users = stub.ListUsers(user_pb2.ListUsersRequest(page=1, page_size=10))
        print(f"Total users: {users.total_count}")
        for user in users.users:
            print(f"  - {user.name}")


if __name__ == "__main__":
    run()
```

---

## Python Server Streaming
- difficulty: medium
- description: Implement server streaming in Python

```python
class StreamServicer(stream_pb2_grpc.StreamServiceServicer):
    def StreamData(self, request, context):
        data = b"x" * 10000
        chunk_size = request.chunk_size or 1024
        sequence = 0

        for i in range(0, len(data), chunk_size):
            chunk = data[i : i + chunk_size]
            yield stream_pb2.DataChunk(
                data=chunk,
                sequence=sequence,
                is_last=(i + chunk_size >= len(data)),
            )
            sequence += 1
            time.sleep(0.1)
```

---

## Python Client Streaming
- difficulty: medium
- description: Send client streaming in Python

```python
def generate_chunks(file_path):
    with open(file_path, "rb") as f:
        sequence = 0
        while True:
            chunk = f.read(1024)
            if not chunk:
                break
            yield stream_pb2.DataChunk(
                data=chunk,
                sequence=sequence,
            )
            sequence += 1


def upload_file(stub, file_path):
    response = stub.UploadData(generate_chunks(file_path))
    print(f"Uploaded {response.total_bytes} bytes")
    return response
```

---

## Python Bidirectional Streaming
- difficulty: hard
- description: Implement bidirectional streaming in Python

```python
class ChatServicer(stream_pb2_grpc.StreamServiceServicer):
    def Chat(self, request_iterator, context):
        for message in request_iterator:
            print(f"Received from {message.user_id}: {message.message}")

            response = stream_pb2.ChatMessage(
                user_id="server",
                message=f"Echo: {message.message}",
                timestamp=int(time.time()),
            )
            yield response


def chat_client(stub):
    def generate_messages():
        messages = ["Hello", "How are you?", "Goodbye"]
        for msg in messages:
            yield stream_pb2.ChatMessage(
                user_id="client",
                message=msg,
                timestamp=int(time.time()),
            )
            time.sleep(1)

    responses = stub.Chat(generate_messages())
    for response in responses:
        print(f"Server: {response.message}")
```

---

## Python Async Server
- difficulty: hard
- description: Implement async gRPC server in Python

```python
import asyncio
import grpc.aio
import user_pb2
import user_pb2_grpc


class AsyncUserServicer(user_pb2_grpc.UserServiceServicer):
    def __init__(self):
        self.users = {}

    async def GetUser(self, request, context):
        await asyncio.sleep(0.1)  # Simulate async operation
        user = self.users.get(request.id)
        if not user:
            await context.abort(grpc.StatusCode.NOT_FOUND, "User not found")
        return user

    async def CreateUser(self, request, context):
        user_id = str(uuid.uuid4())
        user = user_pb2.User(
            id=user_id,
            name=request.name,
            email=request.email,
        )
        self.users[user_id] = user
        return user


async def serve():
    server = grpc.aio.server()
    user_pb2_grpc.add_UserServiceServicer_to_server(AsyncUserServicer(), server)
    server.add_insecure_port("[::]:50051")
    await server.start()
    print("Async server started on port 50051")
    await server.wait_for_termination()


if __name__ == "__main__":
    asyncio.run(serve())
```

---

## Python Interceptor
- difficulty: hard
- description: Implement server interceptor in Python

```python
class LoggingInterceptor(grpc.ServerInterceptor):
    def intercept_service(self, continuation, handler_call_details):
        method = handler_call_details.method
        metadata = dict(handler_call_details.invocation_metadata)

        print(f"Method: {method}")
        print(f"Metadata: {metadata}")

        start_time = time.time()
        response = continuation(handler_call_details)
        duration = time.time() - start_time

        print(f"Duration: {duration:.3f}s")
        return response


class AuthInterceptor(grpc.ServerInterceptor):
    def intercept_service(self, continuation, handler_call_details):
        metadata = dict(handler_call_details.invocation_metadata)
        token = metadata.get("authorization")

        if not token:
            return grpc.unary_unary_rpc_method_handler(
                lambda req, ctx: ctx.abort(
                    grpc.StatusCode.UNAUTHENTICATED, "Missing token"
                )
            )

        return continuation(handler_call_details)


def serve():
    server = grpc.server(
        futures.ThreadPoolExecutor(max_workers=10),
        interceptors=[LoggingInterceptor(), AuthInterceptor()],
    )
    # ...
```

---

## Proto Generate Commands
- difficulty: easy
- description: Commands to generate code from proto files

```bash
# Go
protoc --go_out=. --go_opt=paths=source_relative \
       --go-grpc_out=. --go-grpc_opt=paths=source_relative \
       proto/*.proto

# Python
python -m grpc_tools.protoc -I. --python_out=. --grpc_python_out=. proto/*.proto

# TypeScript (with ts-proto)
protoc --plugin=./node_modules/.bin/protoc-gen-ts_proto \
       --ts_proto_out=./src/generated \
       --ts_proto_opt=outputServices=grpc-js \
       proto/*.proto

# Buf (modern alternative)
buf generate
```

---

## Buf Configuration
- difficulty: medium
- description: Configure Buf for proto management

```yaml
# buf.yaml
version: v1
name: buf.build/example/myproject
deps:
  - buf.build/googleapis/googleapis
breaking:
  use:
    - FILE
lint:
  use:
    - DEFAULT

# buf.gen.yaml
version: v1
plugins:
  - plugin: go
    out: gen/go
    opt: paths=source_relative
  - plugin: go-grpc
    out: gen/go
    opt: paths=source_relative
  - plugin: ts
    out: gen/ts
    opt: outputServices=grpc-js
```

---

## ConnectRPC Server
- difficulty: medium
- description: Modern gRPC alternative with Connect protocol

```typescript
import { ConnectRouter } from "@connectrpc/connect";
import { fastify } from "fastify";
import { fastifyConnectPlugin } from "@connectrpc/connect-fastify";
import { UserService } from "./gen/user_connect";

const routes = (router: ConnectRouter) => {
  router.service(UserService, {
    async getUser(req) {
      return {
        id: req.id,
        name: "John Doe",
        email: "john@example.com",
      };
    },

    async createUser(req) {
      return {
        id: crypto.randomUUID(),
        name: req.name,
        email: req.email,
        isActive: true,
      };
    },
  });
};

async function main() {
  const server = fastify();
  await server.register(fastifyConnectPlugin, { routes });
  await server.listen({ host: "0.0.0.0", port: 8080 });
  console.log("Server listening on port 8080");
}

main();
```

---

## ConnectRPC Client
- difficulty: easy
- description: Call Connect service from TypeScript client

```typescript
import { createPromiseClient } from "@connectrpc/connect";
import { createGrpcTransport } from "@connectrpc/connect-node";
import { UserService } from "./gen/user_connect";

const transport = createGrpcTransport({
  baseUrl: "http://localhost:8080",
  httpVersion: "2",
});

const client = createPromiseClient(UserService, transport);

async function main() {
  const user = await client.createUser({
    name: "Jane Doe",
    email: "jane@example.com",
  });
  console.log("Created:", user);

  const fetched = await client.getUser({ id: user.id });
  console.log("Fetched:", fetched);
}

main();
```
