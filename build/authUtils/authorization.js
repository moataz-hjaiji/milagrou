"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ApiError_1 = require("../core/ApiError");
const asyncHandler_1 = __importDefault(require("../helpers/utils/asyncHandler"));
const seed_permission_1 = require("../helpers/seeder/seed.permission");
exports.default = (0, asyncHandler_1.default)(async (req, res, next) => {
    const action = req.action;
    if (!action) {
        throw new ApiError_1.AuthFailureError('Permission denied');
    }
    if (!req.user) {
        throw new ApiError_1.AuthFailureError('Permission denied');
    }
    // Extract allowed actions from user roles and permissions
    let allowedActions = [];
    for (const role of req.user.roles) {
        for (const permission of role.permissions) {
            // if permission is all, add all actions for the entity
            if (permission.action === 'all') {
                for (const action of seed_permission_1.actions) {
                    allowedActions.push({
                        action: action,
                        entity: permission.entity,
                    });
                }
                continue;
            }
            else {
                allowedActions.push({
                    action: permission.action,
                    entity: permission.entity,
                });
            }
        }
    }
    allowedActions = [...new Set(allowedActions)];
    const isActionAllowed = allowedActions.some((allowedAction) => allowedAction.entity === action.entity &&
        allowedAction.action === action.action);
    if (isActionAllowed) {
        return next();
    }
    throw new ApiError_1.AuthFailureError('Permission denied');
});
//# sourceMappingURL=authorization.js.map