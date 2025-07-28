# Система управления коммерческими предложениями

## Описание

Веб-приложение для загрузки, хранения и поиска товаров из коммерческих предложений в формате Excel. Позволяет загружать файлы, искать товары по названию, экспортировать результаты поиска и вести журнал загрузок.

---

## Структура проекта

- `backend` — серверная часть на NestJS, PostgreSQL, TypeORM
- `frontend` — клиентская часть на React, Vite, Ant Design

---

## Быстрый старт

### 1. Клонируйте репозиторий

```bash
git clone <адрес_репозитория>
cd <имя репозитория>
```

### 2. Запуск через Docker (рекомендуется)

```bash
docker-compose up --build
```

- Backend будет доступен на `http://localhost:3000`
- Frontend — на `http://localhost:5173`

---

### 3. Ручной запуск (локально)

#### Backend

```bash
cd backend
cp .env.example .env # настройте параметры подключения к БД
npm install
npm run start:dev
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Переменные окружения

Настройте файл `backend/.env`:

```
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=pass123
DATABASE_NAME=postgres
PORT=3000
UPLOAD_MAX_FILE_SIZE=10485760
```

---

## База данных

- Используется PostgreSQL 15+
- Таблицы создаются автоматически через TypeORM

---

## Основные команды

### Backend

- `npm run start:dev` — запуск сервера в режиме разработки
- `npm run build` — сборка

### Frontend

- `npm run dev` — запуск фронтенда
- `npm run build` — сборка
