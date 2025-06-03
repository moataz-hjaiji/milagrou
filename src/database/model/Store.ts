import { model, Schema, Document } from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';
import { checkDuplicateKey } from '../../helpers/utils/checkDuplecateKey';
import { preFindHook } from '../../helpers/utils/databaseHooks';

export const STORE_DOCUMENT_NAME = 'Store';
const STORE_COLLECTION_NAME = 'Stores';

export default interface IStore extends Document {
  nameAng: string;
  nameAr: string;
  deletedAt?: Date;
}

const schema = new Schema<IStore>(
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

schema.pre('save', async function (this: IStore, next) {
  await checkDuplicateKey('nameAng', this.nameAng, StoreModel, this._id);
  await checkDuplicateKey('nameAr', this.nameAr, StoreModel, this._id);
  next();
});

schema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate() as {
    $set?: { nameAng?: string; nameAr?: string };
  };
  const id = this.getQuery()._id;
  const nameAng = update?.$set?.nameAng;
  if (nameAng) await checkDuplicateKey('nameAng', nameAng, StoreModel, id);
  const nameAr = update?.$set?.nameAr;
  if (nameAr) await checkDuplicateKey('nameAr', nameAr, StoreModel, id);
  next();
});

preFindHook(schema);
schema.plugin(mongoosePagination);

export const StoreModel = model<IStore, Pagination<IStore>>(
  STORE_DOCUMENT_NAME,
  schema,
  STORE_COLLECTION_NAME
);
