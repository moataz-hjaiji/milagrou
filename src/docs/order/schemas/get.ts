/**
 * @swagger
 * components:
 *   schemas:
 *     GetOrder:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *           format: uuid
 *         deliveryType:
 *           type: string
 *         paymentMethodId:
 *           type: string
 *           format: uuid
 *         addressId:
 *           type: string
 *           format: uuid
 *         orderPrice:
 *           type: number
 *         newId:
 *           type: number
 *         status:
 *           type: string
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
 *               itemPrice:
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
 *                           price:
 *                             type: integer
 *               notes:
 *                 type: string
 *         deliveryGuyId:
 *           type: string
 *           format: uuid
 *         deliveryGuyacceptance:
 *           type: boolean
 */
