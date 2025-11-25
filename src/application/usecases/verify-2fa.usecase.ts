import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Verify2FADto } from 'src/shared/dtos/auth/verify-2fa.dto';
import { MessageResponseDto } from 'src/shared/dtos/auth/message-response.dto';
import { UserService } from '../services';
import { Transactional } from 'src/infrastructure/database';
import { Transaction } from 'sequelize';
import { User } from 'src/domain/entities';
import { MESSAGES } from 'src/shared/messages';

@Injectable()
export class Verify2FAUseCase {
  constructor(private readonly userService: UserService) {}

  @Transactional()
  async execute(
    user: User | null,
    dto: Verify2FADto,
    transaction?: Transaction,
  ): Promise<MessageResponseDto> {
    if (!user) throw new UnauthorizedException(MESSAGES.ERR_UNAUTHORIZED);

    await this.userService.verify2FA(user.id, dto.code, transaction);

    return {
      message: MESSAGES.TWO_FACTOR_VERIFIED,
    };
  }
}
