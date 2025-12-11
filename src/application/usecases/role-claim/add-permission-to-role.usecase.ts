import { MESSAGES } from 'src/shared/messages';
import { MessageResponseDto, PermissionDto } from 'src/shared/dtos';
import { RoleClaimAdapter } from 'src/domain/adapters';

export class AddPermissionToRoleUseCase {
  constructor(private readonly roleClaimAdapter: RoleClaimAdapter) {}

  async execute(
    roleId: string,
    permission: PermissionDto[],
  ): Promise<MessageResponseDto> {
    await this.roleClaimAdapter.addPermission(roleId, permission);
    return { message: MESSAGES.CREATED_SUCCESS };
  }
}
