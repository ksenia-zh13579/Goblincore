import type { Request, Response } from "express";
import { prisma } from "../prisma";

type TransactionType = "income" | "expense";

function parsePositiveBigIng(value: unknown): bigint | null {
    if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) {
        return null;
    }

    try {
        return BigInt(value);
    } catch {
        return null;
    }
}

function isTransactionType(value: unknown): value is TransactionType {
    return value === "income" || value === "expense";
}

function normalizeName(
    value: unknown,
    maxLength: number
): string | null {
    if (typeof value !== "string") {
        return null;
    }

    const name = value.trim();

    if (!name || name.length > maxLength) {
        return null;
    }

    return name;
}

function parseAmount(value: unknown): string | null {
    if (typeof value !== "string" && typeof value !== "number") {
        return null;
    }

    const amount = String(value).trim();

    if (!/^\d{1,10}(?:\.\d{1,2})?$/.test(amount)) {
        return null;
    }

    const [whole, fraction = ""] = amount.split(".");
    const cents = BigInt(whole) * 100n + BigInt(fraction.padEnd(2, "0"));

    if (cents <= 0n) {
        return null;
    }

    return `${BigInt(whole).toString()}.${fraction.padEnd(2, "0")}`;
}

function parseDateOnly(value: unknown): Date | null {
    if (
        typeof value !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(value)
    ) {
        return null;
    }

    const date = new Date(`${value}T00:00:00.000Z`);

    if (
        Number.isNaN(date.getTime()) ||
        date.toISOString().slice(0, 10) !== value
    ) {
        return null;
    }

    return date;
}

class CategoryTypeMismatchError extends Error {}
class CategoryLimitRequiredError extends Error {}
class CategoryLimitOnlyForNewCategoryError extends Error {}
class CategoryLimitNotAllowedForIncomeError extends Error {}
class TransactionNotFoundError extends Error {}
class CategoryRequiredForTypeChangeError extends Error {}

export async function getMyTransactions(
    req: Request,
    res: Response
) {
    try {
        if (!req.user){
            return res.status(401).json({
                message: "Требуется авторизация",
            });
        }

        const userId = parsePositiveBigIng(req.user.user_id);

        if (userId === null) {
            return res.status(401).json({
                message: "Некорректные данные авторизации",
            });
        }

        const transactions = await prisma.transactions.findMany({
            where: {
                user_id: userId,
            },
            orderBy: {
                transaction_date: "desc",
            },
            include: {
                categories: {
                    select: {
                        name: true,
                    },
                },
                places: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        const result = transactions.map((transaction) => ({
            transaction_id: transaction.transaction_id.toString(),
            user_id: transaction.user_id.toString(),
            category_id: transaction.category_id.toString(),
            category_name: transaction.categories.name,
            amount: transaction.amount.toString(),
            comment: transaction.comment,
            transaction_date: transaction.transaction_date,
            place_id: transaction.place_id?.toString() ?? null,
            place_name: transaction.places?.name ?? null,
            type: transaction.type,
            created_at: transaction.created_at,
        }));

        return res.status(200).json(result);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Ошибка при получении транзакций",
        });
    }
}

export async function getTransactionById(
    req: Request,
    res: Response
) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Требуется авторизация",
            });
        }

        const userId = parsePositiveBigIng(req.user.user_id);
        const transactionId = parsePositiveBigIng(req.params.id);

        if (userId === null) {
            return res.status(401).json({
                message: "Некорректные данные авторизации",
            });
        }

        if (transactionId === null) {
            return res.status(400).json({
                message: "Некорректный ID транзакции",
            });
        }

        const transaction = await prisma.transactions.findFirst({
            where: {
                transaction_id: transactionId,
                user_id: userId,
            },
            include: {
                categories: {
                    select: {
                        name: true,
                    },
                },
                places: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        if (!transaction) {
            return res.status(404).json({
                message: "Транзакция не найдена",
            });
        }

        const result = {
            transaction_id: transaction.transaction_id.toString(),
            user_id: transaction.user_id.toString(),
            category_id: transaction.category_id.toString(),
            category_name: transaction.categories.name,
            amount: transaction.amount.toString(),
            comment: transaction.comment,
            transaction_date: transaction.transaction_date,
            place_id: transaction.place_id?.toString() ?? null,
            place_name: transaction.places?.name ?? null,
            type: transaction.type,
            created_at: transaction.created_at,
        };

        return res.status(200).json(result)
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Ошибка при получении транзакции",
        });
    }
}

