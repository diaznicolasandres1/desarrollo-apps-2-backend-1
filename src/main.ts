import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { MetricsService } from './metrics/metrics.service';
import { MetricsInterceptor } from './metrics/metrics.interceptor';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { Reflector } from '@nestjs/core';

// Configurar timezone para Argentina (GMT-3)
process.env.TZ = 'America/Argentina/Buenos_Aires';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for all origins
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Global prefix for API versioning
  app.setGlobalPrefix('api/v1');

  // JWT Guard se aplicará manualmente en cada controlador que lo necesite
  // Para aplicar globalmente, descomenta las siguientes líneas:
  // const reflector = app.get(Reflector);
  // app.useGlobalGuards(new JwtAuthGuard(reflector));

  const config = new DocumentBuilder()
    .setTitle('Cultural Places API')
    .setDescription('API para gestionar lugares culturales de Buenos Aires')
    .setVersion('1.0')
    .addTag('cultural-places', 'Endpoints para gestionar lugares culturales')
    .addTag('users', 'Endpoints para gestionar usuarios')
    .addServer(
      process.env.NODE_ENV === 'production'
        ? 'https://desarrollo-apps2-back-end.vercel.app'
        : 'http://localhost:3000',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: 'Cultural Places API',
    customfavIcon: '/favicon.ico',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.js',
    ],
    customCssUrl: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.css',
    ],
  });

  // Configurar métricas
  const metricsService = app.get(MetricsService);
  const metricsInterceptor = app.get(MetricsInterceptor);
  
  // Aplicar interceptor globalmente
  app.useGlobalInterceptors(metricsInterceptor);
  
  // Endpoint para métricas de Prometheus
  app.use('/metrics', async (req, res) => {
    try {
      metricsService.updateMemoryUsage();
      const metrics = await metricsService.getMetrics();
      res.set('Content-Type', 'text/plain');
      res.end(metrics);
    } catch (error) {
      res.status(500).end('Error generating metrics');
    }
  });

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/docs`);
  console.log(`📊 Metrics endpoint: http://localhost:${port}/metrics`);
}
bootstrap();
