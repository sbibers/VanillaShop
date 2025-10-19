import {products} from './products.js';

export let inventory = JSON.parse(localStorage.getItem('inventory'));

// function to generate random stock for each product.
function generate_random_stock()
{
  const min = 5;
  const max = 50;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

if (!inventory)
{
  inventory = {};
  products.forEach((p) =>
  {
    inventory[p.id] = generate_random_stock();
  });
  save_inventory();
}
else
{
  let changed = false;
  products.forEach((p) =>
  {
    if (typeof inventory[p.id] === 'undefined')
    {
      inventory[p.id] = generate_random_stock();
      changed = true;
    }
  });
  if (changed)
  {
    save_inventory();
  }
}

function save_inventory()
{
  localStorage.setItem('inventory', JSON.stringify(inventory));
}

export function get_inventory(product_id)
{
  if (typeof inventory[product_id] === 'undefined')
  {
    inventory[product_id] = generate_random_stock();
    save_inventory();
  }
  return (inventory[product_id]);
}

export function reduce_inventory(product_id, quantity)
{
  const current = get_inventory(product_id);
  const next = Math.max(0, current - quantity);
  inventory[product_id] = next;
  save_inventory();
}

export function increase_inventory(product_id, quantity)
{
  const current = get_inventory(product_id);
  inventory[product_id] = current + quantity;
  save_inventory();
}
