import express from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from "./routes/auth_routes";
import profileRoutes from "./routes/user_routes";
import transactionRoutes from "./routes/transactions_routes";
import categoriesRoutes from "./routes/categories_routes";

const app = express();

// 1. ЛОГГЕР ЗАПРОСОВ (чтобы видеть, что запрос дошел до сервера)
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
});

// 2. НАСТРОЙКА CORS (ДОЛЖНА БЫТЬ ДО ВСЕХ РОУТОВ!)
app.use(cors({
    origin: "http://localhost:5173", // Адрес вашего фронтенда (Vite)
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Разрешаем передачу куки (для JWT)
}));

// 3. ПАРСЕРЫ
app.use(express.json());
app.use(cookieParser());

// 4. SWAGGER
app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
);

// 5. ТЕСТОВЫЙ МАРШРУТ
app.get("/", (req, res) => {
    res.json({
        message: 'Finance Tracker API is running'
    });
});

// 6. ПОДКЛЮЧЕНИЕ РОУТОВ
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/categories", categoriesRoutes);

// 7. ГЛОБАЛЬНЫЙ ОБРАБОТЧИК ОШИБОК (должен быть в самом конце)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("=== ОШИБКА НА СЕРВЕРЕ ===");
    console.error(err);
    res.status(500).json({ 
        error: err.message || 'Internal Server Error' 
    });
});

export default app;