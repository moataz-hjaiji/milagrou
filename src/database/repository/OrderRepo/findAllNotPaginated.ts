import IOrder, { OrderModel } from '../../model/Order';

const findAllNotPaginated = (obj: object): Promise<IOrder[]> => {
  return OrderModel.find(obj).exec();
};

export default findAllNotPaginated;
