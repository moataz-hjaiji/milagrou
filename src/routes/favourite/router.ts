import express from 'express';
import authentication from '../../authUtils/authentication';
import * as favouriteController from '../../controllers/favourite.controller';
import validator, { ValidationSource } from '../../helpers/utils/validator';
import schema from './schema';
import authorization from '../../authUtils/authorization';
import assignAction from '../../authUtils/assignAction';
import { ACTIONS } from '../../helpers/seeder/seed.permission';

const router = express.Router();

router.use('/', authentication);

router.route('/').get(
  // assignAction({ action: ACTIONS.list, entity: 'Favourite' }),
  // authorization,
  favouriteController.getAll
);

router
  .route('/toggle/:id')
  .post(
    validator(schema.param, ValidationSource.PARAM),
    favouriteController.toggle
  );

router.route('/:id').get(
  // assignAction({ action: ACTIONS.read, entity: 'Favourite' }),
  // authorization,
  validator(schema.param, ValidationSource.PARAM),
  favouriteController.getOne
);

export default router;
