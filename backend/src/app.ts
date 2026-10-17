import express from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth_routes";
import profileRoutes from "./routes/user_routes";
import transactionRoutes from "./routes/transactions_routes";
import categoriesRoutes from "./routes/categories_routes";

const app = express();

app.use(express.json());
app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
);

app.get("/", (req, res) => {
    res.json({
        message: 'Finance Tracker API is running'
    });
});

app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/categories", categoriesRoutes);

export default app;