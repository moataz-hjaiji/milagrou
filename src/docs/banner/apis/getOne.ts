/**
 * @swagger
 * /banners/{id}:
 *    get:
 *      summary: Get one Banner by id
 *      parameters:
 *        - in: path
 *          name: id
 *      tags: [Banner]
 *      responses:
 *        200:
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/GetBanner'
 *        400:
 *          description: 	Validation Failed
 *        401:
 *          description: Error Token
 *        403:
 *          description: Access Denied / Unauthorized
 *        500:
 *          description: Internal server error
 */
