import { Schema, model, Document } from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';

export const DOCUMENT_NAME = 'Permission';
export const COLLECTION_NAME = 'permissions';

export default interface IPermission extends Document {
  entity: string;
  action: string;
}

const schema = new Schema<IPermission>(
  {
    entity: {
      type: Schema.Types.String,
      required: true,
    },
    action: {
      type: Schema.Types.String,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

schema.plugin(mongoosePagination);

export const PermissionModel = model<IPermission, Pagination<IPermission>>(
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME
);
