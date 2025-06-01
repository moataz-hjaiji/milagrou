import express from 'express';
import authentication from '../../authUtils/authentication';
import * as categoryController from '../../controllers/category.controller';
import validator, { ValidationSource } from '../../helpers/utils/validator';
import schema from './schema';
import authorization from '../../authUtils/authorization';
import assignAction from '../../authUtils/assignAction';
import { ACTIONS } from '../../helpers/seeder/seed.permission';

const router = express.Router();

router
  .route('/')
  .post(
    authentication,
    assignAction({ action: ACTIONS.create, entity: 'Category' }),
    authorization,
    validator(schema.create),
    categoryController.create
  )
  .get(categoryController.getAll);

router
  .route('/:id')
  .get(
    validator(schema.param, ValidationSource.PARAM),
    categoryController.getOne
  )
  .put(
    authentication,
    assignAction({ action: ACTIONS.update, entity: 'Category' }),
    authorization,
    validator(schema.param, ValidationSource.PARAM),
    validator(schema.update),
    categoryController.update
  )
  .delete(
    authentication,
    assignAction({ action: ACTIONS.delete, entity: 'Category' }),
    authorization,
    validator(schema.param, ValidationSource.PARAM),
    categoryController.remove
  );

export default router;
