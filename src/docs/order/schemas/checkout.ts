/**
 * @swagger
 * components:
 *   schemas:
 *     Checkout:
 *       type: object
 *       required:
 *         - deliveryType
 *         - orderType
 *         - paymentMethodId
 *       properties:
 *         userId:
 *           type: string
 *           format: uuid
 *         browserId:
 *           type: string
 *         deliveryType:
 *           type: string
 *           enum:
 *             - DELIVERY
 *             - PICKUP
 *         orderType:
 *           type: string
 *           enum:
 *             - GIFT
 *             - NORMAL
 *             - RESERVATION
 *         code:
 *           type: string
 *         paymentMethodId:
 *           type: string
 *           format: uuid
 *         addressId:
 *           type: string
 *           format: uuid
 */
