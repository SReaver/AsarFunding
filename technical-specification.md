# Technical Specification: Commercial Offers Management System

## 1. Project Overview

### 1.1 System Purpose
Web application for uploading, storing, and searching products from commercial offers in Excel format. The system allows uploading Excel files with products from different suppliers, searching products by name, and exporting search results back to Excel.

### 1.2 Core Features
- Upload commercial offers from Excel files
- Search products by partial name match
- Display results considering offer validity period
- Export search results to Excel
- Log upload operations

## 2. Technology Stack

### 2.1 Backend
- **Framework**: NestJS (latest stable version)
- **ORM**: TypeORM
- **Database**: PostgreSQL 15+
- **Validation**: class-validator, class-transformer
- **Excel processing**: exceljs
- **Static files**: @nestjs/serve-static

### 2.2 Frontend
- **Framework**: React 18+
- **Build tool**: Vite
- **UI library**: Ant Design 5+
- **HTTP client**: Native fetch API
- **Language**: TypeScript

### 2.3 Infrastructure
- **Containerization**: Docker, Docker Compose
- **Node.js**: LTS version (minimum 18.x)

## 3. Database Schema

### 3.1 Table `commercial_offers`
```sql
CREATE TABLE commercial_offers (
    id SERIAL PRIMARY KEY,
    offer_date DATE NOT NULL,
    object_name VARCHAR(255) NOT NULL,
    validity_days INTEGER NOT NULL DEFAULT 3,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL
);
```

### 3.2 Table `products`
```sql
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    commercial_offer_id INTEGER NOT NULL REFERENCES commercial_offers(id) ON DELETE CASCADE,
    number INTEGER,
    name VARCHAR(500) NOT NULL,
    unit VARCHAR(100),
    quantity INTEGER NOT NULL,
    price DECIMAL(12, 2) NOT NULL,
    supplier VARCHAR(255) NOT NULL
);
```

### 3.3 Table `upload_logs`
```sql
CREATE TABLE upload_logs (
    id SERIAL PRIMARY KEY,
    upload_date TIMESTAMP NOT NULL DEFAULT NOW(),
    filename VARCHAR(255) NOT NULL,
    records_count INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'error')),
    error_message TEXT
);
```

## 4. Functional Requirements

### 4.1 Excel File Upload

#### 4.1.1 User Interface
- "Upload from Excel" button on main page
- Drag & Drop area for file upload
- Upload progress indicator
- Display upload result (success/error)

#### 4.1.2 File Processing
- **File format**: .xlsx, .xls
- **Maximum size**: 10 MB
- **File structure**:
  - Row 1: Header (may be merged cells)
  - Row 2: Commercial offer info and object name
  - Row 3: Column headers
  - Rows 4+: Product data
  - Last row: Offer validity period

#### 4.1.3 Data Parsing
- Extract offer date from format "Коммерческое предложение от DD месяц YYYYг."
- Extract object name from string after "Объект"
- Extract validity period from last row (default 3 days)
- Parse products with columns: №, Product name, Unit, Quantity, Price, Supplier

#### 4.1.4 Validation Rules
- **Required fields**: name, quantity, price, supplier
- **Quantity**: integer > 0
- **Price**: number > 0, support "." and "," as decimal separators
- **Empty rows**: skip silently
- **Duplicates**: allowed (same product from different suppliers)

#### 4.1.5 Database Storage
- Transactional save (all or nothing)
- On re-upload - complete data replacement
- Auto-calculate `expires_at = created_at + validity_days`
- Log operation in `upload_logs`

#### 4.1.6 Error Handling
- Human-readable error messages:
  - "Invalid file format. Expected Excel file (.xlsx or .xls)"
  - "File too large. Maximum size is 10 MB"
  - "Commercial offer date not found"
  - "Missing required columns: [list]"
  - "Error in row X: [problem description]"

### 4.2 Product Search

