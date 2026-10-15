import { Router } from "express";
import { 
    register,
    login,
    refresh,
    logout
} from "../controllers/auth_controller";

const router = Router();

/**
 * @openapi
 * /api/auth/register:
 *  post:
 *      tags:
 *          - Auth
 *      summary: Создание аккаунта
 *      description: Регистрация нового пользователя.
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/RegisterRequest'
 *      responses:
 *          '201':
 *              description: Аккаунт успешно создан
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              message:
 *                                  type: string
 *                              user:
 *                                  $ref: '#/components/schemas/User'
 *          '400':
 *              description: Некорректные данные
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/ErrorResponse'
 *          '409':
 *              description: Пользователь с таким email уже существует
 *          '500':
 *              description: Внутренняя ошибка сервера
 */
router.post("/register", register);

/**
 * @openapi
 * /api/auth/login:
 *  post:
 *      tags:
 *          - Auth
 *      summary: Вход в аккаунт
 *      description: Проверка email и пароля, выдает access token и устанавливает refresh cookie.
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/LoginRequest'
 *      responses:
 *          '200':
 *              description: Вход выполнен успешно
 *              headers:
 *                  Set-Cookie:
 *                      description: HttpOnly cookie с refresh token
 *                      schema:
 *                          type: string
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/AuthResponse'
 *          '400':
 *              description: Не переданы email или пароль
 *          '401':
 *              description: Неверный email или пароль
 *          '500':
 *              description: Внутренняя ошибка сервера
 */
router.post("/login", login);

/**
 * @openapi
 * /api/auth/refresh:
 *  post:
 *      tags:
 *          - Auth
 *      summary: Обновление access token
 *      description: Проверяет refresh token из cookie и выдает новый access token.
 *      security:
 *          - refreshCookie: []
 *      responses:
 *          '200':
 *              description: Токен успешно обновлен
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/AccessTokenResponse'
 *          '401':
 *              description: Refresh token отсутствует, недействителен или истек
 *          '500':
 *              description: Внутренняя ошибка сервера         
 */
router.post("/refresh", refresh);

/**
 * @openapi
 * /api/auth/logout:
 *  post:
 *      tags:
 *          - Auth
 *      summary: Выход из аккаунта
 *      description: Очищает refresh cookie в браузере. При stateless-аутентификации уже скопированный refresh token не отзывается.
 *      responses:
 *          '200':
 *              description: Cookie очищена
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              message:
 *                                  type: string
 *                                  example: Выход выполнен
 *          '500':
 *              description: Внутренняя ошибка сервера
 */
router.post("/logout", logout);

export default router;