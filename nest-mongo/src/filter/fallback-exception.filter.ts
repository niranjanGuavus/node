import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';

@Catch()
export class FallbackExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
   
    const _ctx = host.switchToHttp();
    const response = _ctx.getResponse();

    return response.status(500).send({
      statusCode: 500,
      createdBy: "FallbackExceptionFilter",
      errorMessage: exception.message ? exception.message : "Unexpected error occurs"
    })
  }
}
