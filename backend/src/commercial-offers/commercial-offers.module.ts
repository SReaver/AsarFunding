import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommercialOffersService } from './commercial-offers.service';
import { CommercialOffer } from './entities/commercial-offer.entity';
import { Product } from '../products/entities/product.entity';

@Module({
	imports: [TypeOrmModule.forFeature([CommercialOffer, Product])],
	providers: [CommercialOffersService],
	exports: [CommercialOffersService],
})
export class CommercialOffersModule { }