/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateBanner:
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
 *           format: binary
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
 */
