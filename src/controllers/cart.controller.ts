import { Response } from 'express';
import asyncHandler from '../helpers/utils/asyncHandler';
import { ProtectedRequest } from '../types/app-request';
import cartService from '../services/cart';

import { SuccessResponse } from '../core/ApiResponse';

export const addToCart = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const item = req.body;
    const userId = req.user._id;
    const result = await cartService.addToCart({ item, userId });
    new SuccessResponse('success', result).send(res);
  }
);

export const getMyCart = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const userId = req.user._id;
    const result = await cartService.getMyCart(userId);
    new SuccessResponse('success', result).send(res);
  }
);

export const incrementOrDecrement = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const userId = req.user._id;
    const { itemId, action } = req.body;
    const result = await cartService.incrementOrDecrement({
      userId,
      itemId,
      action,
    });
    new SuccessResponse('success', result).send(res);
  }
);

export const removeFromCart = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const userId = req.user._id;
    const { itemId } = req.body;
    const result = await cartService.removeFromCart({
      userId,
      itemId,
    });
    new SuccessResponse('success', result).send(res);
  }
);

export const editItem = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const userId = req.user._id;
    const { itemId, item } = req.body;
    const result = await cartService.editItem({
      userId,
      itemId,
      item,
    });
    new SuccessResponse('success', result).send(res);
  }
);
