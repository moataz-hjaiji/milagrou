/**
 * @swagger
 * components:
 *   schemas:
 *     GetCart:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *           format: uuid
 *         totalCartPrice:
 *           type: number
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *                 format: uuid
 *               product:
 *                 type: string
 *                 format: uuid
 *               quantity:
 *                 type: integer
 *               supplements:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *
 */
