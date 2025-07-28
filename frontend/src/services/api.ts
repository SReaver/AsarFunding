import { SearchResponse, UploadResponse } from '../types';

export class ApiService {
	private static async handleResponse<T>(response: Response): Promise<T> {
		if (!response.ok) {
			const error = await response.json().catch(() => ({ message: 'Unknown error' }));
			throw new Error(error.message || `HTTP error! status: ${response.status}`);
		}
		return response.json();
	}

	static async uploadFile(file: File): Promise<UploadResponse> {
		const formData = new FormData();
		formData.append('file', file);

		const response = await fetch('/api/upload', {
			method: 'POST',
			body: formData,
		});

		return this.handleResponse<UploadResponse>(response);
	}

	static async searchProducts(query: string): Promise<SearchResponse> {
		const params = new URLSearchParams();
		if (query) {
			params.append('query', query);
		}

		const response = await fetch(`/api/products/search?${params}`);
		return this.handleResponse<SearchResponse>(response);
	}

	static async exportProducts(query: string): Promise<void> {
		const params = new URLSearchParams();
		if (query) {
			params.append('query', query);
		}

		const response = await fetch(`/api/products/export?${params}`);

		if (!response.ok) {
			throw new Error('Export failed');
		}

		const blob = await response.blob();
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;

		// Extract filename from Content-Disposition header
		const contentDisposition = response.headers.get('Content-Disposition');
		const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
		const filename = filenameMatch ? filenameMatch[1] : 'products_export.xlsx';

		a.download = filename;
		document.body.appendChild(a);
		a.click();
		window.URL.revokeObjectURL(url);
		document.body.removeChild(a);
	}
}