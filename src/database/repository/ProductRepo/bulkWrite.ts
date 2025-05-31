import { ProductModel } from '../../model/Product';

const bulkWrite = async (updates: any) => {
  const bulkOps = updates.map((update: any) => ({
    updateOne: {
      filter: { _id: update.id },
      update: { $set: { position: update.position } },
    },
  }));

  return await ProductModel.bulkWrite(bulkOps);
};

export default bulkWrite;
