import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../models/ApiResponseModels/api-response.js';

@Injectable()
export class ApiResponseInterceptor<T> implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((result) => {
        if (
          result &&
          typeof result === 'object' &&
          'pageInfo' in result &&
          'data' in result
        ) {
          return {
            data: result.data,
            pageInfo: result.pageInfo,
            status: response.statusCode,
          };
        }

        return {
          data: result,
          status: response.statusCode,
        };
      }),
    );
  }
}
