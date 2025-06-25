import OrderRepo from '../../database/repository/OrderRepo';
import { Parser } from 'json2csv';

export const exportData = async (ids: string[]) => {
  const orders = await OrderRepo.findAllNotPaginated({
    _id: {
      $in: ids,
    },
  });
  const orderData = orders.map((order) => order.toObject());
  // const fields = ['_id', 'firstName', 'lastName', 'email', 'phoneNumber']; // specify fields to include
  const parser = new Parser();
  // { fields }
  const csv = parser.parse(orderData);

  return {
    csv,
  };
};
