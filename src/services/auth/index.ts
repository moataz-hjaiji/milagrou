import { loginUser } from './loginUser.service';
import { loginAdmin } from './loginAdmin.service';
import { logout } from './logout.service';
import { refreshToken } from './refreshToken.service';
import { registerPhone } from './registerPhone.service';
import { resendRegisterPhone } from './resendRegisterPhone.service';
import { verifyCodeRegister } from './verifyCodeRegister.service';
import { setCredentials } from './setCredentials.service';
import { forgetPassword } from './forgetPassword.service';
import { verifyCodeForgetPasword } from './verifyCodeForgetPasword.service';
import { resendForgetPassword } from './resendForgetPassword.service';
import { resetPassword } from './resetPassword.service';
import { loginDelivery } from './loginDelivery.service';

export default {
  loginUser,
  loginAdmin,
  logout,
  refreshToken,
  registerPhone,
  resendRegisterPhone,
  verifyCodeRegister,
  setCredentials,
  forgetPassword,
  verifyCodeForgetPasword,
  resendForgetPassword,
  resetPassword,
  loginDelivery,
};
