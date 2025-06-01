import { model, Schema, Document } from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';
import { checkDuplicateKey } from '../../helpers/utils/checkDuplecateKey';
import { preFindHook } from '../../helpers/utils/databaseHooks';

export const CATEGORY_DOCUMENT_NAME = 'Category';
const CATEGORY_COLLECTION_NAME = 'Categories';

export default interface ICategory extends Document {
  name: string;
  deletedAt?: Date;
}

const schema = new Schema<ICategory>(
  {
    name: {
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

schema.pre('save', async function (this: ICategory, next) {
  await checkDuplicateKey('name', this.name, CategoryModel, this._id);
  next();
});

schema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate() as { $set?: { name?: string } };
  const id = this.getQuery()._id;
  const name = update?.$set?.name;
  if (name) await checkDuplicateKey('name', name, CategoryModel, id);
  next();
});

preFindHook(schema);
schema.plugin(mongoosePagination);

export const CategoryModel = model<ICategory, Pagination<ICategory>>(
  CATEGORY_DOCUMENT_NAME,
  schema,
  CATEGORY_COLLECTION_NAME
);
