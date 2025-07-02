/**
 * @swagger
 * components:
 *   schemas:
 *     CreateDiscount:
 *       type: object
 *       required:
 *         - target
 *         - startDate
 *         - endDate
 *         - amount
 *         - type
 *       properties:
 *         target:
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
 *         startDate:
 *           type: string
 *         endDate:
 *           type: string
 *         amount:
 *           type: number
 *         type:
 *           type: string
 *           enum:
 *             - AMOUNT
 *             - PERCENTAGE
 *         isActive:
 *           type: boolean
 */
