"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolManager = void 0;
const auth_tools_1 = require("./auth.tools");
const product_tools_1 = require("./product.tools");
const cart_tools_1 = require("./cart.tools");
const order_tools_1 = require("./order.tools");
const user_tools_1 = require("./user.tools");
class ToolManager {
    constructor(apiClient) {
        this.authTools = new auth_tools_1.AuthTools(apiClient);
        this.productTools = new product_tools_1.ProductTools(apiClient);
        this.cartTools = new cart_tools_1.CartTools(apiClient);
        this.orderTools = new order_tools_1.OrderTools(apiClient);
        this.userTools = new user_tools_1.UserTools(apiClient);
    }
    getAllTools() {
        return [
            ...this.authTools.getTools(),
            ...this.productTools.getTools(),
            ...this.cartTools.getTools(),
            ...this.orderTools.getTools(),
            ...this.userTools.getTools()
        ];
    }
    async executeTool(toolName, args) {
        // Determine which tool category to use
        if (toolName.startsWith('login_') || toolName.startsWith('register_') ||
            toolName.startsWith('logout_') || toolName.startsWith('refresh_')) {
            return await this.authTools.executeTool(toolName, args);
        }
        if (toolName.startsWith('get_product') || toolName.startsWith('search_product') ||
            toolName.startsWith('get_categor')) {
            return await this.productTools.executeTool(toolName, args);
        }
        if (toolName.startsWith('get_cart') || toolName.startsWith('add_to_cart') ||
            toolName.startsWith('remove_from_cart') || toolName.startsWith('update_cart') ||
            toolName.startsWith('clear_cart')) {
            return await this.cartTools.executeTool(toolName, args);
        }
        if (toolName.startsWith('get_order') || toolName.startsWith('create_order') ||
            toolName.startsWith('cancel_order') || toolName.startsWith('track_order')) {
            return await this.orderTools.executeTool(toolName, args);
        }
        if (toolName.startsWith('get_profile') || toolName.startsWith('update_profile') ||
            toolName.startsWith('get_address') || toolName.startsWith('add_address') ||
            toolName.startsWith('update_address') || toolName.startsWith('delete_address')) {
            return await this.userTools.executeTool(toolName, args);
        }
        throw new Error(`Unknown tool: ${toolName}`);
    }
}
exports.ToolManager = ToolManager;
//# sourceMappingURL=index.js.map