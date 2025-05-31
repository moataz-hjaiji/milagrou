/**
 * @swagger
 * /product-prices:
 *    post:
 *      tags: [ProductPrice]
 *      summary: Create a new ProductPrice
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
 *                $ref: '#components/schemas/CreateProductPrice'
 *          multipart/form-data:
 *              schema:
 *                $ref: '#components/schemas/CreateProductPrice'
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
