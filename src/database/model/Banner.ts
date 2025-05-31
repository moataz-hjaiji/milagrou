import { model, Schema, Document, ObjectId } from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';
import { preFindHook } from '../../helpers/utils/databaseHooks';
import IMenu from './Menu';

export const DOCUMENT_NAME = 'Banner';
export const COLLECTION_NAME = 'banners';

export default interface IBanner extends Document {
  titleFr: string;
  titleAr: string;
  descriptionFr: string;
  descriptionAr: string;

  picture: string;
  isPublished: boolean;
  data: object;
  deletedAt?: Date;
}

const schema = new Schema<IBanner>(
  {
    titleFr: {
      type: Schema.Types.String,
      trim: true,
    },
    titleAr: {
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
    isPublished: {
      type: Schema.Types.Boolean,
      default: false,
    },
    data: {
      menuId: {
        type: Schema.Types.ObjectId,
        ref: 'Menu',
      },
      categoryId: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
      },
      subCategoryId: {
        type: Schema.Types.ObjectId,
        ref: 'SubCategory',
      },
      productId: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
      },
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

export const BannerModel = model<IBanner, Pagination<IBanner>>(
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME
);
