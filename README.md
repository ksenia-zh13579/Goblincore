# Goblincore - персональный трекер финансов

Проект для КР № 2 по СПО

## Команда

"Топовый игнор"
Участники: Гузаирова О. Р., Ходжакулыев Р. Р., Жужлева К. А., Шульга М. А., Крестин К. Б.

## Запуск бэкенда

### 1. Запуск PostgreSQL

Убедитесь, что запущен сервер PostgreSQL и существует база `finance_tracker`.

В файле `backend/.env` по аналогии с `backend/.env.example` укажите:

```env
DATABASE_URL="postgresql://postgres:пароль@localhost:5432/finance_tracker"
ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=
```

Фактический пользователь, пароль и имя базы должны соответствовать вашей установке PostgreSQL.

### 2. Установка зависимостей backend

В PowerShell:

```powershell
cd backend
npm install
```

### 3. Генерация Prisma Client

Это нужно сделать после установки зависимостей и после изменения Prisma-схемы:

```powershell
npx prisma generate
```

Команда создаёт клиент из `schema.prisma`.

### 4. Создание структуры базы данных

Если база новая и схема ещё не создана, для разработки можно выполнить:

```powershell
npx prisma db push
```

`db push` синхронизирует базу с файлом `schema.prisma`.

Проверить схему можно командой:

```powershell
npx prisma validate
```

### 5. Запуск backend

```powershell
npm run dev
```

Backend будет доступен по адресу:

```text
http://localhost:3000
```

### Полная последовательность для первого запуска

```powershell
cd backend
npm install
npx prisma generate
npx prisma db push
npm run dev
```

В дальнейшем, если зависимости уже установлены, база создана и схема не менялась, достаточно:

```powershell
cd backend
npm run dev
```

## Запуск фронтенда

```
cd frontend
npm run dev
```

## Запуск через Docker Compose

Для запуска всего проекта нужны Docker Desktop и Docker Compose:

```powershell
docker compose up --build
```

После запуска:

- frontend: http://localhost:5175
- backend: http://localhost:3000
- Swagger: http://localhost:3000/api-docs

PostgreSQL запускается в отдельном контейнере, а данные сохраняются в volume
`postgres_data`. При старте backend автоматически выполняется `npx prisma db push`,
поэтому отдельно запускать Prisma не требуется.

Для остановки контейнеров:

```powershell
docker compose down
```

Чтобы удалить также данные PostgreSQL:

```powershell
docker compose down -v
```
