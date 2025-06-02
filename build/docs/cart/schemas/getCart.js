"use strict";
/**
 * @swagger
 * components:
 *   schemas:
 *     GetCart:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *           format: uuid
 *         totalCartPrice:
 *           type: number
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *                 format: uuid
 *               product:
 *                 type: string
 *                 format: uuid
 *               quantity:
 *                 type: integer
 *               selectedSupplements:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     supplementCategory:
 *                       type: string
 *                       format: uuid
 *                     supplements:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           supplement:
 *                             type: string
 *                             format: uuid
 *               notes:
 *                 type: string
 */
//# sourceMappingURL=getCart.js.map