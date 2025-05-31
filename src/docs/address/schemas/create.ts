/**
 * @swagger
 * components:
 *   schemas:
 *     CreateAddress:
 *       type: object
 *       required:
 *         - userId
 *         - location
 *         - city
 *         - street
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
 *           required:
 *             - type
 *             - coordinates
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
 */
