const API_BASE = 'https://dummyjson.com/products';

export async function fetchAllProducts() {
  const res = await fetch(API_BASE);
  if (!res.ok) throw new Error('Failed to fetch products');
  const data = await res.json();
  return data.products;
}

export async function fetchProductById(id) {
  const res = await fetch(`${API_BASE}/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch product #${id}`);
  return res.json();
}
