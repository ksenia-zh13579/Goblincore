import type { Request, Response } from "express";
import { prisma } from "../prisma";
import { 
    parsePositiveBigInt,
    isTransactionType,
    normalizeName,
    parseAmount,
    isPrismaErrorCode,
    CategoryNotFoundError,
    CategoryAlreadyExistsError,
    CategoryInUseError,
    CategoryLimitRequiredError,
    CategoryLimitNotAllowedError
} from "../services/type_and_parse_functions";

type TransactionType = "income" | "expense";

export async function getMyCategories(
    req: Request,
    res: Response
) {
    try {
        if (!req.user){
            return res.status(401).json({
                message: "Требуется авторизация",
            });
        }

        const userId = parsePositiveBigInt(req.user.user_id);

        if (userId === null) {
            return res.status(401).json({
                message: "Некорректные данные авторизации",
            });
        }

        let categoryType: TransactionType | undefined;

        if (req.query.type !== undefined) {
            const queryType = req.query.type;

            if (!isTransactionType(queryType)) {
                return res.status(400).json({
                    message: "Тип должен быть income или expense",
                });
            }

            categoryType = queryType;
        }

        const [categories, limits] = await Promise.all([
            prisma.categories.findMany({
                where: {
                    user_id: userId,
                    ...(categoryType ? {category_type: categoryType} : {}),
                },
                orderBy: {
                    name: "asc",
                },
            }),

            prisma.category_limits.findMany({
                where: {
                    user_id: userId,
                },
                select: {
                    category_id: true,
                    amount: true,
                },
            }),
        ]);

        const limitsMap = new Map(
            limits.map((limit) => [
                limit.category_id.toString(),
                limit.amount.toString(),
            ])
        );

        const result = categories.map((category) => ({
            category_id: category.category_id.toString(),
            user_id: category.user_id.toString(),
            name: category.name,
            category_type: category.category_type,
            category_limit:
                limitsMap.get(category.category_id.toString()) ?? null,
        }));

        return res.status(200).json(result);
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Ошибка при получении категорий",
        });
    }
}

export async function getCategoryById(
    req: Request,
    res: Response
) {
    try {
        if (!req.user){
            return res.status(401).json({
                message: "Требуется авторизация",
            });
        }

        const userId = parsePositiveBigInt(req.user.user_id);
        const categoryId = parsePositiveBigInt(req.params.id);

        if (userId === null) {
            return res.status(401).json({
                message: "Некорректные данные авторизации",
            });
        }

        if (categoryId === null) {
            return res.status(400).json({
                message: "Некорректный ID категории",
            });
        }

        const category = await prisma.categories.findFirst({
            where: {
                category_id: categoryId,
                user_id: userId,
            },
        });

        if (!category) {
            return res.status(404).json({
                message: "Категория не найдена",
            });
        }

        const limit = await prisma.category_limits.findFirst({
            where: {
                category_id: categoryId,
                user_id: userId,
            },
        });

        return res.status(200).json({
            category_id: category.category_id.toString(),
            user_id: category.user_id.toString(),
            name: category.name,
            category_type: category.category_type,
            category_limit: limit?.amount.toString() ?? null,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Ошибка при получении категории",
        });
    }
}


export async function addNewCategory(
    req: Request,
    res: Response
) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Требуется авторизация",
            });
        }

        const userId = parsePositiveBigInt(req.user.user_id);

        if (userId === null) {
            return res.status(401).json({
                message: "Некорректные данные авторизации",
            });
        }

        const body = req.body ?? {};
        const name = normalizeName(body.name, 100);

        if (!name) {
            return res.status(400).json({
                message: "Название категории обязательно и не должно превышать 100 символов",
            });
        }

        const categoryType = body.category_type;

        if (!isTransactionType(categoryType)) {
            return res.status(400).json({
                message: "Тип категории должен быть income или expense",
            });
        }

        const hasLimit = 
            body.category_limit !== undefined &&
            body.category_limit !== null &&
            body.category_limit !== "";

        let categoryLimit: string | null = null;

        if (hasLimit) {
            categoryLimit = parseAmount(body.category_limit);

            if (categoryLimit === null) {
                return res.status(400).json({
                    message: "Лимит должен быть положительным числом с точностью до двух знаков",
                });
            }
        }

        if (categoryType === "expense" && categoryLimit === null) {
            return res.status(400).json({
                message: "Для новой категории расходов необходимо указать лимит",
            });
        }

        if (categoryType === "income" && hasLimit) {
            return res.status(400).json({
                message: "Для категории доходов лимит не предусмотрен",
            });
        }

        const category = await prisma.$transaction(async (tx) => {
            const existing = await tx.categories.findFirst({
                where: {
                    user_id: userId,
                    name,
                },
            });

            if (existing) {
                throw new CategoryAlreadyExistsError();
            }

            const created = await tx.categories.create({
                data: {
                    user_id: userId,
                    name,
                    category_type: categoryType,
                },
            });

            if (categoryType === "expense") {
                await tx.category_limits.create({
                    data: {
                        user_id: userId,
                        category_id: created.category_id,
                        amount: categoryLimit!,
                    },
                });
            }

            return created;
        });

        return res.status(201).json({
            message: "Категория успешно создана",
            category: {
                category_id: category.category_id.toString(),
                user_id: category.user_id.toString(),
                name: category.name,
                category_type: category.category_type,
                category_limit: categoryLimit,
            },
        });
    } catch (error) {
        if (
            error instanceof CategoryAlreadyExistsError ||
            isPrismaErrorCode(error, "P2002")
        ) {
            return res.status(409).json({
                message: "Категория с таким названием уже существует",
            });
        }

        console.error(error);

        return res.status(500).json({
            message: "Ошибка при создании категории",
        });
    }
}

