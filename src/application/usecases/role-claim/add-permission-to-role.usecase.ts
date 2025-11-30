import { MESSAGES } from 'src/shared/messages';
import { RoleClaimService } from '../../services';
import { MessageResponseDto, PermissionDto } from 'src/shared/dtos';

export class AddPermissionToRoleUseCase {
  constructor(private readonly roleClaimService: RoleClaimService) {}

  async execute(
    roleId: string,
    permission: PermissionDto[],
  ): Promise<MessageResponseDto> {
    await this.roleClaimService.addPermission(roleId, permission);
    return { message: MESSAGES.CREATED_SUCCESS };
  }
}
