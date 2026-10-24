# Goblincore — персональный трекер финансов

Веб-приложение для ведения личного бюджета.<br>

Функции:
- Позволяет учитывать доходы и расходы;
- распределение транзакций по категориям;
- создание месячных лимитов;
- просмотр статистики.

**Стек технологий:**
- **Frontend:** React, TypeScript, Vite, Chart.js, Axios
- **Backend:** Node.js, Express, TypeScript, Prisma ORM
- **База данных:** PostgreSQL (запуск через Docker)

## Предварительные требования

Перед началом работы убедитесь, что на вашем компьютере установлены:

1.  **Node.js** и **npm**;
2.  **Docker Desktop**;
3.  **Git**.

Проверить установку можно в терминале:
```bash
node -v
npm -v
docker --version
git --version
```
Каждую команду надо выполнять отдельно

## Быстрый запуск
Если вы уже запускали проект ранее и забыли как, то перейдите в папки frontend и backend в разных терминалах и выполните в каждом:

```bash
npm run dev
```

ВНИМАНИЕ: перед этим должен быть запущен Docker:
```bash
docker compose up -d
```

Приложение будет доступно по адресу http://localhost:5173<br>
API - http://localhost:3000<br>
swagger - http://localhost:3000/api-docs.<br>

Остановить backend и frontend можно через `Ctrl+C`.<br>
Для остановки контейнера выполните:
```bash
docker compose down
```

# Установка проекта с нуля

## Шаг 1. Клонирование репозитория
перейдите в папку, где будете клонировать репозиторий и выполните:
```bash
git clone https://github.com/ksenia-zh13579/Goblincore.git
```

перейдите в папку проекта:
```bash
cd Goblincore
```

## Шаг 2. Запуск базы данных (Docker)
ВНИМАНИЕ: перед тем, как запускать backend запустите Docker Desktop на своем устройстве

можете проверить версию Docker compose:
```bash
docker compose version
```

Перейдите в папку backend:

```bash
cd backend
```
Запустите контейнер с базой данных:

```bash
docker compose up -d
```

Можете проверить запуск контейнера, выполнив:
```bash
docker ps
```

## Шаг 3. Настройка бэкенда
Убедитесь, что вы находитесь в папке backend:
```bash
cd backend
```

Установите зависимости:
```bash
npm install
```
Создайте файл .env на основе шаблона:

Windows (PowerShell):
```powershell
Copy-Item .env.example .env
```
Mac/Linux:
```bash
cp .env.example .env
```
Откройте созданный файл backend/.env и проверьте значения.<br>
Они должны быть такими:

- url для подключения к созданной базе данных:<br>
```text
DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5433/finance_tracker?schema=public"
```

- Секретные ключи для JWT-токенов:<br>
```text
ACCESS_TOKEN_SECRET="super_secret_access_key_goblincore"
REFRESH_TOKEN_SECRET="super_secret_refresh_key_goblincore"
```

- порт и node_env:<br>
```text
PORT=3000
NODE_ENV=development
```

<hr>

Создание базы данных через Prisma:

```bash
npx prisma db push
npx prisma generate
```
Запустите сервер бэкенда:

```bash
npm run dev
```

## Шаг 4. Настройка Фронтенда
Откройте новый терминал bash

Перейдите в папку frontend:

```bash
cd frontend
```

Перед установкой основных зависимостей установите:
```bash
npm install -D "@vitejs/plugin-react@^6"
```

Установите зависимости:
```bash
npm install
```
Создайте файл .env (если его нет) и добавьте адрес бэкенда:<br>
- VITE_API_URL=http://localhost:3000

Запустите фронтенд:
```bash
npm run dev
```

## Шаг 5. Проверка работы
Откройте в браузере: http://localhost:5173<br>

Попробуйте использовать приложение

## Структура проекта
```text
Goblincore/
├── backend/               # Серверная часть (Express + Prisma)
│   ├── src/               # Исходный код
│   ├── prisma/            # Схема базы данных
│   ├── docker-compose.yml # Конфигурация базы данных
│   └── .env.example       # Шаблон переменных окружения
├── frontend/              # Клиентская часть (React + Vite)
│   ├── src/               # Исходный код
│   ├── public/            # Статические файлы (логотип)
│   └── .env.example       # Шаблон переменных окружения
└── README.md              # Этот файл
Проект выполнен в рамках контрольной работы №2 по дисциплине СПО. Команда «Топовый игнор».
```
