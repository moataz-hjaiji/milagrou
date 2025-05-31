import { model, Schema, Document, ObjectId } from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';
import { preFindHook } from '../../helpers/utils/databaseHooks';
import IProduct from './Product';

export const DOCUMENT_NAME = 'ProductPrice';
export const COLLECTION_NAME = 'productPrices';

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
      ref: 'Product',
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
>(DOCUMENT_NAME, schema, COLLECTION_NAME);
