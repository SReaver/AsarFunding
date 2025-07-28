import {
	Controller,
	Post,
	UseInterceptors,
	UploadedFile,
	BadRequestException,
	HttpCode,
	HttpStatus
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';

@Controller('api/upload')
export class UploadController {
	constructor(private readonly uploadService: UploadService) { }

	@Post()
	@HttpCode(HttpStatus.OK)
	@UseInterceptors(FileInterceptor('file'))
	async uploadFile(@UploadedFile() file: Express.Multer.File) {
		try {
			return await this.uploadService.uploadExcelFile(file);
		} catch (error) {
			if (error instanceof BadRequestException) {
				throw error;
			}
			throw new BadRequestException(error.message || 'Failed to process the file');
		}
	}
}