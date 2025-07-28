import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductResponseDto } from './dto/product-response.dto';
import { SearchProductsDto } from './dto/search-products.dto';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ProductsService {
	constructor(
		@InjectRepository(Product)
		private productRepository: Repository<Product>,
	) { }

	async searchProducts(searchDto: SearchProductsDto): Promise<{ products: ProductResponseDto[]; total: number }> {
		const query = this.productRepository
			.createQueryBuilder('product')
			.leftJoinAndSelect('product.commercialOffer', 'commercialOffer');

		if (searchDto.query && searchDto.query.length >= 2) {
			query.where('LOWER(product.name) LIKE LOWER(:query)', { query: `%${searchDto.query}%` });
		}

		query.orderBy('commercialOffer.expires_at', 'DESC')
			.addOrderBy('product.name', 'ASC')
			.limit(1000);

		const [products, total] = await query.getManyAndCount();

		const productResponses = products.map(product => this.mapToResponseDto(product));

		return { products: productResponses, total };
	}

	async exportToExcel(searchDto: SearchProductsDto): Promise<Buffer> {
		const { products } = await this.searchProducts(searchDto);

		const workbook = new ExcelJS.Workbook();
		const worksheet = workbook.addWorksheet('Products');

		// Add headers
		worksheet.columns = [
			{ header: '№', key: 'number', width: 10 },
			{ header: 'Наименование товара', key: 'name', width: 40 },
			{ header: 'Ед. изм.', key: 'unit', width: 10 },
			{ header: 'Кол-во', key: 'quantity', width: 12 },
			{ header: 'Цена', key: 'price', width: 15 },
			{ header: 'Поставщик', key: 'supplier', width: 30 },
			{ header: 'Статус', key: 'status', width: 12 },
			{ header: 'Дата предложения', key: 'offerDate', width: 15 },
			{ header: 'Действует до', key: 'expiresAt', width: 15 },
		];

		// Add data
		products.forEach((product, index) => {
			worksheet.addRow({
				number: index + 1,
				name: product.name,
				unit: product.unit || '',
				quantity: product.quantity,
				price: product.price,
				supplier: product.supplier,
				status: product.isExpired ? 'Просрочено' : 'Актуально',
				offerDate: product.offerDate,
				expiresAt: product.expiresAt,
			});
		});

		const buffer = await workbook.xlsx.writeBuffer();
		return Buffer.from(buffer);
	}

	private mapToResponseDto(product: Product): ProductResponseDto {
		const now = new Date();
		const expiresAt = new Date(product.commercialOffer.expiresAt);
		const isExpired = now > expiresAt;

		return {
			id: product.id,
			name: product.name,
			unit: product.unit || '',
			quantity: product.quantity,
			price: product.price,
			supplier: product.supplier,
			isExpired,
			offerDate: new Date(product.commercialOffer.offerDate).toISOString().split('T')[0],
			expiresAt: expiresAt.toISOString().split('T')[0],
		};
	}
}