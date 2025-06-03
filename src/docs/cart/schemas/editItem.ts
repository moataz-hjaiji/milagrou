/**
 * @swagger
 * components:
 *   schemas:
 *     EditItem:
 *       type: object
 *       required:
 *         - itemId
 *         - item
 *       properties:
 *         itemId:
 *           type: string
 *           format: uuid
 *         item:
 *           type: object
 *           properties:
 *             supplements:
 *               type: array
 *               items:
 *                 type: string
 *                 format: uuid
 */
