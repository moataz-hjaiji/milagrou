/**
 * @swagger
 * /supplements/{id}:
 *    get:
 *      summary: Get one Supplement by id
 *      parameters:
 *        - in: path
 *          name: id
 *      tags: [Supplement]
 *      responses:
 *        200:
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/GetSupplement'
 *        400:
 *          description: 	Validation Failed
 *        401:
 *          description: Error Token
 *        403:
 *          description: Access Denied / Unauthorized
 *        500:
 *          description: Internal server error
 */
