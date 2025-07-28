import { useState } from 'react';
import { ConfigProvider, Divider } from 'antd';
import { Layout } from './components/Layout/Layout';
import { UploadExcel } from './components/Upload/UploadExcel';
import { ProductSearch } from './components/Search/ProductSearch';

function App() {
  const [uploadKey, setUploadKey] = useState(0);

  const handleUploadSuccess = () => {
    // Force refresh of search results by updating key
    setUploadKey(prev => prev + 1);
  };

  return (
    <ConfigProvider>
      <Layout>
        <UploadExcel onUploadSuccess={handleUploadSuccess} />
        <Divider />
        <ProductSearch key={uploadKey} />
      </Layout>
    </ConfigProvider>
  );
}

export default App;