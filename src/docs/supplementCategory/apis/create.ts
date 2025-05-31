/**
 * @swagger
 * /supplement-categories:
 *    post:
 *      tags: [SupplementCategory]
 *      summary: Create a new SupplementCategory
 *      security:
 *        - bearerAuth: []
 *      consumes:
 *        - application/json
 *        - multipart/form-data
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *              schema:
 *                $ref: '#components/schemas/CreateSupplementCategory'
 *          multipart/form-data:
 *              schema:
 *                $ref: '#components/schemas/CreateSupplementCategory'
 *      responses:
 *        200:
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/GetSupplementCategory'
 *        400:
 *          description: 	Validation Failed
 *        401:
 *          description: Error Token
 *        403:
 *          description: Access Denied / Unauthorized
 *        500:
 *          description: Internal server error
 */
