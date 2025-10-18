import { Module } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { MetricsInterceptor } from './metrics.interceptor';
import { MetricsExceptionFilter } from '../common/filters/metrics-exception.filter';

@Module({
  providers: [MetricsService, MetricsInterceptor, MetricsExceptionFilter],
  exports: [MetricsService, MetricsInterceptor, MetricsExceptionFilter],
})
export class MetricsModule {}
