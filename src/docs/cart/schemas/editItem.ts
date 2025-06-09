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
 *         userId:
 *           type: string
 *           format: uuid
 *         browserId:
 *           type: string
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
