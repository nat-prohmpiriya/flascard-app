# NestJS Snippets

## Basic Controller
- difficulty: easy

```typescript
import { Controller, Get, Post, Body, Param } from '@nestjs/common';

@Controller('users')
export class UsersController {
  @Get()
  findAll(): string {
    return 'This returns all users';
  }

  @Get(':id')
  findOne(@Param('id') id: string): string {
    return `This returns user #${id}`;
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto): string {
    return 'This creates a user';
  }
}
```

## Controller with All HTTP Methods
- difficulty: easy

```typescript
import {
  Controller, Get, Post, Put, Patch, Delete,
  Body, Param, Query
} from '@nestjs/common';

@Controller('items')
export class ItemsController {
  @Get()
  findAll(@Query('limit') limit: number) {
    return { limit };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return { id };
  }

  @Post()
  create(@Body() dto: CreateItemDto) {
    return dto;
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateItemDto) {
    return { id, ...dto };
  }

  @Patch(':id')
  partialUpdate(@Param('id') id: string, @Body() dto: Partial<UpdateItemDto>) {
    return { id, ...dto };
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return { deleted: id };
  }
}
```

## Basic Service
- difficulty: easy

```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  private users: User[] = [];

  findAll(): User[] {
    return this.users;
  }

  findOne(id: string): User | undefined {
    return this.users.find(user => user.id === id);
  }

  create(createUserDto: CreateUserDto): User {
    const user = { id: Date.now().toString(), ...createUserDto };
    this.users.push(user);
    return user;
  }

  update(id: string, updateUserDto: UpdateUserDto): User | undefined {
    const index = this.users.findIndex(user => user.id === id);
    if (index === -1) return undefined;
    this.users[index] = { ...this.users[index], ...updateUserDto };
    return this.users[index];
  }

  remove(id: string): boolean {
    const index = this.users.findIndex(user => user.id === id);
    if (index === -1) return false;
    this.users.splice(index, 1);
    return true;
  }
}
```

## Basic Module
- difficulty: easy

```typescript
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

## App Module with Imports
- difficulty: easy

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}
```

## DTO with Validation
- difficulty: medium

```typescript
import {
  IsString, IsEmail, IsInt, Min, Max,
  IsOptional, MinLength, IsEnum
} from 'class-validator';
import { Transform } from 'class-transformer';

enum Role {
  USER = 'user',
  ADMIN = 'admin',
}

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsInt()
  @Min(0)
  @Max(120)
  @IsOptional()
  age?: number;

  @IsEnum(Role)
  @IsOptional()
  role?: Role = Role.USER;

  @Transform(({ value }) => value.toLowerCase().trim())
  @IsString()
  username: string;
}
```

## Update DTO with PartialType
- difficulty: easy

```typescript
import { PartialType, OmitType, PickType, IntersectionType } from '@nestjs/mapped-types';

export class UpdateUserDto extends PartialType(CreateUserDto) {}

export class UpdateUserWithoutPasswordDto extends PartialType(
  OmitType(CreateUserDto, ['password'] as const)
) {}

export class CreateUserResponseDto extends PickType(CreateUserDto, ['name', 'email'] as const) {}

export class ExtendedUserDto extends IntersectionType(
  CreateUserDto,
  AdditionalUserInfo
) {}
```

## TypeORM Entity
- difficulty: medium

```typescript
import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
  ManyToOne, OneToMany, JoinColumn
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => Role, role => role.users)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @OneToMany(() => Post, post => post.author)
  posts: Post[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

## TypeORM Repository Pattern
- difficulty: medium

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.usersRepository.find({
      relations: ['role', 'posts'],
    });
  }

  findOne(id: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
      relations: ['role'],
    });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password'],
    });
  }

  async create(dto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(dto);
    return this.usersRepository.save(user);
  }

  async update(id: string, dto: UpdateUserDto): Promise<User | null> {
    await this.usersRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
```

## Custom Repository
- difficulty: hard

```typescript
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
  }

  async findActiveUsersWithPosts(): Promise<User[]> {
    return this.createQueryBuilder('user')
      .leftJoinAndSelect('user.posts', 'post')
      .where('user.isActive = :isActive', { isActive: true })
      .orderBy('user.createdAt', 'DESC')
      .getMany();
  }

  async countByRole(roleId: string): Promise<number> {
    return this.count({ where: { role: { id: roleId } } });
  }
}
```

## Prisma Integration
- difficulty: medium

```typescript
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany({
      include: { posts: true },
    });
  }

  findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  create(data: CreateUserDto) {
    return this.prisma.user.create({ data });
  }

  update(id: string, data: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  remove(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }
}
```

## Guards
- difficulty: medium

```typescript
import {
  Injectable, CanActivate, ExecutionContext,
  SetMetadata, UnauthorizedException
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) throw new UnauthorizedException();

    try {
      const payload = await this.jwtService.verifyAsync(token);
      request.user = payload;
    } catch {
      throw new UnauthorizedException();
    }

    return true;
  }

  private extractToken(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
```

## Roles Guard
- difficulty: medium

```typescript
import { Injectable, CanActivate, ExecutionContext, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export enum Role {
  USER = 'user',
  ADMIN = 'admin',
}

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some(role => user.roles?.includes(role));
  }
}

