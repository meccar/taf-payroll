import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { BaseResponseDto } from '../../shared/dtos/base-response.dto';
import { MESSAGES } from '../../shared/messages';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const path = request.url;

    let status: HttpStatus;
    let message: string;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const responseObj = exceptionResponse as { message?: string };
        message =
          responseObj.message || exception.message || MESSAGES.ERROR_OCCURRED;
      } else {
        message = exception.message || MESSAGES.ERROR_OCCURRED;
      }
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = MESSAGES.INTERNAL_SERVER_ERROR;

      // Log unexpected errors
      this.logger.error(
        `${MESSAGES.UNEXPECTED_ERROR} ${
          exception instanceof Error
            ? exception.message
            : MESSAGES.UNKNOWN_ERROR
        }`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    // Log the error
    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${path} - ${status} - ${message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else {
      this.logger.warn(`${request.method} ${path} - ${status} - ${message}`);
    }

    const errorResponse = new BaseResponseDto(undefined, message, status);

    response.status(status).json(errorResponse);
  }
}
