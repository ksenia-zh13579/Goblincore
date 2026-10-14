import { Router } from "express";
import { getTransactions } from "../controllers/db_controller";

const router = Router()

/**
 * @openapi
 * /api/transactions:
 *  get:
 *      tags:
 *          - Transactions
 *      summary: Получение всех транзакций
 *      description: возвращает список всех финансовых транзакций.
 *      responses:
 *          200:
 *              description: Список транзакций успешно получен
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: array
 *                          items:
 *                              $ref: '#/components/schemas/Transaction'
 *          500:
 *              description: Ошибка сервера 
 */

router.get("/", getTransactions);

export default router;