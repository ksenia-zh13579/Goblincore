import express from "express";
import db_rote from "./routes/db_rote";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";

const app = express();

app.use(express.json());
app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
)
app.use("/api/transactions", db_rote);

app.get("/", (req, res) => {
    res.json({
        message: 'Finance Tracker API is running'
    });
});

export default app;