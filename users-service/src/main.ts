import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { MulterExceptionFilter } from './common/filters/multer-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });

  const uploadDir = process.env.UPLOAD_DIR || 'uploads';
  app.useStaticAssets(join(__dirname, '..', uploadDir), {
    prefix: '/uploads',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new MulterExceptionFilter());
  try {
    const server = app.getHttpAdapter().getInstance();
    if (process.env.NODE_ENV !== 'production' && server && server.set) {
      server.set('json spaces', 2);
    }
  } catch (e) {}

  try {
    const server = app.getHttpAdapter().getInstance();
    if (server && server.use) {
      server.use((err: any, req: any, res: any, next: any) => {
        if (!err) return next();

        const message = (err && (err.message || '')).toString();
        const isMulter = err && (err.name === 'MulterError' || err.code);
        const isPayloadTooLarge =
          err &&
          (err.status === 413 ||
            /file too large|PayloadTooLarge/i.test(message));

        if (isMulter || isPayloadTooLarge) {
          return res.status(413).json({
            statusCode: 413,
            message: 'Arquivo muito grande. Tamanho máximo permitido: 5MB.',
          });
        }

        return next(err);
      });
    }
  } catch (e) {}
  await app.listen(3000, '0.0.0.0');
}

bootstrap();
