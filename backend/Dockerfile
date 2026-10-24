FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
COPY prisma7.config.ts tsconfig.json ./

ARG DATABASE_URL=postgresql://postgres:postgrespassword@db:5432/finance_tracker
ENV DATABASE_URL=${DATABASE_URL}
RUN npx prisma generate

COPY src ./src

EXPOSE 3000

CMD ["npm", "run", "dev"]
