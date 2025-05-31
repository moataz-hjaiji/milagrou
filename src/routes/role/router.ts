import express from 'express';
import authentication from '../../authUtils/authentication';
import * as roleController from '../../controllers/role.controller';
import validator, { ValidationSource } from '../../helpers/utils/validator';
import schema from './schema';
import authorization from '../../authUtils/authorization';
import assignAction from '../../authUtils/assignAction';
import { ACTIONS } from '../../helpers/seeder/seed.permission';

const router = express.Router();

router.use('/', authentication);

router
  .route('/')
  .post(
    assignAction({ action: ACTIONS.create, entity: 'Role' }),
    authorization,
    validator(schema.create),
    roleController.create
  )
  .get(
    assignAction({ action: ACTIONS.list, entity: 'Role' }),
    authorization,
    roleController.getAll
  );

router
  .route('/:id')
  .get(
    assignAction({ action: ACTIONS.read, entity: 'Role' }),
    authorization,
    validator(schema.param, ValidationSource.PARAM),
    roleController.getOne
  )
  .put(
    assignAction({ action: ACTIONS.update, entity: 'Role' }),
    authorization,
    validator(schema.param, ValidationSource.PARAM),
    validator(schema.update),
    roleController.update
  )
  .delete(
    assignAction({ action: ACTIONS.delete, entity: 'Role' }),
    authorization,
    validator(schema.param, ValidationSource.PARAM),
    roleController.remove
  );

export default router;
