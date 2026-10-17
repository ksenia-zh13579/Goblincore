# Goblincore - персональный трекер финансов

Проект для КР № 2 по СПО

## Команда

"Топовый игнор"
Участники: Гузаирова О. Р., Ходжакулыев Р. Р., Жужлева К. А., Шульга М. А., Крестин К. Б.

## Инструкция по запуску сервера

1. Для успешного запуска сервера вам нужно установить:
    - Node.js и npm
    - PostgreSQL
    - Git

(После установки лучше проверить версии в терминале:
```bash
node -v
npm -v
git --version
```
)

2. Скачай проект с GitHub:
```bash
git clone https://github.com/ksenia-zh13579/Goblincore.git
```

3. Перейди в папку проекта и зайди в backend:
```
cd Goblincore/backend
```

4. Установи зависимости:
```bash
npm ci
```

Команда будет использовать package-lock.json для установки зависимостей, зафиксированных в проекте.<br>

Если файл package-lock.json отсутствует, то сначала выполни:
```bash
npm install
```

5. Создай пустую базу данных в PostgreSQL:

В pgAdmin подключись к локальному серверу и создай базу через раздел Database.

(если вам доступен psql, то можно создать через команду:
```bash
psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE finance_tracker;"
```
Здесь postgres - это пользователь. Если он у вас другой, то замените postgres на нужное имя.<br>
finance_tracker - название базы. Можете заменить не то, которое вам удобно.
)

6. Настрой файл .env:

В корне репозитория есть шаблон: .env.example<br>
Скопируйте его в .env на backend и заполните занчения:
для bash:<br>
```bash
cp .env.example backend/.env
```
для powershell:<br>
```powershell
Copy-Item .env.example backend/.env
```
Пример значений в .env:<br>
```
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/finance_tracker?schema=public"

JWT_ACCESS_SECRET="your_own_long_random_access_secret"
JWT_REFRESH_SECRET="your_own_long_random_refresh_secret"

PORT=3000
NODE_ENV=development
```

7. Создай таблицы с помощью Prisma

Сначала проверь, есть ли миграции в папке prisma: migrations/

- если она есть, то последовательно выполни:
```bash
npx prisma migrate deploy
npx prisma generate
```

(первая команда применит существующие миграции к новой базе, а вторая создаст Prisma Client)

- если папки миграций нет, то можно создать структуру напрямую:
```bash
npx prisma db push
npx prisma generate
```

(первая команда синхронизирует структуру базы данных с schema.prisma без создания истории миграций)<br>

8. Запусти сервер:
```bash
npm run dev
```

В терминале должно появиться:
```text 
Server started on http://localhost:3000
```

(3000 может поменяться в зависимотси от порта, который вы указали)
