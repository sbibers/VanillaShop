import {products} from '../../data/products.js';
import {cart, remove_from_cart, update_delivery_option} from '../../data/cart.js';
import {fromat_currency} from '../utils/calculations.js';
import dayjs from 'https://unpkg.com/supersimpledev@8.5.0/dayjs/esm/index.js';
import {delivery_options} from '../../data/delivery_options.js';
import {render_payment_summary} from './payment_summary.js';

function delivery_option_html(matching_product, cart_item)
{
    let html = '';
    delivery_options.forEach((delivery_option) =>
    {
        const today = dayjs();
        const delivery_date = today.add(delivery_option.delivery_days, 'days');
        const date_string = delivery_date.format('dddd, MMMM D');
        const price_string = delivery_option.price_cents === 0 ? 'FREE' : `$${fromat_currency(delivery_option.price_cents)}`;
        const is_checked = delivery_option.id === cart_item.delivery_options_id;

        html += `<div class="delivery-option js-delivery-option" data-product-id="${matching_product.id}" data-delivery-option-id="${delivery_option.id}">
        <input type="radio"
        ${is_checked ? 'checked' : ''}
        class="delivery-option-input"
        name="delivery-option-${matching_product.id}">
        <div>
        <div class="delivery-option-date">
            ${date_string}
        </div>
                <div class="delivery-option-price">
                    ${price_string} - Shipping
                </div>
                </div>
            </div>`;
    });
    return (html);
}

export function render_order_summary()
{
    let cart_summary_html = '';

    cart.forEach((cart_item) =>
    {
        const product_id = cart_item.product_id;
        let matching_product;

        products.forEach((product) =>
        {
            if (product.id === product_id)
            {
                matching_product = product;
            }
        });
        
        // skip if product not found.
        if (!matching_product)
        {
            return;
        }
        const delivery_option_id = cart_item.delivery_options_id;
        let delivery_option;
        
        delivery_options.forEach((option) =>
        {
            if (option.id === delivery_option_id)
            {
                delivery_option = option;
            }
        });
        const today = dayjs();
        const delivery_date = today.add(delivery_option.delivery_days, 'days');
        const date_string = delivery_date.format('dddd, MMMM D');
        cart_summary_html +=
        `<div class="cart-item-container js-cart-item-container-${matching_product.id}">
        <div class="delivery-date">
        Delivery date: ${date_string}
        </div>

        <div class="cart-item-details-grid">
        <img class="product-image"
            src="${matching_product.image}">

        <div class="cart-item-details">
        <div class="product-name">
            ${matching_product.name}
        </div>
        <div class="product-price">
            $${fromat_currency(matching_product.price_cents)}
        </div>
        <div class="product-quantity">
            <span>
            Quantity: <span class="quantity-label">${cart_item.quantity}</span>
            </span>
            <span class="delete-quantity-link link-primary js-delete-link"
            data-product-id="${matching_product.id}">
            Delete
            </span>
        </div>
        </div>

        <div class="delivery-options">
        <div class="delivery-options-title">
            Choose a delivery option:
        </div>
        ${delivery_option_html(matching_product, cart_item)}
        </div>
    </div>
    </div>`;
    });

    document.querySelector('.js-order-summary').innerHTML = cart_summary_html;

    document.querySelectorAll('.js-delete-link').forEach((link) =>
    {
        link.addEventListener('click', () =>
        {
            const product_id = link.dataset.productId;
            remove_from_cart(product_id);
            const removed_container = document.querySelector(`.js-cart-item-container-${product_id}`);
            removed_container.remove();
            render_payment_summary();
        });
    });

    document.querySelectorAll('.js-delivery-option').forEach((element) =>
    {
        element.addEventListener('click', () => 
        {
            const product_id = element.dataset.productId;
            const delivery_option_id = element.dataset.deliveryOptionId;
            update_delivery_option(product_id, delivery_option_id);
            render_order_summary();
            render_payment_summary();
        });
    });
}

render_order_summary();