export async function addNewTransaction(
    req: Request,
    res: Response
) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Требуется авторизация",
            });
        }

        const userId = parsePositiveBigIng(req.user.user_id);

        if (userId === null) {
            return res.status(401).json({
                message: "Некорректные данные авторизации",
            });
        }

        const body = req.body ?? {};

        const categoryName = normalizeName(
            body.category_name,
            100
        );

        if (!categoryName) {
            return res.status(400).json({
                message: "Укажите название категории длиной до 100 символов",
            });
        }

        const {
            amount: rawAmount,
            comment,
            transaction_date,
            type,
        } = body;

        if (!isTransactionType(type)) {
            return res.status(400).json({
                message: "Тип должен бфть income или expense",
            });
        }

        const amount = parseAmount(rawAmount);

        if (amount === null) {
            return res.status(400).json({
                message: "Сумма должна быть положительной и иметь не более двух знаков после точки",
            });
        }

        const transactionDate = parseDateOnly(transaction_date);

        if (!transactionDate) {
            return res.status(400).json({
                message: "Укажите корректную дату в формате YYYY-MM-DD",
            });
        }

        if (
            comment !== undefined &&
            comment !== null &&
            typeof comment !== "string"
        ) {
            return res.status(400).json({
                message: "Комментарий должен быть строкой или null",
            });
        }

        let placeName: string | null = null;

        if (body.place_name !== undefined && body.place_name !== null) {
            if (typeof body.place_name !== "string") {
                return res.status(400).json({
                    message: "Название места должно быть строкой или null",
                });
            }

            placeName = body.place_name.trim() || null;

            if (placeName && placeName.length > 150) {
                return res.status(400).json({
                    message: "Название места не должно превышать 150 символов",
                });
            }
        }

        const hasCategoryLimit = 
            body.category_limit !== undefined &&
            body.category_limit !== null &&
            body.category_limit !== "";

        let categoryLimit: string | null = null;

        if (hasCategoryLimit) {
            categoryLimit = parseAmount(body.category_limit);

            if (categoryLimit === null) {
                return res.status(400).json({
                    message: "Лимит должен быть положительным числом с точностью до двух знаков",
                });
            }
        }

        if (type === "income" && hasCategoryLimit) {
            return res.status(400).json({
                message: "Для категории доходов лимит указывать не нужно",
            });
        }

        const transaction = await prisma.$transaction(async (tx) => {
            const existingCategory = await tx.categories.findUnique({
                where: {
                    user_id_name: {
                        user_id: userId,
                        name: categoryName,
                    },
                },
            });

            let categoryId: bigint;

            if (existingCategory) {
                if (existingCategory.category_type !== type) {
                    throw new CategoryTypeMismatchError();
                }

                if (hasCategoryLimit) {
                    throw new CategoryLimitOnlyForNewCategoryError();
                }

                categoryId = existingCategory.category_id;
            } else {
                if (type === "expense" && categoryLimit === null) {
                    throw new CategoryLimitRequiredError();
                }

                const category = await tx.categories.create({
                    data: {
                        user_id: userId,
                        name: categoryName,
                        category_type: type,
                    },
                });

                categoryId = category.category_id;

                if (type === "expense") {
                    await tx.category_limits.create({
                        data: {
                            user_id: userId,
                            category_id: category.category_id,
                            amount: categoryLimit!,
                        },
                    });
                }
            }

            let placeId: bigint | null = null;

            if (placeName !== null) {
                const place = await tx.places.upsert({
                    where: {
                        user_id_name: {
                            user_id: userId,
                            name: placeName,
                        },
                    },
                    update: {},
                    create: {
                        user_id: userId,
                        name: placeName,
                    },
                });

                placeId = place.place_id;
            }

            return tx.transactions.create({
                data: {
                    user_id: userId,
                    category_id: categoryId,
                    amount,
                    comment: comment ?? null,
                    transaction_date: transactionDate,
                    place_id: placeId,
                    type,
                },
                include: {
                    categories: {
                        select: {
                            name: true,
                        },
                    },
                    places: {
                        select: {
                            name: true,
                        },
                    },
                },
            });
        });

        return res.status(201).json({
            message: "Транзакция успешно создана",
            transaction: {
                transaction_id: transaction.transaction_id.toString(),
                user_id: transaction.user_id.toString(),
                category_id: transaction.category_id.toString(),
                category_name: transaction.categories.name,
                amount: transaction.amount.toString(),
                comment: transaction.comment,
                transaction_date: transaction.transaction_date,
                place_id: transaction.place_id?.toString() ?? null,
                place_name: transaction.places?.name ?? null,
                type: transaction.type,
                created_at: transaction.created_at,
            },
        });
    } catch (error) {
        if (error instanceof CategoryTypeMismatchError) {
            return res.status(400).json({
                message: "Категория с таким названием уже существует для другого типа транзакции",
            });
        }

        if (error instanceof CategoryLimitRequiredError) {
            return res.status(400).json({
                message: "При создании новой категории расходов необходимо указать лимит",
            });
        }

        if (error instanceof CategoryLimitOnlyForNewCategoryError) {
            return res.status(400).json({
                message: "Лимит передается только при создании новой категории",
            });
        }

        console.error(error);

        return res.status(500).json({
            message: "Ошибка при создании транзакции"
        });
    }
}

