/**
 * @swagger
 * components:
 *   schemas:
 *     IncrementOrDecrement:
 *       type: object
 *       required:
 *         - itemId
 *         - action
 *       properties:
 *         itemId:
 *           type: string
 *           format: uuid
 *         action:
 *           type: string
 *           enum:
 *             - PLUS
 *             - MINUS

 */
