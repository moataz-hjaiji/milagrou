/**
 * @swagger
 * /governorates/{id}:
 *    get:
 *      summary: Get one Governorate by id
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: id
 *      tags: [Governorate]
 *      responses:
 *        200:
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/GetGovernorate'
 *        400:
 *          description: 	Validation Failed
 *        401:
 *          description: Error Token
 *        403:
 *          description: Access Denied / Unauthorized
 *        500:
 *          description: Internal server error
 */
