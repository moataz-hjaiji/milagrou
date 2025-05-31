/**
 * @swagger
 * /sub-categories/{id}:
 *    get:
 *      summary: Get one SubCategory by id
 *      parameters:
 *        - in: path
 *          name: id
 *      tags: [SubCategory]
 *      responses:
 *        200:
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/GetSubCategory'
 *        400:
 *          description: 	Validation Failed
 *        401:
 *          description: Error Token
 *        403:
 *          description: Access Denied / Unauthorized
 *        500:
 *          description: Internal server error
 */
