import { prisma } from "../prisma";
import type { Request, Response } from "express";

export async function getTransactions(
    req: Request,
    res: Response
) {
    try {
        if (!req.user){
            return res.status(401).json({
                message: "Требуется авторизация",
            });
        }
        const transactions = await prisma.transactions.findMany({
            where: {
                user_id: BigInt(req.user.user_id),
            },
        });

        const result = transactions.map((transaction) => ({
            ...transaction,
            transaction_id: transaction.transaction_id.toString(),
            user_id: transaction.user_id.toString(),
            category_id: transaction.category_id.toString(),
            place_id: transaction.place_id?.toString() ?? null,
        }));

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({
            message: "Ошибка при получении транзакций",
        });
    }
}