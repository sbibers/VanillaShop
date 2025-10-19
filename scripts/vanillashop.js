import {cart, add_to_cart} from '../data/cart.js';

import {products} from '../data/products.js';
import {get_inventory} from '../data/inventory.js';

import {fromat_currency} from './utils/calculations.js';

let products_html = '';

// generate the HTML code for each product.
products.forEach((products) =>
{
    const stock = get_inventory(products.id);
    const is_out_of_stock = stock <= 0;
    const options = !is_out_of_stock
      ? Array.from({ length: Math.max(1, Math.min(10, stock)) }, (_, i) => i + 1)
          .map((n) => `<option value="${n}" ${n === 1 ? 'selected' : ''}>${n}</option>`)
          .join('')
      : '';
    products_html += `<div class="product-container" data-product-id="${products.id}">
          <div class="product-image-container">
            <img class="product-image js-open-details"
              src="${products.image}" data-product-id="${products.id}" tabindex="0" alt="${products.name}">
          </div>

          <div class="product-name limit-text-to-2-lines js-open-details" data-product-id="${products.id}" tabindex="0">
            ${products.name}
          </div>

          <div class="product-rating-container">
            <img class="product-rating-stars"
              src="images/ratings/rating-${products.rating.stars * 10}.png" alt="${products.rating.stars} stars rating">
            <div class="product-rating-count link-primary">
              ${products.rating.count}
            </div>
          </div>

          <div class="product-price">
            $${fromat_currency(products.price_cents)}
          </div>

          <div class="product-quantity-container">
            ${is_out_of_stock ? '' : `<select class="js-quantity-selector-${products.id}">${options}</select>`}
          </div>

          <div class="product-spacer"></div>

          <div class="product-stock">${is_out_of_stock ? 'Out of stock' : `In stock: ${stock}`}</div>

          <div class="added-to-cart">
            <img src="images/icons/checkmark.png" alt="Added to cart">
            Added
          </div>

          <button class="add-to-cart-button button-primary js-add-to-cart" 
          data-product-id="${products.id}" ${is_out_of_stock ? 'disabled' : ''}>
            ${is_out_of_stock ? 'Out of stock' : 'Add to Cart'}
          </button>
        </div>`;
});

document.querySelector('.js-product-grid').innerHTML = products_html;


function increment_quantity()
{
  let cart_quantity_count = 0;
  cart.forEach((cart_item) => 
  {
    cart_quantity_count += cart_item.quantity;
  });
  document.querySelector('.js-cart-quantity').innerHTML = cart_quantity_count;
}

increment_quantity();

document.querySelectorAll('.js-add-to-cart').forEach((button) =>
{
  button.addEventListener('click', () => 
  {
    const product_id = button.dataset.productId;
    const quantity_selector = document.querySelector(`.js-quantity-selector-${product_id}`);
    const quantity = Number(quantity_selector.value);
    add_to_cart(button, product_id, quantity);
    increment_quantity();
  });
});

// product details modal.
function create_modal()
{
  const existing = document.querySelector('.product-modal-overlay');
  if (existing) 
  {
    return (existing);
  }
  const overlay = document.createElement('div');
  overlay.className = 'product-modal-overlay';
  overlay.innerHTML = `
    <div class="product-modal">
      <button class="product-modal-close" aria-label="Close">×</button>
      <div class="product-modal-body"></div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', (e) =>
  {
    if (e.target.classList.contains('product-modal-overlay') || e.target.classList.contains('product-modal-close'))
    {
      overlay.classList.remove('is-open');
    }
  });
  document.addEventListener('keydown', (e) =>
  {
    if (e.key === 'Escape')
    {
      overlay.classList.remove('is-open');
    }
  });
  return (overlay);
}

// opens the product details modal.
function open_product_details(product_id)
{
  const product = products.find(p => p.id === product_id);
  if (!product)
  {
    return;
  }
  const stock = get_inventory(product.id);
  const overlay = create_modal();
  const body = overlay.querySelector('.product-modal-body');
  const keywords = Array.isArray(product.keywords) ? product.keywords.join(', ') : '';
  const size_chart = product.sizeChartLink ? `<div class="product-detail-row"><a class="link-primary" href="${product.sizeChartLink}" target="_blank">Size chart</a></div>` : '';
  body.innerHTML = `
    <div class="product-detail-grid">
      <div class="product-detail-image-wrap">
        <img src="${product.image}" alt="${product.name}">
      </div>
      <div class="product-detail-info">
        <h2 class="product-detail-name">${product.name}</h2>
        <div class="product-detail-rating">
          <img src="images/ratings/rating-${product.rating.stars * 10}.png" alt="${product.rating.stars} stars">
          <span class="product-detail-rating-count">${product.rating.count}</span>
        </div>
        <div class="product-detail-price">$${fromat_currency(product.price_cents)}</div>
        <div class="product-detail-stock ${stock <= 0 ? 'out' : 'in'}">${stock <= 0 ? 'Out of stock' : `In stock: ${stock}`}</div>
        ${keywords ? `<div class="product-detail-row"><span class="product-detail-label">Keywords:</span> ${keywords}</div>` : ''}
        ${product.type ? `<div class="product-detail-row"><span class="product-detail-label">Type:</span> ${product.type}</div>` : ''}
        ${size_chart}
      </div>
    </div>`;
  overlay.classList.add('is-open');
}

document.querySelectorAll('.js-open-details').forEach((el) => // clickable elements to open product details.
{
  el.addEventListener('click', (e) => 
  {
    const pid = e.currentTarget.dataset.productId;
    open_product_details(pid);
  });
  
  // add keyboard support for focused elements.
  el.addEventListener('keydown', (e) => 
  {
    if (e.key === 'Enter' || e.key === ' ') 
    {
      e.preventDefault();
      const pid = e.currentTarget.dataset.productId;
      open_product_details(pid);
    }
  });
});
