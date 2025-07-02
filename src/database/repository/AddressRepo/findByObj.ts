import IAddress, { AddressModel } from '../../model/Address';

const findByObj = (obj: object): Promise<IAddress | null> => {
  return AddressModel.findOne(obj).exec();
};

export default findByObj;
