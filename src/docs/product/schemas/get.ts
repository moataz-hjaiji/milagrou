/**
 * @swagger
 * components:
 *   schemas:
 *     GetProduct:
 *       type: object
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
 *           items:
 *             type: string
 *         subCategory:
 *           type: object
 *         category:
 *           type: object
 *         supplementArray:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               supplementCategory:
 *                 type: object
 *               min:
 *                 type: number
 *               max:
 *                 type: number
 *               supplements:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     supplement:
 *                       type: object
 *                     price:
 *                       type: number
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
 */
