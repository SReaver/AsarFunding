import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { getDatabaseConfig } from './config/database.config';
import { UploadModule } from './upload/upload.module';
import { ProductsModule } from './products/products.module';
import { CommercialOffersModule } from './commercial-offers/commercial-offers.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: getDatabaseConfig,
		}),
		ServeStaticModule.forRoot({
			rootPath: join(__dirname, '..', 'public'),
			exclude: ['/api*'],
		}),
		UploadModule,
		ProductsModule,
		CommercialOffersModule,
	],
})
export class AppModule { }