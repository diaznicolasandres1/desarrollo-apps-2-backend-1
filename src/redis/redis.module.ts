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
          connectTimeout: 15000,
          lazyConnect: false,
          keepAlive: 30000,
          family: 4,
          maxConnections: 5,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [BullModule],
})
export class RedisModule {}
