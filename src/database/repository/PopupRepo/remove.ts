import { ObjectId } from 'mongoose';
import IPopup, { PopupModel } from '../../model/Popup';

const remove = async (id: string | ObjectId): Promise<IPopup | null> => {
  return await PopupModel.findByIdAndUpdate(
    id,
    { $set: { deletedAt: Date.now() } },
    { new: true }
  ).exec();
};

export default remove;
