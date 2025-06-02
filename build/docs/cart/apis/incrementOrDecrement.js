"use strict";
/**
 * @swagger
 * /carts/quantity:
 *    put:
 *      tags: [Cart]
 *      summary: increment or decrement an item
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
 *                $ref: '#components/schemas/IncrementOrDecrement'
 *          multipart/form-data:
 *              schema:
 *                $ref: '#components/schemas/IncrementOrDecrement'
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
//# sourceMappingURL=incrementOrDecrement.js.map