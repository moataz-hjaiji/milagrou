import { model, Schema, Document } from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';
import { preFindHook } from '../../helpers/utils/databaseHooks';

export const DOCUMENT_NAME = 'SupplementCategory';
export const COLLECTION_NAME = 'supplementCategorys';

export default interface ISupplementCategory extends Document {
  nameFr: string;
  nameAr: string;
  descriptionFr: string;
  descriptionAr: string;
  deletedAt?: Date;
}

const schema = new Schema<ISupplementCategory>(
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

export const SupplementCategoryModel = model<
  ISupplementCategory,
  Pagination<ISupplementCategory>
>(DOCUMENT_NAME, schema, COLLECTION_NAME);
