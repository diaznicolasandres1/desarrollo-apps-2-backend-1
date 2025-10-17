import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { MetricsService } from './metrics.service';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        // Capturar requests exitosos
        const duration = (Date.now() - startTime) / 1000;
        const method = request.method;
        const route = request.route?.path || request.url;
        const statusCode = response.statusCode;

        this.metricsService.recordHttpRequest(method, route, statusCode, duration);
      }),
      catchError((error) => {
        // Capturar requests con errores (4XX, 5XX)
        const duration = (Date.now() - startTime) / 1000;
        const method = request.method;
        const route = request.route?.path || request.url;
        const statusCode = error.status || error.statusCode || 500;

        this.metricsService.recordHttpRequest(method, route, statusCode, duration);
        
        // Re-lanzar el error para que NestJS lo maneje normalmente
        return throwError(() => error);
      }),
    );
  }
}
