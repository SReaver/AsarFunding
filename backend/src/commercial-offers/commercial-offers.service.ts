import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner } from 'typeorm';
import { CommercialOffer } from './entities/commercial-offer.entity';
import { Product } from '../products/entities/product.entity';
import { CreateCommercialOfferDto } from './dto/create-commercial-offer.dto';

@Injectable()
export class CommercialOffersService {
	constructor(
		@InjectRepository(CommercialOffer)
		private commercialOfferRepository: Repository<CommercialOffer>
	) { }

	async create(createDto: CreateCommercialOfferDto, queryRunner?: QueryRunner): Promise<CommercialOffer> {
		const manager = queryRunner ? queryRunner.manager : this.commercialOfferRepository.manager;

		// Delete existing offers for the same object
		await manager.delete(CommercialOffer, { objectName: createDto.objectName });

		// Create new commercial offer
		const commercialOffer = new CommercialOffer();
		commercialOffer.offerDate = createDto.offerDate;
		commercialOffer.objectName = createDto.objectName;
		commercialOffer.validityDays = createDto.validityDays;
		commercialOffer.createdAt = new Date();
		commercialOffer.expiresAt = new Date(commercialOffer.offerDate.getDate() + createDto.validityDays * 24 * 60 * 60 * 1000);

		const savedOffer = await manager.save(CommercialOffer, commercialOffer);

		// Create products
		const products = createDto.products.map((productDto, index) => {
			const product = new Product();
			product.number = productDto.number || index + 1;
			product.name = productDto.name;
			product.unit = productDto.unit;
			product.quantity = productDto.quantity;
			product.price = productDto.price;
			product.supplier = productDto.supplier;
			product.commercialOfferId = savedOffer.id;
			return product;
		});

		await manager.save(Product, products);

		savedOffer.products = products;
		return savedOffer;
	}
}