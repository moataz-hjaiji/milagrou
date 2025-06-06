import { ObjectId } from 'mongoose';
import IPopup, { PopupModel } from '../../model/Popup';

const update = async (
  id: string | ObjectId,
  obj: Partial<IPopup>
): Promise<IPopup | null> => {
  return await PopupModel.findByIdAndUpdate(
    id,
    { $set: { ...obj } },
    { new: true, runValidators: true, context: 'query' }
  ).exec();
};

export default update;
