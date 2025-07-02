import IAddress, { AddressModel } from '../../model/Address';

const create = async (obj: Partial<IAddress>): Promise<IAddress> => {
  return await AddressModel.create(obj);
};

export default create;
