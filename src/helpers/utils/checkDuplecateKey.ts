import { ObjectId } from 'mongoose';
import { BadRequestError } from '../../core/ApiError';

export async function checkDuplicateKey(
  key: string,
  value: any,
  model: any,
  id: ObjectId
) {
  const existingKey = await model.findOne({
    [key]: value,
    _id: { $ne: id },
  });
  if (existingKey)
    throw new BadRequestError(
      `${model.modelName} with that ${key} already exists`
    );
}
