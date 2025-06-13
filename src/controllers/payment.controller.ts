import { Response } from 'express';
import asyncHandler from '../helpers/utils/asyncHandler';
import { ProtectedRequest } from '../types/app-request';
import paymentService from '../services/payment';

import {
  SuccessMsgResponse,
  SuccessResponse,
  SuccessResponsePaginate,
} from '../core/ApiResponse';

export const webhook = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const result = await paymentService.webhook(req);
    new SuccessResponse('success', result).send(res);
  }
);

export const InvoiceStatus = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { invoiceId } = req.body;
    const result = await paymentService.InvoiceStatus(invoiceId);
    new SuccessResponse('success', result).send(res);
  }
);
