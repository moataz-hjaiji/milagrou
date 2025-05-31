import { Response } from 'express';
import asyncHandler from '../helpers/utils/asyncHandler';
import { ProtectedRequest } from '../types/app-request';
import bannerService from '../services/banner';
import {
  SuccessMsgResponse,
  SuccessResponse,
  SuccessResponsePaginate,
} from '../core/ApiResponse';

export const create = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { body, file } = req;
    const result = await bannerService.create({ body, file });
    new SuccessResponse('Banner created', result).send(res);
  }
);

export const getAll = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { query } = req;
    const result = await bannerService.getAll(query);

    new SuccessResponsePaginate(
      'All banners returned successfully',
      result.docs,
      result.meta
    ).send(res);
  }
);

export const getOne = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { id } = req.params;
    const { query } = req;
    const result = await bannerService.getOne(id, query);
    new SuccessResponse('Banner returned', result).send(res);
  }
);

export const update = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { id } = req.params;
    const { body, file } = req;
    const result = await bannerService.update({ id, body, file });
    new SuccessResponse('Banner updated', result).send(res);
  }
);

export const remove = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { id } = req.params;
    await bannerService.remove(id);
    new SuccessMsgResponse('Banner Deleted').send(res);
  }
);
