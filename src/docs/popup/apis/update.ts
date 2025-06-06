/**
 * @swagger
 * /popups/{id}:
 *    put:
 *      summary: Update Popup by id
 *      security:
 *        - bearerAuth: []
 *      consumes:
 *        - application/json
 *        - multipart/form-data
 *      tags: [Popup]
 *      parameters:
 *        - in: path
 *          name: id
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *              schema:
 *                $ref: '#components/schemas/UpdatePopup'
 *          multipart/form-data:
 *              schema:
 *                $ref: '#components/schemas/UpdatePopup'
 *      responses:
 *        200:
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/GetPopup'
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
