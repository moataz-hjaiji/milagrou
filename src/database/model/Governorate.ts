import { model, Schema, Document } from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';
import { checkDuplicateKey } from '../../helpers/utils/checkDuplecateKey';
import { preFindHook } from '../../helpers/utils/databaseHooks';

export const GOVERNORATE_DOCUMENT_NAME = 'Governorate';
const GOVERNORATE_COLLECTION_NAME = 'Governorates';

export default interface IGovernorate extends Document {
  nameAng: string;
  nameAr: string;
  deletedAt?: Date;
}

const schema = new Schema<IGovernorate>(
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

schema.pre('save', async function (this: IGovernorate, next) {
  await checkDuplicateKey('nameAng', this.nameAng, GovernorateModel, this._id);
  await checkDuplicateKey('nameAr', this.nameAr, GovernorateModel, this._id);
  next();
});

schema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate() as {
    $set?: { nameAng?: string; nameAr?: string };
  };
  const id = this.getQuery()._id;
  const nameAng = update?.$set?.nameAng;
  if (nameAng)
    await checkDuplicateKey('nameAng', nameAng, GovernorateModel, id);
  const nameAr = update?.$set?.nameAr;
  if (nameAr) await checkDuplicateKey('nameAr', nameAr, GovernorateModel, id);
  next();
});

preFindHook(schema);
schema.plugin(mongoosePagination);

export const GovernorateModel = model<IGovernorate, Pagination<IGovernorate>>(
  GOVERNORATE_DOCUMENT_NAME,
  schema,
  GOVERNORATE_COLLECTION_NAME
);
