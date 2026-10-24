import type { Request, Response } from "express";
import { prisma } from "../prisma";
import { parsePositiveBigInt } from "../services/type_and_parse_functions";

export async function getMyPlaces(req: Request, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Требуется авторизация" });
        }

        const userId = parsePositiveBigInt(req.user.user_id);
        if (userId === null) {
            return res.status(401).json({ message: "Некорректные данные авторизации" });
        }

        const places = await prisma.places.findMany({
            where: { user_id: userId },
            orderBy: { name: "asc" },
            select: { place_id: true, name: true },
        });

        return res.status(200).json(
            places.map((place) => ({
                place_id: place.place_id.toString(),
                name: place.name,
            })),
        );
    } catch (error) {
        console.error("ОШИБКА ПОЛУЧЕНИЯ МЕСТ:", error);
        return res.status(500).json({ message: "Ошибка при получении магазинов" });
    }
}
