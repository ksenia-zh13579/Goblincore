import type { Request, Response } from "express";
import { prisma } from "../prisma";
import bcrypt from "bcrypt";


export async function getMyProfile(
    req: Request,
    res: Response
) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Требуется авторизация",
            });            
        }

        const profile = await prisma.users.findUnique({
            where: {
                user_id: BigInt(req.user.user_id),
            },
        });

        if (!profile) {
            return res.status(404).json({
                message: "Пользователь не найден",
            });
        }

        const result = {
            user_id: profile.user_id.toString(),
            username: profile.username,
            email: profile.email,
            created_at: profile.created_at,
        };

        return res.status(200).json(result);
    } catch (error) {
        res.status(500).json({
            message: "Ошибка при получении данных профиля",
        });
    }
}

export async function patchMyProfile(
    req: Request,
    res: Response
) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Требуется авторизация",
            });
        }

        const { username, email, password } = req.body ?? {};

        const data: {
            username?: string;
            email?: string;
            password_hash?: string;
        } = {};

        if (username !== undefined) {
            if (typeof username !== "string" || !username.trim() || username.trim().length > 100) {
                return res.status(400).json({
                    message: "Некорректное имя пользователя",
                });
            }
            data.username = username.trim();
        }

        if (email !== undefined) {
            if (typeof email !== "string" || !email.trim()) {
                return res.status(400).json({
                    message: "Некорректная почта",
                });
            }
            data.email = email.trim().toLowerCase();
        }

        if (password !== undefined) {
            if (typeof password !== "string" || password.length < 8 || password.length > 72) {
                return res.status(400).json({
                    message: "Пароль должен содержать от 8 до 72 символов",
                });
            }
            data.password_hash = await bcrypt.hash(password, 12);
        }

        const user = await prisma.users.update({
            where: {
                user_id: BigInt(req.user.user_id),
            },
            data,
        });

        const result = {
            user_id: user?.user_id.toString(),
            username: user?.username,
            email: user?.email,
            created_at: user?.created_at,
        };

        return res.status(200).json({
            message: "Профиль успешно обновлен",
            user: result,
        });
    } catch (error: any) {
        console.error(error);

        if (error?.code === "P2002") {
            return res.status(409).json({
                message: "Пользователь с такой почтой уже существует",
            });
        }

        return res.status(500).json({
            message: "Ошибка при обновлении профиля",
        });
    }
}

export async function deleteMyProfile(
    req: Request,
    res: Response
) {
    try {
        if (!req.user) {
            return res.status(400).json({
                message: "Требуется авторизация",
            });
        }

        await prisma.users.delete({
            where: {
                user_id: BigInt(req.user.user_id),
            },
        });

        return res.status(200).json({
            message: "Аккаунт успешно удален",
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Ошибка при удалении профиля",
        });
    }
}