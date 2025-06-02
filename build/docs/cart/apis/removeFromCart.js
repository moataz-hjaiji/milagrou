"use strict";
/**
 * @swagger
 * /carts/remove:
 *    delete:
 *      tags: [Cart]
 *      summary: remove an item from my cart
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
 *                $ref: '#components/schemas/RemoveFromCart'
 *          multipart/form-data:
 *              schema:
 *                $ref: '#components/schemas/RemoveFromCart'
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
//# sourceMappingURL=removeFromCart.js.map