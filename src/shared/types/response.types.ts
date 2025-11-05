import { HttpStatus } from '@nestjs/common';

export type ResponseStatus = HttpStatus;

export interface BaseResponseStructure<T = unknown> {
  status: ResponseStatus;
  message: string;
  data?: T;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginationInput {
  page: number;
  limit: number;
  total: number;
}
