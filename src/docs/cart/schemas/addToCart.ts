/**
 * @swagger
 * components:
 *   schemas:
 *     AddToCart:
 *       type: object
 *       required:
 *         - product
 *         - quantity
 *       properties:
 *         userId:
 *           type: string
 *           format: uuid
 *         browserId:
 *           type: string
 *         product:
 *           type: string
 *           format: uuid
 *         quantity:
 *           type: integer
 *         supplements:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 */
