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
            },
        ],
        components: {
            schemas: {
                Transaction: {
                    type: "object",
                    properties: {
                        transaction_id : {
                            type: "integer",
                            example: 1,
                        },
                        user_id: {
                            type: "integer",
                            example: 1,
                        },
                        category_id: {
                            type: "integer",
                            example: 3,
                        },
                        amount: {
                            type: "number",
                            format: "double",
                            example: 2500.00,
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
                            type: "integer",
                            nullable: true,
                            example: 2,
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