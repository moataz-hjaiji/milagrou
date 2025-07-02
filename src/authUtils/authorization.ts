import { ProtectedRequest } from 'app-request';
import { AuthFailureError } from '../core/ApiError';
import asyncHandler from '../helpers/utils/asyncHandler';
import { IAction, IEntity, actions } from '../helpers/seeder/seed.permission';

export default asyncHandler(async (req: ProtectedRequest, res, next) => {
  const action = req.action;
  if (!action) {
    throw new AuthFailureError('Permission denied');
  }
  if (!req.user) {
    throw new AuthFailureError('Permission denied');
  }

  // Extract allowed actions from user roles and permissions
  let allowedActions: { entity: IEntity; action: IAction }[] = [];
  for (const role of req.user.roles) {
    for (const permission of role.permissions) {
      // if permission is all, add all actions for the entity
      if (permission.action === 'all') {
        for (const action of actions) {
          allowedActions.push({
            action: action as IAction,
            entity: permission.entity as IEntity,
          });
        }
        continue;
      } else {
        allowedActions.push({
          action: permission.action as IAction,
          entity: permission.entity as IEntity,
        });
      }
    }
  }
  allowedActions = [...new Set(allowedActions)];

  const isActionAllowed = allowedActions.some(
    (allowedAction) =>
      allowedAction.entity === action.entity &&
      allowedAction.action === action.action
  );

  if (isActionAllowed) {
    return next();
  }
  throw new AuthFailureError('Permission denied');
});
