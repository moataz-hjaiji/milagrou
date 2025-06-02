import { Response } from 'express';
import asyncHandler from '../helpers/utils/asyncHandler';
import { ProtectedRequest } from '../types/app-request';
import deliveryPriceService from '../services/deliveryPrice';

import {
  SuccessMsgResponse,
  SuccessResponse,
  SuccessResponsePaginate,
} from '../core/ApiResponse';

export const create = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { body } = req;
    const result = await deliveryPriceService.create({ body });
    new SuccessResponse('DeliveryPrice created', result).send(res);
  }
);

export const getAll = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { query } = req;
    const result = await deliveryPriceService.getAll(query);

    new SuccessResponsePaginate(
      'All deliveryPrices returned successfully',
      result.docs,
      result.meta
    ).send(res);
  }
);

export const getOne = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { id } = req.params;
    const { query } = req;
    const result = await deliveryPriceService.getOne(id, query);
    new SuccessResponse('DeliveryPrice returned', result).send(res);
  }
);

export const update = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { id } = req.params;
    const { body } = req;
    const result = await deliveryPriceService.update({ id, body });
    new SuccessResponse('DeliveryPrice updated', result).send(res);
  }
);

export const remove = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { id } = req.params;
    await deliveryPriceService.remove(id);
    new SuccessMsgResponse('DeliveryPrice Deleted').send(res);
  }
);
