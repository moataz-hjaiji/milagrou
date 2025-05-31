import IDeliveryPrice, { DeliveryPriceModel } from '../../model/DeliveryPrice';

const findByObj = (obj: object): Promise<IDeliveryPrice | null> => {
  return DeliveryPriceModel.findOne(obj).exec();
};

export default findByObj;
