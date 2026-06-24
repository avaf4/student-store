# Student Store API — System Spec

This document is the source of truth for all schema and route decisions across the
project. Decide here, then implement.

---

## Section 1: Data Models

Three models: `Product`, `Order`, and `OrderItem`.

### Product

| Field         | Prisma Type | Required | Default            | Notes                       |
| ------------- | ----------- | -------- | ------------------ | --------------------------- |
| `id`          | `Int`       | Yes      | `autoincrement()`  | Primary key                 |
| `name`        | `String`    | Yes      | —                  | Product name                |
| `description` | `String`    | No       | —                  | Longer text description     |
| `price`       | `Float`     | Yes      | —                  | Unit price in dollars       |
| `imageUrl`    | `String`    | No       | —                  | Maps to `image_url` in data |
| `category`    | `String`    | No       | —                  | e.g. "Apparel", "Books"     |

- **Primary key:** `id`, auto-increments.
- **Relationships:** One `Product` has many `OrderItem` records (`OrderItem.productId -> Product.id`).
- **Cascade behavior:** Deleting a `Product` **cascade deletes** every `OrderItem` that
  references it.

### Order

| Field        | Prisma Type | Required | Default            | Notes                                  |
| ------------ | ----------- | -------- | ------------------ | -------------------------------------- |
| `id`         | `Int`       | Yes      | `autoincrement()`  | Primary key                            |
| `customer`   | `Int`       | Yes      | —                  | Customer id placing the order          |
| `totalPrice` | `Float`     | Yes      | —                  | Sum of (item price × quantity)         |
| `status`     | `String`    | Yes      | `"pending"`        | e.g. "pending", "completed"            |
| `createdAt`  | `DateTime`  | Yes      | `now()`            | Timestamp the order was created        |

- **Primary key:** `id`, auto-increments.
- **Relationships:** One `Order` has many `OrderItem` records (`OrderItem.orderId -> Order.id`).
- **Cascade behavior:** Deleting an `Order` **cascade deletes** every `OrderItem` that
  belongs to it.

### OrderItem

`OrderItem` is the join between an order and the products in it. It sits at the
intersection of two relationships, so it is downstream of **both** cascade rules.

| Field       | Prisma Type | Required | Default           | Notes                          |
| ----------- | ----------- | -------- | ----------------- | ------------------------------ |
| `id`        | `Int`       | Yes      | `autoincrement()` | Primary key                    |
| `orderId`   | `Int`       | Yes      | —                 | Foreign key → `Order.id`       |
| `productId` | `Int`       | Yes      | —                 | Foreign key → `Product.id`     |
| `quantity`  | `Int`       | Yes      | `1`               | How many of the product        |
| `price`     | `Float`     | Yes      | —                 | Unit price captured at order time |

- **Primary key:** `id`, auto-increments.
- **Relationships:**
  - Many `OrderItem` belong to one `Order` (`orderId -> Order.id`).
  - Many `OrderItem` reference one `Product` (`productId -> Product.id`).
- **Cascade behavior:** An `OrderItem` cannot outlive either parent.
  - Deleting its `Order` deletes the `OrderItem`.
  - Deleting its `Product` deletes the `OrderItem`.

#### Dependency-chain reasoning (the important part)

`OrderItem` holds foreign keys to both `Order` and `Product`, so it is downstream of two
cascade delete rules at once.

**What happens if a product is deleted while an active order contains it?** The cascade
removes the matching `OrderItem` rows. The `Order` itself survives — it is only a parent
of `OrderItem`, never a child of `Product` — but it now represents a *smaller* set of
items than when it was placed. Its stored `totalPrice` becomes stale because we captured
the total at creation time and the cascade does not recompute it.

**Design consequence:** because deleting a product silently changes order history, in a
real store we would prefer to *soft-delete* / deactivate products rather than hard-delete
them. For this project we implement the required hard cascade delete, but we record the
tradeoff: `totalPrice` is a snapshot, not a recomputed value, and a product deletion can
leave it out of sync with the surviving items.

---

## Section 2: API Contract

**Consistent error shape for the entire API:**

```json
{ "error": "Human-readable message describing what went wrong" }
```

All non-2xx responses use this shape.

### Products

#### GET /products
- **Request:** none. Optional query params (Milestone 2): `category`, `sort`, `search`.
- **Success:** `200` — array of product objects.
  ```json
  [ { "id": 1, "name": "College Hoodie", "category": "Apparel",
      "description": "...", "imageUrl": "...", "price": 29.99 } ]
  ```
