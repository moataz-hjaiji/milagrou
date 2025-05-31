import { model, Schema, Document, ObjectId } from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';
import { preFindHook } from '../../helpers/utils/databaseHooks';

export const DOCUMENT_NAME = 'PaymentMethod';
export const COLLECTION_NAME = 'paymentMethods';

export default interface IPaymentMethod extends Document {
  name: string;
  description: string;
  deletedAt?: Date;
}

const schema = new Schema<IPaymentMethod>(
  {
    name: {
      type: Schema.Types.String,
      trim: true,
    },
    description: {
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

export const PaymentMethodModel = model<
  IPaymentMethod,
  Pagination<IPaymentMethod>
>(DOCUMENT_NAME, schema, COLLECTION_NAME);
