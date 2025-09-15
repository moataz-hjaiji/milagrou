import { Response } from 'express';
import asyncHandler from '../helpers/utils/asyncHandler';
import { ProtectedRequest } from '../types/app-request';
import cartService from '../services/cart';

import { SuccessResponse } from '../core/ApiResponse';

export const addToCart = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { item, userId, browserId } = req.body;
    const result = await cartService.addToCart({ item, userId, browserId });
    new SuccessResponse('success', result).send(res);
  }
);

export const getMyCart = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { userId, browserId } = req.body;
    const result = await cartService.getMyCart({ userId, browserId });
    new SuccessResponse('success', result).send(res);
  }
);

export const incrementOrDecrement = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { itemId, action, userId, browserId } = req.body;
    const result = await cartService.incrementOrDecrement({
      userId,
      browserId,
      itemId,
      action,
    });
    new SuccessResponse('success', result).send(res);
  }
);

export const removeFromCart = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { itemId, userId, browserId } = req.body;
    const result = await cartService.removeFromCart({
      userId,
      browserId,
      itemId,
    });
    new SuccessResponse('success', result).send(res);
  }
);

export const removeByProduct = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { productId, userId, browserId } = req.body;
    const result = await cartService.removeByProduct({
      userId,
      productId,
    });
    new SuccessResponse('success', result).send(res);
  }
);

export const editItem = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { itemId, item, userId, browserId } = req.body;
    const result = await cartService.editItem({
      userId,
      browserId,
      itemId,
      item,
    });
    new SuccessResponse('success', result).send(res);
  }
);

export const clearCart = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { userId, browserId } = req.body;
    const result = await cartService.clearCart({ userId, browserId });
    new SuccessResponse('success', result).send(res);
  }
);