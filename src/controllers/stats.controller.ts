import { Response } from 'express';
import asyncHandler from '../helpers/utils/asyncHandler';
import { ProtectedRequest } from '../types/app-request';
import statsService from '../services/stats';

import {
  SuccessMsgResponse,
  SuccessResponse,
  SuccessResponsePaginate,
} from '../core/ApiResponse';

export const stats = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    let { startDate, endDate } = req.body;
    startDate = new Date(startDate);
    endDate = new Date(endDate);
    const result = await statsService.stats({ startDate, endDate });
    new SuccessResponse('success', result).send(res);
  }
);
