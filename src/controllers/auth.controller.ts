import { Request, Response } from 'express';
import asyncHandler from '../helpers/utils/asyncHandler';
import { ProtectedRequest } from '../types/app-request';
import authService from '../services/auth';
import {
  SuccessMsgResponse,
  SuccessResponse,
  TokenRefreshResponse,
} from '../core/ApiResponse';

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { emailOrPhone, password } = req.body;
  const result = await authService.loginUser({ emailOrPhone, password });
  new SuccessResponse('Login Success', result).send(res);
});

export const loginAdmin = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await authService.loginAdmin({ email, password });
  new SuccessResponse('Login Success', result).send(res);
});

export const logout = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { id } = req.keystore;
    await authService.logout(id);
    new SuccessMsgResponse('Logout success').send(res);
  }
);

export const refreshToken = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const result = await authService.refreshToken(req);
    new TokenRefreshResponse(
      'Token Issued',
      result.accessToken,
      result.refreshToken
    ).send(res);
  }
);

export const registerPhone = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { phoneNumber } = req.body;
    await authService.registerPhone(phoneNumber);
    new SuccessMsgResponse('Register success').send(res);
  }
);

export const resendRegisterPhone = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { phoneNumber } = req.body;
    await authService.resendRegisterPhone(phoneNumber);
    new SuccessMsgResponse('Resend success').send(res);
  }
);

export const verifyCodeRegister = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { phoneNumber, registerConfirmationCode } = req.body;
    await authService.verifyCodeRegister({
      phoneNumber,
      registerConfirmationCode,
    });
    new SuccessMsgResponse('Verification success').send(res);
  }
);

export const setCredentials = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const {
      phoneNumber,
      registerConfirmationCode,
      password,
      confirmPassword,
      firstName,
      lastName,
      email,
    } = req.body;
    const result = await authService.setCredentials({
      phoneNumber,
      firstName,
      lastName,
      email,
      registerConfirmationCode,
      password,
      confirmPassword,
    });
    new SuccessResponse('Credentials set success', result).send(res);
  }
);

export const forgetPassword = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { phoneNumber } = req.body;
    await authService.forgetPassword(phoneNumber);
    new SuccessMsgResponse('Forget password request success').send(res);
  }
);

export const resendForgetPassword = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { phoneNumber } = req.body;
    await authService.resendForgetPassword(phoneNumber);
    new SuccessMsgResponse('Resend success').send(res);
  }
);

export const verifyCodeForgetPasword = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { phoneNumber, forgetConfirmationCode } = req.body;
    await authService.verifyCodeForgetPasword({
      phoneNumber,
      forgetConfirmationCode,
    });
    new SuccessMsgResponse('Verification success').send(res);
  }
);

export const resetPassword = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { phoneNumber, forgetConfirmationCode, password, confirmPassword } =
      req.body;
    const result = await authService.resetPassword({
      phoneNumber,
      forgetConfirmationCode,
      password,
      confirmPassword,
    });
    new SuccessResponse('Password reset success', result).send(res);
  }
);
