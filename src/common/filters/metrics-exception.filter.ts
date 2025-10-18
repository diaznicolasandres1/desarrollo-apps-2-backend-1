import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { MetricsService } from '../../metrics/metrics.service';

@Catch()
export class MetricsExceptionFilter implements ExceptionFilter {
  constructor(private readonly metricsService: MetricsService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const startTime = request['startTime'] || Date.now();

    let status: number;
    let message: string;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
    }

    // Registrar la métrica del error
    const duration = (Date.now() - startTime) / 1000;
    const method = request.method;
    const route = request.route?.path || request.url;

    this.metricsService.recordHttpRequest(method, route, status, duration);

    // Continuar con el manejo normal de la excepción
    response.status(status).json({
      statusCode: status,
      message: message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
