import { model, Schema, Document, ObjectId } from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';
import { preFindHook } from '../../helpers/utils/databaseHooks';
import ISupplementCategory from './SupplementCategory';

export const DOCUMENT_NAME = 'Supplement';
export const COLLECTION_NAME = 'supplements';

export default interface ISupplement extends Document {
  nameFr: string;
  nameAr: string;
  descriptionFr: string;
  descriptionAr: string;
  supplementCategory: ISupplementCategory | ObjectId;
  deletedAt?: Date;
}

const schema = new Schema<ISupplement>(
  {
    nameFr: {
      type: Schema.Types.String,
      trim: true,
    },
    nameAr: {
      type: Schema.Types.String,
      trim: true,
    },
    descriptionFr: {
      type: Schema.Types.String,
      trim: true,
    },
    descriptionAr: {
      type: Schema.Types.String,
      trim: true,
    },
    supplementCategory: {
      type: Schema.Types.ObjectId,
      ref: 'SupplementCategory',
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
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME
);