@Controller('admin')
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  @Get()
  getAdminData() {
    return { message: 'Admin only' };
  }
}
```

## Interceptors
- difficulty: medium

```typescript
import {
  Injectable, NestInterceptor, ExecutionContext,
  CallHandler, UseInterceptors
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map(data => ({
        success: true,
        data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const request = context.switchToHttp().getRequest();

    console.log(`[${request.method}] ${request.url}`);

    return next.handle().pipe(
      tap(() => console.log(`Response time: ${Date.now() - now}ms`)),
    );
  }
}

@UseInterceptors(TransformInterceptor)
@Controller('users')
export class UsersController {}
```

## Pipes
- difficulty: medium

```typescript
import {
  PipeTransform, Injectable, ArgumentMetadata,
  BadRequestException, ParseIntPipe, DefaultValuePipe
} from '@nestjs/common';

@Injectable()
export class ParseIdPipe implements PipeTransform<string, string> {
  transform(value: string, metadata: ArgumentMetadata): string {
    if (!value.match(/^[0-9a-fA-F]{24}$/)) {
      throw new BadRequestException('Invalid ID format');
    }
    return value;
  }
}

@Controller('items')
export class ItemsController {
  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return { page, limit };
  }

  @Get(':id')
  findOne(@Param('id', ParseIdPipe) id: string) {
    return { id };
  }
}
```

## Exception Filters
- difficulty: medium

```typescript
import {
  ExceptionFilter, Catch, ArgumentsHost,
  HttpException, HttpStatus
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    response.status(status).json({
      success: false,
      ...(typeof exceptionResponse === 'object' ? exceptionResponse : { message: exceptionResponse }),
    });
  }
}
```

## Custom Decorators
- difficulty: medium

```typescript
import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);

export const Cookies = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return data ? request.cookies?.[data] : request.cookies;
  },
);

@Controller('users')
export class UsersController {
  @Get('me')
  getProfile(@CurrentUser() user: User) {
    return user;
  }

  @Get('email')
  getEmail(@CurrentUser('email') email: string) {
    return { email };
  }
}
```

## JWT Authentication
- difficulty: hard

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, roles: user.roles };
    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }

  async register(dto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({
      ...dto,
      password: hashedPassword,
    });
    return this.login(user);
  }

  async refreshToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.usersService.findOne(payload.sub);
      return this.login(user);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
```

## Auth Module with Passport
- difficulty: hard

```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

## JWT Strategy
- difficulty: medium

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    const user = await this.usersService.findOne(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    return { id: payload.sub, email: payload.email, roles: payload.roles };
  }
}
```

## Caching with Redis
- difficulty: medium

```typescript
import { Module, CacheModule } from '@nestjs/common';
import { redisStore } from 'cache-manager-redis-store';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    CacheModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        store: redisStore,
        host: config.get('REDIS_HOST'),
        port: config.get('REDIS_PORT'),
        ttl: 60,
      }),
    }),
  ],
})
export class AppModule {}

@Injectable()
export class UsersService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async findOne(id: string): Promise<User> {
    const cacheKey = `user:${id}`;
    const cached = await this.cacheManager.get<User>(cacheKey);

    if (cached) return cached;

    const user = await this.usersRepository.findOne({ where: { id } });
    await this.cacheManager.set(cacheKey, user, 300);
    return user;
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    await this.usersRepository.update(id, dto);
    await this.cacheManager.del(`user:${id}`);
    return this.findOne(id);
  }
}
```

