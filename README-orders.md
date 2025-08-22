# Orders & Order Items Feature

## Setup

1. Set `MONGO_URI` in `.env`.
2. `node scripts/seed.js` to create a seed user, products, cart items, and a sample order.
3. `node server.js` to start the API.

## Testing

Use the Postman steps outlined in the main message or cURL samples.


## Endpoints (mounted at /api/orders)

- POST /from-cart
  - Body: { user_id, address_id }
  - Creates Order + OrderItems from the user's Cart, snapshots current product prices, adjusts stock, clears cart, and returns the order + items.

- GET /:orderId
  - Returns a single order plus its items (with product populated).

- GET /user/:userId
  - Returns all orders for a user with their items.

- POST /:orderId/items
  - Body: { product_id, quantity, variant_id? }
  - Adds a line item (or merges with existing same product/variant), adjusts stock, and recalculates order total.

- PATCH /:orderId/items/:orderItemId
  - Body: { quantity }
  - Updates item quantity, adjusts stock by delta, recalculates total.

- DELETE /:orderId/items/:orderItemId
  - Removes an item, restores stock, recalculates total.

- POST /:orderId/recalculate
  - Forces a total recalc from OrderItems (safety/debug).

## Data/Business Rules

- Order total is always `sum(price * quantity)` from `OrderItem`; `price` is captured at time of add (snapshot from Product.price).
- All modifying operations use MongoDB **transactions** to keep stock, order, and items in sync.
- **Stock checks** ensure you can’t oversell.
- Placing an order **clears cart** items atomically on success.

