import React from 'react';
import { Alert } from 'antd';

interface UploadResultProps {
  result: {
    success: boolean;
    message: string;
  };
}

export const UploadResult: React.FC<UploadResultProps> = ({ result }) => {
  return (
    <Alert
      message={result.success ? 'Загрузка успешна' : 'Ошибка загрузки'}
      description={result.message}
      type={result.success ? 'success' : 'error'}
      showIcon
      closable
    />
  );
};