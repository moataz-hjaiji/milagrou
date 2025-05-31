import IPaymentMethod, { PaymentMethodModel } from '../../model/PaymentMethod';

const create = async (
  obj: Partial<IPaymentMethod>
): Promise<IPaymentMethod> => {
  return await PaymentMethodModel.create(obj);
};

export default create;
