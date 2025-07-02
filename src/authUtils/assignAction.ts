import { ProtectedRequest } from 'app-request';
import asyncHandler from '../helpers/utils/asyncHandler';
import { IAction, IEntity } from '../helpers/seeder/seed.permission';

export default (action: { action: IAction; entity: IEntity }) =>
  asyncHandler(async (req: ProtectedRequest, res, next) => {
    req.action = action;
    next();
  });
