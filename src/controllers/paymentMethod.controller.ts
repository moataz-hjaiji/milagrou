import { Response } from 'express';
import asyncHandler from '../helpers/utils/asyncHandler';
import { ProtectedRequest } from '../types/app-request';
import paymentMethodService from '../services/paymentMethod';

import {
  SuccessMsgResponse,
  SuccessResponse,
  SuccessResponsePaginate,
} from '../core/ApiResponse';

export const create = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { body } = req;
    const result = await paymentMethodService.create({ body });
    new SuccessResponse('PaymentMethod created', result).send(res);
  }
);

export const getAll = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { query } = req;
    const result = await paymentMethodService.getAll(query);

    new SuccessResponsePaginate(
      'All paymentMethods returned successfully',
      result.docs,
      result.meta
    ).send(res);
  }
);

export const getOne = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { id } = req.params;
    const { query } = req;
    const result = await paymentMethodService.getOne(id, query);
    new SuccessResponse('PaymentMethod returned', result).send(res);
  }
);

export const update = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { id } = req.params;
    const { body, file } = req;
    const result = await paymentMethodService.update({ id, body });
    new SuccessResponse('PaymentMethod updated', result).send(res);
  }
);

export const remove = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { id } = req.params;
    await paymentMethodService.remove(id);
    new SuccessMsgResponse('PaymentMethod Deleted').send(res);
  }
);
