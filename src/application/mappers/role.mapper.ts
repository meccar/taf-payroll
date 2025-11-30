import { Role } from 'src/domain/entities';
import { RoleResponseDto } from 'src/shared/dtos';

export class RoleMapper {
  static toResponse(entity: Role): RoleResponseDto {
    return {
      id: entity.id,
      name: entity.name,
    };
  }

  static toArrayResponse(entities: Role[]): RoleResponseDto[] {
    return entities.map((entity) => this.toResponse(entity));
  }
}
