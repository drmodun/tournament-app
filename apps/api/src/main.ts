import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { PostgresExceptionFilter } from './base/exception/postgresExceptionFilter';
import { NoValuesToSetExceptionFilter } from './base/exception/noValuesToSetExceptionFilter';
import * as fs from 'fs';
import * as yaml from 'yaml';
import { env } from 'process';

process.env.TZ = 'UTC'; // TODO: if this is not set, the date will be off by 2 hours, maybe fix that later with a special lib

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalFilters(
    new PostgresExceptionFilter(),
    new NoValuesToSetExceptionFilter(),
  );
  app.enableCors();

  const swaggerConfig = new DocumentBuilder()
    .setTitle('winning.sh API')
    .setDescription('The Winning.sh API description')
    .setVersion('1.0 alpha')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  const yamlString: string = yaml.stringify(document, {});

  SwaggerModule.setup('swagger', app, document);

  try {
    if (env.MODE !== 'production')
      fs.writeFileSync('./openapi.yml', yamlString);
  } catch (err) {
    console.error(err);
  }

  await app.listen(process.env.API_PORT || 5500);
}
bootstrap();
