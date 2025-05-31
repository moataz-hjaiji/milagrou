/**
 * @swagger
 * components:
 *   schemas:
 *     GetBanner:
 *       type: object
 *       properties:
 *         titleFr:
 *           type: string
 *         titleAr:
 *           type: string
 *         descriptionFr:
 *           type: string
 *         descriptionAr:
 *           type: string
 *         picture:
 *           type: string
 *         isPublished:
 *           type: boolean
 *         data:
 *           type: object
 *           properties:
 *             menuId:
 *               type: string
 *               format: uuid
 *             categoryId:
 *               type: string
 *               format: uuid
 *             subCategoryId:
 *               type: string
 *               format: uuid
 *             productId:
 *               type: string
 *               format: uuid
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
 */
