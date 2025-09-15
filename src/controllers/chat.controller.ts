import { Response } from 'express';
import asyncHandler from '../helpers/utils/asyncHandler';
import { ProtectedRequest } from '../types/app-request';
import chatService from '../services/chat';
import { SuccessResponse } from '../core/ApiResponse';
import { BadRequestError } from '../core/ApiError';
import Logger from '../core/Logger';

export const sendMessage = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { message } = req.body;
    const userId = req.user.id;

    Logger.info(`Chat request from user: ${userId}`);

    if (!message) {
      throw new BadRequestError('Message is required');
    }

    const response = await chatService.processMessage({
      message,
      userId,
    });

    new SuccessResponse('Message sent successfully', response).send(res);
  }
);

export const getConversationHistory = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const userId = req.user.id;

    Logger.info(`Getting conversation history for user: ${userId}`);

    const messages = await chatService.getConversationHistory(userId);

    new SuccessResponse('Conversation history retrieved', {
      messages,
      count: messages.length,
    }).send(res);
  }
);

export const clearConversation = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const userId = req.user.id;

    Logger.info(`Clearing conversation for user: ${userId}`);

    const success = await chatService.clearConversation(userId);

    new SuccessResponse('Conversation cleared successfully', {
      cleared: success,
    }).send(res);
  }
);
