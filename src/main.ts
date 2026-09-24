import 'reflect-metadata';
import { ConsoleLogger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter.js';
import { ApiResponseInterceptor } from './common/interceptor/api-response.interceptor.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({
      json: false,
      prefix: 'Backend',
      context: 'Api',
    }),
  });
  const config = new DocumentBuilder()
    .setTitle('Property API')
    .setDescription('Property management API')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/docs', app, document);
  app.enableShutdownHooks();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new ApiResponseInterceptor());
  console.log('App listing to ==> ', process.env.PORT);

  const httpAdapter = app.getHttpAdapter();

  httpAdapter.get('/', (req, res) => {
    res.status(200).send({
      message:
        'Hello!! Please visit https://github.com/pradyotghosh for documentation',
    });
  });
  httpAdapter.get('/swagger', (req, res) => {
    res.status(200).send({
      message:
        'Hello!! Please visit https://github.com/pradyotghosh for documentation',
    });
  });

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
