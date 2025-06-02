"use strict";
/**
 * @swagger
 * /governorates/{id}:
 *    put:
 *      summary: Update Governorate by id
 *      security:
 *        - bearerAuth: []
 *      consumes:
 *        - application/json
 *        - multipart/form-data
 *      tags: [Governorate]
 *      parameters:
 *        - in: path
 *          name: id
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *              schema:
 *                $ref: '#components/schemas/UpdateGovernorate'
 *          multipart/form-data:
 *              schema:
 *                $ref: '#components/schemas/UpdateGovernorate'
 *      responses:
 *        200:
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/GetGovernorate'
 *        400:
 *          description: 	Validation Failed
 *        401:
 *          description: Error Token
 *        403:
 *          description: Access Denied / Unauthorized
 *        500:
 *          description: Internal server error
 *
 */
//# sourceMappingURL=update.js.map