import React, { useState } from 'react';
import { Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { ApiService } from '../../services/api';
import { UploadResult } from './UploadResult';

interface UploadExcelProps {
  onUploadSuccess: () => void;
}

export const UploadExcel: React.FC<UploadExcelProps> = ({ onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [lastResult, setLastResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleUpload: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError } = options;
    setUploading(true);
    setLastResult(null);

    try {
      const result = await ApiService.uploadFile(file as File);
      setLastResult({ success: result.success, message: result.message });
      
      if (result.success) {
        message.success(result.message);
        onSuccess?.(result);
        onUploadSuccess();
      } else {
        message.error(result.message);
        onError?.(new Error(result.message));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка загрузки';
      setLastResult({ success: false, message: errorMessage });
      message.error(errorMessage);
      onError?.(error as Error);
    } finally {
      setUploading(false);
    }
  };

  const uploadProps: UploadProps = {
    name: 'file',
    accept: '.xlsx,.xls',
    showUploadList: false,
    customRequest: handleUpload,
    beforeUpload: (file) => {
      const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                      file.type === 'application/vnd.ms-excel' ||
                      file.name.endsWith('.xlsx') ||
                      file.name.endsWith('.xls');
      
      if (!isExcel) {
        message.error('Можно загружать только Excel-файлы!');
        return false;
      }
      
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('Размер файла должен быть не более 10 МБ!');
        return false;
      }
      
      return true;
    },
  };

  return (
    <div style={{ marginBottom: 24 }}>
      <Upload.Dragger {...uploadProps} style={{ marginBottom: 16 }}>
        <p className="ant-upload-drag-icon">
          <UploadOutlined style={{ fontSize: 48, color: '#1890ff' }} />
        </p>
        <p className="ant-upload-text">Кликните или перетащите Excel-файл для загрузки</p>
        <p className="ant-upload-hint">
          Поддерживаются файлы .xlsx и .xls. Максимальный размер — 10 МБ.
        </p>
        <Button 
          type="primary" 
          icon={<UploadOutlined />} 
          loading={uploading}
          style={{ marginTop: 16 }}
        >
          {uploading ? 'Загрузка...' : 'Загрузить из Excel'}
        </Button>
      </Upload.Dragger>
      
      {lastResult && <UploadResult result={lastResult} />}
    </div>
  );
};