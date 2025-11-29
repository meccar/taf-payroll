import { RoleClaimService } from '../../services';
import { PermissionDto } from 'src/shared/dtos';

export class AddPermissionToRoleUseCase {
  constructor(private readonly roleClaimService: RoleClaimService) {}

  async execute(roleId: string, permission: PermissionDto[]) {
    return this.roleClaimService.addPermission(roleId, permission);
  }
}
