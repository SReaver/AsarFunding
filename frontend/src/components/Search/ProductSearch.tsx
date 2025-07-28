import React, { useState, useEffect, useCallback } from 'react';
import { SearchInput } from './SearchInput';
import { ProductTable } from '../Table/ProductTable';
import { ExportButton } from '../Table/ExportButton';
import { ApiService } from '../../services/api';
import { Product } from '../../types';
import { message } from 'antd';

export const ProductSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const searchProducts = useCallback(async (query: string) => {
    if (query.length < 2 && query.length > 0) {
      return;
    }

    setLoading(true);
    try {
      const response = await ApiService.searchProducts(query);
      setProducts(response.products);
      setTotal(response.total);
    } catch (error) {
      message.error('Ошибка поиска товаров');
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchProducts(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchProducts]);

  const handleExport = async () => {
    try {
      await ApiService.exportProducts(searchQuery);
      message.success('Экспорт завершён успешно');
    } catch (error) {
      message.error('Ошибка экспорта товаров');
      console.error('Export error:', error);
    }
  };

  return (
    <div>
      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
      />
      
      {products.length > 0 && (
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Найдено {total} товаров</span>
          <ExportButton onClick={handleExport} disabled={products.length === 0} />
        </div>
      )}
      
      <ProductTable
        products={products}
        loading={loading}
      />
    </div>
  );
};