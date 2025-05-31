import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
import { Schema, model, Document, AggregatePaginateModel } from 'mongoose';
import IPermission from './Permission';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';
import { preFindHook } from '../../helpers/utils/databaseHooks';

export const DOCUMENT_NAME = 'Role';
export const COLLECTION_NAME = 'roles';

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
        ref: 'Permission',
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
>(DOCUMENT_NAME, schema, COLLECTION_NAME);
