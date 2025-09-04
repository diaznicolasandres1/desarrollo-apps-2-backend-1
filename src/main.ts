import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for production
  app.enableCors({
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://your-frontend-domain.com'] 
      : true,
    credentials: true,
  });

  // Global prefix for API versioning
  app.setGlobalPrefix('api/v1');

  const config = new DocumentBuilder()
    .setTitle('Cultural Places API')
    .setDescription('API para gestionar lugares culturales de Buenos Aires')
    .setVersion('1.0')
    .addTag('cultural-places', 'Endpoints para gestionar lugares culturales')
    .addTag('users', 'Endpoints para gestionar usuarios')
    .addServer(process.env.NODE_ENV === 'production' ? 'https://your-app-name.onrender.com' : 'http://localhost:3000')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/docs`);
}
bootstrap();
