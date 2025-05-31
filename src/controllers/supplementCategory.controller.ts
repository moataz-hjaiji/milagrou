import { Response } from 'express';
import asyncHandler from '../helpers/utils/asyncHandler';
import { ProtectedRequest } from '../types/app-request';
import supplementCategoryService from '../services/supplementCategory';

import {
  SuccessMsgResponse,
  SuccessResponse,
  SuccessResponsePaginate,
} from '../core/ApiResponse';

export const create = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { body } = req;
    const result = await supplementCategoryService.create({ body });
    new SuccessResponse('supplementCategory created', result).send(res);
  }
);

export const getAll = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { query } = req;
    const result = await supplementCategoryService.getAll(query);

    new SuccessResponsePaginate(
      'All supplementCategorys returned successfully',
      result.docs,
      result.meta
    ).send(res);
  }
);

export const getOne = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { id } = req.params;
    const { query } = req;
    const result = await supplementCategoryService.getOne(id, query);
    new SuccessResponse('supplementCategory returned', result).send(res);
  }
);

export const update = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { id } = req.params;
    const { body, file } = req;
    const result = await supplementCategoryService.update({ id, body });
    new SuccessResponse('supplementCategory updated', result).send(res);
  }
);

export const remove = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { id } = req.params;
    await supplementCategoryService.remove(id);
    new SuccessMsgResponse('supplementCategory Deleted').send(res);
  }
);
