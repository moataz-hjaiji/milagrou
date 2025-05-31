/**
 * @swagger
 * components:
 *   schemas:
 *     GetAddress:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *           format: objectId
 *         city:
 *           type: string
 *         street:
 *           type: string
 *         location:
 *           type: object
 *           properties:
 *             type:
 *               type: string
 *               enum:
 *                 - Point
 *             coordinates:
 *               type: array
 *               items:
 *                 type: number
 *               minItems: 2
 *               maxItems: 2
 *         isHome:
 *           type: boolean
 *         isWork:
 *           type: boolean
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
 */
