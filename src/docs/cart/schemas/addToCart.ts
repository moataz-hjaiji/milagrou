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
