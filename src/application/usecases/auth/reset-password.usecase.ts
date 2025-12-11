import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ResetPasswordDto } from 'src/shared/dtos/auth/reset-password.dto';
import { MessageResponseDto } from 'src/shared/dtos/common/message-response.dto';
import { MESSAGES } from 'src/shared/messages';
import { UserAdapter, UserTokenAdapter } from 'src/domain/adapters';
import * as bcrypt from 'bcrypt';
import { SECURITY, UNIT_OF_WORK } from 'src/shared/constants';
import { generateSecurityStamp } from 'src/shared/utils';
import type { IUnitOfWork } from 'src/domain/adapters/unit-of-work.adapter';

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    private readonly userAdapter: UserAdapter,
    private readonly userTokenAdapter: UserTokenAdapter,
    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute(dto: ResetPasswordDto): Promise<MessageResponseDto> {
    return this.unitOfWork.execute<MessageResponseDto>(async () => {
      const tokenRecord = await this.userTokenAdapter.findOne({
        where: {
          loginProvider: 'email',
          name: 'passwordResetToken',
          value: dto.token,
        },
      });

      if (!tokenRecord)
        throw new BadRequestException(MESSAGES.ERR_INVALID_TOKEN);

      const user = await this.userAdapter.findById(tokenRecord.userId);
      if (!user) throw new BadRequestException(MESSAGES.ERR_USER_NOT_FOUND);

      const passwordHash = await bcrypt.hash(
        dto.newPassword,
        SECURITY.BCRYPT_SALT_ROUNDS,
      );

      const result = await this.userAdapter.update(user.id, {
        passwordHash,
        securityStamp: generateSecurityStamp(),
      });

      if (!result) throw new BadRequestException(MESSAGES.ERR_FAILED_TO_LOGIN);

      const removeTokenResult = await this.userTokenAdapter.removeToken(
        user.id,
        'email',
        'passwordResetToken',
      );

      if (!removeTokenResult.success)
        throw new BadRequestException(MESSAGES.ERR_OCCURRED);

      return {
        message: MESSAGES.PASSWORD_RESET_SUCCESS,
      };
    });
  }
}
