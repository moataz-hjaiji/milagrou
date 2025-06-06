import IPopup, { PopupModel } from '../../model/Popup';

const create = async (obj: Partial<IPopup>): Promise<IPopup> => {
  return await PopupModel.create(obj);
};

export default create;
