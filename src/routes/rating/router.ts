import express from 'express';
import authentication from '../../authUtils/authentication';
import * as ratingController from '../../controllers/rating.controller';
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
    assignAction({ action: ACTIONS.create, entity: 'Rating' }),
    authorization,
    validator(schema.create),
    ratingController.create
  )
  .get(
    assignAction({ action: ACTIONS.list, entity: 'Rating' }),
    authorization,
    ratingController.getAll
  );

router
  .route('/:id')
  .get(
    assignAction({ action: ACTIONS.read, entity: 'Rating' }),
    authorization,
    validator(schema.param, ValidationSource.PARAM),
    ratingController.getOne
  )
  .delete(
    assignAction({ action: ACTIONS.delete, entity: 'Rating' }),
    authorization,
    validator(schema.param, ValidationSource.PARAM),
    ratingController.remove
  );

export default router;
