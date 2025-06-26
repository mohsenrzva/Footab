import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../users/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let users: jest.Mocked<UserService>;
  let jwt: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findByPhone: jest.fn(),
            create: jest.fn(),
            updateOtp: jest.fn(),
            saveRefreshTokenHash: jest.fn(),
            clearOtp: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
            verifyAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    users = module.get(UserService);
    jwt = module.get(JwtService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('requestOtp', () => {
    it('creates user if needed and returns an otp', async () => {
      users.findByPhone.mockResolvedValue(null as any);
      users.create.mockResolvedValue({ id: '1', phone: '1111' } as any);
      users.updateOtp.mockResolvedValue(null as any);
      jest.spyOn(Math, 'random').mockReturnValue(0.123456); // 123456

      const res = await service.requestOtp({ phone: '1111' });

      expect(users.create).toHaveBeenCalledWith('1111');
      expect(users.updateOtp).toHaveBeenCalled();
      expect(res).toEqual({ otp: '123456' });
    });
  });

  describe('verifyOtp', () => {
    it('returns tokens on valid otp', async () => {
      users.findByPhone.mockResolvedValue({
        id: '1',
        phone: '1111',
        otpCode: '123456',
        otpExpires: new Date(Date.now() + 60000),
      } as any);
      jwt.signAsync.mockResolvedValueOnce('access').mockResolvedValueOnce('refresh');
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed');
      users.saveRefreshTokenHash.mockResolvedValue(null as any);
      users.clearOtp.mockResolvedValue(null as any);

      const res = await service.verifyOtp({ phone: '1111', otp: '123456' });

      expect(jwt.signAsync).toHaveBeenCalledTimes(2);
      expect(users.saveRefreshTokenHash).toHaveBeenCalledWith('1', 'hashed');
      expect(users.clearOtp).toHaveBeenCalledWith('1');
      expect(res).toEqual({ accessToken: 'access', refreshToken: 'refresh' });
    });

    it('throws for invalid otp', async () => {
      users.findByPhone.mockResolvedValue({
        id: '1',
        phone: '1111',
        otpCode: '000000',
        otpExpires: new Date(Date.now() + 60000),
      } as any);

      await expect(
        service.verifyOtp({ phone: '1111', otp: '123456' }),
      ).rejects.toThrow();
    });
  });

  describe('refresh', () => {
    it('returns new access token', async () => {
      jwt.verifyAsync.mockResolvedValue({ sub: '1', phone: '1111' });
      users.findByPhone.mockResolvedValue({
        id: '1',
        phone: '1111',
        refreshTokenHash: 'hash',
      } as any);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      jwt.signAsync.mockResolvedValue('newAccess');

      const res = await service.refresh({ refreshToken: 'refresh' });

      expect(jwt.verifyAsync).toHaveBeenCalledWith('refresh');
      expect(jwt.signAsync).toHaveBeenCalled();
      expect(res).toEqual({ accessToken: 'newAccess' });
    });

    it('throws on invalid token', async () => {
      jwt.verifyAsync.mockImplementation(() => {
        throw new Error('bad');
      });

      await expect(
        service.refresh({ refreshToken: 'invalid' }),
      ).rejects.toThrow();
    });
  });
});