## Queue with Bull
- difficulty: hard

```typescript
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { Process, Processor, OnQueueFailed } from '@nestjs/bull';
import { Job } from 'bull';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    BullModule.registerQueue({
      name: 'email',
    }),
  ],
})
export class QueueModule {}

@Processor('email')
export class EmailProcessor {
  @Process('send')
  async handleSend(job: Job<{ to: string; subject: string; body: string }>) {
    const { to, subject, body } = job.data;
    console.log(`Sending email to ${to}: ${subject}`);
    await this.emailService.send(to, subject, body);
  }

  @OnQueueFailed()
  onFailed(job: Job, error: Error) {
    console.error(`Job ${job.id} failed:`, error.message);
  }
}

@Injectable()
export class EmailService {
  constructor(@InjectQueue('email') private emailQueue: Queue) {}

  async sendWelcomeEmail(user: User) {
    await this.emailQueue.add('send', {
      to: user.email,
      subject: 'Welcome!',
      body: `Hello ${user.name}`,
    }, {
      attempts: 3,
      backoff: 5000,
    });
  }
}
```

## WebSocket Gateway
- difficulty: medium

```typescript
import {
  WebSocketGateway, WebSocketServer,
  SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect,
  MessageBody, ConnectedSocket
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('message')
  handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { room: string; message: string },
  ) {
    this.server.to(payload.room).emit('message', {
      sender: client.id,
      message: payload.message,
    });
  }

  @SubscribeMessage('join')
  handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() room: string,
  ) {
    client.join(room);
    this.server.to(room).emit('userJoined', { userId: client.id });
  }
}
```

## File Upload
- difficulty: medium

```typescript
import {
  Controller, Post, UseInterceptors, UploadedFile,
  UploadedFiles, ParseFilePipe, MaxFileSizeValidator,
  FileTypeValidator
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('upload')
export class UploadController {
  @Post('single')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
  }))
  uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /^image\/(jpg|jpeg|png|gif)$/ }),
        ],
      }),
    ) file: Express.Multer.File,
  ) {
    return { filename: file.filename, size: file.size };
  }

  @Post('multiple')
  @UseInterceptors(FilesInterceptor('files', 10))
  uploadFiles(@UploadedFiles() files: Express.Multer.File[]) {
    return files.map(file => ({ filename: file.filename }));
  }
}
```

## Swagger Documentation
- difficulty: medium

```typescript
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Controller, Get, Post, Body, Query } from '@nestjs/common';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Returns list of users', type: [UserResponseDto] })
  findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.usersService.findAll(page, limit);
  }

  @Post()
  @ApiOperation({ summary: 'Create new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'User created', type: UserResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error' })
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }
}
```

## Testing Controller
- difficulty: medium

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    findAll: jest.fn().mockResolvedValue([{ id: '1', name: 'John' }]),
    findOne: jest.fn().mockResolvedValue({ id: '1', name: 'John' }),
    create: jest.fn().mockResolvedValue({ id: '1', name: 'John' }),
    update: jest.fn().mockResolvedValue({ id: '1', name: 'Jane' }),
    remove: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should return all users', async () => {
    const result = await controller.findAll();
    expect(result).toHaveLength(1);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('should create a user', async () => {
    const dto = { name: 'John', email: 'john@example.com', password: '12345678' };
    const result = await controller.create(dto);
    expect(result.name).toBe('John');
    expect(service.create).toHaveBeenCalledWith(dto);
  });
});
```

## Testing Service with Repository
- difficulty: hard

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './user.entity';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  const mockUser = { id: '1', name: 'John', email: 'john@example.com' };

  const mockRepository = {
    find: jest.fn().mockResolvedValue([mockUser]),
    findOne: jest.fn().mockResolvedValue(mockUser),
    create: jest.fn().mockReturnValue(mockUser),
    save: jest.fn().mockResolvedValue(mockUser),
    update: jest.fn().mockResolvedValue({ affected: 1 }),
    delete: jest.fn().mockResolvedValue({ affected: 1 }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should find all users', async () => {
    const result = await service.findAll();
    expect(result).toEqual([mockUser]);
    expect(repository.find).toHaveBeenCalled();
  });

  it('should find one user by id', async () => {
    const result = await service.findOne('1');
    expect(result).toEqual(mockUser);
    expect(repository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
  });
});
```

