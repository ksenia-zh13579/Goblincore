import { prisma } from "../prisma";
import { Request, Response } from "express";

export async function getTransactions(
    req: Request,
    res: Response
) {
    try {
        const transactions = await prisma.transactions.findMany();

        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({
            message: "Ошибка при получении транзакций",
        });
    }
}