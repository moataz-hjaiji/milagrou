/**
 * @swagger
 * components:
 *   schemas:
 *     GetPromoCode:
 *       type: object
 *       properties:
 *         code:
 *           type: string
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
 *         oneTimeUse:
 *           type: boolean
 *         maxUsage:
 *           type: number
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
 */
