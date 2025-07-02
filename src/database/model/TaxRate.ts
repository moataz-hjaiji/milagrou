import { model, Schema, Document } from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';
import { preFindHook } from '../../helpers/utils/databaseHooks';

export const TAX_RATE_DOCUMENT_NAME = 'TaxRate';
const TAX_RATE_COLLECTION_NAME = 'TaxRates';

export default interface ITaxRate extends Document {
  amount: number;
  deletedAt?: Date;
}

const schema = new Schema<ITaxRate>(
  {
    amount: {
      type: Schema.Types.Number,
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

export const TaxRateModel = model<ITaxRate, Pagination<ITaxRate>>(
  TAX_RATE_DOCUMENT_NAME,
  schema,
  TAX_RATE_COLLECTION_NAME
);
