import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../users/user.service';
import { OtpService } from '../otp/otp.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

// Create proper mock types
type MockUserService = {
  findByPhone: jest.Mock;
  create: jest.Mock;
  saveRefreshTokenHash: jest.Mock;
};

type MockOtpService = {
  saveOtp: jest.Mock;
  findOtp: jest.Mock;
  clearOtp: jest.Mock;
};

type MockJwtService = {
  signAsync: jest.Mock;
  verifyAsync: jest.Mock;
};

describe('AuthService', () => {
  let service: AuthService;
  let users: MockUserService;
  let otps: MockOtpService;
  let jwt: MockJwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findByPhone: jest.fn(),
            create: jest.fn(),
            saveRefreshTokenHash: jest.fn(),
          } as MockUserService,
        },
        {
          provide: OtpService,
          useValue: {
            saveOtp: jest.fn(),
            findOtp: jest.fn(),
            clearOtp: jest.fn(),
          } as MockOtpService,
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
            verifyAsync: jest.fn(),
          } as MockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    users = module.get(UserService);
    otps = module.get(OtpService);
    jwt = module.get(JwtService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('requestOtp', () => {
    it('creates user if needed and returns an otp', async () => {
      users.findByPhone.mockResolvedValue(null);
      users.create.mockResolvedValue({ id: '1', phone: '1111' });
      otps.saveOtp.mockResolvedValue(null);
      jest.spyOn(Math, 'random').mockReturnValue(0.123456); // 123456

      const res = await service.requestOtp({ phone: '1111' });

      expect(users.create).toHaveBeenCalledWith('1111');
      expect(otps.saveOtp).toHaveBeenCalled();
      expect(res).toEqual({ otp: '123456' });
    });
  });

  describe('verifyOtp', () => {
    it('returns tokens on valid otp', async () => {
      users.findByPhone.mockResolvedValue({ id: '1', phone: '1111' });
      otps.findOtp.mockResolvedValue({
        phone: '1111',
        code: '123456',
        expires: new Date(Date.now() + 60000),
      });
      jwt.signAsync
        .mockResolvedValueOnce('access')
        .mockResolvedValueOnce('refresh');
      (jest.spyOn(bcrypt, 'hash') as jest.Mock).mockResolvedValue('hashed');
      users.saveRefreshTokenHash.mockResolvedValue(null);
      otps.clearOtp.mockResolvedValue(null);

      const res = await service.verifyOtp({ phone: '1111', otp: '123456' });

      expect(jwt.signAsync).toHaveBeenCalledTimes(2);
      expect(users.saveRefreshTokenHash).toHaveBeenCalledWith('1', 'hashed');
      expect(otps.clearOtp).toHaveBeenCalledWith('1111');
      expect(res).toEqual({ accessToken: 'access', refreshToken: 'refresh' });
    });

    it('throws for invalid otp', async () => {
      users.findByPhone.mockResolvedValue({ id: '1', phone: '1111' });
      otps.findOtp.mockResolvedValue({
        phone: '1111',
        code: '000000',
        expires: new Date(Date.now() + 60000),
      });

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
      });
      (jest.spyOn(bcrypt, 'compare') as jest.Mock).mockResolvedValue(true);
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
