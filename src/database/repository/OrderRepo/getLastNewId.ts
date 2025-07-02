import IOrder, { OrderModel } from '../../model/Order';

const getLastNewId = (): Promise<IOrder | null> => {
  return OrderModel.findOne().sort({ newId: -1 }).exec();
};

export default getLastNewId;
