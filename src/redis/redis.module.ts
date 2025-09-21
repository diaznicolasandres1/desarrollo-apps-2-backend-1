import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
          password: configService.get('REDIS_PASSWORD'),
          db: configService.get('REDIS_DB', 0),
          maxRetriesPerRequest: 3,
          retryDelayOnFailover: 100,
          connectTimeout: 10000,
          lazyConnect: true,
          maxMemoryPolicy: 'allkeys-lru',
          keepAlive: 30000,
          family: 4,
          // Limitar conexiones para evitar el error de Redis Cloud
          maxConnections: 10,
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'event-notifications',
    }),
  ],
  exports: [BullModule],
})
export class RedisModule {}
