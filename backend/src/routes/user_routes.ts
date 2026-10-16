import { Router } from "express";
import { authMiddleware } from "../middleware/auth_middleware";
import { 
    getMyProfile,
    patchMyProfile,
    deleteMyProfile
} from "../controllers/user_controller";

const router = Router();

/**
 * @openapi
 * /api/profile:
 *  get:
 *      tags:
 *          - Profile
 *      summary: Просмотр профиля
 *      description: Получение информации о профиле пользователя
 *      security:
 *          - bearerAuth: []
 *      responses:
 *          '200':
 *              description: Информация профиля успешно получена
 *              content:
 *                  application:json:
 *                      schema:
 *                          $ref: '#/components/schemas/User'
 *          '401':
 *              description: Отсутствует действительный access token
 *          '500':
 *              description: Ошибка при получении данных профиля
 */
router.get("/", authMiddleware, getMyProfile);

/**
 * @openapi
 * /api/profile:
 *  patch:
 *      tags:
 *          - Profile
 *      summary: Редактирование профиля
 *      description: Изменение данных текущего пользователя
 *      security:
 *          - bearerAuth: []
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/UpdateProfileRequest'
 *      responses:
 *          '200':
 *              description: Профиль успешно обновлен
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              message:
 *                                  type: string
 *                                  example: Профиль успешно обновлен
 *                              user:
 *                                  $ref: '#/components/schemas/User'
 *          '401':
 *              description: Отсутствует действительный access token
 *          '500':
 *              description: Ошибка при обновлении профиля
 */
router.patch("/", authMiddleware, patchMyProfile);

/**
 * @openapi
 * /api/profile:
 *  delete:
 *      tags:
 *          - Profile
 *      summary: Удаление аккаунта
 *      description: Полное удаление аккаунта текущего пользователя и связанных с ним данных
 *      security:
 *          - bearerAuth: []
 *      responses:
 *          '200':
 *              description: Аккаунт успешно удален
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              message:
 *                                  type: string
 *                                  example: Аккаунт успешно удален
 *          '401':
 *              description: Отсутствует действительный access token
 *          '500':
 *              description: Ошибка при удалении аккаунта
 */
router.delete("/", authMiddleware, deleteMyProfile);

export default router;