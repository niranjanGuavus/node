import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { FallbackExceptionFilter } from './filter/fallback-exception.filter';
import { HttpExceptionFilter } from './filter/http-exception.filter';

async function bootstrap() {
  //const app = await NestFactory.create(AppModule,  { cors: true });

  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
  //Disable cors
  app.enableCors()

  app.setGlobalPrefix("api-nwdaf");
  app.useGlobalFilters(
    new FallbackExceptionFilter(),
    new HttpExceptionFilter())
  await app.listen(8080);
}
bootstrap();
