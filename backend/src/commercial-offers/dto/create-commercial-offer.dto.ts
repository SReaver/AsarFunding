import { IsNotEmpty, IsNumber, IsString, IsDate, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
	@IsNumber()
	number?: number;

	@IsNotEmpty()
	@IsString()
	name: string;

	@IsString()
	unit?: string;

	@IsNotEmpty()
	@IsNumber()
	@Min(1)
	quantity: number;

	@IsNotEmpty()
	@IsNumber()
	@Min(0)
	price: number;

	@IsNotEmpty()
	@IsString()
	supplier: string;
}

export class CreateCommercialOfferDto {
	@IsNotEmpty()
	@IsDate()
	@Type(() => Date)
	offerDate: Date;

	@IsNotEmpty()
	@IsString()
	objectName: string;

	@IsNumber()
	@Min(1)
	validityDays: number = 3;

	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => CreateProductDto)
	products: CreateProductDto[];
}