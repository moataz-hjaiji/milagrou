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
    await paymentService.webhook(req);
  }
);

export const InvoiceStatus = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { invoiceId } = req.body;
    const result = await paymentService.InvoiceStatus(invoiceId);
    new SuccessResponse('success', result).send(res);
  }
);

export const invoiceRefund = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { invoiceId, Amount } = req.body;
    const result = await paymentService.invoiceRefund({ invoiceId, Amount });
    new SuccessResponse('success', result).send(res);
  }
);

export const getPaymentMethods = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { InvoiceAmount, CurrencyIso } = req.body;
    const result = await paymentService.getPaymentMethods(
      InvoiceAmount,
      CurrencyIso
    );
    new SuccessResponse('success', result).send(res);
  }
);