## E2E Testing
- difficulty: hard

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'password' });
    accessToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/users (GET)', () => {
    return request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });

  it('/users (POST)', () => {
    return request(app.getHttpServer())
      .post('/users')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'John', email: 'john@example.com', password: '12345678' })
      .expect(201);
  });
});
```

## Configuration Service
- difficulty: medium

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  get port(): number {
    return this.configService.get<number>('PORT', 3000);
  }

  get isProduction(): boolean {
    return this.configService.get<string>('NODE_ENV') === 'production';
  }

  get database(): DatabaseConfig {
    return {
      host: this.configService.getOrThrow<string>('DB_HOST'),
      port: this.configService.get<number>('DB_PORT', 5432),
      username: this.configService.getOrThrow<string>('DB_USER'),
      password: this.configService.getOrThrow<string>('DB_PASSWORD'),
      database: this.configService.getOrThrow<string>('DB_NAME'),
    };
  }

  get jwtSecret(): string {
    return this.configService.getOrThrow<string>('JWT_SECRET');
  }
}
```

## Health Check
- difficulty: easy

```typescript
import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck, HealthCheckService, HttpHealthIndicator,
  TypeOrmHealthIndicator, MemoryHealthIndicator
} from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private db: TypeOrmHealthIndicator,
    private memory: MemoryHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      () => this.http.pingCheck('api', 'https://api.example.com'),
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
    ]);
  }

  @Get('ready')
  @HealthCheck()
  readiness() {
    return this.health.check([
      () => this.db.pingCheck('database'),
    ]);
  }

  @Get('live')
  liveness() {
    return { status: 'ok' };
  }
}
```

## Event Emitter
- difficulty: medium

```typescript
import { Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';

export class UserCreatedEvent {
  constructor(public readonly user: User) {}
}

@Injectable()
export class UsersService {
  constructor(private eventEmitter: EventEmitter2) {}

  async create(dto: CreateUserDto): Promise<User> {
    const user = await this.usersRepository.save(dto);
    this.eventEmitter.emit('user.created', new UserCreatedEvent(user));
    return user;
  }
}

@Injectable()
export class NotificationListener {
  @OnEvent('user.created')
  handleUserCreated(event: UserCreatedEvent) {
    console.log(`Welcome email sent to ${event.user.email}`);
  }
}

@Injectable()
export class AnalyticsListener {
  @OnEvent('user.created', { async: true })
  async handleUserCreated(event: UserCreatedEvent) {
    await this.analyticsService.trackNewUser(event.user);
  }
}
```

## Throttling Rate Limit
- difficulty: easy

```typescript
import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

@Controller('api')
export class ApiController {
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Get('limited')
  getLimited() {
    return { message: 'This route is rate limited' };
  }

  @SkipThrottle()
  @Get('unlimited')
  getUnlimited() {
    return { message: 'No rate limit here' };
  }
}
```

## Basic Middleware
- difficulty: easy

```typescript
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    console.log(`[${req.method}] ${req.originalUrl}`);

    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`[${req.method}] ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    });

    next();
  }
}
```

## Functional Middleware
- difficulty: easy

```typescript
import { Request, Response, NextFunction } from 'express';

export function loggerMiddleware(req: Request, res: Response, next: NextFunction) {
  console.log(`Request: ${req.method} ${req.url}`);
  next();
}

@Module({
  imports: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(loggerMiddleware).forRoutes('*');
  }
}
```

## Apply Middleware to Module
- difficulty: medium

```typescript
import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { LoggerMiddleware } from './logger.middleware';
import { AuthMiddleware } from './auth.middleware';
import { UsersController } from './users/users.controller';

