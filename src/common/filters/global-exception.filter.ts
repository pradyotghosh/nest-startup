import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();

      const errorResponse = exception.getResponse();

      if (typeof errorResponse === 'string') {
        message = errorResponse;
      } else if (
        typeof errorResponse === 'object' &&
        errorResponse !== null &&
        'message' in errorResponse
      ) {
        const errorMessage = errorResponse.message;

        message = Array.isArray(errorMessage)
          ? errorMessage.join(', ')
          : String(errorMessage);
      }
    } else if (exception instanceof Error) {
      this.logger.error(`${request.method} ${request.url}`, exception.stack);
    }

    response.status(statusCode).json({
      success: false,
      statusCode,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),

      ...(process.env.NODE_ENV !== 'production' && exception instanceof Error
        ? {
            debug: {
              name: exception.name,
              message: exception.message,
            },
          }
        : {}),
    });
  }
}
