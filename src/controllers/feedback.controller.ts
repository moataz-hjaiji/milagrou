import { Response } from 'express';
import asyncHandler from '../helpers/utils/asyncHandler';
import { ProtectedRequest } from '../types/app-request';
import feedbackService from '../services/feedback';

import {
  SuccessMsgResponse,
  SuccessResponse,
  SuccessResponsePaginate,
} from '../core/ApiResponse';

export const create = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { body } = req;
    const result = await feedbackService.create({ body });
    new SuccessResponse('Feedback created', result).send(res);
  }
);

export const getAll = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { query } = req;
    const result = await feedbackService.getAll(query);

    new SuccessResponsePaginate(
      'All feedbacks returned successfully',
      result.docs,
      result.meta
    ).send(res);
  }
);

export const getOne = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { id } = req.params;
    const { query } = req;
    const result = await feedbackService.getOne(id, query);
    new SuccessResponse('Feedback returned', result).send(res);
  }
);

export const update = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { id } = req.params;
    const { body } = req;
    const result = await feedbackService.update({ id, body });
    new SuccessResponse('Feedback updated', result).send(res);
  }
);

export const remove = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { id } = req.params;
    await feedbackService.remove(id);
    new SuccessMsgResponse('Feedback Deleted').send(res);
  }
);
