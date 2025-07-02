/**
 * @swagger
 * components:
 *   schemas:
 *     GetPopup:
 *       type: object
 *       properties:
 *         titleAng:
 *           type: string
 *         titleAr:
 *           type: string
 *         descriptionAng:
 *           type: string
 *         descriptionAr:
 *           type: string
 *         buttonTextAng:
 *           type: string
 *         buttonTextAr:
 *           type: string
 *         image:
 *           type: string
 *         target:
 *           type: object
 *           properties:
 *             categoryId:
 *               type: string
 *               format: ObjectId
 *             productId:
 *               type: string
 *               format: ObjectId
 *         isActive:
 *           type: boolean
 *         startDate:
 *           type: string
 *           format: date-time
 *         endDate:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
 */
