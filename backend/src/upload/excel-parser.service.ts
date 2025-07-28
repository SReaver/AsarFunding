import { Injectable, BadRequestException } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { CreateCommercialOfferDto, CreateProductDto } from '../commercial-offers/dto/create-commercial-offer.dto';

@Injectable()
export class ExcelParserService {
	private readonly REQUIRED_COLUMNS = ['name', 'quantity', 'price', 'supplier'];
	private readonly MONTH_NAMES = {
		'января': 0, 'февраля': 1, 'марта': 2, 'апреля': 3,
		'мая': 4, 'июня': 5, 'июля': 6, 'августа': 7,
		'сентября': 8, 'октября': 9, 'ноября': 10, 'декабря': 11
	};

	async parseExcelFile(buffer: Buffer): Promise<CreateCommercialOfferDto> {
		const workbook = new ExcelJS.Workbook();

		try {
			await workbook.xlsx.load(buffer);
		} catch (error) {
			throw new BadRequestException('Invalid file format. Expected Excel file (.xlsx or .xls)');
		}

		const worksheet = workbook.worksheets[0];
		if (!worksheet) {
			throw new BadRequestException('Excel file is empty');
		}

		const offerDate = this.extractOfferDate(worksheet);
		const objectName = this.extractObjectName(worksheet);
		const validityDays = this.extractValidityDays(worksheet);
		const products = this.extractProducts(worksheet);

		if (products.length === 0) {
			throw new BadRequestException('No products found in the file');
		}

		return {
			offerDate,
			objectName,
			validityDays,
			products,
		};
	}

	private extractOfferDate(worksheet: ExcelJS.Worksheet): Date {
		const row2 = worksheet.getRow(2);
		let dateStr = '';

		row2.eachCell((cell) => {
			const value = cell.value?.toString() || '';
			if (value.includes('Коммерческое предложение от')) {
				dateStr = value;
			}
		});

		if (!dateStr) {
			throw new BadRequestException('Commercial offer date not found');
		}

		// Более гибкое регулярное выражение
		const dateMatch = dateStr.match(/от\s*(\d{1,2})\s+([а-я]+)\s+(\d{4})г\.?/i);

		if (!dateMatch) {
			throw new BadRequestException('Invalid date format in commercial offer');
		}

		const [, day, monthName, year] = dateMatch;
		const month = this.MONTH_NAMES[monthName.toLowerCase()];

		if (month === undefined) {
			throw new BadRequestException(`Unknown month name: ${monthName}`);
		}

		return new Date(parseInt(year), month, parseInt(day));
	}

	private extractObjectName(worksheet: ExcelJS.Worksheet): string {
		const row2 = worksheet.getRow(2);
		let objectName = '';

		row2.eachCell((cell) => {
			const value = cell.value?.toString() || '';
			if (value.includes('Объект')) {
				const match = value.match(/Объект[:\s]+(.+)/);
				if (match) {
					objectName = match[1].trim();
				}
			}
		});

		if (!objectName) {
			throw new BadRequestException('Object name not found');
		}

		return objectName;
	}

	private extractValidityDays(worksheet: ExcelJS.Worksheet): number {
		const lastRow = worksheet.lastRow;
		if (!lastRow) {
			return 3;
		}

		let validityDays = 3;
		lastRow.eachCell((cell) => {
			const value = cell.value?.toString() || '';
			const match = value.match(/(\d+)\s*дн/);
			if (match) {
				validityDays = parseInt(match[1]);
			}
		});

		return validityDays;
	}

	private extractProducts(worksheet: ExcelJS.Worksheet): CreateProductDto[] {
		const products: CreateProductDto[] = [];
		const headerRow = worksheet.getRow(3);
		const columnMapping = this.getColumnMapping(headerRow);

		for (let rowNumber = 4; rowNumber <= worksheet.lastRow.number - 1; rowNumber++) {
			const row = worksheet.getRow(rowNumber);
			if (this.isEmptyRow(row)) {
				continue;
			}

			try {
				const product = this.parseProductRow(row, columnMapping, rowNumber);
				if (product) {
					products.push(product);
				}
			} catch (error) {
				throw new BadRequestException(`Error in row ${rowNumber}: ${error.message}`);
			}
		}

		return products;
	}

	private getColumnMapping(headerRow: ExcelJS.Row): Map<string, number> {
		const mapping = new Map<string, number>();
		const headers = {
			'№': 'number',
			'наименование товара': 'name',
			'ед. изм.': 'unit',
			'ед.измерения': 'unit',
			'кол-во': 'quantity',
			'количество': 'quantity', // альтернативный вариант
			'цена': 'price',
			'поставщик': 'supplier',
			'поставщик(и)': 'supplier',
			'supplier': 'supplier',
		};

		headerRow.eachCell((cell, colNumber) => {
			const value = cell.value?.toString().trim().toLowerCase().replace(/\s+/g, ' ') || '';
			const mappedName = headers[value];
			if (mappedName) {
				mapping.set(mappedName, colNumber);
			}
		});

		// Check required columns
		for (const column of this.REQUIRED_COLUMNS) {
			if (!mapping.has(column)) {
				throw new BadRequestException(`Missing required column: ${column}`);
			}
		}

		return mapping;
	}

	private isEmptyRow(row: ExcelJS.Row): boolean {
		let isEmpty = true;
		row.eachCell((cell) => {
			if (cell.value) {
				isEmpty = false;
			}
		});
		return isEmpty;
	}

	private parseProductRow(row: ExcelJS.Row, columnMapping: Map<string, number>, rowNumber: number): CreateProductDto | null {
		const getValue = (column: string): any => {
			const colNumber = columnMapping.get(column);
			if (!colNumber) return null;
			return row.getCell(colNumber).value;
		};

		const name = getValue('name')?.toString().trim();
		const unit = this.parseNumber(getValue('unit'), 'unit', rowNumber);
		const quantity = this.parseNumber(getValue('quantity'), 'quantity', rowNumber);
		const price = this.parseDecimal(getValue('price'), 'price', rowNumber);
		const supplier = getValue('supplier')?.toString().trim();

		if (!name || !supplier || quantity <= 0 || price <= 0) {
			return null;
		}

		return {
			number: this.parseNumber(getValue('number'), 'number', rowNumber) || undefined,
			name,
			unit: String(unit) || undefined,
			quantity,
			price,
			supplier,
		};
	}

	private parseNumber(value: any, fieldName: string, rowNumber: number): number {
		if (value === null || value === undefined || value === '') {
			return 0;
		}

		const num = Number(value);
		if (isNaN(num)) {
			throw new Error(`Invalid ${fieldName} value: ${value}`);
		}

		return Math.floor(num);
	}

	private parseDecimal(value: any, fieldName: string, rowNumber: number): number {
		if (value === null || value === undefined || value === '') {
			return 0;
		}

		// Handle comma as decimal separator
		const strValue = value.toString().replace(',', '.');
		const num = parseFloat(strValue);

		if (isNaN(num)) {
			throw new Error(`Invalid ${fieldName} value: ${value}`);
		}

		return num;
	}
}