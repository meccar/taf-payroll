import { ClaimDto, MessageResponseDto } from 'src/shared/dtos';
import { MESSAGES } from 'src/shared/messages';
import { RoleClaimAdapter } from 'src/domain/adapters';

export class CreateRoleClaimUseCase {
  constructor(private readonly roleClaimAdapter: RoleClaimAdapter) {}

  async execute(roleId: string, claim: ClaimDto): Promise<MessageResponseDto> {
    await this.roleClaimAdapter.addClaim(
      roleId,
      claim.claimType,
      claim.claimValue,
    );

    return { message: MESSAGES.CREATED_SUCCESS };
  }
}
