import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../services/auth_service";

export function authMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const authorization = req.headers.authorization;

    if (!authorization) {
        return res.status(401).json({
            message: "Требуется авторизация",
        });
    }

    const [type, token] = authorization.split(" ");

    if (type !== "Bearer" || !token) {
        return res.status(401).json({
            message: "Неверный формат токена",
        });
    }

    const payload = verifyAccessToken(token);

    if (!payload) {
        return res.status(401).json({
            message: "Недействительный или просроченный токен",
        });
    }

    req.user = {
        user_id: payload.user_id,
    };

    next();
}