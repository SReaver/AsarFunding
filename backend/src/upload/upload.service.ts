import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { UploadLog, UploadStatus } from './entities/upload-log.entity';
import { ExcelParserService } from './excel-parser.service';
import { CommercialOffersService } from '../commercial-offers/commercial-offers.service';
import { ConfigService } from '@nestjs/config';
import { getAppConfig } from '../config/app.config';

@Injectable()
export class UploadService {
	private readonly maxFileSize: number;

	constructor(
		@InjectRepository(UploadLog)
		private uploadLogRepository: Repository<UploadLog>,
		private excelParserService: ExcelParserService,
		private commercialOffersService: CommercialOffersService,
		private dataSource: DataSource,
		configService: ConfigService,
	) {
		const appConfig = getAppConfig(configService);
		this.maxFileSize = appConfig.uploadMaxFileSize;
	}

	async uploadExcelFile(file: Express.Multer.File) {
		// Validate file
		if (!file) {
			throw new BadRequestException('No file uploaded');
		}

		if (!file.originalname.match(/\.(xlsx|xls)$/)) {
			throw new BadRequestException('Invalid file format. Expected Excel file (.xlsx or .xls)');
		}

		if (file.size > this.maxFileSize) {
			throw new BadRequestException(`File too large. Maximum size is ${this.maxFileSize / 1024 / 1024} MB`);
		}

		const uploadLog = new UploadLog();
		uploadLog.filename = file.originalname;
		uploadLog.status = UploadStatus.ERROR;
		uploadLog.recordsCount = 0;

		const queryRunner = this.dataSource.createQueryRunner();
		await queryRunner.connect();
		await queryRunner.startTransaction();

		try {
			// Parse Excel file
			const commercialOfferDto = await this.excelParserService.parseExcelFile(file.buffer);

			// Save commercial offer with products
			const commercialOffer = await this.commercialOffersService.create(commercialOfferDto, queryRunner);

			// Update upload log
			uploadLog.status = UploadStatus.SUCCESS;
			uploadLog.recordsCount = commercialOffer.products.length;

			await queryRunner.manager.save(uploadLog);
			await queryRunner.commitTransaction();

			return {
				success: true,
				message: `Successfully uploaded ${uploadLog.recordsCount} products`,
				recordsCount: uploadLog.recordsCount,
			};
		} catch (error) {
			await queryRunner.rollbackTransaction();

			uploadLog.errorMessage = error.message;
			await this.uploadLogRepository.save(uploadLog);

			throw error;
		} finally {
			await queryRunner.release();
		}
	}
}