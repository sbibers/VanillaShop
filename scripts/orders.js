import {orders} from '../data/orders.js';
import {cart} from '../data/cart.js';
import {fromat_currency} from './utils/calculations.js';
import dayjs from 'https://unpkg.com/supersimpledev@8.5.0/dayjs/esm/index.js';

function render_orders()
{
  const container = document.querySelector('.orders-grid');
  if (!container)
    return;

  if (!orders || orders.length === 0)
  {
    container.innerHTML = '';
    return;
  }

  let html = '';
  orders.forEach((order) =>
  {
    const placed_date = dayjs(order.placed_at_iso).format('MMMM D');
    const order_total = fromat_currency(order.totals.order_total_cents);

    let items_html = '';
    order.items.forEach((item) =>
    {
      const arriving = dayjs(item.delivery_date_iso).format('MMMM D');
      items_html += `
        <div class="product-image-container">
          <img src="${item.image}">
        </div>

        <div class="product-details">
          <div class="product-name">
            ${item.name}
          </div>
          <div class="product-delivery-date">
            Arriving on: ${arriving}
          </div>
          <div class="product-quantity">
            Quantity: ${item.quantity}
          </div>
        </div>
        `;
    });

    html += `
      <div class="order-container">
        <div class="order-header">
          <div class="order-header-left-section">
            <div class="order-date">
              <div class="order-header-label">Order Placed:</div>
              <div>${placed_date}</div>
            </div>
            <div class="order-total">
              <div class="order-header-label">Total:</div>
              <div>$${order_total}</div>
            </div>
          </div>
        </div>

        <div class="order-details-grid no-actions">
          ${items_html}
        </div>
      </div>`;
  });
  container.innerHTML = html;
}

render_orders();

// update cart quantity bubble in header.
function update_cart_quantity()
{
  const element = document.querySelector('.js-cart-quantity');
  if (!element)
    return;
  let count = 0;
  cart.forEach((item) => { count += item.quantity; });
  element.textContent = count;
}

update_cart_quantity();