@Module({
  imports: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('*');

    consumer
      .apply(AuthMiddleware)
      .exclude(
        { path: 'auth/login', method: RequestMethod.POST },
        { path: 'auth/register', method: RequestMethod.POST },
        { path: 'health', method: RequestMethod.GET },
      )
      .forRoutes('*');

    consumer
      .apply(LoggerMiddleware, AuthMiddleware)
      .forRoutes(UsersController);
  }
}
```

## Auth Middleware
- difficulty: medium

```typescript
import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private jwtService: JwtService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization header');
    }

    const token = authHeader.split(' ')[1];

    try {
      const payload = await this.jwtService.verifyAsync(token);
      req['user'] = payload;
      next();
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
```

## CORS Middleware
- difficulty: easy

```typescript
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class CorsMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    res.header('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS || '*');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }

    next();
  }
}
```

## Global Middleware in main.ts
- difficulty: easy

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as helmet from 'helmet';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.use(compression());
  app.use(cookieParser());

  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  await app.listen(3000);
}
bootstrap();
```

## Basic Serialization with Exclude
- difficulty: easy

```typescript
import { Exclude, Expose } from 'class-transformer';

export class UserEntity {
  id: string;
  name: string;
  email: string;

  @Exclude()
  password: string;

  @Exclude()
  refreshToken: string;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}

@Controller('users')
export class UsersController {
  @Get(':id')
  findOne(@Param('id') id: string): UserEntity {
    const user = this.usersService.findOne(id);
    return new UserEntity(user);
  }
}
```

## Serialization with Expose and Transform
- difficulty: medium

```typescript
import { Exclude, Expose, Transform, Type } from 'class-transformer';

export class UserResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  email: string;

  @Exclude()
  password: string;

  @Expose()
  @Transform(({ value }) => value?.toISOString())
  createdAt: Date;

  @Expose({ name: 'fullName' })
  getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  @Expose({ groups: ['admin'] })
  role: string;

  @Type(() => PostResponseDto)
  @Expose()
  posts: PostResponseDto[];

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
```

## ClassSerializerInterceptor Global
- difficulty: medium

```typescript
import { NestFactory, Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector), {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
    })
  );

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    })
  );

  await app.listen(3000);
}
bootstrap();
```

## Serialization with Groups
- difficulty: medium

```typescript
import { Expose } from 'class-transformer';
import { SerializeOptions } from '@nestjs/common';

export class UserEntity {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  email: string;

  @Expose({ groups: ['admin', 'self'] })
  phone: string;

  @Expose({ groups: ['admin'] })
  role: string;

  @Expose({ groups: ['admin'] })
  createdAt: Date;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}

@Controller('users')
export class UsersController {
  @Get()
  @SerializeOptions({ groups: ['admin'] })
  findAllAdmin(): UserEntity[] {
    return this.usersService.findAll().map(u => new UserEntity(u));
  }

  @Get('me')
  @SerializeOptions({ groups: ['self'] })
  findMe(@CurrentUser() user: User): UserEntity {
    return new UserEntity(user);
  }

  @Get('public')
  @SerializeOptions({ groups: [] })
  findAllPublic(): UserEntity[] {
    return this.usersService.findAll().map(u => new UserEntity(u));
  }
}
```

## Custom Serializer Interceptor
- difficulty: hard

```typescript
import {
  Injectable, NestInterceptor, ExecutionContext,
  CallHandler, UseInterceptors
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { plainToInstance } from 'class-transformer';

interface ClassConstructor<T = any> {
  new (...args: any[]): T;
}

export function Serialize<T>(dto: ClassConstructor<T>) {
  return UseInterceptors(new SerializeInterceptor(dto));
}

@Injectable()
export class SerializeInterceptor<T> implements NestInterceptor {
  constructor(private dto: ClassConstructor<T>) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<T> {
    return next.handle().pipe(
      map((data) => {
        return plainToInstance(this.dto, data, {
          excludeExtraneousValues: true,
        });
      }),
    );
  }
}

@Controller('users')
export class UsersController {
  @Get(':id')
  @Serialize(UserResponseDto)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }
}
```

## TypeORM Transaction with QueryRunner
- difficulty: hard

