/**
 * @swagger
 * components:
 *   schemas:
 *     CreateProduct:
 *       type: object
 *       required:
 *         - nameFr
 *         - nameAr
 *         - images
 *         - isAvailable
 *         - isRecommended
 *       properties:
 *         nameFr:
 *           type: string
 *         nameAr:
 *           type: string
 *         descriptionFr:
 *           type: string
 *         descriptionAr:
 *           type: string
 *         isAvailable:
 *           type: boolean
 *         isRecommended:
 *           type: boolean
 *         images:
 *           type: array
 *           items :
 *             type: string
 *             format: binary
 *         subCategory:
 *           type: string
 *           format: uuid
 *         category:
 *           type: string
 *           format: uuid
 *         supplementArray:
 *           type: array
 *           items:
 *             type: object
 *             required:
 *               - supplementCategory
 *               - min
 *               - max
 *               - supplements
 *             properties:
 *               supplementCategory:
 *                 type: string
 *                 format: uuid
 *               min:
 *                 type: number
 *               max:
 *                 type: number
 *               supplements:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - supplement
 *                     - price
 *                   properties:
 *                     supplement:
 *                       type: string
 *                       format: uuid
 *                     price:
 *                       type: number
 */
