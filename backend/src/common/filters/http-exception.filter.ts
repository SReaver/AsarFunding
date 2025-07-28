import {
	ExceptionFilter,
	Catch,
	ArgumentsHost,
	HttpException,
	HttpStatus,
	Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
	private readonly logger = new Logger(HttpExceptionFilter.name);

	catch(exception: unknown, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();

		let status = HttpStatus.INTERNAL_SERVER_ERROR;
		let message = 'Internal server error';
		let errors: string[] = [];

		if (exception instanceof HttpException) {
			status = exception.getStatus();
			const exceptionResponse = exception.getResponse();

			if (typeof exceptionResponse === 'string') {
				message = exceptionResponse;
			} else if (typeof exceptionResponse === 'object') {
				const responseObj = exceptionResponse as any;
				message = responseObj.message || message;
				errors = responseObj.errors || [];
			}
		} else if (exception instanceof Error) {
			message = exception.message;
			this.logger.error(`Unhandled exception: ${exception.stack}`);
		}

		response.status(status).json({
			success: false,
			message,
			errors: errors.length > 0 ? errors : undefined,
		});
	}
}