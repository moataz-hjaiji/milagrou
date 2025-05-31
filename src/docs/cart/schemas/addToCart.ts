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
 *           minimum: 1
 *         selectedSupplements:
 *           type: array
 *           items:
 *             type: object
 *             required:
 *               - supplementCategory
 *               - supplements
 *             properties:
 *               supplementCategory:
 *                 type: string
 *                 format: uuid
 *               supplements:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - supplement
 *                   properties:
 *                     supplement:
 *                       type: string
 *                       format: uuid
 *         notes:
 *           type: string
 */
