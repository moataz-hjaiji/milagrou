"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedPermissions = exports.SuperAdminPermissionsIds = exports.actions = exports.ACTIONS = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const Permission_1 = require("../../database/model/Permission");
const Role_1 = require("../../database/model/Role");
var ACTIONS;
(function (ACTIONS) {
    ACTIONS["create"] = "create";
    ACTIONS["list"] = "list";
    ACTIONS["read"] = "read";
    ACTIONS["update"] = "update";
    ACTIONS["delete"] = "delete";
    ACTIONS["all"] = "all";
})(ACTIONS = exports.ACTIONS || (exports.ACTIONS = {}));
exports.actions = Object.keys(ACTIONS);
const modelsPath = path_1.default.join(__dirname, '../../database/model');
const entities = fs_1.default
    .readdirSync(modelsPath)
    .filter((file) => file.endsWith('.ts') || file.endsWith('.js'))
    .map((file) => path_1.default.basename(file, path_1.default.extname(file)))
    .filter((model) => !['Keystore'].includes(model));
exports.SuperAdminPermissionsIds = [];
const seedPermissions = async () => {
    try {
        const permissions = entities.flatMap((entity) => exports.actions.map((action) => ({
            entity,
            action,
        })));
        await Permission_1.PermissionModel.insertMany(permissions);
        const SuperAdminPermissions = [
            { entity: 'Address', action: 'all' },
            { entity: 'Category', action: 'all' },
            { entity: 'Discount', action: 'all' },
            { entity: 'Notification', action: 'all' },
            { entity: 'Order', action: 'all' },
            { entity: 'PaymentMethod', action: 'all' },
            { entity: 'Product', action: 'all' },
            { entity: 'ProductPrice', action: 'all' },
            { entity: 'PromoCode', action: 'all' },
            { entity: 'Rating', action: 'all' },
            { entity: 'User', action: 'all' },
            { entity: 'Role', action: 'all' },
            { entity: 'Permission', action: 'all' },
        ];
        const UserPermissions = [
            { entity: 'Address', action: 'all' },
            { entity: 'Category', action: 'all' },
            { entity: 'Discount', action: 'all' },
            { entity: 'Notification', action: 'all' },
            { entity: 'Order', action: 'all' },
            { entity: 'PaymentMethod', action: 'all' },
            { entity: 'Product', action: 'all' },
            { entity: 'ProductPrice', action: 'all' },
            { entity: 'PromoCode', action: 'all' },
            { entity: 'Rating', action: 'all' },
            { entity: 'User', action: 'all' },
            { entity: 'Role', action: 'all' },
            { entity: 'Permission', action: 'all' },
        ];
        const superAdminpermissionsIds = await Promise.all(SuperAdminPermissions.map(async (permission) => {
            const permissionFound = await Permission_1.PermissionModel.findOne({
                entity: permission.entity,
                action: permission.action,
            });
            if (!permissionFound) {
                const createdPermission = await Permission_1.PermissionModel.create(permission);
                console.info(`\n\tPermission ${permission.entity} ${permission.action} created! \n`);
                return createdPermission;
            }
            return permissionFound;
        }));
        const superAdminRoleFound = await Role_1.RoleModel.findOne({
            name: 'admin',
        });
        if (!superAdminRoleFound) {
            const createdRole = await Role_1.RoleModel.create({
                name: 'admin',
                permissions: superAdminpermissionsIds.map((permission) => permission._id),
            });
            console.info(`\n\tRole ${createdRole.name} created! \n`);
        }
        const userPermissionsWithIds = await Promise.all(UserPermissions.map(async (permission) => {
            const permissionFound = await Permission_1.PermissionModel.findOne({
                entity: permission.entity,
                action: permission.action,
            });
            if (!permissionFound) {
                const createdPermission = await Permission_1.PermissionModel.create(permission);
                console.info(`\n\tPermission ${permission.entity} ${permission.action} created! \n`);
                return createdPermission;
            }
            return permissionFound;
        }));
        const UserRoleFound = await Role_1.RoleModel.findOne({ name: 'user' });
        if (!UserRoleFound) {
            const createdRole = await Role_1.RoleModel.create({
                name: 'user',
                permissions: userPermissionsWithIds.map((permission) => permission._id),
            });
            console.info(`\n\tRole ${createdRole.name} created! \n`);
        }
    }
    catch (err) {
        console.error('Error seeding roles:', err);
    }
};
exports.seedPermissions = seedPermissions;
//# sourceMappingURL=seed.permission.js.map