import express from "express";
import db_rote from "./routes/db_rote";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth_routes";

const app = express();

app.use(express.json());
app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
);
app.use(cookieParser());

app.get("/", (req, res) => {
    res.json({
        message: 'Finance Tracker API is running'
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/transactions", db_rote);

export default app;