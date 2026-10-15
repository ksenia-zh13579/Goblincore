import swaggerJSDoc from "swagger-jsdoc";
import { transaction_type } from "../generated/prisma/enums";

const options: swaggerJSDoc.Options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Finance Tracker API",
            version: "1.0.0",
            description: "API для трекера финансов"
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: "Локальный сервер для разработки проекта"
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                    description: "Access token",
                },
                refreshCookie: {
                    type: "apiKey",
                    in: "cookie",
                    name: "refreshToken",
                    description: "Refresh token в HttpOnly cookie",
                },
            },
            schemas: {
                ErrorResponse: {
                    type: "object",
                    properties: {
                        message: {
                            type: "string",
                            example: "Ошибка запуска сервера",
                        },
                    },
                },
                RegisterRequest: {
                    type: "object",
                    required: ["username", "email", "password"],
                    properties: {
                        username: {
                            type: "string",
                            maxLength: 100,
                            example: "Alex",
                        },
                        email: {
                            type: "string",
                            format: "email",
                            example: "alex@example.com",
                        },
                        password: {
                            type: "string",
                            format: "password",
                            minLength: 8,
                            maxLength: 72,
                            exapmle: "MyCoolPassword1339",
                        },
                    },
                },
                LoginRequest: {
                    type: "object",
                    required: ["email", "password"],
                    properties: {
                        email: {
                            type: "string",
                            format: "email",
                            example: "alex@example.com",
                        },
                        password: {
                            type: "string",
                            format: "password",
                            example: "MyCoolPassword1339",
                        },
                    },
                },
                User: {
                    type: "object",
                    properties: {
                        user_id: {
                            type: "string",
                            example: "1",
                        },
                        username: {
                            type: "string",
                            example: "CoolDude13",
                        },
                        email: {
                            type: "string",
                            format: "email",
                            example: "alex@example.com",
                        },
                    },
                },
                AuthResponse: {
                    type: "object",
                    properties: {
                        message: {
                            type: "string",
                            example: "Авторизация прошла успешно",
                        },
                        accessToken: {
                            type: "string",
                            example: "ey745874935kflkdfjsdlkvn...",
                        },
                        tokenType: {
                            type: "string",
                            example: "Bearer",
                        },
                        user: {
                            $ref: "#/components/schemas/User",
                        },
                    },
                },
                AccessTokenResponse: {
                    type: "object",
                    properties: {
                        accessToken: {
                            type: "string",
                        },
                        tokenType: {
                            type: "string",
                            example: "Bearer",
                        },
                    },
                },
                Transaction: {
                    type: "object",
                    properties: {
                        transaction_id : {
                            type: "string",
                            example: "10",
                        },
                        user_id: {
                            type: "string",
                            example: "1",
                        },
                        category_id: {
                            type: "string",
                            example: "3",
                        },
                        amount: {
                            type: "string",
                            description: "Сумма NUMERIC(12, 2)",
                            example: "2500.00",
                        },
                        comment: {
                            type: "string",
                            nullable: true,
                            example: "Покупка продуктов в пятерочке",
                        },
                        transaction_date: {
                            type: "string",
                            format: "date",
                            example: "2026-10-14",
                        },
                        place_id: {
                            type: "string",
                            nullable: true,
                            example: "2",
                        },
                        type: {
                            type: "string",
                            enum: ["income", "expense"],
                            example: "expense",
                        },
                        created_at: {
                            type: "string",
                            format: "date-time",
                        },
                    },
                },
            },
        },
    },
    apis: ["./src/routes/*.ts"],
};

export const swaggerSpec = swaggerJSDoc(options);