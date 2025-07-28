import {
	Controller,
	Get,
	Query,
	Res,
	ValidationPipe
} from '@nestjs/common';
import { Response } from 'express';
import { ProductsService } from './products.service';
import { SearchProductsDto } from './dto/search-products.dto';

@Controller('api/products')
export class ProductsController {
	constructor(private readonly productsService: ProductsService) { }

	@Get('search')
	async searchProducts(
		@Query(new ValidationPipe({ transform: true })) searchDto: SearchProductsDto,
	) {
		return await this.productsService.searchProducts(searchDto);
	}

	@Get('export')
	async exportProducts(
		@Query(new ValidationPipe({ transform: true })) searchDto: SearchProductsDto,
		@Res() res: Response,
	) {
		const buffer = await this.productsService.exportToExcel(searchDto);
		const filename = `products_export_${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.xlsx`;

		res.set({
			'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			'Content-Disposition': `attachment; filename="${filename}"`,
		});

		res.send(buffer);
	}
}