import express from 'express';
import authentication from '../../authUtils/authentication';
import * as statsController from '../../controllers/stats.controller';
import authorization from '../../authUtils/authorization';
import validator from '../../helpers/utils/validator';
import schema from './schema';
import assignAction from '../../authUtils/assignAction';
import { ACTIONS } from '../../helpers/seeder/seed.permission';

const router = express.Router();

router.use('/', authentication);

router
  .route('/')
  .post(
    assignAction({ action: ACTIONS.list, entity: 'Stats' }),
    authorization,
    validator(schema.dateRange),
    statsController.stats
  );

router
  .route('/delivery')
  .post(
    assignAction({ action: ACTIONS.read, entity: 'Stats' }),
    authorization,
    validator(schema.dateRange),
    statsController.ordersCompletedByDelivery
  );

export default router;
