import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class ResponseTimeMiddleware implements NestMiddleware {
  use(request: Request, response: Response, next: NextFunction) {
    const startAt = process.hrtime();
    const { ip, method, originalUrl } = request;
    const userAgent = request?.headers['user-agent'] || '';

    response.on('finish', () => {
      const { statusCode } = response;
      const diff = process.hrtime(startAt);
      // Time in millisecond...
      const responseTime = diff[0] * 1e3 + diff[1] * 1e-6;
      console.log(`${method} ${originalUrl} ${statusCode} ${responseTime}ms   ${userAgent} ${ip}`);
    });

    next();
  }
}
