import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Sequelize } from 'sequelize-typescript';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { Transaction } from 'sequelize';
import * as bcrypt from 'bcrypt';
import { UserService } from './user.service';
import { BaseService } from './base.service';
import {
  User,
  Role,
  UserClaim,
  UserLogin,
  UserToken,
} from '../../domain/entities';
import { AUTH_MESSAGES } from '../../shared/messages/auth.messages';
import { generatePasetoToken } from '../../shared/utils/paseto.util';

// Mock dependencies
jest.mock('bcrypt');
jest.mock('../../shared/utils/paseto.util');
jest.mock('../../shared/utils', () => ({
  generateSecurityStamp: jest.fn(() => 'security-stamp'),
  generateConcurrencyStamp: jest.fn(() => 'concurrency-stamp'),
}));

describe('UserService', () => {
  let service: UserService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let _configService: ConfigService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let _eventEmitter: EventEmitter2;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let _sequelize: Sequelize;
  let baseService: jest.Mocked<BaseService<User>>;

  const mockUser: Partial<User> = {
    id: 'user-123',
    email: 'test@example.com',
    normalizedEmail: 'TEST@EXAMPLE.COM',
    userName: 'testuser',
    normalizedUserName: 'TESTUSER',
    passwordHash: 'hashed-password',
    emailConfirmed: true,
    twoFactorEnabled: true,
    lockoutEnabled: false,
    accessFailedCount: 0,
    lockoutEnd: undefined,
  };

  const mockRole: Partial<Role> = {
    id: 'role-123',
    name: 'Admin',
    normalizedName: 'ADMIN',
  };

  const mockUserClaim: Partial<UserClaim> = {
    id: 'claim-123',
    claimType: 'policy',
    claimValue: 'read:users',
  };

  beforeEach(async () => {
    // Create mocks
    const mockConfigService = {
      get: jest.fn(),
    };

    const mockEventEmitter = {
      emit: jest.fn(),
    };

    const mockSequelize = {} as Sequelize;

    // Mock BaseService methods
    baseService = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    } as unknown as jest.Mocked<BaseService<User>>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
        {
          provide: Sequelize,
          useValue: mockSequelize,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    _configService = module.get<ConfigService>(ConfigService);
    _eventEmitter = module.get<EventEmitter2>(EventEmitter2);
    _sequelize = module.get<Sequelize>(Sequelize);

    // Mock BaseService methods on the service instance
    jest
      .spyOn(service, 'findAll')
      .mockImplementation((...args) => baseService.findAll(...args));
    jest
      .spyOn(service, 'findById')
      .mockImplementation((...args) => baseService.findById(...args));
    jest
      .spyOn(service, 'findOne')
      .mockImplementation((...args) => baseService.findOne(...args));
    jest
      .spyOn(service, 'create')
      .mockImplementation((...args) => baseService.create(...args));
    jest
      .spyOn(service, 'update')
      .mockImplementation((...args) => baseService.update(...args));

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('getEntityName', () => {
    it('should return User entity name', () => {
      const entityName = (
        service as unknown as { getEntityName: () => string }
      ).getEntityName();
      expect(entityName).toBe('User');
    });
  });

  describe('getUsers', () => {
    it('should return all users', async () => {
      const users = [mockUser as User, { ...mockUser, id: 'user-456' } as User];
      baseService.findAll.mockResolvedValue(users);

      const result = await service.getUsers();

      expect(result).toEqual(users);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(baseService.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('createUser', () => {
    const newUser: Partial<User> = {
      normalizedEmail: 'NEW@EXAMPLE.COM',
      normalizedUserName: 'NEWUSER',
      passwordHash: 'plain-password',
    };

    it('should create a user successfully', async () => {
      baseService.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      const createdUser = { ...newUser, id: 'new-user-id' } as User;
      baseService.create.mockResolvedValue(createdUser);

      const result = await service.createUser(newUser);

      expect(result).toEqual(createdUser);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(baseService.findOne).toHaveBeenCalledTimes(2); // findByEmail and findByUserName
      expect(bcrypt.hash).toHaveBeenCalledWith('plain-password', 10);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(baseService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          passwordHash: 'hashed-password',
          securityStamp: 'security-stamp',
          concurrencyStamp: 'concurrency-stamp',
        }),
        undefined,
        undefined,
      );
    });

    it('should throw error if user with email already exists', async () => {
      baseService.findOne.mockResolvedValue(mockUser as User);

      await expect(service.createUser(newUser)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.createUser(newUser)).rejects.toThrow(
        AUTH_MESSAGES.USER_ALREADY_EXISTS,
      );
    });

    it('should throw error if user with username already exists', async () => {
      baseService.findOne
        .mockResolvedValueOnce(null) // findByEmail returns null
        .mockResolvedValueOnce(mockUser as User); // findByUserName returns existing user

      await expect(service.createUser(newUser)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should check username if email is not provided', async () => {
      const userWithoutEmail = {
        normalizedUserName: 'NEWUSER',
        passwordHash: 'plain-password',
      };
      baseService.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      const createdUser = { ...userWithoutEmail, id: 'new-user-id' } as User;
      baseService.create.mockResolvedValue(createdUser);

      await service.createUser(userWithoutEmail);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(baseService.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { normalizedUserName: 'NEWUSER' },
        }),
      );
    });

    it('should throw error if create returns null', async () => {
      baseService.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      baseService.create.mockResolvedValue(null);

      await expect(service.createUser(newUser)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.createUser(newUser)).rejects.toThrow(
        AUTH_MESSAGES.FAILED_TO_CREATE_USER,
      );
    });

    it('should use transaction when provided', async () => {
      const transaction = {} as Transaction;
      baseService.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      const createdUser = { ...newUser, id: 'new-user-id' } as User;
      baseService.create.mockResolvedValue(createdUser);

      await service.createUser(newUser, transaction);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(baseService.create).toHaveBeenCalledWith(
        expect.any(Object),
        undefined,
        transaction,
      );
    });
  });

  describe('login', () => {
    const loginUser: Partial<User> = {
      normalizedEmail: 'TEST@EXAMPLE.COM',
      passwordHash: 'plain-password',
    };

    it('should login successfully with email', async () => {
      const existingUser = {
        ...mockUser,
        passwordHash: 'hashed-password',
        accessFailedCount: 0,
        lockoutEnd: undefined,
      } as User;
      baseService.findOne.mockResolvedValue(existingUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      baseService.update.mockResolvedValue(existingUser);
      baseService.findById
        .mockResolvedValueOnce({
          ...existingUser,
          roles: [],
        } as unknown as User)
        .mockResolvedValueOnce({
          ...existingUser,
          claims: [],
        } as unknown as User);
      (generatePasetoToken as jest.Mock).mockReturnValue('token-123');

      const result = await service.login(loginUser);

      expect(result).toBe('token-123');
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'plain-password',
        'hashed-password',
      );
      expect(generatePasetoToken).toHaveBeenCalled();
    });

    it('should login successfully with username', async () => {
      const loginWithUsername = {
        normalizedUserName: 'TESTUSER',
        passwordHash: 'plain-password',
      };
      const existingUser = {
        ...mockUser,
        passwordHash: 'hashed-password',
        accessFailedCount: 0,
        lockoutEnd: undefined,
        emailConfirmed: true,
      } as User;
      // When using username, findByEmail is not called, only findByUserName
      baseService.findOne.mockResolvedValueOnce(existingUser); // findByUserName returns user
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      baseService.update.mockResolvedValue(existingUser);
      baseService.findById
        .mockResolvedValueOnce({
          ...existingUser,
          roles: [],
        } as unknown as User)
        .mockResolvedValueOnce({
          ...existingUser,
          claims: [],
        } as unknown as User);
      (generatePasetoToken as jest.Mock).mockReturnValue('token-123');

      const result = await service.login(loginWithUsername);

      expect(result).toBe('token-123');
    });

    it('should throw error if neither email nor username provided', async () => {
      await expect(service.login({})).rejects.toThrow(BadRequestException);
      await expect(service.login({})).rejects.toThrow(
        AUTH_MESSAGES.EMAIL_OR_USERNAME_REQUIRED,
      );
    });

    it('should throw error if password not provided', async () => {
      await expect(
        service.login({ normalizedEmail: 'test@example.com' }),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.login({ normalizedEmail: 'test@example.com' }),
      ).rejects.toThrow(AUTH_MESSAGES.PASSWORD_REQUIRED);
    });

    it('should throw error if user not found', async () => {
      baseService.findOne.mockResolvedValue(null);

      await expect(service.login(loginUser)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginUser)).rejects.toThrow(
        AUTH_MESSAGES.UNAUTHORIZED,
      );
    });

    it('should throw error if account is locked', async () => {
      const lockedUser = {
        ...mockUser,
        lockoutEnabled: true,
        lockoutEnd: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
      } as User;
      baseService.findOne.mockResolvedValue(lockedUser);

      await expect(service.login(loginUser)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should not throw error if lockout period has expired', async () => {
      const expiredLockoutUser = {
        ...mockUser,
        lockoutEnabled: true,
        lockoutEnd: new Date(Date.now() - 1000), // 1 second ago
        passwordHash: 'hashed-password',
        accessFailedCount: 0,
      } as User;
      baseService.findOne.mockResolvedValue(expiredLockoutUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      baseService.update.mockResolvedValue(expiredLockoutUser);
      baseService.findById
        .mockResolvedValueOnce({
          ...expiredLockoutUser,
          roles: [],
        } as unknown as User)
        .mockResolvedValueOnce({
          ...expiredLockoutUser,
          claims: [],
        } as unknown as User);
      (generatePasetoToken as jest.Mock).mockReturnValue('token-123');

      const result = await service.login(loginUser);

      expect(result).toBe('token-123');
    });

    it('should throw error if password is invalid', async () => {
      const existingUser = {
        ...mockUser,
        passwordHash: 'hashed-password',
        lockoutEnabled: true,
      } as unknown as User;
      const updateMock = jest.fn().mockResolvedValue(existingUser);

      (existingUser as unknown as { update: jest.Mock }).update = updateMock;
      baseService.findOne.mockResolvedValue(existingUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginUser)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(updateMock).toHaveBeenCalled();
    });

    it('should reset access failed count and lockout on successful login', async () => {
      const userWithFailedAttempts = {
        ...mockUser,
        passwordHash: 'hashed-password',
        accessFailedCount: 3,
        lockoutEnd: new Date(),
      } as User;
      baseService.findOne.mockResolvedValue(userWithFailedAttempts);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      const resetUser = {
        ...userWithFailedAttempts,
        accessFailedCount: 0,
        lockoutEnd: undefined,
      } as User;
      baseService.update.mockResolvedValue(resetUser);
      baseService.findById
        .mockResolvedValueOnce({ ...resetUser, roles: [] } as unknown as User)
        .mockResolvedValueOnce({ ...resetUser, claims: [] } as unknown as User);
      (generatePasetoToken as jest.Mock).mockReturnValue('token-123');

      await service.login(loginUser);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(baseService.update).toHaveBeenCalledWith(
        userWithFailedAttempts.id,
        {
          accessFailedCount: 0,
          lockoutEnd: undefined,
        },
        undefined,
        undefined,
      );
    });

    it('should throw error if email not confirmed', async () => {
      const unconfirmedUser = {
        ...mockUser,
        passwordHash: 'hashed-password',
        emailConfirmed: false,
        accessFailedCount: 0,
        lockoutEnd: undefined,
      } as User;
      baseService.findOne.mockResolvedValue(unconfirmedUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      baseService.update.mockResolvedValue(unconfirmedUser);

      await expect(service.login(loginUser)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginUser)).rejects.toThrow(
        AUTH_MESSAGES.EMAIL_NOT_CONFIRMED,
      );
    });

    it('should use transaction when provided', async () => {
      const transaction = {} as Transaction;
      const existingUser = {
        ...mockUser,
        passwordHash: 'hashed-password',
        accessFailedCount: 1,
        lockoutEnd: new Date(),
      } as User;
      baseService.findOne.mockResolvedValue(existingUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      baseService.update.mockResolvedValue(existingUser);
      baseService.findById
        .mockResolvedValueOnce({
          ...existingUser,
          roles: [],
        } as unknown as User)
        .mockResolvedValueOnce({
          ...existingUser,
          claims: [],
        } as unknown as User);
      (generatePasetoToken as jest.Mock).mockReturnValue('token-123');

      await service.login(loginUser, transaction);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(baseService.update).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        undefined,
        transaction,
      );
    });
  });

  describe('handleFailedLogin', () => {
    it('should do nothing if lockout is not enabled', async () => {
      const user = {
        ...mockUser,
        lockoutEnabled: false,
        update: jest.fn(),
      } as unknown as User;

      await service.handleFailedLogin(user);

      expect(
        (user as unknown as { update: jest.Mock }).update,
      ).not.toHaveBeenCalled();
    });

    it('should increment access failed count if below max attempts', async () => {
      const user = {
        ...mockUser,
        lockoutEnabled: true,
        accessFailedCount: 2,
      } as unknown as User;
      const updateMock = jest.fn().mockResolvedValue(user);

      (user as unknown as { update: jest.Mock }).update = updateMock;

      await service.handleFailedLogin(user);

      expect(updateMock).toHaveBeenCalledWith({
        accessFailedCount: 3,
      });
    });

    it('should set lockout end if max attempts reached', async () => {
      const user = {
        ...mockUser,
        lockoutEnabled: true,
        accessFailedCount: 4, // One less than max (5)
      } as unknown as User;
      const updateMock = jest.fn().mockResolvedValue(user);

      (user as unknown as { update: jest.Mock }).update = updateMock;

      await service.handleFailedLogin(user);

      expect(updateMock).toHaveBeenCalledWith({
        accessFailedCount: 5,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        lockoutEnd: expect.any(Date),
      });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const lockoutEnd = (updateMock.mock.calls[0]?.[0] as { lockoutEnd: Date })
        ?.lockoutEnd;
      expect(lockoutEnd?.getTime()).toBeGreaterThan(Date.now());
    });

    it('should handle null accessFailedCount', async () => {
      const user = {
        ...mockUser,
        lockoutEnabled: true,
        accessFailedCount: null as unknown as number,
      } as unknown as User;
      const updateMock = jest.fn().mockResolvedValue(user);

      (user as unknown as { update: jest.Mock }).update = updateMock;

      await service.handleFailedLogin(user);

      expect(updateMock).toHaveBeenCalledWith({
        accessFailedCount: 1,
      });
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      baseService.findOne.mockResolvedValue(mockUser as User);

      const result = await service.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(baseService.findOne).toHaveBeenCalledWith({
        where: { normalizedEmail: 'TEST@EXAMPLE.COM' },
      });
    });

    it('should return null if user not found', async () => {
      baseService.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('notfound@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findByUserName', () => {
    it('should find user by username', async () => {
      baseService.findOne.mockResolvedValue(mockUser as User);

      const result = await service.findByUserName('testuser');

      expect(result).toEqual(mockUser);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(baseService.findOne).toHaveBeenCalledWith({
        where: { normalizedUserName: 'TESTUSER' },
      });
    });

    it('should return null if user not found', async () => {
      baseService.findOne.mockResolvedValue(null);

      const result = await service.findByUserName('notfound');

      expect(result).toBeNull();
    });
  });

  describe('getRoles', () => {
    it('should return user roles', async () => {
      const userWithRoles = {
        ...mockUser,
        roles: [mockRole as Role],
      } as User;
      baseService.findById.mockResolvedValue(userWithRoles);

      const result = await service.getRoles('user-123');

      expect(result).toEqual([mockRole as Role]);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(baseService.findById).toHaveBeenCalledWith('user-123', {
        include: [
          {
            model: Role,
            through: { attributes: [] },
          },
        ],
      });
    });

    it('should return empty array if user not found', async () => {
      baseService.findById.mockResolvedValue(null);

      const result = await service.getRoles('non-existent');

      expect(result).toEqual([]);
    });

    it('should return empty array if user has no roles', async () => {
      const userWithoutRoles = { ...mockUser, roles: [] } as User;
      baseService.findById.mockResolvedValue(userWithoutRoles);

      const result = await service.getRoles('user-123');

      expect(result).toEqual([]);
    });
  });

  describe('findByClaim', () => {
    it('should find user by claim', async () => {
      const userWithClaim = {
        ...mockUser,
        claims: [mockUserClaim as UserClaim],
      } as User;
      baseService.findOne.mockResolvedValue(userWithClaim);

      const claim = { claimType: 'policy', claimValue: 'read:users' };
      const result = await service.findByClaim(claim);

      expect(result).toEqual(userWithClaim);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(baseService.findOne).toHaveBeenCalledWith({
        include: [
          {
            model: UserClaim,
            where: claim,
          },
        ],
      });
    });

    it('should return null if user not found', async () => {
      baseService.findOne.mockResolvedValue(null);

      const result = await service.findByClaim({ claimType: 'policy' });

      expect(result).toBeNull();
    });
  });

  describe('getClaims', () => {
    it('should return user claims', async () => {
      const userWithClaims = {
        ...mockUser,
        claims: [mockUserClaim as UserClaim],
      } as User;
      baseService.findById.mockResolvedValue(userWithClaims);

      const result = await service.getClaims('user-123');

      expect(result).toEqual([mockUserClaim as UserClaim]);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(baseService.findById).toHaveBeenCalledWith('user-123', {
        include: [{ model: UserClaim }],
      });
    });

    it('should return empty array if user not found', async () => {
      baseService.findById.mockResolvedValue(null);

      const result = await service.getClaims('non-existent');

      expect(result).toEqual([]);
    });

    it('should return empty array if user has no claims', async () => {
      const userWithoutClaims = { ...mockUser, claims: [] } as User;
      baseService.findById.mockResolvedValue(userWithoutClaims);

      const result = await service.getClaims('user-123');

      expect(result).toEqual([]);
    });
  });

  describe('getLogins', () => {
    it('should return user logins', async () => {
      const mockLogin: Partial<UserLogin> = {
        id: 'login-123',
        loginProvider: 'google',
        providerKey: 'google-key',
      };
      const userWithLogins = {
        ...mockUser,
        logins: [mockLogin as UserLogin],
      } as User;
      baseService.findById.mockResolvedValue(userWithLogins);

      const result = await service.getLogins('user-123');

      expect(result).toEqual([mockLogin as UserLogin]);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(baseService.findById).toHaveBeenCalledWith('user-123', {
        include: [{ model: UserLogin }],
      });
    });

    it('should return empty array if user not found', async () => {
      baseService.findById.mockResolvedValue(null);

      const result = await service.getLogins('non-existent');

      expect(result).toEqual([]);
    });
  });

  describe('getTokens', () => {
    it('should return user tokens', async () => {
      const mockToken: Partial<UserToken> = {
        id: 'token-123',
        userId: 'user-123',
        loginProvider: 'email',
        name: 'confirmationToken',
        value: 'token-value',
      };
      const userWithTokens = {
        ...mockUser,
        tokens: [mockToken as UserToken],
      } as User;
      baseService.findById.mockResolvedValue(userWithTokens);

      const result = await service.getTokens('user-123');

      expect(result).toEqual([mockToken as UserToken]);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(baseService.findById).toHaveBeenCalledWith('user-123', {
        include: [{ model: UserToken }],
      });
    });

    it('should return empty array if user not found', async () => {
      baseService.findById.mockResolvedValue(null);

      const result = await service.getTokens('non-existent');

      expect(result).toEqual([]);
    });
  });

  describe('setLockoutEnd', () => {
    it('should set lockout end date', async () => {
      const lockoutEnd = new Date();
      const user = { ...mockUser } as unknown as User;
      const updateMock = jest.fn().mockResolvedValue(user);

      (user as unknown as { update: jest.Mock }).update = updateMock;
      baseService.findById.mockResolvedValue(user);

      const result = await service.setLockoutEnd('user-123', lockoutEnd);

      expect(result).toEqual(user);
      expect(updateMock).toHaveBeenCalledWith(
        { lockoutEnd },
        { transaction: undefined },
      );
    });

    it('should set lockout end to null', async () => {
      const user = { ...mockUser } as unknown as User;
      const updateMock = jest.fn().mockResolvedValue(user);

      (user as unknown as { update: jest.Mock }).update = updateMock;
      baseService.findById.mockResolvedValue(user);

      const result = await service.setLockoutEnd('user-123', null);

      expect(result).toEqual(user);
      expect(updateMock).toHaveBeenCalledWith(
        { lockoutEnd: null },
        { transaction: undefined },
      );
    });

    it('should return null if user not found', async () => {
      baseService.findById.mockResolvedValue(null);

      const result = await service.setLockoutEnd('non-existent', new Date());

      expect(result).toBeNull();
    });

    it('should use transaction when provided', async () => {
      const transaction = {} as Transaction;
      const user = { ...mockUser } as unknown as User;
      const updateMock = jest.fn().mockResolvedValue(user);

      (user as unknown as { update: jest.Mock }).update = updateMock;
      baseService.findById.mockResolvedValue(user);

      await service.setLockoutEnd('user-123', new Date(), transaction);

      expect(updateMock).toHaveBeenCalledWith(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        { lockoutEnd: expect.any(Date) },
        { transaction },
      );
    });
  });

  describe('buildPasetoPayload', () => {
    it('should build payload with user id, email, roles, and policies', async () => {
      const user = {
        ...mockUser,
        id: 'user-123',
        email: 'test@example.com',
      } as User;
      const roles = [
        { ...mockRole, name: 'Admin' } as Role,
        { ...mockRole, id: 'role-456', name: 'User' } as Role,
      ];
      const claims = [
        {
          ...mockUserClaim,
          claimType: 'policy',
          claimValue: 'read:users',
        } as UserClaim,
        {
          ...mockUserClaim,
          id: 'claim-456',
          claimType: 'policy',
          claimValue: 'write:users',
        } as UserClaim,
        {
          ...mockUserClaim,
          id: 'claim-789',
          claimType: 'other',
          claimValue: 'some-value',
        } as UserClaim,
      ];
      baseService.findById
        .mockResolvedValueOnce({ ...user, roles } as unknown as User)
        .mockResolvedValueOnce({ ...user, claims } as unknown as User);

      const payload = await (
        service as unknown as {
          buildPasetoPayload: (user: User) => Promise<Record<string, unknown>>;
        }
      ).buildPasetoPayload(user);

      expect(payload).toEqual({
        sub: 'user-123',
        email: 'test@example.com',
        roles: ['Admin', 'User'],
        policies: ['read:users', 'write:users'],
      });
    });

    it('should build payload without email if not provided', async () => {
      const user = {
        ...mockUser,
        id: 'user-123',
        email: undefined,
      } as User;
      baseService.findById
        .mockResolvedValueOnce({ ...user, roles: [] } as unknown as User)
        .mockResolvedValueOnce({ ...user, claims: [] } as unknown as User);

      const payload = await (
        service as unknown as {
          buildPasetoPayload: (user: User) => Promise<Record<string, unknown>>;
        }
      ).buildPasetoPayload(user);

      expect(payload).toEqual({
        sub: 'user-123',
      });
    });

    it('should build payload without roles if empty', async () => {
      const user = {
        ...mockUser,
        id: 'user-123',
        email: 'test@example.com',
      } as User;
      baseService.findById
        .mockResolvedValueOnce({ ...user, roles: [] } as unknown as User)
        .mockResolvedValueOnce({ ...user, claims: [] } as unknown as User);

      const payload = await (
        service as unknown as {
          buildPasetoPayload: (user: User) => Promise<Record<string, unknown>>;
        }
      ).buildPasetoPayload(user);

      expect(payload).toEqual({
        sub: 'user-123',
        email: 'test@example.com',
      });
    });

    it('should build payload without policies if empty', async () => {
      const user = {
        ...mockUser,
        id: 'user-123',
        email: 'test@example.com',
      } as User;
      const roles = [{ ...mockRole, name: 'Admin' } as Role];
      baseService.findById
        .mockResolvedValueOnce({ ...user, roles } as unknown as User)
        .mockResolvedValueOnce({ ...user, claims: [] } as unknown as User);

      const payload = await (
        service as unknown as {
          buildPasetoPayload: (user: User) => Promise<Record<string, unknown>>;
        }
      ).buildPasetoPayload(user);

      expect(payload).toEqual({
        sub: 'user-123',
        email: 'test@example.com',
        roles: ['Admin'],
      });
    });

    it('should filter out non-policy claims', async () => {
      const user = {
        ...mockUser,
        id: 'user-123',
      } as User;
      const claims = [
        {
          ...mockUserClaim,
          claimType: 'policy',
          claimValue: 'read:users',
        } as UserClaim,
        {
          ...mockUserClaim,
          id: 'claim-456',
          claimType: 'custom',
          claimValue: 'custom-value',
        } as UserClaim,
      ];
      baseService.findById
        .mockResolvedValueOnce({ ...user, roles: [] } as unknown as User)
        .mockResolvedValueOnce({ ...user, claims } as unknown as User);

      const payload = await (
        service as unknown as {
          buildPasetoPayload: (user: User) => Promise<Record<string, unknown>>;
        }
      ).buildPasetoPayload(user);

      expect((payload as { policies?: string[] }).policies).toEqual([
        'read:users',
      ]);
    });

    it('should filter out empty role names and claim values', async () => {
      const user = {
        ...mockUser,
        id: 'user-123',
      } as User;
      const roles = [
        { ...mockRole, name: 'Admin' } as Role,
        { ...mockRole, id: 'role-456', name: '' } as Role,
        {
          ...mockRole,
          id: 'role-789',
          name: null as unknown as string,
        } as Role,
      ];
      const claims = [
        {
          ...mockUserClaim,
          claimType: 'policy',
          claimValue: 'read:users',
        } as UserClaim,
        {
          ...mockUserClaim,
          id: 'claim-456',
          claimType: 'policy',
          claimValue: '',
        } as UserClaim,
        {
          ...mockUserClaim,
          id: 'claim-789',
          claimType: 'policy',
          claimValue: null as unknown as string,
        } as UserClaim,
      ];
      baseService.findById
        .mockResolvedValueOnce({ ...user, roles } as unknown as User)
        .mockResolvedValueOnce({ ...user, claims } as unknown as User);

      const payload = await (
        service as unknown as {
          buildPasetoPayload: (user: User) => Promise<Record<string, unknown>>;
        }
      ).buildPasetoPayload(user);

      expect((payload as { roles?: string[] }).roles).toEqual(['Admin']);

      expect((payload as { policies?: string[] }).policies).toEqual([
        'read:users',
      ]);
    });
  });
});
