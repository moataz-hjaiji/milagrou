import _ from 'lodash';
import fs from 'fs';
import { Types } from 'mongoose';
import path from 'path';
import { PermissionModel } from '../../database/model/Permission';
import { RoleModel } from '../../database/model/Role';

export enum ACTIONS {
  create = 'create',
  list = 'list',
  read = 'read',
  update = 'update',
  delete = 'delete',
  all = 'all',
}
export const actions = Object.keys(ACTIONS);
export type IAction = keyof typeof ACTIONS;
const modelsPath = path.join(__dirname, '../../database/model');
const entities = fs
  .readdirSync(modelsPath)
  .filter((file) => file.endsWith('.ts') || file.endsWith('.js'))
  .map((file) => path.basename(file, path.extname(file)))
  .filter((model) => !['Keystore'].includes(model));

export type IEntity = (typeof entities)[number];

export const SuperAdminPermissionsIds: Types.ObjectId[] = [];

export const seedPermissions = async () => {
  try {
    const permissions = entities.flatMap((entity) =>
      actions.map((action) => ({
        entity,
        action,
      }))
    );

    await PermissionModel.insertMany(permissions);

    const SuperAdminPermissions: {
      entity: IEntity;
      action: IAction;
    }[] = [
      { entity: 'Address', action: 'all' },
      { entity: 'Banner', action: 'all' },
      { entity: 'Category', action: 'all' },
      { entity: 'DeliveryPrice', action: 'all' },
      { entity: 'Discount', action: 'all' },
      { entity: 'Menu', action: 'all' },
      { entity: 'Notification', action: 'all' },
      { entity: 'Order', action: 'all' },
      { entity: 'PaymentMethod', action: 'all' },
      { entity: 'Product', action: 'all' },
      { entity: 'ProductPrice', action: 'all' },
      { entity: 'PromoCode', action: 'all' },
      { entity: 'Rating', action: 'all' },
      { entity: 'SubCategory', action: 'all' },
      { entity: 'Supplement', action: 'all' },
      { entity: 'SupplementCategory', action: 'all' },
      { entity: 'User', action: 'all' },
      { entity: 'Role', action: 'all' },
      { entity: 'Permission', action: 'all' },
      { entity: 'Stats', action: 'all' },
    ];

    const UserPermissions: {
      entity: IEntity;
      action: IAction;
    }[] = [
      { entity: 'Address', action: 'all' },
      { entity: 'DeliveryPrice', action: 'list' },
      { entity: 'DeliveryPrice', action: 'read' },
      { entity: 'Favourite', action: 'create' },
      { entity: 'Favourite', action: 'list' },
      { entity: 'Favourite', action: 'read' },
      { entity: 'Favourite', action: 'update' },
      { entity: 'Favourite', action: 'delete' },
      { entity: 'Notification', action: 'list' },
      { entity: 'Notification', action: 'read' },
      { entity: 'Order', action: 'list' },
      { entity: 'Order', action: 'read' },
      { entity: 'PaymentMethod', action: 'list' },
      { entity: 'PaymentMethod', action: 'read' },
      { entity: 'Rating', action: 'create' },
      { entity: 'Rating', action: 'list' },
      { entity: 'Rating', action: 'read' },
    ];

    const DeliveryPermissions: {
      entity: IEntity;
      action: IAction;
    }[] = [
      { entity: 'Address', action: 'all' },
      { entity: 'DeliveryPrice', action: 'list' },
      { entity: 'DeliveryPrice', action: 'read' },
      { entity: 'Notification', action: 'list' },
      { entity: 'Notification', action: 'read' },
      { entity: 'Order', action: 'list' },
      { entity: 'Order', action: 'read' },
      { entity: 'Order', action: 'update' },
      { entity: 'PaymentMethod', action: 'list' },
      { entity: 'PaymentMethod', action: 'read' },
      { entity: 'Stats', action: 'read' },
    ];

    const deliverypermissionsIds = await Promise.all(
      DeliveryPermissions.map(async (permission) => {
        const permissionFound = await PermissionModel.findOne({
          entity: permission.entity,
          action: permission.action,
        });

        if (!permissionFound) {
          const createdPermission = await PermissionModel.create(permission);
          console.info(
            `\n\tPermission ${permission.entity} ${permission.action} created! \n`
          );
          return createdPermission;
        }
        return permissionFound;
      })
    );

    const deliveryRoleFound = await RoleModel.findOne({
      name: 'delivery',
    });

    if (!deliveryRoleFound) {
      const createdRole = await RoleModel.create({
        name: 'delivery',
        permissions: deliverypermissionsIds.map((permission) => permission._id),
      });
      console.info(`\n\tRole ${createdRole.name} created! \n`);
    }

    const superAdminpermissionsIds = await Promise.all(
      SuperAdminPermissions.map(async (permission) => {
        const permissionFound = await PermissionModel.findOne({
          entity: permission.entity,
          action: permission.action,
        });

        if (!permissionFound) {
          const createdPermission = await PermissionModel.create(permission);
          console.info(
            `\n\tPermission ${permission.entity} ${permission.action} created! \n`
          );
          return createdPermission;
        }
        return permissionFound;
      })
    );

    const superAdminRoleFound = await RoleModel.findOne({
      name: 'admin',
    });

    if (!superAdminRoleFound) {
      const createdRole = await RoleModel.create({
        name: 'admin',
        permissions: superAdminpermissionsIds.map(
          (permission) => permission._id
        ),
      });
      console.info(`\n\tRole ${createdRole.name} created! \n`);
    }

    const userPermissionsWithIds = await Promise.all(
      UserPermissions.map(async (permission) => {
        const permissionFound = await PermissionModel.findOne({
          entity: permission.entity,
          action: permission.action,
        });

        if (!permissionFound) {
          const createdPermission = await PermissionModel.create(permission);
          console.info(
            `\n\tPermission ${permission.entity} ${permission.action} created! \n`
          );
          return createdPermission;
        }

        return permissionFound;
      })
    );

    const UserRoleFound = await RoleModel.findOne({ name: 'user' });

    if (!UserRoleFound) {
      const createdRole = await RoleModel.create({
        name: 'user',
        permissions: userPermissionsWithIds.map((permission) => permission._id),
      });
      console.info(`\n\tRole ${createdRole.name} created! \n`);
    }
  } catch (err) {
    console.error('Error seeding roles:', err);
  }
};
