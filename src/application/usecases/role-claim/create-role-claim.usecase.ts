import { ClaimDto, MessageResponseDto } from 'src/shared/dtos';
import { RoleClaimService } from '../../services';
import { MESSAGES } from 'src/shared/messages';

export class CreateRoleClaimUseCase {
  constructor(private readonly roleClaimService: RoleClaimService) {}

  async execute(roleId: string, claim: ClaimDto): Promise<MessageResponseDto> {
    await this.roleClaimService.addClaim(
      roleId,
      claim.claimType,
      claim.claimValue,
    );

    return { message: MESSAGES.CREATED_SUCCESS };
  }
}
