import { Response } from 'express';
import asyncHandler from '../helpers/utils/asyncHandler';
import { ProtectedRequest } from '../types/app-request';
import menuService from '../services/menu';

import {
  SuccessMsgResponse,
  SuccessResponse,
  SuccessResponsePaginate,
} from '../core/ApiResponse';

export const create = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { body, file } = req;
    const result = await menuService.create({ body, file });
    new SuccessResponse('Menu created', result).send(res);
  }
);

export const getAll = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { query } = req;
    const result = await menuService.getAll(query);

    new SuccessResponsePaginate(
      'All menus returned successfully',
      result.docs,
      result.meta
    ).send(res);
  }
);

export const getOne = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { id } = req.params;
    const { query } = req;
    const result = await menuService.getOne(id, query);
    new SuccessResponse('Menu returned', result).send(res);
  }
);

export const update = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { id } = req.params;
    const { body, file } = req;
    const result = await menuService.update({ id, body, file });
    new SuccessResponse('Menu updated', result).send(res);
  }
);

export const remove = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { id } = req.params;
    await menuService.remove(id);
    new SuccessMsgResponse('Menu Deleted').send(res);
  }
);

export const getMenusForHome = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { query } = req;
    const result = await menuService.getMenusForHome(query);

    new SuccessResponsePaginate(
      'All menus returned successfully',
      result.docs,
      result.meta
    ).send(res);
  }
);
