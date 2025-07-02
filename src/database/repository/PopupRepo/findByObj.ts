import IPopup, { PopupModel } from '../../model/Popup';

const findByObj = (obj: object): Promise<IPopup | null> => {
  return PopupModel.findOne(obj).exec();
};

export default findByObj;
