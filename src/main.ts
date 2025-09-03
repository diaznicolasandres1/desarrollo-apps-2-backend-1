import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Cultural Places API')
    .setDescription('API para gestionar lugares culturales')
    .setVersion('1.0')
    .addTag('cultural-places', 'Endpoints para gestionar lugares culturales')
    .addTag('users', 'Endpoints para gestionar usuarios')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
