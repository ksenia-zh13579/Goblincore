import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../prisma";
import { 
    createAccessToken,
    createRefreshToken,
    verifyRefreshToken
} from "../services/auth_service";
import validator from "validator";

const REFRESH_COOKIE = "refreshToken";
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

function setRefreshCookie(res: Response, token: string) {
    res.cookie(REFRESH_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: REFRESH_MAX_AGE,
        path: "/api/auth",
    });
}

function clearRefreshCookie(res: Response) {
    res.clearCookie(REFRESH_COOKIE, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/api/auth",
    });
}

export async function register(
    req: Request,
    res: Response
) {
    try {
        const { username, email: rawEmail, password } = req.body;

        if (
            typeof username !== "string" ||
            typeof rawEmail !== "string" ||
            typeof password !== "string"
        ) {
            return res.status(400).json({
                message: "Укажите имя пользователя, почту и пароль",
            });
        }

        const normalizedUsrename = username.trim();
        const normalizedEmail = rawEmail.trim().toLowerCase();

        if (
            !normalizedUsrename ||
            normalizedUsrename.length > 100
        ) {
            return res.status(400).json({
                message: "Некорректное имя пользователя",
            });
        }

        if (!validator.isEmail(normalizedEmail, { require_tld: true})) {
            return res.status(400).json({
                message: "Укажите корректный email, например alex@example.com",
            });
        }

        if (
            normalizedEmail.length > 255 ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
        ) {
            return res.status(400).json({
                message: "Некорректная почта",
            });
        }

        if (password.length < 8 || password.length > 72) {
            return res.status(400).json({
                message: "Пароль должен содержать от 8 до 72 символов",
            });
        }

        const existingUser = await prisma.users.findUnique({
            where: {
                email: normalizedEmail,
            },
        });

        if (existingUser) {
            return res.status(409).json({
                message: "Пользователь с таким email уже существует",
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const user = await prisma.users.create({
            data: {
                username: normalizedUsrename,
                email: normalizedEmail,
                password_hash: passwordHash
            },
            select: {
                user_id: true,
                username: true,
                email: true,
                created_at: true,
            },
        });

        return res.status(201).json({
            message: "Аккаунт успешно создан",
            user: {
                user_id: user.user_id.toString(),
                username: user.username,
                email: user.email,
                created_at: user.created_at,
            },
        });
    } catch (error: unknown) {
        if (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === "P2002"
        ) {
            return res.status(409).json({
                message: "Пользователь с таким email уже существует",
            });
        }

        console.error("ОШИБКА РЕГИСТРАЦИИ:", error);

        return res.status(500).json({
            message: "Ошибка при создании аккаунта",
        });
    }
}

export async function login(
    req: Request,
    res: Response
) {
    try {
        const { email, password } = req.body ?? {};

        if (
            typeof email !== "string" ||
            typeof password !== "string"
        ) {
            return res.status(400).json({
                message: "Укажите почту и пароль",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await prisma.users.findUnique({
            where: {
                email: normalizedEmail,
            },
        });

        if (!user) {
    return res.status(401).json({ message: "Неверный email или пароль" });
}

const isPasswordValid = await bcrypt.compare(password, user.password_hash);

if (!isPasswordValid) {
    return res.status(401).json({ message: "Неверный email или пароль" });
}

        const accessToken = createAccessToken(user.user_id);
        const refreshToken = createRefreshToken(user.user_id);

        setRefreshCookie(res, refreshToken);

        return res.status(200).json({
            message: "Вход выполнен успешно",
            accessToken,
            tokenType: "Bearer",
            user: {
                user_id: user.user_id.toString(),
                username: user.username,
                email: user.email,
            },
        });
    } catch (error: unknown) {
        console.error("ОШИБКА ВХОДА:", error);

        return res.status(500).json({
            message: "Ошибка при входе",
        });
    }
}

export async function refresh(
    req: Request,
    res: Response
) {
    try {
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({
                message: "Refresh token отсутствует",
            });
        }

        const payload = verifyRefreshToken(refreshToken);

        if (!payload) {
            return res.status(401).json({
                message: "Refresh token недействителен или истек",
            });
        }

        const userId = BigInt(payload.user_id);

        const user = await prisma.users.findUnique({
            where: {
                user_id: userId,
            },
            select: {
                user_id: true,
            },
        });

        if (!user) {
            return res.status(401).json({
                message: "Аккаунт не найден или сессия недействительна",
            });
        }

        const accessToken = createAccessToken(user.user_id);

        return res.status(200).json({
            accessToken,
        });
    } catch (error: unknown) {
        console.error("ОШИБКА ОБНОВЛЕНИЯ ТОКЕНА:", error);

        return res.status(500).json({
            message: "Ошибка при обновлении токена",
        });
    }
}

export async function logout(
    _req: Request,
    res: Response
) {
    clearRefreshCookie(res);

    return res.status(200).json({
        message: "Выход выполнен",
    });
}