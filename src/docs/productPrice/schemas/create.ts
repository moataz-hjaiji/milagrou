/**
 * @swagger
 * components:
 *   schemas:
 *     CreateProductPrice:
 *       type: object
 *       required:
 *         - product
 *         - price
 *         - isEnabled
 *       properties:
 *         product:
 *           type: string
 *           format: uuid
 *         price:
 *           type: number
 *         isEnabled:
 *           type: boolean
 */
