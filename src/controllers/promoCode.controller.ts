import { Response } from 'express';
import asyncHandler from '../helpers/utils/asyncHandler';
import { ProtectedRequest } from '../types/app-request';
import promoCodeService from '../services/promoCode';

import {
  SuccessMsgResponse,
  SuccessResponse,
  SuccessResponsePaginate,
} from '../core/ApiResponse';

export const create = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { body } = req;
    const result = await promoCodeService.create({ body });
    new SuccessResponse('PromoCode created', result).send(res);
  }
);

export const getAll = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { query } = req;
    const result = await promoCodeService.getAll(query);

    new SuccessResponsePaginate(
      'All promoCodes returned successfully',
      result.docs,
      result.meta
    ).send(res);
  }
);

export const getOne = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { id } = req.params;
    const { query } = req;
    const result = await promoCodeService.getOne(id, query);
    new SuccessResponse('PromoCode returned', result).send(res);
  }
);

export const update = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { id } = req.params;
    const { body } = req;
    const result = await promoCodeService.update({ id, body });
    new SuccessResponse('PromoCode updated', result).send(res);
  }
);

export const remove = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { id } = req.params;
    await promoCodeService.remove(id);
    new SuccessMsgResponse('PromoCode Deleted').send(res);
  }
);

export const verifyPromoCode = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const userId = req.user._id;
    const { code } = req.body;
    const result = await promoCodeService.verifyPromoCode({ userId, code });
    new SuccessResponse('success', result).send(res);
  }
);
