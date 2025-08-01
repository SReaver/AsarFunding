import {
	Injectable,
	NestInterceptor,
	ExecutionContext,
	CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
	data: T;
}

@Injectable()
export class TransformInterceptor<T>
	implements NestInterceptor<T, Response<T>> {
	intercept(
		context: ExecutionContext,
		next: CallHandler,
	): Observable<Response<T>> {
		return next.handle().pipe(
			map(data => {
				// Skip transformation for file downloads
				const response = context.switchToHttp().getResponse();
				if (response.getHeader('content-disposition')) {
					return data;
				}
				return data;
			}),
		);
	}
}