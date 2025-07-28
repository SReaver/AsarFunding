import { IsString, MinLength, IsOptional } from 'class-validator';

export class SearchProductsDto {
	@IsOptional()
	@IsString()
	@MinLength(2)
	query?: string;
}