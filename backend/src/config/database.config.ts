import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
	type: 'postgres',
	host: configService.get('DATABASE_HOST'),
	port: configService.get('DATABASE_PORT'),
	username: configService.get('DATABASE_USER'),
	password: configService.get('DATABASE_PASSWORD'),
	database: configService.get('DATABASE_NAME'),
	entities: [__dirname + '/../**/*.entity{.ts,.js}'],
	synchronize: true,
	logging: false,
});