export async function patchTransaction(
    req: Request,
    res: Response
) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Требуется авторизация",
            });
        }

        const userId = parsePositiveBigIng(req.user.user_id);
        const transactionId = parsePositiveBigIng(req.params.id);

        if (userId === null) {
            return res.status(401).json({
                message: "Некорректные данные авторизации",
            });
        }

        if (transactionId === null) {
            return res.status(400).json({
                message: "Некорректный ID транзакции",
            });
        }

        const body = req.body ?? {};

        let categoryName: string | undefined;

        if (body.category_name !== undefined) {
            const parsed = normalizeName(body.category_name, 100);

            if (!parsed) {
                return res.status(400).json({
                    message: "Укажите корректное название категории",
                });
            }

            categoryName = parsed;
        }

        let requestedType: TransactionType | undefined;

        if (body.type !== undefined) {
            if (!isTransactionType(body.type)) {
                return res.status(400).json({
                    message: "Тип должен быть income или expense",
                });
            }

            requestedType = body.type;
        }

        let amount: string | undefined;

        if (body.amount !== undefined) {
            const parsed = parseAmount(body.amount);

            if (parsed === null) {
                return res.status(400).json({
                    message: "Некорректная сумма",
                });
            }

            amount = parsed;
        }

        let transactionDate: Date | undefined;

        if (body.transaction_date !== undefined) {
            const parsed = parseDateOnly(body.transaction_date);

            if (!parsed) {
                return res.status(400).json({
                    message: "Укажите корректную дату в формате YYYY-MM-DD",
                });
            }

            transactionDate = parsed;
        }

        let comment: string | null | undefined;

        if (body.comment !== undefined) {
            if (
                body.comment !== null &&
                typeof body.comment !== "string"
            ) {
                return res.status(400).json({
                    message: "Комментарий должен быть строкой или null",
                });
            }

            comment = body.comment;
        }

        let placeName: string | null | undefined;

        if (body.place_name !== undefined) {
            if (body.place_name === null) {
                placeName = null;
            } else if (typeof body.place_name === "string") {
                const parsed = body.place_name.trim();

                if (parsed.length > 150) {
                    return res.status(400).json({
                        message: "Название места не должно превышать 150 символов",
                    });
                }

                placeName = parsed || null;
            } else {
                return res.status(400).json({
                    message: "Название места должно быть строкой или null",
                });
            }
        }

        const hasCategoryLimit = 
            body.category_limit !== undefined &&
            body.category_limit !== null &&
            body.category_limit !== "";

        let categoryLimit: string | null = null;

        if (hasCategoryLimit) {
            categoryLimit = parseAmount(body.category_limit);

            if (categoryLimit === null) {
                return res.status(400).json({
                    message: "Некорректный лимит категории",
                });
            }

            if (categoryName === undefined) {
                return res.status(400).json({
                    message: "Лимит можно передать только вместе с названием категории",
                });
            }
        }

        const hasChanges =
            categoryName !== undefined ||
            requestedType !== undefined ||
            amount !== undefined ||
            transactionDate !== undefined ||
            comment !== undefined ||
            placeName !== undefined;

    
        if (!hasChanges) {
            return res.status(400).json({
                message: "Не указаны поля для изменения",
            });
        }

        const transaction = await prisma.$transaction(async (tx) => {
            const existing = await tx.transactions.findFirst({
                where: {
                    transaction_id: transactionId,
                    user_id: userId,
                },
            });

            if (!existing) {
                throw new TransactionNotFoundError();
            }

            const finalType = requestedType ?? existing.type;

            if (
                finalType !== existing.type &&
                categoryName === undefined
            ) {
                throw new CategoryRequiredForTypeChangeError();
            }

            if (hasCategoryLimit && finalType === "income") {
                throw new CategoryLimitNotAllowedForIncomeError();
            }

            let categoryId = existing.category_id;

            if (categoryName !== undefined) {
                const existingCategory = await tx.categories.findUnique({
                    where: {
                        user_id_name: {
                            user_id: userId,
                            name: categoryName,
                        },
                    },
                });

                if (existingCategory) {
                    if (existingCategory.category_type !== finalType) {
                        throw new CategoryTypeMismatchError();
                    }

                    if (hasCategoryLimit) {
                        throw new CategoryLimitOnlyForNewCategoryError();
                    }

                    categoryId = existingCategory.category_id;
                } else {
                    if (
                        finalType === "expense" &&
                        categoryLimit === null
                    ) {
                        throw new CategoryLimitRequiredError();
                    }

                    const category = await tx.categories.create({
                        data: {
                            user_id: userId,
                            name: categoryName,
                            category_type: finalType,
                        },
                    });

                    categoryId = category.category_id;

                    if (finalType === "expense") {
                        await tx.category_limits.create({
                            data: {
                                user_id: userId,
                                category_id: category.category_id,
                                amount: categoryLimit!,
                            },
                        });
                    }
                }
            }

            let placeId = existing.place_id;

            if (placeName !== undefined) {
                if (placeName === null) {
                    placeId = null;
                } else {
                    const place = await tx.places.upsert({
                        where: {
                            user_id_name: {
                                user_id: userId,
                                name: placeName,
                            },
                        },
                        update: {},
                        create: {
                            user_id: userId,
                            name: placeName,
                        },
                    });

                    placeId = place.place_id;
                }
            }

            const data: {
                category_id?: bigint;
                amount?: string;
                comment?: string | null;
                transaction_date?: Date;
                place_id?: bigint | null;
                type?: TransactionType;
            } = {};

            if (categoryName !== undefined) {
                data.category_id = categoryId;
            }

            if (requestedType !== undefined) {
                data.type = finalType;
            }

            if (amount !== undefined) {
                data.amount = amount;
            }

            if (comment !== undefined) {
                data.comment = comment;
            }

            if (transactionDate !== undefined) {
                data.transaction_date = transactionDate;
            }

            if (placeName !== undefined) {
                data.place_id = placeId;
            }

            return tx.transactions.update({
                where: {
                    transaction_id: transactionId,
                },
                data,
                include: {
                    categories: {
                        select: {
                            name: true,
                        },
                    },
                    places: {
                        select: {
                            name: true,
                        },
                    },
                },
            });
        });

        return res.status(200).json({
            message: "Транзакция успешно обновлена",
            transaction: {
                transaction_id: transaction.transaction_id.toString(),
                user_id: transaction.user_id.toString(),
                category_id: transaction.category_id.toString(),
                category_name: transaction.categories.name,
                amount: transaction.amount.toString(),
                comment: transaction.comment,
                transaction_date: transaction.transaction_date,
                place_id: transaction.place_id?.toString() ?? null,
                place_name: transaction.places?.name ?? null,
                type: transaction.type,
                created_at: transaction.created_at,
            },
        });
    } catch (error) {
        if (error instanceof TransactionNotFoundError) {
            return res.status(404).json({
                message: "Транзакция не найдена",
            });
        }

        if (error instanceof CategoryTypeMismatchError) {
            return res.status(400).json({
                message: "Категория с таким названием уже существует для другого типа транзакции",
            });
        }

        if (error instanceof CategoryLimitRequiredError) {
            return res.status(400).json({
                message: "При создании новой категории расходов необходимо указать лимит",
            });
        }

        if (error instanceof CategoryLimitOnlyForNewCategoryError) {
            return res.status(400).json({
                message: "Лимит передается только при создании новой категории",
            });
        }

        if (error instanceof CategoryLimitNotAllowedForIncomeError) {
            return res.status(400).json({
                message: "Для категории доходв лимит указывать не нужно",
            });
        }

        if (error instanceof CategoryRequiredForTypeChangeError) {
            return res.status(400).json({
                message: "При изменении типа транзакции укажите категорию нового типа",
            });
        }

        console.error(error);

        return res.status(500).json({
            message: "Ошибка при обновлении транзакции",
        });
    }
}

export async function deleteTransaction(
    req: Request,
    res: Response
) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Требуется авторизация",
            });
        }

        const userId = parsePositiveBigIng(req.user.user_id);
        const transactionId = parsePositiveBigIng(req.params.id);

        if (userId === null) {
            return res.status(401).json({
                message: "Некорректные данные авторизации",
            });
        }

        if (transactionId === null) {
            return res.status(400).json({
                message: "Некорректный ID транзакции",
            });
        }

        const result = await prisma.transactions.deleteMany({
            where: {
                transaction_id: transactionId,
                user_id: userId,
            },
        });

        if (result.count == 0) {
            return res.status(404).json({
                message: "Транзакция не найдена",
            });
        }

        return res.status(200).json({
            message: "Транзакция успешно удалена",
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Ошибка при удалении транзакции",
        });
    }
}