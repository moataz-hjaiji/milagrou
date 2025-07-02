/**
 * @swagger
 * /popups/{id}:
 *    get:
 *      summary: Get one Popup by id
 *      parameters:
 *        - in: path
 *          name: id
 *      tags: [Popup]
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
 */
