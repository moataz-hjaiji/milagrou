import IPaymentMethod, { PaymentMethodModel } from '../../model/PaymentMethod';

const findByObj = (obj: object): Promise<IPaymentMethod | null> => {
  return PaymentMethodModel.findOne(obj).exec();
};

export default findByObj;
