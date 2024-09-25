import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { PostgresExceptionFilter } from './base/exception/postgresExceptionFilter';
import { NoValuesToSetExceptionFilter } from './base/exception/noValuesToSetExceptionFilter';
import * as fs from 'fs';
import * as yaml from 'yaml';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
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

  fs.writeFileSync('./openapi.yml', yamlString);

  await app.listen(process.env.API_PORT || 5500);
}
bootstrap();
