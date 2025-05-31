import { Response } from 'express';
import asyncHandler from '../helpers/utils/asyncHandler';
import { ProtectedRequest } from '../types/app-request';
import subCategoryService from '../services/subCategory';

import {
  SuccessMsgResponse,
  SuccessResponse,
  SuccessResponsePaginate,
} from '../core/ApiResponse';

export const create = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { body, files } = req;
    const result = await subCategoryService.create({ body, files });
    new SuccessResponse('SubCategory created', result).send(res);
  }
);

export const getAll = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { query } = req;
    const result = await subCategoryService.getAll(query);

    new SuccessResponsePaginate(
      'All subCategorys returned successfully',
      result.docs,
      result.meta
    ).send(res);
  }
);

export const getOne = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { id } = req.params;
    const { query } = req;
    const result = await subCategoryService.getOne(id, query);
    new SuccessResponse('SubCategory returned', result).send(res);
  }
);

export const update = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { id } = req.params;
    const { body, files } = req;
    const result = await subCategoryService.update({ id, body, files });
    new SuccessResponse('SubCategory updated', result).send(res);
  }
);

export const remove = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { id } = req.params;
    await subCategoryService.remove(id);
    new SuccessMsgResponse('SubCategory Deleted').send(res);
  }
);
