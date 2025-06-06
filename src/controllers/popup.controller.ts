import { Response } from 'express';
import asyncHandler from '../helpers/utils/asyncHandler';
import { ProtectedRequest } from '../types/app-request';
import popupService from '../services/popup';

import {
  SuccessMsgResponse,
  SuccessResponse,
  SuccessResponsePaginate,
} from '../core/ApiResponse';

export const create = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { body, file } = req;
    const result = await popupService.create({ body, file });
    new SuccessResponse('Popup created', result).send(res);
  }
);

export const getAll = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { query } = req;
    const result = await popupService.getAll(query);

    new SuccessResponsePaginate(
      'All popups returned successfully',
      result.docs,
      result.meta
    ).send(res);
  }
);

export const getOne = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { id } = req.params;
    const { query } = req;
    const result = await popupService.getOne(id, query);
    new SuccessResponse('Popup returned', result).send(res);
  }
);

export const update = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { id } = req.params;
    const { body, file } = req;
    const result = await popupService.update({ id, body, file });
    new SuccessResponse('Popup updated', result).send(res);
  }
);

export const remove = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { id } = req.params;
    await popupService.remove(id);
    new SuccessMsgResponse('Popup Deleted').send(res);
  }
);
