/**
 * @swagger
 * /menus/{id}:
 *    get:
 *      summary: Get one Menu by id
 *      parameters:
 *        - in: path
 *          name: id
 *      tags: [Menu]
 *      responses:
 *        200:
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/GetMenu'
 *        400:
 *          description: 	Validation Failed
 *        401:
 *          description: Error Token
 *        403:
 *          description: Access Denied / Unauthorized
 *        500:
 *          description: Internal server error
 */
