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

        const { username, email, password } = req.body;

        const data: {
            username?: string;
            email?: string;
            password_hash?: string;
        } = {};

        if (username !== undefined) {
            data.username = username;
        }

        if (email !== undefined) {
            data.email = email;
        }

        if (password !== undefined) {
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
    } catch (error) {
        console.error(error);

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