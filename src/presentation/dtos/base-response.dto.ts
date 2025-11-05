import { ApiProperty } from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';
import { MESSAGES } from '../../shared/messages';
import type { ResponseStatus } from '../../shared/types/response.types';
import type { PaginationInput } from '../../shared/types/response.types';

export class BaseResponseDto<T = unknown> {
  @ApiProperty({
    description: 'HTTP status code',
    example: 200,
  })
  status: ResponseStatus;

  @ApiProperty({ description: 'Response message' })
  message: string;

  @ApiProperty({ description: 'Response data', required: false })
  data?: T;

  constructor(
    data?: T,
    message: string = MESSAGES.SUCCESS,
    status: ResponseStatus = HttpStatus.OK,
  ) {
    this.status = status;
    this.message = message;
    this.data = data;
  }
}

export class PaginatedDataDto<T = unknown> {
  @ApiProperty({ description: 'List of items', type: Array })
  items: T[];

  @ApiProperty({ description: 'Current page number' })
  page: number;

  @ApiProperty({ description: 'Number of items per page' })
  limit: number;

  @ApiProperty({ description: 'Total number of items' })
  total: number;

  @ApiProperty({ description: 'Total number of pages' })
  totalPages: number;

  @ApiProperty({ description: 'Whether there is a next page' })
  hasNext: boolean;

  @ApiProperty({ description: 'Whether there is a previous page' })
  hasPrev: boolean;
}

export class PaginatedResponseDto<T = unknown> extends BaseResponseDto<
  PaginatedDataDto<T>
> {
  constructor(
    data: T[],
    meta: PaginationInput,
    message: string = MESSAGES.SUCCESS,
  ) {
    const paginatedData: PaginatedDataDto<T> = {
      items: data,
      page: meta.page,
      limit: meta.limit,
      total: meta.total,
      totalPages: Math.ceil(meta.total / meta.limit),
      hasNext: meta.page * meta.limit < meta.total,
      hasPrev: meta.page > 1,
    };

    super(paginatedData, message, HttpStatus.OK);
  }
}

export class SuccessResponseDto<T = unknown> extends BaseResponseDto<T> {
  constructor(data?: T, message: string = MESSAGES.SUCCESS) {
    super(data, message, HttpStatus.OK);
  }
}

export class CreatedResponseDto<T = unknown> extends BaseResponseDto<T> {
  constructor(data?: T, message: string = MESSAGES.CREATED_SUCCESS) {
    super(data, message, HttpStatus.CREATED);
  }
}
