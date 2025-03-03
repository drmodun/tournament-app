import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { AuthModule } from '../src/auth/auth.module';
import { UsersService } from '../src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { IUserLoginResponse } from '@tournament-app/types';
import bcrypt from 'bcrypt';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedPassword123',
    role: 'USER',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, AuthModule],
    })
      .overrideProvider(UsersService)
      .useValue({
        findOneByEmail: jest.fn().mockResolvedValue(mockUser),
        findOne: jest.fn().mockResolvedValue(mockUser),
        create: jest.fn().mockResolvedValue({ id: 1 }),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    usersService = moduleFixture.get<UsersService>(UsersService);
    jwtService = moduleFixture.get<JwtService>(JwtService);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/auth/login (POST)', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    beforeEach(() => {
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(true));
    });

    it('should return tokens when credentials are valid', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
        });
    });

    it('should return 401 when credentials are invalid', () => {
      bcrypt.compare.mockResolvedValue(false);
      return request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(401);
    });

    it('should return 404 when user not found', () => {
      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(null);

      return request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(404);
    });
  });

  describe('/auth/refresh (GET)', () => {
    let validRefreshToken: string;

    beforeEach(async () => {
      // Generate a valid refresh token
      const tokens: IUserLoginResponse = {
        accessToken: await jwtService.signAsync(
          {
            sub: mockUser.id,
            email: mockUser.email,
            role: mockUser.role,
          },
          {
            secret: process.env.JWT_REFRESH_SECRET,
            expiresIn: '7d',
          },
        ),
        refreshToken: await jwtService.signAsync(
          {
            sub: mockUser.id,
            email: mockUser.email,
            role: mockUser.role,
          },
          {
            secret: process.env.JWT_REFRESH_SECRET,
            expiresIn: '7d',
          },
        ),
      };
      validRefreshToken = tokens.refreshToken;
    });

    it('should return new tokens with valid refresh token', () => {
      return request(app.getHttpServer())
        .get('/auth/refresh')
        .set('Authorization', `Bearer ${validRefreshToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
        });
    });

    it('should return 401 with invalid refresh token', () => {
      return request(app.getHttpServer())
        .get('/auth/refresh')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
});
