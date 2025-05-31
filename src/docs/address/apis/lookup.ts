/**
 * @swagger
 * /addresses/lookup:
 *    post:
 *      tags: [Address]
 *      summary: find closest adresses
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
 *                $ref: '#components/schemas/Lookup'
 *          multipart/form-data:
 *              schema:
 *                $ref: '#components/schemas/Lookup'
 *      responses:
 *        200:
 *          description: 	sucess
 *        400:
 *          description: 	Validation Failed
 *        401:
 *          description: Error Token
 *        403:
 *          description: Access Denied / Unauthorized
 *        500:
 *          description: Internal server error
 */
