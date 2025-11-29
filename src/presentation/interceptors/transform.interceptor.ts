import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseResponseDto } from '../../shared/dtos/common/base-response.dto';
import { MESSAGES } from '../../shared/messages';

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, BaseResponseDto<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<BaseResponseDto<T>> {
    return next.handle().pipe(
      map((data: T) => {
        // If data is already a BaseResponseDto, return it as is
        if (data instanceof BaseResponseDto) return data as BaseResponseDto<T>;

        // If data is null or undefined, return success response
        if (data === null || data === undefined)
          return new BaseResponseDto<T>(data, MESSAGES.SUCCESS, HttpStatus.OK);

        // Wrap the data in BaseResponseDto
        return new BaseResponseDto<T>(data, MESSAGES.SUCCESS, HttpStatus.OK);
      }),
    );
  }
}
