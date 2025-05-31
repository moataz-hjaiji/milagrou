import IOrder, { OrderModel } from '../../model/Order';

const findByObj = (obj: object): Promise<IOrder | null> => {
  return OrderModel.findOne(obj).exec();
};

export default findByObj;
