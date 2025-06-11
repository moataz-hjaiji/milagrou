import Joi from '@hapi/joi';
import { JoiObjectId } from '../../helpers/utils/validator';

export default {
  param: Joi.object().keys({
    id: JoiObjectId().required(),
  }),

  create: Joi.object().keys({
    branding: Joi.object().keys({
      primaryColor: Joi.string(),
      secondaryColor: Joi.string(),
      themeColor: Joi.string(),
      fontStyle: Joi.string(),
      titleAng: Joi.string(),
      titleAr: Joi.string(),
      sloganAng: Joi.string(),
      sloganAr: Joi.string(),
    }),
    contactInformation: Joi.object().keys({
      phone: Joi.string(),
      email: Joi.string().email(),
      addressAng: Joi.string(),
      addressAr: Joi.string(),
    }),
    socialMediaLinks: Joi.object().keys({
      facebook: Joi.string(),
      x: Joi.string(),
      tictok: Joi.string(),
      youtube: Joi.string(),
      instagram: Joi.string(),
    }),
    homePageContent: Joi.object().keys({
      carouselImagesList: Joi.object().keys({
        titleAng: Joi.string(),
        titleAr: Joi.string(),
        products: Joi.array().items(JoiObjectId()),
        isEnabled: Joi.boolean(),
      }),
      videoUrl: Joi.object().keys({
        titleAng: Joi.string(),
        titleAr: Joi.string(),
        isEnabled: Joi.boolean(),
      }),
      sectionTexts: Joi.object().keys({
        qualityAng: Joi.string(),
        qualityAr: Joi.string(),
        deliveryAng: Joi.string(),
        deliveryAr: Joi.string(),
        selectionAng: Joi.string(),
        selectionAr: Joi.string(),
        isEnabled: Joi.boolean(),
      }),
      bestSeller: Joi.object().keys({
        titleAng: Joi.string(),
        titleAr: Joi.string(),
        products: Joi.array().items(JoiObjectId()),
        isEnabled: Joi.boolean(),
      }),
    }),
  }),
};
