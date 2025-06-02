/**
 * @swagger
 * components:
 *   schemas:
 *     CreateProduct:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - price
 *         - category
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         price:
 *           type: number
 *         position:
 *           type: integer
 *         category:
 *           type: string
 *           format: uuid
 *         stores:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               store:
 *                 type: string
 *                 format: uuid
 *               quantity:
 *                 type: number
 *         supplements:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               supplement:
 *                 type: string
 *                 format: uuid
 *               price:
 *                 type: number
 */
