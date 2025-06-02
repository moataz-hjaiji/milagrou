"use strict";
/**
 * @swagger
 * components:
 *   schemas:
 *     GetDiscount:
 *       type: object
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
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
 */
//# sourceMappingURL=get.js.map