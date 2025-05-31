import { Schema } from 'mongoose';
import { NextFunction } from 'express';

export function preFindHook(schema: Schema) {
  schema.pre(/^find/, function (this: any, next: NextFunction) {
    this.find({ deletedAt: null });
    next();
  });
}
