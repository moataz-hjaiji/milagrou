import express from 'express';
import authentication from '../../authUtils/authentication';
import * as paymentController from '../../controllers/payment.controller';
import validator, { ValidationSource } from '../../helpers/utils/validator';
import schema from './schema';
import authorization from '../../authUtils/authorization';
import assignAction from '../../authUtils/assignAction';
import { ACTIONS } from '../../helpers/seeder/seed.permission';

const router = express.Router();

// router.use('/', authentication);

router.route('/').post(
  // assignAction({ action: ACTIONS.create, entity: 'Area' }),
  // authorization,
  // authentication,
  // validator(schema.create),
  paymentController.create
);

export default router;
