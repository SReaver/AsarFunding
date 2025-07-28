import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { ExcelParserService } from './excel-parser.service';
import { UploadLog } from './entities/upload-log.entity';
import { CommercialOffersModule } from '../commercial-offers/commercial-offers.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([UploadLog]),
		MulterModule.register({
			limits: {
				fileSize: 10 * 1024 * 1024, // 10MB
			},
		}),
		CommercialOffersModule,
	],
	controllers: [UploadController],
	providers: [UploadService, ExcelParserService],
})
export class UploadModule { }