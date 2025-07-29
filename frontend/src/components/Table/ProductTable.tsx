import React, { useState } from 'react';
import { Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Product } from '../../types';
import { formatPrice, formatDate } from '../../utils/format';

interface ProductTableProps {
  products: Product[];
  loading: boolean;
}

export const ProductTable: React.FC<ProductTableProps> = ({ products, loading }) => {
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const columns: ColumnsType<Product> = [
    {
      title: 'Наименование товара',
      dataIndex: 'name',
      key: 'name',
      width: '25%',
      render: (text: string, _: Product) => (
        <span>
          {text}
        </span>
      ),
    },
    {
      title: 'Ед. изм.',
      dataIndex: 'unit',
      key: 'unit',
      width: '10%',
    },
    {
      title: 'Кол-во',
      dataIndex: 'quantity',
      key: 'quantity',
      width: '10%',
      align: 'right',
    },
    {
      title: 'Цена',
      dataIndex: 'price',
      key: 'price',
      width: '15%',
      align: 'right',
      render: (price: number) => formatPrice(price),
    },
    {
      title: 'Поставщик',
      dataIndex: 'supplier',
      key: 'supplier',
      width: '20%',
    },
    {
      title: 'Статус',
      key: 'status',
      width: '10%',
      render: (_: any, record: Product) => (
        <Tag color={record.isExpired ? 'error' : 'success'}>
          {record.isExpired ? 'Просрочено' : 'Актуально'}
        </Tag>
      ),
    },
    {
      title: 'Дата предложения',
      dataIndex: 'offerDate',
      key: 'offerDate',
      width: '10%',
      render: (date: string) => formatDate(date),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={products}
      rowKey="id"
      loading={loading}
      pagination={{
        current: currentPage,
        pageSize: pageSize,
        showSizeChanger: true,
        showTotal: (total) => `Всего ${total} товаров`,
        onChange: (page, size) => {
          setCurrentPage(page);
          if (size !== pageSize) {
            setPageSize(size);
            setCurrentPage(1);
          }
        },
        onShowSizeChange: (_, size) => {
          setPageSize(size);
          setCurrentPage(1);
        },
      }}
      scroll={{ x: 1000 }}
    />
  );
};