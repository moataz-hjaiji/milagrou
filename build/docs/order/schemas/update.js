"use strict";
/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateOrder:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum:
 *             - ACCEPTED
 *             - PREPARING
 *             - PREPARED
 *             - DELIVERING
 *             - DELIVERED
 *         deliveryGuyId:
 *           type: string
 *           format: uuid
 *         deliveryGuyacceptance:
 *           type: boolean
 */
//# sourceMappingURL=update.js.map