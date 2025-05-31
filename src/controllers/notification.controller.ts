import { Response } from 'express';
import asyncHandler from '../helpers/utils/asyncHandler';
import { ProtectedRequest } from '../types/app-request';
import notificationService from '../services/notification';

import {
  SuccessMsgResponse,
  SuccessResponse,
  SuccessResponsePaginate,
} from '../core/ApiResponse';

export const getAll = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { query } = req;
    const result = await notificationService.getAll(query);

    new SuccessResponsePaginate(
      'All notifications returned successfully',
      result.docs,
      result.meta
    ).send(res);
  }
);

export const getOne = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { id } = req.params;
    const { query } = req;
    const result = await notificationService.getOne(id, query);
    new SuccessResponse('Notification returned', result).send(res);
  }
);

export const update = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { id } = req.params;
    const { body } = req;
    const result = await notificationService.update({ id, body });
    new SuccessResponse('Notification updated', result).send(res);
  }
);

export const markAllAsSeen = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const userId = req.user._id;
    await notificationService.markAllAsSeen(userId);
    new SuccessMsgResponse('Success').send(res);
  }
);

export const subscribeToTopic = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { token, topic } = req.body;
    await notificationService.subscribeToTopic(token, topic);
    new SuccessMsgResponse('Success').send(res);
  }
);

export const unsubscribeFromTopic = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { token, topic } = req.body;
    await notificationService.unsubscribeFromTopic(token, topic);
    new SuccessMsgResponse('Success').send(res);
  }
);
