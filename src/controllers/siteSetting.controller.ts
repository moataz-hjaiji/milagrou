import { Response } from 'express';
import asyncHandler from '../helpers/utils/asyncHandler';
import { ProtectedRequest } from '../types/app-request';
import siteSettingService from '../services/siteSetting';

import {
  SuccessMsgResponse,
  SuccessResponse,
  SuccessResponsePaginate,
} from '../core/ApiResponse';

export const create = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { body, files } = req;
    const result = await siteSettingService.create({ body, files });
    new SuccessResponse('SiteSetting created', result).send(res);
  }
);

export const getAll = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { query } = req;
    const result = await siteSettingService.getAll(query);

    new SuccessResponsePaginate(
      'All siteSettings returned successfully',
      result.docs,
      result.meta
    ).send(res);
  }
);

export const getOne = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { id } = req.params;
    const { query } = req;
    const result = await siteSettingService.getOne(id, query);
    new SuccessResponse('SiteSetting returned', result).send(res);
  }
);

export const update = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { id } = req.params;
    const { body, files } = req;
    const result = await siteSettingService.update({ id, body, files });
    new SuccessResponse('SiteSetting updated', result).send(res);
  }
);

export const remove = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { id } = req.params;
    await siteSettingService.remove(id);
    new SuccessMsgResponse('SiteSetting Deleted').send(res);
  }
);
