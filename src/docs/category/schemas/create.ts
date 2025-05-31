/**
 * @swagger
 * components:
 *   schemas:
 *     CreateCategory:
 *       type: object
 *       required:
 *         - nameFr
 *         - nameAr
 *         - picture
 *         - icon
 *         - hasNoSubCategory
 *         - menu
 *       properties:
 *         nameFr:
 *           type: string
 *         nameAr:
 *           type: string
 *         descriptionFr:
 *           type: string
 *         descriptionAr:
 *           type: string
 *         picture:
 *           type: string
 *           format: binary
 *         icon:
 *           type: string
 *         menu:
 *           type: string
 *           format: uuid
 *         hasNoSubCategory:
 *           type: boolean
 */
