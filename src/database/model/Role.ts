import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
import { Schema, model, Document, AggregatePaginateModel } from 'mongoose';
import IPermission, { PERMISSION_DOCUMENT_NAME } from './Permission';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';
import { preFindHook } from '../../helpers/utils/databaseHooks';

export const ROLE_DOCUMENT_NAME = 'Role';
const ROLE_COLLECTION_NAME = 'Roles';

export default interface IRole extends Document {
  name: string;
  permissions: IPermission[];
  deletedAt?: Date;
}

const schema = new Schema<IRole>(
  {
    name: {
      type: Schema.Types.String,
      required: true,
    },
    permissions: [
      {
        type: Schema.Types.ObjectId,
        ref: () => PERMISSION_DOCUMENT_NAME,
      },
    ],
    deletedAt: {
      type: Date,
      default: null,
      select: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

preFindHook(schema);
schema.plugin(mongoosePagination);
schema.plugin(mongooseAggregatePaginate);

export const RoleModel = model<
  IRole,
  Pagination<IRole> & AggregatePaginateModel<IRole>
>(ROLE_DOCUMENT_NAME, schema, ROLE_COLLECTION_NAME);
