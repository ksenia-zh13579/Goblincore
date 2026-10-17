import { Router } from "express";
import { authMiddleware } from "../middleware/auth_middleware";
import {
    getMyCategories,
    getCategoryById,
    addNewCategory,
    patchCategory,
    deleteCategory
} from "../controllers/category_controller";

const router = Router();

/**
 * @openapi
 * /api/categories:
 *  get:
 *      tags:
 *          - Categories
 *      summary: Получение списка категорий
 *      description: Возвращает категории текущего пользователя. Можно фильтровать по типу.
 *      operationId: getMyCategories
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *          - in: query
 *            name: type
 *            required: false
 *            description: Фильтр по типу категории
 *            schema:
 *              type: string
 *              enum: [income, expense]
 *      responses:
 *          '200':
 *              description: Список категорий успешно получен
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: array
 *                          items:
 *                              $ref: '#/components/schemas/Category'
 *          '400':
 *              description: Некорректный тип категории
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/ErrorResponse'
 *          '401':
 *              description: Требуется авторизация
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/ErrorResponse'
 *          '500':
 *              description: Ошибка при получении категорий
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/", authMiddleware, getMyCategories);

/**
 * @openapi
 * /api/categories/{id}:
 *  get:
 *      tags:
 *          - Categories
 *      summary: Получение категории по ID
 *      description: Возвращает категорию и ее лимит, если он установлен.
 *      operationId: getCategoryById
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *          - in: path
 *            name: id
 *            required: true
 *            description: ID категории
 *            schema:
 *              type: string
 *              pattern: '^[1-9][0-9]*$'
 *            example: "3"
 *      responses:
 *          '200':
 *              description: Категория успешно получена
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Category'
 *          '400':
 *              description: Некорректный ID категории
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/ErrorResponse'
 *          '401':
 *              description: Требуется авторизация
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/ErrorResponse'
 *          '404':
 *              description: Категория не найдена
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/ErrorResponse'
 *          '500':
 *              description: Ошибка при получении категории
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/:id", authMiddleware, getCategoryById);

/**
 * @openapi
 * /api/categories:
 *  post:
 *      tags:
 *          - Categories
 *      summary: Создание категории
 *      description: Создает категорию расходов с обязательным лимитом или категорию доходов без лимита.
 *      operationId: addNewCategory
 *      security:
 *          - bearerAuth: []
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/CreateCategoryRequest'
 *                  examples:
 *                      expenseCategory:
 *                          summary: Категория расходов
 *                          value:
 *                              name: Продукты
 *                              category_type: expense
 *                              category_limit: "15000.00"
 *                      incomeCategory:
 *                          summary: Категория доходов
 *                          value:
 *                              name: Зарплата
 *                              category_type: income
 *      responses:
 *          '201':
 *              description: Категория успешно создана
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/CategoryMutationResponse'
 *          '400':
 *              description: Некорректные данные или не указан обязательный лимит
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/ErrorResponse'
 *          '401':
 *              description: Требуется авторизация
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/ErrorResponse'
 *          '409':
 *              description: Категория с таким названием уже существует
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/ErrorResponse'
 *          '500':
 *              description: Ошибка при создании категории
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/", authMiddleware, addNewCategory);

/**
 * @openapi
 * /api/categories/{id}:
 *  patch:
 *      tags:
 *          - Categories
 *      summary: Редактирование категории
 *      description: Изменяет название, лимит или обя поля. Тип категории менять нельзя.
 *      operationId: patchCategory
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *          - in: path
 *            name: id
 *            required: true
 *            description: ID категории
 *            schema:
 *              type: string
 *              pattern: '^[1-9][0-9]*$'
 *            example: "3"
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/PatchCategoryRequest'
 *                  examples:
 *                      rename:
 *                          summary: Изменить название
 *                          value:
 *                              name: Продукты и товары за 500 рублей
 *                      ChangeLimit:
 *                          summary: Изменить лимит
 *                          value:
 *                              category_limit: "25000.00"
 *                      renameAndLimit:
 *                          summary: Изменить название и лимит
 *                          value:
 *                              name: Продукты за 200 рублей из фикспрайса
 *                              category_limit: "3000.00"
 *      responses:
 *          '200':
 *              description: Категория успешно обновлена
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/CategoryMutationResponse'
 *          '400':
 *              description: Некорректные данные или попытка изменить тип категории
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/ErrorResponse'
 *          '401':
 *              description: Требуется авторизация
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/ErrorResponse'
 *          '404':
 *              description: Категория не найдена
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/ErrorResponse'
 *          '409':
 *              description: Категория с таким названием уже существует
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/ErrorResponse'
 *          '500':
 *              description: Ошибка при обновлении категории
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/ErrorResponse'
 */
router.patch("/:id", authMiddleware, patchCategory);

/**
 * @openapi
 * /api/categories/{id}:
 *  delete:
 *      tags:
 *          - Categories
 *      summary: Удаление категории
 *      description: Удаляет категорию, если она не используется в транзакциях
 *      operationId: deleteCategory
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *          - in: path
 *            name: id
 *            required: true
 *            description: ID категории
 *            schema:
 *              type: "string"
 *              pattern: '^[1-9][0-9]*$'
 *            example: "3"
 *      responses:
 *          '200':
 *              description: Категория успешно удалена
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/MessageResponse'
 *          '400':
 *              description: Некорректный ID категории
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/ErrorResponse'
 *          '401':
 *              description: Требуется авторизация
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/ErrorResponse'
 *          '404':
 *              description: Категория не найдена
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/ErrorResponse'
 *          '409':
 *              description: Категория используется в транзакции или других записях
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/ErrorResponse'
 *          '500':
 *              description: Ошибка при удалении категории
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/ErrorResponse'
 */
router.delete("/:id", authMiddleware, deleteCategory);

export default router;