# 🪙 Goblincore — персональный трекер финансов

Веб-приложение для ведения личного бюджета. Позволяет учитывать доходы и расходы, распределять их по категориям, задавать месячные лимиты и смотреть наглядную статистику.

**Стек технологий:**
*   **Frontend:** React, TypeScript, Vite, Chart.js, Axios
*   **Backend:** Node.js, Express, TypeScript, Prisma ORM
*   **База данных:** PostgreSQL (запускается через Docker)

---

## 📋 Предварительные требования

Перед началом работы убедитесь, что на вашем компьютере установлены:

1.  **Node.js** (версия 18 или 20 LTS) и **npm**. [Скачать](https://nodejs.org/)
2.  **Docker Desktop** (для запуска базы данных). [Скачать](https://www.docker.com/products/docker-desktop/)
3.  **Git**. [Скачать](https://git-scm.com/)

Проверить установку можно в терминале:
node -v
npm -v
docker --version
git --version

## Быстрый запуск

После настройки `.env` и установки зависимостей запускать все сервисы можно одной
командой из корня проекта:

```powershell
npm run dev
```

Команда автоматически запустит PostgreSQL через Docker, backend и frontend.
Приложение будет доступно по адресу http://localhost:5173, API — по адресу
http://localhost:3000, документация API — по адресу
http://localhost:3000/api-docs.

Остановить backend и frontend можно через `Ctrl+C`. Контейнер базы данных
останется запущенным и будет доступен при следующем запуске. Для его остановки
выполните:

```powershell
npm run db:down
```

# 🚀 Шаг 1. Клонирование репозитория
bash
git clone https://github.com/ksenia-zh13579/Goblincore.git
cd Goblincore

# 🗄️ Шаг 2. Запуск Базы Данных (Docker)
Мы используем Docker, чтобы не устанавливать PostgreSQL локально и избежать проблем с паролями.

Перейдите в папку backend:

bash
cd backend
Запустите контейнер с базой данных в фоновом режиме:

bash
docker compose up -d
Проверьте, что контейнер запустился: docker ps. Вы должны увидеть контейнер goblincore-db.

# ⚙️ Шаг 3. Настройка Бэкенда
Убедитесь, что вы находитесь в папке backend.

Установите зависимости:

bash
npm install
Создайте файл .env на основе шаблона:

Windows (PowerShell):

powershell
Copy-Item .env.example .env
Mac/Linux:

bash
cp .env.example .env
Откройте созданный файл backend/.env и проверьте значения. Они должны быть такими:

env
# Пароль и порт совпадают с настройками в docker-compose.yml
DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5433/finance_tracker?schema=public"

# Секретные ключи для JWT-токенов (можно оставить как есть для локальной разработки)
ACCESS_TOKEN_SECRET="super_secret_access_key_goblincore"
REFRESH_TOKEN_SECRET="super_secret_refresh_key_goblincore"

PORT=3000
NODE_ENV=development
Важно: Обратите внимание на порт 5433 (а не 5432). Мы специально пробросили порт Docker-базы на 5433, чтобы избежать конфликта, если у вас локально уже установлен PostgreSQL.

Примените схему базы данных (создайте таблицы) через Prisma:

bash
npx prisma db push
npx prisma generate
Запустите сервер бэкенда:

bash
npm run dev
В терминале должно появиться: Server started on http://localhost:3000

# 🎨 Шаг 4. Настройка Фронтенда
Откройте новый терминал (не закрывая тот, где работает бэкенд).

Перейдите в папку frontend (из корня проекта):

bash
cd frontend
Установите зависимости:

bash
npm install
Создайте файл .env (если его нет) и добавьте адрес бэкенда:

env
VITE_API_URL=http://localhost:3000
Запустите фронтенд:

bash
npm run dev
Vite напишет в терминале: ➜ Local: http://localhost:5173/

# ✅ Шаг 5. Проверка работы
Откройте в браузере: http://localhost:5173

Нажмите «Зарегистрироваться».

Примечание: пароль должен быть от 8 до 72 символов.

После успешной регистрации войдите в систему.

Попробуйте добавить доход или расход. Если карточка появилась, а в консоли нет ошибок — всё работает идеально!

# 🛠️ Частые проблемы (Troubleshooting)
🔴 Ошибка при входе/регистрации (CORS)
Если в консоли браузера вы видите Access-Control-Allow-Origin, убедитесь, что в backend/src/app.ts настроен CORS для http://localhost:5173, а бэкенд перезапущен.

🔴 Ошибка базы данных (P1000 / P1001)
Проверьте, что Docker Desktop запущен, а контейнер goblincore-db работает (docker ps).

Убедитесь, что в backend/.env в DATABASE_URL указан порт 5433.

🔴 Страница в браузере не открывается («Доступ закрыт»)
Новые версии Chrome и Яндекс.Браузера блокируют запросы к localhost.

Решение: Откройте проект в Firefox или отключите флаг chrome://flags/#local-network-access-check в настройках Chrome (поставьте Disabled и перезапустите браузер).

🔴 «Неверный email или пароль»
Проверьте, под каким email вы регистрировались. Посмотреть список пользователей в базе можно командой:

bash
docker exec -it goblincore-db psql -U postgres -d finance_tracker -c "SELECT email FROM users;"
🔴 Как остановить проект?
В терминалах нажать Ctrl+C (остановит фронт и бэк).

Чтобы остановить базу данных: в папке backend выполнить docker compose down (данные сохранятся в volume).

📁 Структура проекта
text
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
