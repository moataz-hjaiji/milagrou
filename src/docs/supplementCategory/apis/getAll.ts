/**
 * @swagger
 *  /supplement-categories:
 *    get:
 *      summary: Get all the SupplementCategorys
 *      tags: [SupplementCategory]
 *      responses:
 *        200:
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  $ref: '#/components/schemas/GetSupplementCategory'
 *        400:
 *          description: 	Validation Failed
 *        401:
 *          description: Error Token
 *        403:
 *          description: Access Denied / Unauthorized
 *        500:
 *          description: Internal server error
 */
