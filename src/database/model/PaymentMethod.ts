import { model, Schema, Document, ObjectId } from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';
import { preFindHook } from '../../helpers/utils/databaseHooks';

export const PAYMENT_METHOD_DOCUMENT_NAME = 'PaymentMethod';
const PAYMENT_METHOD_COLLECTION_NAME = 'PaymentMethods';

export default interface IPaymentMethod extends Document {
  nameAng: string;
  nameAr: string;
  deletedAt?: Date;
}

const schema = new Schema<IPaymentMethod>(
  {
    nameAng: {
      type: Schema.Types.String,
    },
    nameAr: {
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

export const PaymentMethodModel = model<
  IPaymentMethod,
  Pagination<IPaymentMethod>
>(PAYMENT_METHOD_DOCUMENT_NAME, schema, PAYMENT_METHOD_COLLECTION_NAME);
