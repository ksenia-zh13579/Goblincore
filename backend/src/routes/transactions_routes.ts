import { Router } from "express";
import { 
    getMyTransactions,
    getTransactionById,
    addNewTransaction,
    patchTransaction,
    deleteTransaction
} from "../controllers/transactions_controller";
import { authMiddleware } from "../middleware/auth_middleware";
import {
    getMyCategories,
    createCategory,
    updateCategory,
    deleteCategory,
} from "../controllers/category_controller";

const router = Router()

router.get("/categories", authMiddleware, getMyCategories);
router.post("/categories", authMiddleware, createCategory);
router.patch("/categories/:id", authMiddleware, updateCategory);
router.delete("/categories/:id", authMiddleware, deleteCategory);

/**
 * @openapi
 * /api/transactions:
 *  get:
 *      tags:
 *          - Transactions
 *      summary: Получение всех транзакций
 *      description: Возвращает транзакции текущего пользователя. Требуется access toekn.
 *      operationId: getMyTransactions
 *      security:
 *          - bearerAuth: []
 *      responses:
 *          '200':
 *              description: Список транзакций успешно получен
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: array
 *                          items:
 *                              $ref: '#/components/schemas/Transaction'
 *          '401':
 *              description: Отсутствует или недействителен access token
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/ErrorResponse'
 *          '500':
 *              description: Ошибка при получении транзакций
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/ErrorResponse'
 */

router.get("/", authMiddleware, getMyTransactions);

/**
 * @openapi
 * /api/transactions/{id}:
 *  get:
 *      tags:
 *          - Transactions
 *      summary: Получить транзакцию по ID
 *      description: Возвращает одну транзакцию текущего пользователя
 *      operationId: getTransactionById
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *          - in: path
 *            name: id
 *            required: true
 *            description: ID транзакции
 *            schema:
 *              type: string
 *              pattern: '^[1-9][0-9]*$'
 *            example: "15"
 *      responses:
 *          '200':
 *              description: Транзакция получена успешно
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Transaction'
 *          '400':
 *              description: Некорректный ID транзакции
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/ErrorResponse'
 *          '401':
 *              description: Отсутствует или недействительный access token
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/ErrorResponse'
 *          '404':
 *              description: Транзакция не найдена
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/ErrorResponse'
 *          '500':
 *              description: Ошибка при получении транзакции
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/:id", authMiddleware, getTransactionById);

/**
 * @openapi
 * /api/transactions:
 *  post:
 *      tags:
 *          - Transactions
 *      summary: Создание транзакции
 *      description: >
 *          Создает доход или расход. Если категории или места еще не
 *          существует у пользователя, они создаются автоматически.
 *          Для новой категории расходов необходимо передать category_limit.
 *          Для существующей категории лимит повторно не передается.
 *      operationId: addNewTransaction
 *      security:
 *          - bearerAuth: []
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/CreateTransactionRequest'
 *                  example:
 *                      category_name: "Продукты"
 *                      category_limit: "15000.00"
 *                      place_name: "Пятерочка"
 *                      amount: "1500.00"
 *                      comment: "Покупочки на этот вечер"
 *                      transaction_date: "2026-10-15"
 *                      type: "expense"
 *      responses:
 *          '201':
 *              description: Транзакция успешно создана
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/TransactionMutationResponse'
 *          '400':
 *              description: Некорректные данные, конфликт типа категории или отсутствует обязательный лимит
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/ErrorResponse'
 *          '401':
 *              description: Отсутствует или недействительный access token
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/ErrorResponse'
 *          '500':
 *              description: Ошибка при создании транзакции
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/", authMiddleware, addNewTransaction);

/**
 * @openapi
 * /api/transactions/{id}:
 *  patch:
 *      tags:
 *          - Transactions
 *      summary: Изменение транзакции
 *      description: >
 *          Изменяет только переданные поля. Если передана новая категория
 *          расходов, которой еще нет у пользователя, необходимо указать
 *          category_limit. При изменении типа income/expense необходимо
 *          указать категорию соответствующего типа.
 *      operationId: patchTransaction
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *          - in: path
 *            name: id
 *            required: true
 *            description: ID транзакции
 *            schema:
 *              type: string
 *              pattern: '^[1-9][0-9]*$'
 *            example: "15"
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/PatchTransactionRequest'
 *                  example:
 *                      amount: "2000.00"
 *                      comment: "Много потратила в Пятаке"
 *      responses:
 *          '200':
 *              description: Транзакция успешно обновлена
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/TransactionMutationResponse'
 *          '400':
 *              description: Некорректные данные или нарушение правил категории и лимита
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/ErrorResponse'
 *          '401':
 *              description: Отсутствует или недействителен access token
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/ErrorResponse'
 *          '404':
 *              description: Транзакция не найдена
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/ErrorResponse'
 *          '500':
 *              description: Ошибка при обновлении транзакции
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/ErrorResponse'
 */
router.patch("/:id", authMiddleware, patchTransaction);

/**
 * @openapi
 * /api/transactions/{id}:
 *  delete:
 *      tags:
 *          - Transactions
 *      summary: Удаление транзакции
 *      description: Удаляет транзакцию текущего пользователя по ID
 *      operationId: deleteTransaction
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *          - in: path
 *            name: id
 *            required: true
 *            description: ID транзакции
 *            schema:
 *              type: string
 *              pattern: '^[1-9][0-9]*$'
 *            example: "15"
 *      responses:
 *          '200':
 *              description: Транзакция успешно удалена
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/MessageResponse'
 *          '400':
 *              description: Некорректный ID транзакции
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/ErrorResponse'
 *          '401':
 *              description: Отсутствует или недействителен access token
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/ErrorResponse'
 *          '404':
 *              description: Транзакция не найдена
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/ErrorResponse'
 *          '500':
 *              description: Ошибка при удалении транзакции
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/ErrorResponse'
 */
router.delete("/:id", authMiddleware, deleteTransaction);

export default router;