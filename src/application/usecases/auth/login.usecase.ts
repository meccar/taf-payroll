import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from 'src/shared/dtos/auth/login.dto';
import { Transactional } from 'src/infrastructure/database/sequelize';
import { Transaction } from 'sequelize';
import { UserMapper } from 'src/application/mappers/user.mapper';
import { UserAdapter } from 'src/domain/adapters';
import { MESSAGES } from 'src/shared/messages';
import { User } from 'src/domain/entities';
import * as bcrypt from 'bcrypt';
import { AUTH } from 'src/shared/constants';
import { buildPasetoPayload, generatePasetoToken } from 'src/shared/utils';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly userAdapter: UserAdapter,
    private readonly configService: ConfigService,
  ) {}

  @Transactional()
  async execute(dto: LoginDto, transaction?: Transaction): Promise<string> {
    const user = UserMapper.toEntity(dto);

    this.validateLoginInput(user);
    const existingUser = await this.findUser(user);
    this.checkAccountLockout(existingUser);

    await this.verifyPassword(user.passwordHash!, existingUser);
    await this.resetFailedLoginAttempts(existingUser, transaction);

    this.validateEmailConfirmation(user, existingUser);

    return await this.generateAuthToken(existingUser);
  }

  private validateLoginInput(user: Partial<User>): void {
    if (!user.normalizedEmail && !user.normalizedUserName)
      throw new BadRequestException(MESSAGES.ERR_EMAIL_OR_USERNAME_REQUIRED);

    if (!user.passwordHash)
      throw new BadRequestException(MESSAGES.ERR_PASSWORD_REQUIRED);
  }

  private async findUser(user: Partial<User>): Promise<User> {
    let existingUser: User | null = null;

    if (user.normalizedEmail)
      existingUser = await this.userAdapter.findByEmail(user.normalizedEmail);

    if (!existingUser && user.normalizedUserName)
      existingUser = await this.userAdapter.findByUsername(
        user.normalizedUserName,
      );

    if (!existingUser)
      throw new UnauthorizedException(MESSAGES.ERR_UNAUTHORIZED);

    return existingUser;
  }

  private checkAccountLockout(user: User): void {
    if (!user.lockoutEnabled || !user.lockoutEnd) return;

    const now = new Date();
    if (user.lockoutEnd.getTime() > now.getTime())
      throw new UnauthorizedException(MESSAGES.ERR_ACCOUNT_LOCKED);
  }

  private async verifyPassword(
    inputPassword: string,
    user: User,
  ): Promise<void> {
    const isPasswordValid = await bcrypt.compare(
      inputPassword,
      user.passwordHash,
    );

    if (isPasswordValid) return;

    // Password invalid - handle failed attempts
    if (!user.lockoutEnabled)
      throw new UnauthorizedException(MESSAGES.ERR_UNAUTHORIZED);

    await this.handleFailedLoginAttempt(user);
    throw new UnauthorizedException(MESSAGES.ERR_UNAUTHORIZED);
  }

  private async handleFailedLoginAttempt(user: User): Promise<void> {
    const updatedFailedCount = (user.accessFailedCount ?? 0) + 1;
    const maxAttempts = AUTH.LOCKOUT.MAX_ATTEMPTS;
    const shouldLockAccount = updatedFailedCount >= maxAttempts;

    const updateData: Partial<User> = {
      accessFailedCount: updatedFailedCount,
      ...(shouldLockAccount && {
        lockoutEnd: new Date(Date.now() + AUTH.LOCKOUT.MINUTES * 60 * 1000),
      }),
    };

    await this.userAdapter.update(user.id, updateData);
  }

  private async resetFailedLoginAttempts(
    user: User,
    transaction?: Transaction,
  ): Promise<void> {
    const needsReset = user.accessFailedCount !== 0 || user.lockoutEnd !== null;

    if (!needsReset) return;

    const result = await this.userAdapter.update(
      user.id,
      {
        accessFailedCount: 0,
        lockoutEnd: undefined,
      },
      transaction,
    );

    if (!result?.entity)
      throw new BadRequestException(MESSAGES.ERR_FAILED_TO_LOGIN);
  }

  private validateEmailConfirmation(
    inputUser: Partial<User>,
    existingUser: User,
  ): void {
    if (inputUser.normalizedEmail && !existingUser.emailConfirmed)
      throw new UnauthorizedException(MESSAGES.ERR_EMAIL_NOT_CONFIRMED);
  }

  private async generateAuthToken(user: User): Promise<string> {
    const payload = buildPasetoPayload(
      user.id,
      user.email,
      user.roles.map((r) => r.name),
      user.claims
        .map((c) => c.claimType)
        .filter((x): x is string => x !== null),
    );

    return await generatePasetoToken(this.configService, payload);
  }
}
