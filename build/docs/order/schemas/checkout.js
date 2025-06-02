"use strict";
/**
 * @swagger
 * components:
 *   schemas:
 *     Checkout:
 *       type: object
 *       required:
 *         - deliveryType
 *         - paymentMethodId
 *       properties:
 *         deliveryType:
 *           type: string
 *           enum:
 *             - DELIVERY
 *             - PICKUP
 *         code:
 *           type: string
 *         paymentMethodId:
 *           type: string
 *           format: uuid
 *         addressId:
 *           type: string
 *           format: uuid
 */
//# sourceMappingURL=checkout.js.map