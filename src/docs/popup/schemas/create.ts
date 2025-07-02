/**
 * @swagger
 * components:
 *   schemas:
 *     CreatePopup:
 *       type: object
 *       required:
 *         - titleAng
 *         - titleAr
 *         - descriptionAng
 *         - descriptionAr
 *         - buttonTextAng
 *         - buttonTextAr
 *         - image
 *         - target
 *         - isActive
 *         - startDate
 *         - endDate
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
 *           format: binary
 *         target:
 *           type: object
 *           properties:
 *             categoryId:
 *               type: string
 *               format: ObjectId
 *             productId:
 *               type: string
 *               format: ObjectId
 *           oneOf:
 *             - required: ["categoryId"]
 *             - required: ["productId"]
 *         isActive:
 *           type: boolean
 *         startDate:
 *           type: string
 *           format: date-time
 *         endDate:
 *           type: string
 *           format: date-time
 */
