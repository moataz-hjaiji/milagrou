/**
 * @swagger
 * /carts/edit:
 *    put:
 *      tags: [Cart]
 *      summary: edit item in my cart
 *      consumes:
 *        - application/json
 *        - multipart/form-data
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *              schema:
 *                $ref: '#components/schemas/EditItem'
 *          multipart/form-data:
 *              schema:
 *                $ref: '#components/schemas/EditItem'
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
