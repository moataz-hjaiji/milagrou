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
const cartController = __importStar(require("../../controllers/cart.controller"));
const validator_1 = __importDefault(require("../../helpers/utils/validator"));
const schema_1 = __importDefault(require("./schema"));
const router = express_1.default.Router();
router.get('/me', authentication_1.default, cartController.getMyCart);
router.post('/add', authentication_1.default, (0, validator_1.default)(schema_1.default.addToCart), cartController.addToCart);
router.delete('/remove', authentication_1.default, (0, validator_1.default)(schema_1.default.removeFromCart), cartController.removeFromCart);
router.put('/quantity', authentication_1.default, (0, validator_1.default)(schema_1.default.incrementOrDecrement), cartController.incrementOrDecrement);
router.put('/edit', authentication_1.default, (0, validator_1.default)(schema_1.default.editItem), cartController.editItem);
exports.default = router;
//# sourceMappingURL=router.js.map