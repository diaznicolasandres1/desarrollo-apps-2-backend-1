import { Injectable } from '@nestjs/common';
import { register, collectDefaultMetrics, Counter, Histogram, Gauge } from 'prom-client';

@Injectable()
export class MetricsService {
  private readonly httpRequestDuration: Histogram<string>;
  private readonly httpRequestTotal: Counter<string>;
  private readonly activeConnections: Gauge<string>;
  private readonly memoryUsage: Gauge<string>;

  constructor() {
    // Recolectar métricas por defecto del sistema
    collectDefaultMetrics();

    // Métricas personalizadas
    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
    });

    this.httpRequestTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
    });

    this.activeConnections = new Gauge({
      name: 'active_connections',
      help: 'Number of active connections',
    });

    this.memoryUsage = new Gauge({
      name: 'memory_usage_bytes',
      help: 'Memory usage in bytes',
      labelNames: ['type'],
    });

    // Registrar las métricas
    register.registerMetric(this.httpRequestDuration);
    register.registerMetric(this.httpRequestTotal);
    register.registerMetric(this.activeConnections);
    register.registerMetric(this.memoryUsage);
  }

  recordHttpRequest(method: string, route: string, statusCode: number, duration: number) {
    this.httpRequestDuration
      .labels(method, route, statusCode.toString())
      .observe(duration);

    this.httpRequestTotal
      .labels(method, route, statusCode.toString())
      .inc();
  }

  updateActiveConnections(count: number) {
    this.activeConnections.set(count);
  }

  updateMemoryUsage() {
    const memUsage = process.memoryUsage();
    this.memoryUsage.labels('rss').set(memUsage.rss);
    this.memoryUsage.labels('heapTotal').set(memUsage.heapTotal);
    this.memoryUsage.labels('heapUsed').set(memUsage.heapUsed);
    this.memoryUsage.labels('external').set(memUsage.external);
  }

  getMetrics() {
    return register.metrics();
  }
}
