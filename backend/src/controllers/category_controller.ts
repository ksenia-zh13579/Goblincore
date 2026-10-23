import type { Request, Response } from "express";
import { prisma } from "../prisma";

function userId(req: Request) {
    return req.user ? BigInt(req.user.user_id) : null;
}

export async function getMyCategories(req: Request, res: Response) {
    const id = userId(req);
    const type = req.query.type;
    if (id === null) return res.status(401).json({ message: "Требуется авторизация" });
    if (type !== "income" && type !== "expense") {
        return res.status(400).json({ message: "Тип должен быть income или expense" });
    }
    const categories = await prisma.categories.findMany({
        where: { user_id: id, category_type: type },
        include: { category_limits: { select: { amount: true } } },
        orderBy: { name: "asc" },
    });
    return res.json(categories.map((category) => ({
        category_id: category.category_id.toString(),
        name: category.name,
        limit: category.category_limits[0]?.amount?.toString() ?? null,
    })));
}

export async function createCategory(req: Request, res: Response) {
    const id = userId(req);
    const { name, type, limit } = req.body ?? {};
    if (id === null) return res.status(401).json({ message: "Требуется авторизация" });
    if (typeof name !== "string" || !name.trim() || (type !== "income" && type !== "expense")) {
        return res.status(400).json({ message: "Укажите название и корректный тип категории" });
    }
    try {
        const category = await prisma.categories.create({
            data: { user_id: id, name: name.trim(), category_type: type },
        });
        if (type === "expense" && limit !== undefined && Number(limit) > 0) {
            await prisma.category_limits.create({
                data: { user_id: id, category_id: category.category_id, amount: String(limit) },
            });
        }
        return res.status(201).json({
            category_id: category.category_id.toString(),
            name: category.name,
            limit: type === "expense" ? String(limit ?? "") || null : null,
        });
    } catch (error) {
        console.error(error);
        return res.status(409).json({ message: "Категория уже существует или содержит некорректные данные" });
    }
}

export async function updateCategory(req: Request, res: Response) {
    const id = userId(req);
    const categoryParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const categoryId = BigInt(categoryParam);
    const { name, type, limit } = req.body ?? {};
    if (id === null) return res.status(401).json({ message: "Требуется авторизация" });
    if (typeof name !== "string" || !name.trim() || (type !== "income" && type !== "expense")) {
        return res.status(400).json({ message: "Укажите название и корректный тип категории" });
    }
    try {
        const category = await prisma.categories.updateMany({
            where: { category_id: categoryId, user_id: id, category_type: type },
            data: { name: name.trim() },
        });
        if (!category.count) return res.status(404).json({ message: "Категория не найдена" });
        if (type === "expense" && limit !== undefined) {
            await prisma.category_limits.upsert({
                where: { user_id_category_id: { user_id: id, category_id: categoryId } },
                create: { user_id: id, category_id: categoryId, amount: String(limit) },
                update: { amount: String(limit) },
            });
        }
        return res.json({ category_id: categoryParam, name: name.trim(), limit: limit ?? null });
    } catch (error) {
        console.error(error);
        return res.status(400).json({ message: "Не удалось обновить категорию" });
    }
}

export async function deleteCategory(req: Request, res: Response) {
    const id = userId(req);
    if (id === null) return res.status(401).json({ message: "Требуется авторизация" });
    try {
        const categoryParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const result = await prisma.categories.deleteMany({
            where: { category_id: BigInt(categoryParam), user_id: id },
        });
        if (!result.count) return res.status(404).json({ message: "Категория не найдена" });
        return res.json({ message: "Категория удалена" });
    } catch (error) {
        console.error(error);
        return res.status(409).json({ message: "Категория используется транзакциями" });
    }
}
