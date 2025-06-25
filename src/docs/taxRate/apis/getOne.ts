/**
 * @swagger
 * /tax-rates/{id}:
 *    get:
 *      summary: Get one TaxRate by id
 *      parameters:
 *        - in: path
 *          name: id
 *      tags: [TaxRate]
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
