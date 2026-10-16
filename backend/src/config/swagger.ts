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
                    required: ["message"],
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
                UpdateProfileRequest: {
                    type: "object",
                    properties: {
                        username: {
                            type: "string",
                            example: "new_user_user",
                        },
                        email: {
                            type: "string",
                            format: "email",
                            example: "alex@example.com",
                        },
                        password: {
                            type: "string",
                            format: "password",
                            example: "LoLKek1345",
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
                    required: [
                        "transaction_id",
                        "user_id",
                        "category_id",
                        "category_name",
                        "amount",
                        "comment",
                        "transaction_date",
                        "place_id",
                        "place_name",
                        "type",
                        "created_at",
                    ],
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
                        category_name: {
                            type: "string",
                            example: "Продукты"
                        },
                        amount: {
                            type: "string",
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
                            example: "2026-10-14T00:00:00.000Z",
                        },
                        place_id: {
                            type: "string",
                            nullable: true,
                            example: "2",
                        },
                        place_name: {
                            type: "string",
                            nullable: true,
                            example: "Пятерочка"
                        },
                        type: {
                            type: "string",
                            enum: ["income", "expense"],
                            example: "expense",
                        },
                        created_at: {
                            type: "string",
                            format: "date-time",
                            example: "2026-10-11T12:00:00.000Z",
                        },
                    },
                },
                CreateTransactionRequest: {
                    type: "object",
                    required: [
                        "category_name",
                        "amount",
                        "transaction_date",
                        "type,"
                    ],
                    properties: {
                        category_name: {
                            type: "string",
                            maxLength: 100,
                            example: "Продукты",
                        },
                        category_limit: {
                            type: "string",
                            pattern: "^[0-9]{1,10}(\\.[0-9]{1,2})?$",
                            example: "150000.00",
                            description:
                                "Обязателен при создании новой категории расходов. Для существующей категории не указывается.",
                        },
                        amount: {
                            type: "string",
                            pattern: "^[0-9]{1,10}(\\.[0-9]{1,2})?$",
                            example: "1500.50",
                        },
                        comment: {
                            type: "string",
                            nullable: true,
                            example: "Покупочки на июнь",
                        },
                        transaction_date: {
                            type: "string",
                            format: "date",
                            example: "2026-10-15",
                        },
                        place_name: {
                            type: "string",
                            nullable: true,
                            maxLength: 150,
                            example: "Пятерочка",
                        },
                        type: {
                            type: "string",
                            enum: ["income", "expense"],
                            example: "expense",
                        },
                    },
                },
                PatchTransactionRequest: {
                    type: "object",
                    properties: {
                        category_name: {
                            type: "string",
                            maxLength: 100,
                            example: "Аптеки",
                        },
                        category_limit: {
                            type: "string",
                            pattern: "^[0-9]{1,10}(\\.[0-9]{1,2})?$",
                            example: "5000.00",
                            description:
                                "Указывается вместе с category_name только при создвнии новой категории расходов",
                        },
                        amount: {
                            type: "string",
                            pattern: "^[0-9]{1,10}(\\.[0-9]{1,2})?$",
                            example: "2000.00",
                        },
                        comment: {
                            type: "string",
                            nullable: true,
                            example: "Обновленный комментарий",
                        },
                        transaction_date: {
                            type: "string",
                            format: "date",
                            example: "2026-10-16",
                        },
                        place_name: {
                            type: "string",
                            nullable: true,
                            maxLength: 150,
                            example: "Ozon",
                            description:
                                "Передайте null или пустую строку, чтобы убрать место из транзакции.",
                        },
                        type: {
                            type: "string",
                            enum: ["income", "expense"],
                            example: "expense",
                        },
                    },
                },
                TransactionMutationResponse: {
                    type: "object",
                    required: ["message", "transaction"],
                    properties: {
                        message: {
                            type: "string",
                            example: "Транзакция успешно обновлена",
                        },
                        transaction: {
                            $ref: '#/components/schemas/Transaction',
                        },
                    },
                },
                MessageResponse: {
                    type: "object",
                    required: ["message"],
                    properties: {
                        message: {
                            type: "string",
                            example: "Транзакция успешно удалена",
                        },
                    },
                },
            },
        },
    },
    apis: ["./src/routes/*.ts"],
};

export const swaggerSpec = swaggerJSDoc(options);