"use strict";
/**
 * @swagger
 * /discount:
 *    post:
 *      tags: [Discount]
 *      summary: Create a new Discount
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
 *                $ref: '#components/schemas/CreateDiscount'
 *          multipart/form-data:
 *              schema:
 *                $ref: '#components/schemas/CreateDiscount'
 *      responses:
 *        200:
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/GetDiscount'
 *        400:
 *          description: 	Validation Failed
 *        401:
 *          description: Error Token
 *        403:
 *          description: Access Denied / Unauthorized
 *        500:
 *          description: Internal server error
 */
//# sourceMappingURL=create.js.map