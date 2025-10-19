export let cart = JSON.parse(localStorage.getItem('cart'));
import {get_inventory} from './inventory.js';

if (!cart)
{
    cart = [];
}

function save_to_storage()
{
    localStorage.setItem('cart', JSON.stringify(cart));
}

export function add_to_cart(button, product_id, quantity = 1)
{
  let maching_cart_item;

  cart.forEach((cart_item) =>
  {
    if (product_id === cart_item.product_id)
    {
      maching_cart_item = cart_item;
    }
  });
  if (maching_cart_item)
  {
    const current_in_cart = maching_cart_item.quantity;
    const stock = get_inventory(product_id);
    const allowed_to_add = Math.max(0, stock - current_in_cart);
    const add_qty = Math.min(quantity, allowed_to_add);
    maching_cart_item.quantity += add_qty;
  }
  else
  {
    const stock = get_inventory(product_id);
    const add_qty = Math.min(quantity, Math.max(0, stock));
    if (add_qty > 0)
    {
      cart.push({
        product_id: product_id,
        quantity: add_qty,
        delivery_options_id: '1'
      });
    }
  }
  save_to_storage();
}

export function remove_from_cart(product_id)
{
    const new_cart = [];

    cart.forEach((cart_item) => 
    {
        if (product_id !== cart_item.product_id)
        {
            new_cart.push(cart_item);
        }
    });
    cart = new_cart;
    save_to_storage();
}

export function update_delivery_option(product_id, delivery_option_id)
{
  let matching_item;

  cart.forEach((cart_item) =>
  {
    if (product_id === cart_item.product_id)
    {
      matching_item = cart_item;
    }
  });

  matching_item.delivery_options_id = delivery_option_id;
  save_to_storage();
}

export function clear_cart()
{
  cart = [];
  save_to_storage();
}
