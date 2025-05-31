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
 *             selectedSupplements:
 *               type: array
 *               items:
 *                 type: object
 *                 required:
 *                   - supplementCategory
 *                   - supplements
 *                 properties:
 *                   supplementCategory:
 *                     type: string
 *                     format: uuid
 *                   supplements:
 *                     type: array
 *                     minItems: 1
 *                     items:
 *                       type: object
 *                       required:
 *                         - supplement
 *                       properties:
 *                         supplement:
 *                           type: string
 *                           format: uuid
 *             notes:
 *               type: string
 */
