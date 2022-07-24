import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter<T extends HttpException> implements ExceptionFilter {
  catch(exception: T, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    const response  = ctx.getResponse(),
          statusCode = exception.getStatus();

    return response.status(statusCode).send({
      status: statusCode,
      createdBy: "HttpExceptionFilter",
      errorMessage: exception.message
    })
  }
}


// @Catch(HttpException)
// export class HttpExceptionFilter<T extends HttpException> implements ExceptionFilter
//     {
//       catch(exception: T, host: ArgumentsHost) {
//         const ctx = host.switchToHttp();
//         const response: FastifyReply<any> = ctx.getResponse<FastifyReply>();
    
//         const status = exception.getStatus();
//         const exceptionResponse = exception.getResponse();
    
//         const error =
//           typeof response === 'string'
//             ? { message: exceptionResponse }
//             : (exceptionResponse as object);
    
//         response
//           .status(status)
//           .send({ ...error, timestamp: new Date().toISOString() });
//       }
//     }
