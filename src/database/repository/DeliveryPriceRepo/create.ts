import IDeliveryPrice, { DeliveryPriceModel } from '../../model/DeliveryPrice';

const create = async (
  obj: Partial<IDeliveryPrice>
): Promise<IDeliveryPrice> => {
  return await DeliveryPriceModel.create(obj);
};

export default create;
