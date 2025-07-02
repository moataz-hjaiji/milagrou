/**
 * @swagger
 * components:
 *   schemas:
 *     CreateAddress:
 *       type: object
 *       required:
 *         - areaId
 *         - street
 *         - block
 *       properties:
 *         userId:
 *           type: string
 *           format: objectId
 *         browserId:
 *           type: string
 *         areaId:
 *           type: string
 *           format: objectId
 *         block:
 *           type: string
 *         street:
 *           type: string
 *         buildingNumber:
 *           type: integer
 *         specialDirection:
 *           type: string
 */
