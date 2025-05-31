import { model, Schema, Document, ObjectId } from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';
import { preFindHook } from '../../helpers/utils/databaseHooks';
import IProduct, { PRODUCT_DOCUMENT_NAME } from './Product';

export const PRODUCT_PRICE_DOCUMENT_NAME = 'ProductPrice';
const PRODUCT_PRICE_COLLECTION_NAME = 'ProductPrices';

export default interface IProductPrice extends Document {
  product: IProduct | ObjectId;
  price: number;
  isEnabled: boolean;
  deletedAt?: Date;
}

const schema = new Schema<IProductPrice>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: () => PRODUCT_DOCUMENT_NAME,
    },
    price: {
      type: Schema.Types.Number,
    },
    isEnabled: {
      type: Schema.Types.Boolean,
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

export const ProductPriceModel = model<
  IProductPrice,
  Pagination<IProductPrice>
>(PRODUCT_PRICE_DOCUMENT_NAME, schema, PRODUCT_PRICE_COLLECTION_NAME);
