"use strict";
/**
 * @swagger
 * /discount:
 *    get:
 *      summary: Get all the Discounts
 *      tags: [Discount]
 *      security:
 *        - bearerAuth: []
 *      responses:
 *        200:
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  $ref: '#/components/schemas/GetDiscount'
 *        400:
 *          description: 	Validation Failed
 *        401:
 *          description: Error Token
 *        403:
 *          description: Access Denied / Unauthorized
 *        500:
 *          description: Internal server error
 */
//# sourceMappingURL=getAll.js.map