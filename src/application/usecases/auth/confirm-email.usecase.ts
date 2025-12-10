import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfirmEmailDto } from 'src/shared/dtos/auth/confirm-email.dto';
import { MessageResponseDto } from 'src/shared/dtos/common/message-response.dto';
import { UserService } from '../../services';
import { Transactional } from 'src/infrastructure/database/sequelize';
import { Transaction } from 'sequelize';
import { MESSAGES } from 'src/shared/messages';
import { UserAdapter, UserTokenAdapter } from 'src/domain/adapters';

@Injectable()
export class ConfirmEmailUseCase {
  constructor(
    private readonly userService: UserService,
    private readonly userTokenAdapter: UserTokenAdapter,
    private readonly userAdapter: UserAdapter,
  ) {}

  @Transactional()
  async execute(
    dto: ConfirmEmailDto,
    transaction?: Transaction,
  ): Promise<MessageResponseDto> {
    const tokenRecord = await this.userTokenAdapter.findOne({
      where: {
        loginProvider: 'email',
        name: 'confirmationToken',
        value: dto.token,
      },
      transaction,
    });

    if (!tokenRecord) throw new BadRequestException(MESSAGES.ERR_INVALID_TOKEN);

    const user = await this.userTokenAdapter.findById(tokenRecord.userId);
    if (!user) throw new BadRequestException(MESSAGES.ERR_USER_NOT_FOUND);

    if (user.emailConfirmed)
      throw new BadRequestException(MESSAGES.ERR_EMAIL_ALREADY_CONFIRMED);

    await this.userService.confirmEmail(dto.token, transaction);

    return {
      message: MESSAGES.EMAIL_CONFIRMED,
    };
  }
}
