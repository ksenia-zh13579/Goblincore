import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error('DATABASE_URL не задан в .env');
}

const adapter = new PrismaPg({
    connectionString,
});

export const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
    adapter,
});