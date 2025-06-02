import { model, Schema, Document } from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';
import { checkDuplicateKey } from '../../helpers/utils/checkDuplecateKey';
import { preFindHook } from '../../helpers/utils/databaseHooks';

export const STORE_DOCUMENT_NAME = 'Store';
const STORE_COLLECTION_NAME = 'Stores';

export default interface IStore extends Document {
  name: string;
  deletedAt?: Date;
}

const schema = new Schema<IStore>(
  {
    name: {
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

schema.pre('save', async function (this: IStore, next) {
  await checkDuplicateKey('name', this.name, StoreModel, this._id);
  next();
});

schema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate() as { $set?: { name?: string } };
  const id = this.getQuery()._id;
  const name = update?.$set?.name;
  if (name) await checkDuplicateKey('name', name, StoreModel, id);
  next();
});

preFindHook(schema);
schema.plugin(mongoosePagination);

export const StoreModel = model<IStore, Pagination<IStore>>(
  STORE_DOCUMENT_NAME,
  schema,
  STORE_COLLECTION_NAME
);
