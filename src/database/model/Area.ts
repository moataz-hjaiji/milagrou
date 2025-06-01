import { model, Schema, Document, ObjectId } from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';
import { preFindHook } from '../../helpers/utils/databaseHooks';
import IGovernorate, { GOVERNORATE_DOCUMENT_NAME } from './Governorate';

export const AREA_DOCUMENT_NAME = 'Area';
const AREA_COLLECTION_NAME = 'Areas';

export default interface IArea extends Document {
  governorateId: IGovernorate | ObjectId;
  name: string;
  deletedAt?: Date;
}

const schema = new Schema<IArea>(
  {
    name: {
      type: Schema.Types.String,
    },
    governorateId: {
      type: Schema.Types.ObjectId,
      ref: () => GOVERNORATE_DOCUMENT_NAME,
    },
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

export const AreaModel = model<IArea, Pagination<IArea>>(
  AREA_DOCUMENT_NAME,
  schema,
  AREA_COLLECTION_NAME
);
