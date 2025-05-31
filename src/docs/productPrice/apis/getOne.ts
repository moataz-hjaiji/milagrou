/**
 * @swagger
 * /product-prices/{id}:
 *    get:
 *      summary: Get one ProductPrice by id
 *      parameters:
 *        - in: path
 *          name: id
 *      tags: [ProductPrice]
 *      responses:
 *        200:
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/GetProductPrice'
 *        400:
 *          description: 	Validation Failed
 *        401:
 *          description: Error Token
 *        403:
 *          description: Access Denied / Unauthorized
 *        500:
 *          description: Internal server error
 */
