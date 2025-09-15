import express from 'express';
import authentication from '../../authUtils/authentication';
import * as cartController from '../../controllers/cart.controller';
import validator from '../../helpers/utils/validator';
import schema from './schema';

const router = express.Router();

router.post(
  '/me',
  //  authentication,
  cartController.getMyCart
);

router.post(
  '/add',
  // authentication,
  validator(schema.addToCart),
  cartController.addToCart
);

router.delete(
  '/remove',
  // authentication,
  validator(schema.removeFromCart),
  cartController.removeFromCart
);

router.delete(
  '/remove-by-product',
  // authentication,
  validator(schema.removeByProduct),
  cartController.removeByProduct
);

router.put(
  '/quantity',
  // authentication,
  validator(schema.incrementOrDecrement),
  cartController.incrementOrDecrement
);

router.put(
  '/edit',
  // authentication,
  validator(schema.editItem),
  cartController.editItem
);
router.delete(
  '/clear',
  // authentication,
  validator(schema.clearCart),
  cartController.clearCart
);
export default router;