#### 4.2.1 Search Interface
- Input field with placeholder "Enter product name"
- Auto-search after typing 2+ characters
- 300ms debounce for optimization
- Clear search button

#### 4.2.2 Search Algorithm
- Search in `products.name` field
- Case-insensitive partial search (ILIKE '%query%')
- Include all matches from all commercial offers

#### 4.2.3 Results Display
- Table with columns:
  - Product name
  - Unit
  - Quantity
  - Price (formatted with thousand separators)
  - Supplier
  - Status (Active/Expired)
- Expired offers displayed with strikethrough text
- Default sorting: active first, then by name

#### 4.2.4 Status Determination
- Backend comparison: `current_timestamp > expires_at`
- Status calculated dynamically on each request
- No caching of status

### 4.3 Excel Export

#### 4.3.1 Export Interface
- "Export to Excel" button appears when search results exist
- Button disabled when no results
- Loading state during export generation

#### 4.3.2 Export Format
- Filename: `products_export_YYYY-MM-DD_HH-mm-ss.xlsx`
- Columns:
  - Number (auto-generated)
  - Product name
  - Unit
  - Quantity
  - Price
  - Supplier
  - Status (Active/Expired)
  - Offer date
  - Expires at
- No styling or formatting
- Plain data export

#### 4.3.3 Export Logic
- Export current search results only
- Include both active and expired offers
- Generate on backend and stream to client

## 5. API Endpoints

### 5.1 Upload Endpoint
```
POST /api/upload
Content-Type: multipart/form-data
Body: file (Excel file)

Response Success (200):
{
  "success": true,
  "message": "Successfully uploaded N products",
  "recordsCount": N
}

Response Error (400):
{
  "success": false,
  "message": "Detailed error message",
  "errors": ["List of specific errors if applicable"]
}
```

### 5.2 Search Endpoint
```
GET /api/products/search?query={searchTerm}

Response (200):
{
  "products": [
    {
      "id": 1,
      "name": "Product name",
      "unit": "pcs",
      "quantity": 10,
      "price": 1500.00,
      "supplier": "Supplier LLC",
      "isExpired": false,
      "offerDate": "2025-05-28",
      "expiresAt": "2025-05-31"
    }
  ],
  "total": N
}
```

### 5.3 Export Endpoint
```
GET /api/products/export?query={searchTerm}

Response: Excel file stream
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="products_export_2025-05-28_14-30-00.xlsx"
```

## 6. Project Structure

### 6.1 Backend Structure
```
backend/
├── src/
│   ├── commercial-offers/
│   │   ├── commercial-offers.module.ts
│   │   ├── commercial-offers.service.ts
│   │   ├── commercial-offers.controller.ts
│   │   ├── dto/
│   │   │   └── create-commercial-offer.dto.ts
│   │   └── entities/
│   │       └── commercial-offer.entity.ts
│   ├── products/
│   │   ├── products.module.ts
│   │   ├── products.service.ts
│   │   ├── products.controller.ts
│   │   ├── dto/
│   │   │   ├── search-products.dto.ts
│   │   │   └── product-response.dto.ts
│   │   └── entities/
│   │       └── product.entity.ts
│   ├── upload/
│   │   ├── upload.module.ts
│   │   ├── upload.service.ts
│   │   ├── upload.controller.ts
│   │   ├── excel-parser.service.ts
│   │   └── entities/
│   │       └── upload-log.entity.ts
│   ├── common/
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   └── interceptors/
│   │       └── transform.interceptor.ts
│   ├── config/
│   │   ├── database.config.ts
│   │   └── app.config.ts
│   └── app.module.ts
├── public/ (built frontend)
├── uploads/ (temporary upload directory)
├── .env
├── tsconfig.json
├── nest-cli.json
└── package.json
```

