/**
 * @swagger
 * components:
 *   schemas:
 *     Lookup:
 *       type: object
 *       required:
 *         - longitude
 *         - latitude
 *         - adressIds
 *       properties:
 *         longitude:
 *           type: number
 *         latitude:
 *           type: number
 *         adressIds:
 *           type: array
 *           items:
 *             type: string
 *             format: objectId
 */