export async function patchCategory(
    req:Request,
    res: Response
) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Требуется авторизация",
            });
        }

        const userId = parsePositiveBigInt(req.user.user_id);
        const categoryId = parsePositiveBigInt(req.params.id);

        if (userId === null) {
            return res.status(401).json({
                message: "Некорректные данные авторизации",
            });
        }

        if (categoryId === null) {
            return res.status(400).json({
                message: "Некорректный ID категории",
            });
        }

        const body = req.body ?? {};

        if (body.category_type !== undefined) {
            return res.status(400).json({
                message: "Тип категории нельзя изменить. Создайте категорию нужного типа",
            });
        }

        const hasName = body.name !== undefined;
        const hasLimit = body.category_limit !== undefined;

        if (!hasName && !hasLimit) {
            return res.status(400).json({
                message: "Укажите новое название категории или лимит",
            });
        }

        let name: string | undefined;

        if (hasName) {
            const parsed = normalizeName(body.name, 100);

            if (!parsed) {
                return res.status(400).json({
                    message: "Название категории не должно превышать 100 символов и не может быть пустым",
                });
            }

            name = parsed;
        }

        let categoryLimit: string | undefined;

        if (hasLimit) {
            const parsed = parseAmount(body.category_limit);

            if (parsed === null) {
                return res.status(400).json({
                    message: "Лимит должен быть положительным числом с точностью до двух знаков",
                });
            }

            categoryLimit = parsed;
        }

        const result = await prisma.$transaction(async (tx) => {
            const existing = await tx.categories.findFirst({
                where: {
                    category_id: categoryId,
                    user_id: userId,
                },
            });

            if (!existing) {
                throw new CategoryNotFoundError();
            }

            if (categoryLimit !== undefined) {
                if (existing.category_type === "income") {
                    throw new CategoryLimitNotAllowedError();
                }

                const existingLimit = await tx.category_limits.findFirst({
                    where: {
                        category_id: categoryId,
                        user_id: userId,
                    },
                });

                if (existingLimit) {
                    await tx.category_limits.update({
                        where: {
                            limit_id: existingLimit.limit_id,
                        },
                        data: {
                            amount: categoryLimit,
                        },
                    });
                } else {
                    await tx.category_limits.create({
                        data: {
                            user_id: userId,
                            category_id: categoryId,
                            amount: categoryLimit,
                        },
                    });
                }
            }

            if (name !== undefined && name !== existing.name) {
                const duplicate = await tx.categories.findFirst({
                    where: {
                        user_id: userId,
                        name,
                    },
                });

                if (duplicate) {
                    throw new CategoryAlreadyExistsError();
                }
            }

            const category = name !== undefined
                ? await tx.categories.update({
                    where: {
                        category_id: categoryId,
                    },
                    data: {
                        name,
                    },
                })
                : existing;

            const limit = await tx.category_limits.findFirst({
                where: {
                    category_id: categoryId,
                    user_id: userId,
                },
            });

            return {
                category,
                categoryLimit: limit?.amount.toString() ?? null,
            };
        });

        return res.status(200).json({
            message: "Категория успешно обновлена",
            category: {
                category_id: result.category.category_id.toString(),
                user_id: result.category.user_id.toString(),
                name: result.category.name,
                category_type: result.category.category_type,
                category_limit: result.categoryLimit,
            },
        });
    } catch (error) {
        if (error instanceof CategoryNotFoundError) {
            return res.status(404).json({
                message: "Категория не найдена",
            });
        }

        if (error instanceof CategoryAlreadyExistsError) {
            return res.status(409).json({
                message: "Категория с таким названием уже существует",
            });
        }

        if (error instanceof CategoryLimitNotAllowedError) {
            return res.status(400).json({
                message: "Для категории доходов нельзя устанавливать лимит",
            });
        }

        if (isPrismaErrorCode(error, "P2002")) {
            return res.status(409).json({
                message: "Категория с таким названием уже существует",
            });
        }

        console.error(error);

        return res.status(500).json({
             message: "Ошибка при обновлении категории",
        });
    }
}

export async function deleteCategory(
    req: Request,
    res: Response
) {
    try {
        if (!req.user){
            return res.status(401).json({
                message: "Требуется авторизация",
            });
        }

        const userId = parsePositiveBigInt(req.user.user_id);
        const categoryId = parsePositiveBigInt(req.params.id);

        if (userId === null) {
            return res.status(401).json({
                message: "Некорректные данные авторизации",
            });
        }

        if (categoryId === null) {
            return res.status(400).json({
                message: "Некорректный ID категории",
            });
        }

        await prisma.$transaction(async (tx) => {
            const category = await tx.categories.findFirst({
                where: {
                    category_id: categoryId,
                    user_id: userId,
                },
            });

            if (!category) {
                throw new CategoryNotFoundError();
            }

            const transactionCount = await tx.transactions.count({
                where: {
                    category_id: categoryId,
                },
            });

            if (transactionCount > 0) {
                throw new CategoryInUseError();
            }

            await tx.categories.delete({
                where: {
                    category_id: categoryId,
                },
            });
        });

        return res.status(200).json({
            message: "Категория успешно удалена",
        });
    } catch (error) {
        if (error instanceof CategoryNotFoundError) {
            return res.status(404).json({
                message: "Категория не найдена",
            });
        }

        if (
            error instanceof CategoryInUseError ||
            isPrismaErrorCode(error, "P2003")
        ) {
            return res.status(409).json({
                message: "Нельзя удалить категорию, которая используется в транзакциях или других записях",
            });
        }

        console.error(error);

        return res.status(500).json({
            message: "Ошибка при удалении категории",
        });
    }
}