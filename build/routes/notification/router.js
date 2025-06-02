"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authentication_1 = __importDefault(require("../../authUtils/authentication"));
const notificationController = __importStar(require("../../controllers/notification.controller"));
const validator_1 = __importStar(require("../../helpers/utils/validator"));
const schema_1 = __importDefault(require("./schema"));
const authorization_1 = __importDefault(require("../../authUtils/authorization"));
const assignAction_1 = __importDefault(require("../../authUtils/assignAction"));
const seed_permission_1 = require("../../helpers/seeder/seed.permission");
const router = express_1.default.Router();
router.use('/', authentication_1.default);
router
    .route('/')
    .get((0, assignAction_1.default)({ action: seed_permission_1.ACTIONS.list, entity: 'Notification' }), authorization_1.default, notificationController.getAll);
router.route('/seen').put(notificationController.markAllAsSeen);
router
    .route('/subscribe')
    .post((0, validator_1.default)(schema_1.default.subscribeOrUnsubscribe), notificationController.subscribeToTopic);
router
    .route('/unsubscribe')
    .post((0, validator_1.default)(schema_1.default.subscribeOrUnsubscribe), notificationController.unsubscribeFromTopic);
router
    .route('/:id')
    .get((0, assignAction_1.default)({ action: seed_permission_1.ACTIONS.read, entity: 'Notification' }), authorization_1.default, (0, validator_1.default)(schema_1.default.param, validator_1.ValidationSource.PARAM), notificationController.getOne)
    .put((0, assignAction_1.default)({ action: seed_permission_1.ACTIONS.update, entity: 'Notification' }), authorization_1.default, (0, validator_1.default)(schema_1.default.param, validator_1.ValidationSource.PARAM), (0, validator_1.default)(schema_1.default.update), notificationController.update);
exports.default = router;
//# sourceMappingURL=router.js.map