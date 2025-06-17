import express from 'express';
import validator from '../../helpers/utils/validator';
import schema from './schema';
import authentication from '../../authUtils/authentication';
import * as authController from '../../controllers/auth.controller';

const router = express.Router();

router.post(
  '/login/user',
  validator(schema.loginUser),
  authController.loginUser
);

router.post(
  '/login/admin',
  validator(schema.loginAdmin),
  authController.loginAdmin
);

router.post(
  '/register',
  validator(schema.registerPhone),
  authController.registerPhone
);

router.post(
  '/register/verify',
  validator(schema.verifyRegisterPhone),
  authController.verifyCodeRegister
);

router.post(
  '/register/set-credentials',
  validator(schema.setCredentials),
  authController.setCredentials
);

router.post(
  '/register/resend',
  validator(schema.registerPhone),
  authController.resendRegisterPhone
);

router.post(
  '/password/forget',
  validator(schema.forgetPhone),
  authController.forgetPassword
);

router.post(
  '/password/verify',
  validator(schema.verifyForgetPassword),
  authController.verifyCodeForgetPasword
);

router.post(
  '/password/reset',
  validator(schema.setPassword),
  authController.resetPassword
);

router.post(
  '/password/resend',
  validator(schema.forgetPhone),
  authController.resendForgetPassword
);

router.post('/login/google', authController.googleAuthProvider);

router.post(
  '/login/whatsapp/send-verification',
  authController.whatsappAuthPrividerSendVerification
);
router.post(
  '/login/whatsapp/verify',
  authController.whatsappAuthPrividerVerify
);

router.use('/', authentication);

router.post(
  '/refresh',
  validator(schema.refreshToken),
  authController.refreshToken
);

router.post('/logout', authController.logout);

export default router;
