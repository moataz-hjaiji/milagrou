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
 *         userId:
 *           type: string
 *           format: uuid
 *         browserId:
 *           type: string
 *         itemId:
 *           type: string
 *           format: uuid
 *         action:
 *           type: string
 *           enum:
 *             - PLUS
 *             - MINUS

 */
