import { Response } from 'express';
import asyncHandler from '../helpers/utils/asyncHandler';
import { ProtectedRequest } from '../types/app-request';
import addressService from '../services/address';

import {
  SuccessMsgResponse,
  SuccessResponse,
  SuccessResponsePaginate,
} from '../core/ApiResponse';

export const create = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { body } = req;
    const result = await addressService.create({ body });
    new SuccessResponse('Address created', result).send(res);
  }
);

export const getAll = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { query } = req;
    const result = await addressService.getAll(query);

    new SuccessResponsePaginate(
      'All addresss returned successfully',
      result.docs,
      result.meta
    ).send(res);
  }
);

export const getOne = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { id } = req.params;
    const { query } = req;
    const result = await addressService.getOne(id, query);
    new SuccessResponse('Address returned', result).send(res);
  }
);

export const update = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { id } = req.params;
    const { body } = req;
    const result = await addressService.update({ id, body });
    new SuccessResponse('Address updated', result).send(res);
  }
);

export const remove = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { id } = req.params;
    await addressService.remove(id);
    new SuccessMsgResponse('Address Deleted').send(res);
  }
);
