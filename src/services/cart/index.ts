import { addToCart } from './addToCart.service';
import { getMyCart } from './getMyCart.service';
import { incrementOrDecrement } from './incrementOrDecrement.service';
import { removeFromCart } from './removeFromCart.service';
import { removeByProduct } from './removeByProduct.service';
import { editItem } from './editItem.service';
import {clearCart} from './clearCart.service';

export default {
  addToCart,
  getMyCart,
  incrementOrDecrement,
  removeFromCart,
  removeByProduct,
  editItem,
  clearCart
};
