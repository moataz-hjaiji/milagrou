/**
 * @swagger
 * components:
 *   schemas:
 *     CreateSubCategory:
 *       type: object
 *       required:
 *         - nameFr
 *         - nameAr
 *         - picture
 *         - icon
 *         - category
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
 *         category:
 *           type: string
 *           format: uuid
 */
