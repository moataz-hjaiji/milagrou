import { OrderModel } from '../../model/Order';

const countDocuments = async (obj: object) => {
  return await OrderModel.countDocuments(obj);
};

export default countDocuments;
