import { model, Schema, Document } from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';
import { checkDuplicateKey } from '../../helpers/utils/checkDuplecateKey';
import { preFindHook } from '../../helpers/utils/databaseHooks';

export const CATEGORY_DOCUMENT_NAME = 'Category';
const CATEGORY_COLLECTION_NAME = 'Categories';

export default interface ICategory extends Document {
  nameAng: string;
  nameAr: string;
  deletedAt?: Date;
}

const schema = new Schema<ICategory>(
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

schema.pre('save', async function (this: ICategory, next) {
  await checkDuplicateKey('nameAng', this.nameAng, CategoryModel, this._id);
  await checkDuplicateKey('nameAr', this.nameAr, CategoryModel, this._id);
  next();
});

schema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate() as {
    $set?: { nameAng?: string; nameAr?: string };
  };
  const id = this.getQuery()._id;
  const nameAng = update?.$set?.nameAng;
  if (nameAng) await checkDuplicateKey('nameAng', nameAng, CategoryModel, id);
  const nameAr = update?.$set?.nameAr;
  if (nameAr) await checkDuplicateKey('nameAr', nameAr, CategoryModel, id);
  next();
});

preFindHook(schema);
schema.plugin(mongoosePagination);

export const CategoryModel = model<ICategory, Pagination<ICategory>>(
  CATEGORY_DOCUMENT_NAME,
  schema,
  CATEGORY_COLLECTION_NAME
);
