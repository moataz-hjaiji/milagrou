"use strict";
/**
 * @swagger
 * /delivery-prices:
 *    post:
 *      tags: [DeliveryPrice]
 *      summary: Create a new DeliveryPrice
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
 *                $ref: '#components/schemas/CreateDeliveryPrice'
 *          multipart/form-data:
 *              schema:
 *                $ref: '#components/schemas/CreateDeliveryPrice'
 *      responses:
 *        200:
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/GetDeliveryPrice'
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