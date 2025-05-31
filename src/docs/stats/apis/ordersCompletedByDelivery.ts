/**
 * @swagger
 * /stats/delivery:
 *    post:
 *      tags: [Stats]
 *      summary: get number of orders Completed By Delivery
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
 *                $ref: '#components/schemas/DateRange'
 *          multipart/form-data:
 *              schema:
 *                $ref: '#components/schemas/DateRange'
 *      responses:
 *        200:
 *          description: 	success
 *        400:
 *          description: 	Validation Failed
 *        401:
 *          description: Error Token
 *        403:
 *          description: Access Denied / Unauthorized
 *        500:
 *          description: Internal server error
 */
