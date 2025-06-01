import { Response } from 'express';
import asyncHandler from '../helpers/utils/asyncHandler';
import { ProtectedRequest } from '../types/app-request';
import governorateService from '../services/governorate';

import {
  SuccessMsgResponse,
  SuccessResponse,
  SuccessResponsePaginate,
} from '../core/ApiResponse';

export const create = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { body } = req;
    const result = await governorateService.create({ body });
    new SuccessResponse('Governorate created', result).send(res);
  }
);

export const getAll = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { query } = req;
    const result = await governorateService.getAll(query);

    new SuccessResponsePaginate(
      'All governorates returned successfully',
      result.docs,
      result.meta
    ).send(res);
  }
);

export const getOne = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { id } = req.params;
    const { query } = req;
    const result = await governorateService.getOne(id, query);
    new SuccessResponse('Governorate returned', result).send(res);
  }
);

export const update = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { id } = req.params;
    const { body } = req;
    const result = await governorateService.update({ id, body });
    new SuccessResponse('Governorate updated', result).send(res);
  }
);

export const remove = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { id } = req.params;
    await governorateService.remove(id);
    new SuccessMsgResponse('Governorate Deleted').send(res);
  }
);
