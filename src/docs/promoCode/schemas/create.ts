/**
 * @swagger
 * components:
 *   schemas:
 *     CreatePromoCode:
 *       type: object
 *       required:
 *         - code
 *         - startDate
 *         - endDate
 *         - amount
 *         - type
 *         - isActive
 *         - oneTimeUse
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
 */
