/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateSiteSetting:
 *       type: object
 *       properties:
 *         branding:
 *           type: object
 *           properties:
 *             logo:
 *               type: string
 *               format: binary
 *             primaryColor:
 *               type: string
 *             secondaryColor:
 *               type: string
 *             themeColor:
 *               type: string
 *             fontStyle:
 *               type: string
 *             titleAng:
 *               type: string
 *             titleAr:
 *               type: string
 *             sloganAng:
 *               type: string
 *             sloganAr:
 *               type: string
 *         contactInformation:
 *           type: object
 *           properties:
 *             phone:
 *               type: string
 *             email:
 *               type: string
 *             addressAng:
 *               type: string
 *             addressAr:
 *               type: string
 *         socialMediaLinks:
 *           type: object
 *           properties:
 *             facebook:
 *               type: string
 *             x:
 *               type: string
 *             tictok:
 *               type: string
 *             youtube:
 *               type: string
 *             instagram:
 *               type: string
 *         homePageContent:
 *           type: object
 *           properties:
 *             carouselImagesList:
 *               type: object
 *               properties:
 *                 titleAng:
 *                   type: string
 *                 titleAr:
 *                   type: string
 *                 products:
 *                   type: array
 *                   items:
 *                     type: string
 *                     format: mongo-id
 *                 isEnabled:
 *                   type: boolean
 *             videoUrl:
 *               type: object
 *               properties:
 *                 titleAng:
 *                   type: string
 *                 titleAr:
 *                   type: string
 *                 url:
 *                   type: string
 *                   format: binary
 *                 isEnabled:
 *                   type: boolean
 *             sectionTexts:
 *               type: object
 *               properties:
 *                 qualityAng:
 *                   type: string
 *                 qualityAr:
 *                   type: string
 *                 deliveryAng:
 *                   type: string
 *                 deliveryAr:
 *                   type: string
 *                 selectionAng:
 *                   type: string
 *                 selectionAr:
 *                   type: string
 *                 isEnabled:
 *                   type: boolean
 *                   default: true
 *             bestSeller:
 *               type: object
 *               properties:
 *                 titleAng:
 *                   type: string
 *                 titleAr:
 *                   type: string
 *                 products:
 *                   type: array
 *                   items:
 *                     type: string
 *                     format: mongo-id
 *                 isEnabled:
 *                   type: boolean
 */
