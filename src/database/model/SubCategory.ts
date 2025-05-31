import { model, Schema, Document, ObjectId } from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';
import { preFindHook } from '../../helpers/utils/databaseHooks';
import ICategory, { IconsTypes } from './Category';

export const DOCUMENT_NAME = 'SubCategory';
export const COLLECTION_NAME = 'subCategorys';

export default interface ISubCategory extends Document {
  nameFr: string;
  nameAr: string;
  descriptionFr: string;
  descriptionAr: string;
  picture: string;
  icon: IconsTypes;
  category: ICategory | ObjectId;
  deletedAt?: Date;
}

const schema = new Schema<ISubCategory>(
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
    picture: {
      type: Schema.Types.String,
      trim: true,
    },
    icon: {
      type: Schema.Types.String,
      trim: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
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

export const SubCategoryModel = model<ISubCategory, Pagination<ISubCategory>>(
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME
);
