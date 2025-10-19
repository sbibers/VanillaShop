import {cart, clear_cart} from '../../data/cart.js';
import {products} from '../../data/products.js';
import {delivery_options} from '../../data/delivery_options.js';
import {fromat_currency} from '../utils/calculations.js';
import {place_current_cart_order} from '../../data/orders.js';

export function render_payment_summary()
{
    let product_price_cents = 0;
    let shipping_price_cents = 0;
    let cart_quantity = 0;
    
    cart.forEach((cart_item) =>
    {
        const product_id = cart_item.product_id;
        let matching_product;

        // find the matching product.
        products.forEach((product) =>
        {
            if (product.id === product_id)
            {
                matching_product = product;
            }
        });
            
        const item_total = matching_product.price_cents * cart_item.quantity;
        product_price_cents += item_total;
        cart_quantity += cart_item.quantity;

        const delivery_option_id = cart_item.delivery_options_id;
        let delivery_option;

        delivery_options.forEach((option) =>
        {
            if (option.id === delivery_option_id)
            {
                delivery_option = option;
            }
        });

        shipping_price_cents += delivery_option.price_cents;
    });

    const total_before_tax_cents = product_price_cents + shipping_price_cents;
    const tax_cents = total_before_tax_cents * 0.1;
    const total_cents = total_before_tax_cents + tax_cents;

    const payment_summary_html = `
        <div class="payment-summary-title">
            Order Summary
        </div>

        <div class="payment-summary-row">
            <div>Items (${cart_quantity}):</div>
            <div class="payment-summary-money">$${fromat_currency(product_price_cents)}</div>
        </div>

        <div class="payment-summary-row">
            <div>Shipping &amp; handling:</div>
            <div class="payment-summary-money">$${fromat_currency(shipping_price_cents)}</div>
        </div>

        <div class="payment-summary-row subtotal-row">
            <div>Total before tax:</div>
            <div class="payment-summary-money">$${fromat_currency(total_before_tax_cents)}</div>
        </div>

        <div class="payment-summary-row">
            <div>Estimated tax (10%):</div>
            <div class="payment-summary-money">$${fromat_currency(tax_cents)}</div>
        </div>

        <div class="payment-summary-row total-row">
            <div>Order total:</div>
            <div class="payment-summary-money">$${fromat_currency(total_cents)}</div>
        </div>

        <button class="place-order-button button-primary">
            Place your order
        </button>
    `;

    document.querySelector('.payment-summary').innerHTML = payment_summary_html;

    // update the header's items count next to Checkout link.
    const items_link = document.querySelector('.checkout-header-middle-section .return-to-home-link');
    if (items_link)
    {
        items_link.textContent = `${cart_quantity} item${cart_quantity === 1 ? '' : 's'}`;
    }

    const place_order_button = document.querySelector('.place-order-button');
    if (place_order_button)
    {
        place_order_button.addEventListener('click', () =>
        {
            const order_id = place_current_cart_order();
            if (order_id)
            {
                clear_cart();
                window.location.href = 'orders.html';
            }
        });
    }
}
