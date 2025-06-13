import { Response } from 'express';
import asyncHandler from '../helpers/utils/asyncHandler';
import { ProtectedRequest } from '../types/app-request';
import orderService from '../services/order';

import {
  SuccessMsgResponse,
  SuccessResponse,
  SuccessResponsePaginate,
} from '../core/ApiResponse';

export const checkout = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const {
      deliveryType,
      orderType,
      reservationDate,
      addressId,
      code,
      userId,
      browserId,
    } = req.body;

    const result = await orderService.checkout({
      userId,
      browserId,
      deliveryType,
      orderType,
      reservationDate,
      addressId,
      code,
    });
    new SuccessResponse('success', result).send(res);
  }
);

export const getAll = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { query } = req;
    const result = await orderService.getAll(query);

    new SuccessResponsePaginate(
      'All orders returned successfully',
      result.docs,
      result.meta
    ).send(res);
  }
);

export const getOne = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { id } = req.params;
    const { query } = req;
    const result = await orderService.getOne(id, query);
    new SuccessResponse('Order returned', result).send(res);
  }
);

export const update = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { id } = req.params;
    const { body } = req;
    const result = await orderService.update({ id, body });
    new SuccessResponse('Order updated', result).send(res);
  }
);

export const remove = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { id } = req.params;
    await orderService.remove(id);
    new SuccessMsgResponse('Order Deleted').send(res);
  }
);
