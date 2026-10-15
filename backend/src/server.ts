import 'dotenv/config';
import app from "./app";

const port = Number(process.env.PORT ?? 3000);

const server = app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});
server.on("error", (error) => {
    console.error("Не удалось запустить сервер:", error);
});