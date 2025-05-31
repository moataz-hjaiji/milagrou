/**
 * @swagger
 * /promo-codes:
 *    post:
 *      tags: [PromoCode]
 *      summary: Create a new PromoCode
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
 *                $ref: '#components/schemas/CreatePromoCode'
 *          multipart/form-data:
 *              schema:
 *                $ref: '#components/schemas/CreatePromoCode'
 *      responses:
 *        200:
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/GetPromoCode'
 *        400:
 *          description: 	Validation Failed
 *        401:
 *          description: Error Token
 *        403:
 *          description: Access Denied / Unauthorized
 *        500:
 *          description: Internal server error
 */
