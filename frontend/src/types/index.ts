export interface Product {
	id: number;
	name: string;
	unit: string;
	quantity: number;
	price: number;
	supplier: string;
	isExpired: boolean;
	offerDate: string;
	expiresAt: string;
}

export interface SearchResponse {
	products: Product[];
	total: number;
}

export interface UploadResponse {
	success: boolean;
	message: string;
	recordsCount?: number;
	errors?: string[];
}