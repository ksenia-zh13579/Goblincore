import jwt from 'jsonwebtoken';

export type TokenType = "access" | "refresh";

export interface TokenPayload {
    user_id: string;
    tokenType: TokenType;
}

function getSecret(name: string): string {
    const secret = process.env[name];

    if (!secret) {
        throw new Error(`Переменная ${name} не задана`);
    }

    return secret;
}

export function createAccessToken(userId: bigint): string {
    return jwt.sign(
        {
            user_id: userId.toString(),
            tokenType: "access",
        },
        getSecret("ACCESS_TOKEN_SECRET"),
        {
            expiresIn: "15m",
        }
    );
}

export function createRefreshToken(userId: bigint): string {
    return jwt.sign(
        {
            user_id: userId.toString(),
            tokenType: "refresh",
        },
        getSecret("REFRESH_TOKEN_SECRET"),
        {
            expiresIn: "7d",
        }
    );
}

function verifyToken(
    token: string,
    secretName: string,
    expectedType: TokenType
): TokenPayload | null {
    try {
        const decoded = jwt.verify(token, getSecret(secretName));

        if (
            typeof decoded === "string" ||
            typeof decoded.user_id !== "string" ||
            !/^\d+$/.test(decoded.user_id) ||
            decoded.tokenType !== expectedType
        ) {
            return null;
        }

        return {
            user_id: decoded.user_id,
            tokenType: expectedType,
        };
    } catch {
        return null;
    }
}

export function verifyAccessToken(
    token: string
): TokenPayload | null {
    return verifyToken(
        token,
        "ACCESS_TOKEN_SECRET",
        "access"
    );
}

export function verifyRefreshToken(
    token: string
): TokenPayload | null {
    return verifyToken(
        token,
        "REFRESH_TOKEN_SECRET",
        "refresh"
    );
}