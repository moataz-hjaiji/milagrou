/**
 * @swagger
 * /sub-categories:
 *    post:
 *      tags: [SubCategory]
 *      summary: Create a new SubCategory
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
 *                $ref: '#components/schemas/CreateSubCategory'
 *          multipart/form-data:
 *              schema:
 *                $ref: '#components/schemas/CreateSubCategory'
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