### 6.2 Frontend Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── Layout/
│   │   │   └── Layout.tsx
│   │   ├── Upload/
│   │   │   ├── UploadExcel.tsx
│   │   │   └── UploadResult.tsx
│   │   ├── Search/
│   │   │   ├── ProductSearch.tsx
│   │   │   └── SearchInput.tsx
│   │   └── Table/
│   │       ├── ProductTable.tsx
│   │       └── ExportButton.tsx
│   ├── services/
│   │   └── api.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   └── format.ts
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## 7. Frontend-Backend Integration

### 7.1 Build Process
1. Frontend built with Vite: `npm run build`
2. Output copied to `backend/public`
3. NestJS serves static files via ServeStaticModule

### 7.2 ServeStaticModule Configuration
```typescript
ServeStaticModule.forRoot({
  rootPath: join(__dirname, '..', 'public'),
  exclude: ['/api*'],
})
```

### 7.3 API Communication
- All API calls use `/api` prefix
- Frontend uses native fetch with proper error handling
- Request/Response types shared via TypeScript interfaces

## 8. Docker Configuration

### 8.1 Docker Compose Structure
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: commercial_offers
      POSTGRES_USER: app_user
      POSTGRES_PASSWORD: app_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  app:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      - postgres
    environment:
      DATABASE_HOST: postgres
      DATABASE_PORT: 5432
      DATABASE_USER: app_user
      DATABASE_PASSWORD: app_password
      DATABASE_NAME: commercial_offers
    volumes:
      - ./uploads:/app/uploads

volumes:
  postgres_data:
```

### 8.2 Dockerfile (Multi-stage)
```dockerfile
# Frontend build stage
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Backend build stage
FROM node:18-alpine AS backend-build
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci
COPY backend/ ./
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app
COPY --from=backend-build /app/dist ./dist
COPY --from=backend-build /app/node_modules ./node_modules
COPY --from=frontend-build /app/frontend/dist ./public
EXPOSE 3000
CMD ["node", "dist/main"]
```

## 9. Environment Variables

### 9.1 Backend (.env)
```
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=app_user
DATABASE_PASSWORD=app_password
DATABASE_NAME=commercial_offers

# App
PORT=3000
UPLOAD_MAX_FILE_SIZE=10485760
```

## 10. Error Handling

### 10.1 Global Error Handler
- Catch all unhandled exceptions
- Log errors with context
- Return user-friendly error messages
- Never expose internal errors to client

### 10.2 Validation Errors
- Return specific field errors
- Provide clear instructions for fixing
- HTTP status 400 for validation errors

### 10.3 Upload Errors
- File format validation
- Size validation
- Content validation with row numbers
- Transaction rollback on any error

## 11. Security Considerations

### 11.1 File Upload Security
- Validate MIME types
- Limit file size
- Scan for malicious content
- Store in temporary directory with cleanup

### 11.2 API Security
- Input validation on all endpoints
- SQL injection prevention via TypeORM
- XSS prevention in responses
- Rate limiting on upload endpoint

## 12. Performance Considerations

### 12.1 Database
- Index on products.name for search
- Index on commercial_offers.expires_at
- Batch insert for products

### 12.2 Search Optimization
- Debounce search input
- Limit results to 1000 records
- Use database-level text search

### 12.3 File Processing
- Stream large files
- Process in chunks
- Clear temporary files after processing

## 13. Deployment Instructions

### 13.1 Development
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app
```

### 13.2 Production Build
```bash
# Build and start
docker-compose -f docker-compose.prod.yml up -d --build
```

## 14. Testing Requirements

### 14.1 Manual Testing Scenarios
1. Upload valid Excel file
2. Upload invalid file format
3. Upload file with missing required fields
4. Search with various queries
5. Export empty results
6. Export large result set
7. Check expired offers display

### 14.2 Edge Cases
- Empty Excel file
- Excel with only headers
- Very large files (>10MB)
- Special characters in product names
- Concurrent uploads
- Network interruption during upload