import express from 'express';
import authentication from '../../authUtils/authentication';
import * as permissionController from '../../controllers/permission.controller';
import validator, { ValidationSource } from '../../helpers/utils/validator';
import schema from './schema';
import authorization from '../../authUtils/authorization';
import assignAction from '../../authUtils/assignAction';
import { ACTIONS } from '../../helpers/seeder/seed.permission';

const router = express.Router();

router.use('/', authentication);

router.route('/').get(
  // assignAction({ action: ACTIONS.list, entity: 'Permission' }),
  // authorization,
  permissionController.getAll
);

router.route('/:id').get(
  // assignAction({ action: ACTIONS.read, entity: 'Permission' }),
  // authorization,
  validator(schema.param, ValidationSource.PARAM),
  permissionController.getOne
);

export default router;