- **Error:** `500` — `{ "error": "Failed to fetch products" }`

#### GET /products/:id
- **Request:** route param `id` (Int).
- **Success:** `200` — single product object.
- **Error:** `404` — `{ "error": "Product with id 999 not found" }`

#### POST /products
- **Request body:** `{ "name", "description?", "price", "imageUrl?", "category?" }`
- **Success:** `201` — the created product object.
- **Error:** `400` — `{ "error": "name and price are required" }`

#### PUT /products/:id
- **Request:** route param `id`, body with any updatable fields.
- **Success:** `200` — the updated product object.
- **Error:** `404` — `{ "error": "Product with id 999 not found" }`

#### DELETE /products/:id
- **Request:** route param `id`.
- **Success:** `204` — no body. (Cascade deletes related `OrderItem` rows.)
- **Error:** `404` — `{ "error": "Product with id 999 not found" }`

### Orders

#### GET /orders
- **Request:** none.
- **Success:** `200` — array of order objects, each including its `orderItems`.
- **Error:** `500` — `{ "error": "Failed to fetch orders" }`

#### GET /orders/:id
- **Request:** route param `id`.
- **Success:** `200` — single order with its `orderItems`.
- **Error:** `404` — `{ "error": "Order with id 999 not found" }`

#### POST /orders  *(see Section 3 — most complex endpoint)*
- **Request body:**
  ```json
  {
    "customer": 101,
    "status": "pending",
    "items": [
      { "productId": 1, "quantity": 2 },
      { "productId": 4, "quantity": 1 }
    ]
  }
  ```
  - `customer` (Int, required), `status` (String, optional → defaults `"pending"`),
    `items` (array, required, must contain ≥ 1 item).
  - `totalPrice` is **not** sent by the client; the server computes it.
- **Success:** `201` — the created order **including** its `orderItems`:
  ```json
  {
    "id": 7, "customer": 101, "status": "pending",
    "totalPrice": 61.97, "createdAt": "2026-06-23T10:00:00.000Z",
    "orderItems": [
      { "id": 12, "orderId": 7, "productId": 1, "quantity": 2, "price": 29.99 },
      { "id": 13, "orderId": 7, "productId": 4, "quantity": 1, "price": 1.99 }
    ]
  }
  ```
- **Errors:**
  - `400` — `{ "error": "An order must contain at least one item" }`
  - `400` — `{ "error": "Product with id 999 does not exist" }` (item references a
    nonexistent product — whole request fails, nothing is created)

#### DELETE /orders/:id
- **Request:** route param `id`.
- **Success:** `204` — no body. (Cascade deletes the order's `OrderItem` rows.)
- **Error:** `404` — `{ "error": "Order with id 999 not found" }`

---

## Section 3: Transactional Flow — `POST /orders`

`POST /orders` must do four things **atomically**: create the order, create its items,
compute and store the total, and roll everything back if any step fails.

### Step-by-step at the data layer

1. **Receive and validate the request body.**
   - Body shape: `{ customer, status?, items: [{ productId, quantity }, ...] }`.
   - If `items` is missing or empty → respond `400` immediately, no DB writes.

2. **Look up every referenced product.** Query `prisma.product.findMany` for all
   `productId`s in `items`. We need the products to (a) verify each one exists and
   (b) read the authoritative `price` from the DB rather than trusting the client.

3. **Validate product existence.** If any `productId` in the request has no matching
   product → respond `400` (`"Product with id X does not exist"`) and write nothing.

4. **Compute line prices and the total.** For each item, capture the product's current
   `price` and multiply by `quantity`. `totalPrice = Σ (price × quantity)`.

5. **Write atomically inside a transaction.** Use Prisma's nested-create
   (`prisma.order.create` with `orderItems: { create: [...] }`), which Prisma runs as a
   single transaction. The order and all its items are inserted together; the computed
   `totalPrice` is stored on the order.

6. **Return the created order with its items.** Use `include: { orderItems: true }` so
   the response carries both the order metadata and the created items. Respond `201`.

### Why atomicity matters

If item #2 fails to insert after item #1 succeeded (e.g. a constraint error), a
non-transactional approach leaves a half-created order: an `Order` row with a wrong
`totalPrice` and only some of its items. Wrapping the writes in one transaction means
either **all** rows are committed or **none** are — no partial orders to debug later.

### What if an item references a nonexistent product?

Detected in **step 3, before any writes happen**. The endpoint responds `400` with
`{ "error": "Product with id 999 does not exist" }` and the database is untouched —
no order and no items are created.
