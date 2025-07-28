import { ConfigService } from '@nestjs/config';

export interface AppConfig {
	port: number;
	uploadMaxFileSize: number;
}

export const getAppConfig = (configService: ConfigService): AppConfig => ({
	port: configService.get<number>('PORT', 3000),
	uploadMaxFileSize: configService.get<number>('UPLOAD_MAX_FILE_SIZE', 10485760),
});