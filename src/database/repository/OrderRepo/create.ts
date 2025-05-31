import IOrder, { OrderModel } from '../../model/Order';

const create = async (obj: Partial<IOrder>): Promise<IOrder> => {
  return await OrderModel.create(obj);
};

export default create;
