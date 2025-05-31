import Joi from '@hapi/joi';

export default {
  loginAdmin: Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required(),
  }),

  loginUser: Joi.object().keys({
    phoneNumber: Joi.string()
      .pattern(
        /^(2[0-9]{7}|9[0-9]{7}|4[0-9]{7}|5[0-9]{7}|7[0-9]{7})$/,
        'numbers'
      )
      .required(),
    password: Joi.string().required().required(),
  }),

  loginDelivery: Joi.object().keys({
    emailOrUserName: Joi.string().required(),
    password: Joi.string().required(),
  }),

  refreshToken: Joi.object().keys({
    refreshToken: Joi.string().required().min(1),
  }),

  registerPhone: Joi.object().keys({
    phoneNumber: Joi.string()
      .pattern(
        /^(2[0-9]{7}|9[0-9]{7}|4[0-9]{7}|5[0-9]{7}|7[0-9]{7})$/,
        'numbers'
      )
      .required(),
  }),

  forgetPhone: Joi.object().keys({
    phoneNumber: Joi.string()
      .pattern(
        /^(2[0-9]{7}|9[0-9]{7}|4[0-9]{7}|5[0-9]{7}|7[0-9]{7})$/,
        'numbers'
      )
      .required(),
  }),

  verifyRegisterPhone: Joi.object().keys({
    phoneNumber: Joi.string()
      .pattern(
        /^(2[0-9]{7}|9[0-9]{7}|4[0-9]{7}|5[0-9]{7}|7[0-9]{7})$/,
        'numbers'
      )
      .required(),
    registerConfirmationCode: Joi.number().required(),
  }),

  verifyForgetPassword: Joi.object().keys({
    phoneNumber: Joi.string()
      .pattern(
        /^(2[0-9]{7}|9[0-9]{7}|4[0-9]{7}|5[0-9]{7}|7[0-9]{7})$/,
        'numbers'
      )
      .required(),
    forgetConfirmationCode: Joi.number().required(),
  }),

  setCredentials: Joi.object().keys({
    phoneNumber: Joi.string()
      .pattern(
        /^(2[0-9]{7}|9[0-9]{7}|4[0-9]{7}|5[0-9]{7}|7[0-9]{7})$/,
        'numbers'
      )
      .required(),
    registerConfirmationCode: Joi.number(),
    userName: Joi.string().min(3).required(),
    password: Joi.string().min(8).required(),
    confirmPassword: Joi.string().min(8).required(),
  }),

  setPAssword: Joi.object().keys({
    phoneNumber: Joi.string()
      .pattern(
        /^(2[0-9]{7}|9[0-9]{7}|4[0-9]{7}|5[0-9]{7}|7[0-9]{7})$/,
        'numbers'
      )
      .required(),
    forgetConfirmationCode: Joi.number().required(),
    password: Joi.string().min(8).required(),
    confirmPassword: Joi.string().min(8).required(),
  }),
};
