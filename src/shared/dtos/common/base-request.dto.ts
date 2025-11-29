import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, Max, IsString, IsEnum } from 'class-validator';
import { SortOrder } from '../../types/sort.types';
import type { SortOrderType } from '../../types/sort.types';
import { PAGINATION } from '../../constants/pagination.constants';

export class PaginationDto {
  @ApiPropertyOptional({
    description: 'Page number (starts from 1)',
    default: PAGINATION.DEFAULT_PAGE,
    minimum: PAGINATION.MIN_PAGE,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(PAGINATION.MIN_PAGE)
  page?: number = PAGINATION.DEFAULT_PAGE;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    default: PAGINATION.DEFAULT_LIMIT,
    minimum: PAGINATION.MIN_LIMIT,
    maximum: PAGINATION.MAX_LIMIT,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(PAGINATION.MIN_LIMIT)
  @Max(PAGINATION.MAX_LIMIT)
  limit?: number = PAGINATION.DEFAULT_LIMIT;

  get skip(): number {
    return (
      ((this.page || PAGINATION.DEFAULT_PAGE) - 1) *
      (this.limit || PAGINATION.DEFAULT_LIMIT)
    );
  }

  get take(): number {
    return this.limit || PAGINATION.DEFAULT_LIMIT;
  }
}

export class SortDto {
  @ApiPropertyOptional({
    description: 'Field to sort by',
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: SortOrder,
    default: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrderType = SortOrder.DESC;
}

export class BaseQueryDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Search query string',
  })
  @IsOptional()
  @IsString()
  search?: string;
}

export class FilterDto {
  @ApiPropertyOptional({
    description: 'Filter by field',
  })
  @IsOptional()
  @IsString()
  field?: string;

  @ApiPropertyOptional({
    description: 'Filter value',
  })
  @IsOptional()
  @IsString()
  value?: string;
}
