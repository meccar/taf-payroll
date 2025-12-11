import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ConfirmEmailDto } from 'src/shared/dtos/auth/confirm-email.dto';
import { MessageResponseDto } from 'src/shared/dtos/common/message-response.dto';
import { Transactional } from 'src/infrastructure/database/sequelize';
import { Transaction } from 'sequelize';
import { MESSAGES } from 'src/shared/messages';
import { UserAdapter, UserTokenAdapter } from 'src/domain/adapters';
import { UNIT_OF_WORK } from 'src/shared/constants';
import type { IUnitOfWork } from 'src/domain/adapters/unit-of-work.adapter';

@Injectable()
export class ConfirmEmailUseCase {
  constructor(
    private readonly userTokenAdapter: UserTokenAdapter,
    private readonly userAdapter: UserAdapter,
    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  @Transactional()
  async execute(
    dto: ConfirmEmailDto,
    transaction?: Transaction,
  ): Promise<MessageResponseDto> {
    return this.unitOfWork.execute<MessageResponseDto>(async () => {
      const tokenRecord = await this.userTokenAdapter.findOne({
        where: {
          loginProvider: 'email',
          name: 'confirmationToken',
          value: dto.token,
        },
        transaction,
      });

      if (!tokenRecord)
        throw new BadRequestException(MESSAGES.ERR_INVALID_TOKEN);

      const user = await this.userAdapter.findById(tokenRecord.userId);
      if (!user) throw new BadRequestException(MESSAGES.ERR_USER_NOT_FOUND);

      if (user.emailConfirmed)
        throw new BadRequestException(MESSAGES.ERR_EMAIL_ALREADY_CONFIRMED);

      user.emailConfirmed = true;

      const updateResult = await this.userAdapter.update(
        user.id,
        user,
        transaction,
      );

      if (!updateResult)
        throw new BadRequestException(MESSAGES.ERR_FAILED_TO_LOGIN);

      const removeResult = await this.userTokenAdapter.removeToken(
        user.id,
        'email',
        'confirmationToken',
        transaction,
      );

      if (!removeResult)
        throw new BadRequestException(MESSAGES.ERR_FAILED_TO_LOGIN);

      return {
        message: MESSAGES.EMAIL_CONFIRMED,
      };
    });
  }
}
