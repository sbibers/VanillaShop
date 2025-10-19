import {cart} from './cart.js';
import {products} from './products.js';
import {reduce_inventory} from './inventory.js';
import {delivery_options} from './delivery_options.js';
import dayjs from 'https://unpkg.com/supersimpledev@8.5.0/dayjs/esm/index.js';

export let orders = JSON.parse(localStorage.getItem('orders'));

if (!orders)
{
  orders = [];
}

function save_orders_to_storage()
{
  localStorage.setItem('orders', JSON.stringify(orders));
}

function generate_order_id()
{
  return (`${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`);
}

export function place_current_cart_order()
{
  if (!cart || cart.length === 0)
  {
    return (null);
  }

  // build items from the current cart snapshot.
  const items = cart.map((cart_item) =>
  {
    const product = products.find((p) => p.id === cart_item.product_id);
    const option = delivery_options.find((o) => o.id === cart_item.delivery_options_id);

    const today = dayjs();
    const delivery_date = today.add(option.delivery_days, 'days');

    return ({
      product_id: cart_item.product_id,
      name: product ? product.name : 'Unknown Product',
      image: product ? product.image : '',
      price_cents: product ? product.price_cents : 0,
      quantity: cart_item.quantity,
      delivery_date_iso: delivery_date.toISOString(),
      delivery_option_id: option.id
    });
  });

  const product_total_cents = items.reduce((sum, it) => sum + it.price_cents * it.quantity, 0);
  const shipping_total_cents = cart.reduce((sum, it) =>
  {
    const option = delivery_options.find((o) => o.id === it.delivery_options_id);
    return (sum + (option ? option.price_cents : 0));
  }, 0);
  const subtotal_cents = product_total_cents + shipping_total_cents;
  const tax_cents = Math.round(subtotal_cents * 0.1);
  const order_total_cents = subtotal_cents + tax_cents;

  const order = ({
    id: generate_order_id(),
    placed_at_iso: new Date().toISOString(),
    items,
    totals: {
      product_total_cents,
      shipping_total_cents,
      tax_cents,
      order_total_cents
    }
  });

  orders.unshift(order);
  save_orders_to_storage();

  items.forEach((it) =>
  {
    reduce_inventory(it.product_id, it.quantity);
  });
  return (order.id);
}
