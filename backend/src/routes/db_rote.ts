import { Router } from "express";
import { getTransactions } from "../controllers/db_controller";
import { authMiddleware } from "../middleware/auth_middleware";

const router = Router()

/**
 * @openapi
 * /api/transactions:
 *  get:
 *      tags:
 *          - Transactions
 *      summary: Получение всех транзакций
 *      description: возвращает транзакции текущего пользователя. Требуется access toekn.
 *      security:
 *          - bearerAuth: []
 *      responses:
 *          200:
 *              description: Список транзакций успешно получен
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: array
 *                          items:
 *                              $ref: '#/components/schemas/Transaction'
 *          '401':
 *              description: Отсутствует или недействителен access token
 *          500:
 *              description: Ошибка при получении транзакций
 */

router.get("/", authMiddleware, getTransactions);

export default router;