import { Response } from 'express';
import asyncHandler from '../helpers/utils/asyncHandler';
import { ProtectedRequest } from '../types/app-request';
import favouriteService from '../services/favourite';

import {
  SuccessMsgResponse,
  SuccessResponse,
  SuccessResponsePaginate,
} from '../core/ApiResponse';

export const create = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { body } = req;
    const result = await favouriteService.create({ body });
    new SuccessResponse('Favourite created', result).send(res);
  }
);

export const getAll = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { query } = req;
    const result = await favouriteService.getAll(query);

    new SuccessResponsePaginate(
      'All favourites returned successfully',
      result.docs,
      result.meta
    ).send(res);
  }
);

export const getOne = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { id } = req.params;
    const { query } = req;
    const result = await favouriteService.getOne(id, query);
    new SuccessResponse('Favourite returned', result).send(res);
  }
);

export const update = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { id } = req.params;
    const { body } = req;
    const result = await favouriteService.update({ id, body });
    new SuccessResponse('Favourite updated', result).send(res);
  }
);

export const remove = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { id } = req.params;
    await favouriteService.remove(id);
    new SuccessMsgResponse('Favourite Deleted').send(res);
  }
);

export const toggle = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const productId = req.params.id;
    const userId = req.user._id;
    const result = await favouriteService.toggle({ productId, userId });
    if (result === true) {
      new SuccessMsgResponse('product added to favourites').send(res);
    } else {
      new SuccessMsgResponse('product removed from favourites').send(res);
    }
  }
);
