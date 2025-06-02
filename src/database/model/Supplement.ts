import { model, Schema, Document } from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';
import { preFindHook } from '../../helpers/utils/databaseHooks';

export const SUPPLEMENT_DOCUMENT_NAME = 'Supplement';
const SUPPLEMENT_COLLECTION_NAME = 'Supplements';

export default interface ISupplement extends Document {
  name: string;
  image: string;
  deletedAt?: Date;
}

const schema = new Schema<ISupplement>(
  {
    name: {
      type: Schema.Types.String,
      trim: true,
    },
    image: {
      type: Schema.Types.String,
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

export const SupplementModel = model<ISupplement, Pagination<ISupplement>>(
  SUPPLEMENT_DOCUMENT_NAME,
  schema,
  SUPPLEMENT_COLLECTION_NAME
);
