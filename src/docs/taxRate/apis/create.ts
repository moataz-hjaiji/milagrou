/**
 * @swagger
 * /tax-rates:
 *    post:
 *      tags: [TaxRate]
 *      summary: Create a new TaxRate
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
 *                $ref: '#components/schemas/CreateTaxRate'
 *          multipart/form-data:
 *              schema:
 *                $ref: '#components/schemas/CreateTaxRate'
 *      responses:
 *        200:
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/GetTaxRate'
 *        400:
 *          description: 	Validation Failed
 *        401:
 *          description: Error Token
 *        403:
 *          description: Access Denied / Unauthorized
 *        500:
 *          description: Internal server error
 */
