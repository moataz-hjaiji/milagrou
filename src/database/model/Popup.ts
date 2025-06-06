import { model, Schema, Document, ObjectId } from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';
import { preFindHook } from '../../helpers/utils/databaseHooks';
import { CATEGORY_DOCUMENT_NAME } from './Category';
import { PRODUCT_DOCUMENT_NAME } from './Product';

export const POPUP_DOCUMENT_NAME = 'Popup';
const POPUP_COLLECTION_NAME = 'Popups';

interface ITarget {
  categoryId?: ObjectId | string;
  productId?: ObjectId | string;
}

export default interface IPopup extends Document {
  titleAng: string;
  titleAr: string;
  descriptionAng: string;
  descriptionAr: string;
  buttonTextAng: string;
  buttonTextAr: string;
  image: string;
  target: ITarget;
  startDate: Date;
  endDate: Date;
  isActive: Boolean;
  deletedAt?: Date;
}

const schema = new Schema<IPopup>(
  {
    titleAng: {
      type: Schema.Types.String,
    },
    titleAr: {
      type: Schema.Types.String,
    },
    descriptionAng: {
      type: Schema.Types.String,
    },
    descriptionAr: {
      type: Schema.Types.String,
    },
    buttonTextAng: {
      type: Schema.Types.String,
    },
    buttonTextAr: {
      type: Schema.Types.String,
    },
    image: {
      type: Schema.Types.String,
    },
    target: {
      categoryId: {
        type: Schema.Types.ObjectId,
        ref: () => CATEGORY_DOCUMENT_NAME,
      },
      productId: {
        type: Schema.Types.ObjectId,
        ref: () => PRODUCT_DOCUMENT_NAME,
      },
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: false,
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

export const PopupModel = model<IPopup, Pagination<IPopup>>(
  POPUP_DOCUMENT_NAME,
  schema,
  POPUP_COLLECTION_NAME
);