```typescript
import { Injectable } from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';

@Injectable()
export class TransferService {
  constructor(private dataSource: DataSource) {}

  async transferMoney(fromId: string, toId: string, amount: number): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const fromAccount = await queryRunner.manager.findOne(Account, {
        where: { id: fromId },
        lock: { mode: 'pessimistic_write' },
      });

      const toAccount = await queryRunner.manager.findOne(Account, {
        where: { id: toId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!fromAccount || !toAccount) {
        throw new Error('Account not found');
      }

      if (fromAccount.balance < amount) {
        throw new Error('Insufficient balance');
      }

      fromAccount.balance -= amount;
      toAccount.balance += amount;

      await queryRunner.manager.save(fromAccount);
      await queryRunner.manager.save(toAccount);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
```

## TypeORM Transaction with EntityManager
- difficulty: medium

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    private dataSource: DataSource,
  ) {}

  async createOrder(dto: CreateOrderDto): Promise<Order> {
    return this.dataSource.transaction(async (manager) => {
      const order = manager.create(Order, {
        userId: dto.userId,
        status: 'pending',
        total: 0,
      });
      await manager.save(order);

      let total = 0;
      for (const item of dto.items) {
        const product = await manager.findOne(Product, {
          where: { id: item.productId },
        });

        if (!product || product.stock < item.quantity) {
          throw new Error(`Product ${item.productId} not available`);
        }

        product.stock -= item.quantity;
        await manager.save(product);

        const orderItem = manager.create(OrderItem, {
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: product.price,
        });
        await manager.save(orderItem);

        total += product.price * item.quantity;
      }

      order.total = total;
      return manager.save(order);
    });
  }
}
```

## TypeORM Transaction Decorator
- difficulty: medium

```typescript
import { DataSource } from 'typeorm';

export function Transactional() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const dataSource: DataSource = this.dataSource;

      return dataSource.transaction(async (manager) => {
        const originalManager = this.manager;
        this.manager = manager;

        try {
          return await originalMethod.apply(this, args);
        } finally {
          this.manager = originalManager;
        }
      });
    };

    return descriptor;
  };
}

@Injectable()
export class UsersService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  private manager = this.usersRepository.manager;

  @Transactional()
  async createUserWithProfile(dto: CreateUserDto): Promise<User> {
    const user = this.manager.create(User, dto);
    await this.manager.save(user);

    const profile = this.manager.create(Profile, {
      userId: user.id,
      bio: dto.bio,
    });
    await this.manager.save(profile);

    return user;
  }
}
```

## Prisma Transaction
- difficulty: medium

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async createOrder(dto: CreateOrderDto) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId: dto.userId,
          status: 'pending',
        },
      });

      let total = 0;

      for (const item of dto.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product || product.stock < item.quantity) {
          throw new Error('Product not available');
        }

        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });

        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            price: product.price,
          },
        });

        total += product.price * item.quantity;
      }

      return tx.order.update({
        where: { id: order.id },
        data: { total },
        include: { items: true },
      });
    });
  }
}
```

## Prisma Interactive Transaction
- difficulty: hard

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class TransferService {
  constructor(private prisma: PrismaService) {}

  async transferMoney(fromId: string, toId: string, amount: number) {
    return this.prisma.$transaction(
      async (tx) => {
        const from = await tx.account.update({
          where: { id: fromId },
          data: { balance: { decrement: amount } },
        });

        if (from.balance < 0) {
          throw new Error('Insufficient balance');
        }

        const to = await tx.account.update({
          where: { id: toId },
          data: { balance: { increment: amount } },
        });

        await tx.transfer.create({
          data: {
            fromAccountId: fromId,
            toAccountId: toId,
            amount,
          },
        });

        return { from, to };
      },
      {
        maxWait: 5000,
        timeout: 10000,
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );
  }
}
```

## Transaction with Retry Logic
- difficulty: hard

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  constructor(private dataSource: DataSource) {}

  async executeWithRetry<T>(
    operation: (manager: EntityManager) => Promise<T>,
    maxRetries = 3,
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.dataSource.transaction(async (manager) => {
          return await operation(manager);
        });
      } catch (error) {
        lastError = error;
        this.logger.warn(
          `Transaction attempt ${attempt}/${maxRetries} failed: ${error.message}`,
        );

        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 100;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }

  async createOrderWithRetry(dto: CreateOrderDto): Promise<Order> {
    return this.executeWithRetry(async (manager) => {
      const order = manager.create(Order, dto);
      return manager.save(order);
    });
  }
}
```
