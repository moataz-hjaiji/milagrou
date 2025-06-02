"use strict";
/**
 * @swagger
 * /carts/add:
 *    post:
 *      tags: [Cart]
 *      summary: add an item to ur cart
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
 *                $ref: '#components/schemas/AddToCart'
 *          multipart/form-data:
 *              schema:
 *                $ref: '#components/schemas/AddToCart'
 *      responses:
 *        200:
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/GetCart'
 *        400:
 *          description: 	Validation Failed
 *        401:
 *          description: Error Token
 *        403:
 *          description: Access Denied / Unauthorized
 *        500:
 *          description: Internal server error
 */
//# sourceMappingURL=addToCart.js.map