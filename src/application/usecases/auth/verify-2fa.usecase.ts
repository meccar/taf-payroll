import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Verify2FADto } from 'src/shared/dtos/auth/verify-2fa.dto';
import { MessageResponseDto } from 'src/shared/dtos/common/message-response.dto';
import { User } from 'src/domain/entities';
import { MESSAGES } from 'src/shared/messages';
import { UserTokenAdapter } from 'src/domain/adapters';
import { UNIT_OF_WORK } from 'src/shared/constants';
import type { IUnitOfWork } from 'src/domain/adapters/unit-of-work.adapter';

@Injectable()
export class Verify2FAUseCase {
  constructor(
    private readonly userTokenAdapter: UserTokenAdapter,
    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute(
    user: User | null,
    dto: Verify2FADto,
  ): Promise<MessageResponseDto> {
    return this.unitOfWork.execute<MessageResponseDto>(async () => {
      if (!user) throw new UnauthorizedException(MESSAGES.ERR_UNAUTHORIZED);

      if (!user.twoFactorEnabled)
        throw new BadRequestException(MESSAGES.ERR_TWO_FACTOR_NOT_ENABLED);

      // TODO: Implement actual 2FA verification logic (TOTP, SMS, etc.)
      // For now, this is a placeholder
      // You would typically verify against a stored secret or send SMS code
      const tokenRecord = await this.userTokenAdapter.getToken(
        user.id,
        '2fa',
        'verificationCode',
      );

      if (!tokenRecord || tokenRecord.value !== dto.code)
        throw new BadRequestException(MESSAGES.ERR_INVALID_2FA_CODE);

      const result = await this.userTokenAdapter.removeToken(
        user.id,
        '2fa',
        'verificationCode',
      );

      if (!result) throw new BadRequestException(MESSAGES.ERR_OCCURRED);

      return {
        message: MESSAGES.TWO_FACTOR_VERIFIED,
      };
    });
  }
}
