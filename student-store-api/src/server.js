const express = require("express");
const cors = require("cors");
const Product = require("./models/product");
const Order = require("./models/order");
const OrderItem = require("./models/orderItem");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3038;

// Root route — used to confirm the server is running
app.get("/", (req, res) => {
  res.json({ message: "Student Store API is running 🛍️" });
});

// ---------- Product endpoints ----------

// GET /products — fetch products, with optional ?category= and ?sort= filters
app.get("/products", async (req, res) => {
  try {
    const products = await Product.list(req.query);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// GET /products/:id — fetch one product by id
app.get("/products/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const product = await Product.get(id);
    if (!product) {
      return res.status(404).json({ error: `Product with id ${id} not found` });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// POST /products — create a new product
app.post("/products", async (req, res) => {
  try {
    const { name, price } = req.body;
    if (name === undefined || price === undefined) {
      return res.status(400).json({ error: "name and price are required" });
    }
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: "Failed to create product" });
  }
});

// PUT /products/:id — update an existing product
app.put("/products/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const existing = await Product.get(id);
    if (!existing) {
      return res.status(404).json({ error: `Product with id ${id} not found` });
    }
    const product = await Product.update(id, req.body);
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Failed to update product" });
  }
});

// DELETE /products/:id — remove a product
app.delete("/products/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const existing = await Product.get(id);
    if (!existing) {
      return res.status(404).json({ error: `Product with id ${id} not found` });
    }
    await Product.remove(id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Failed to delete product" });
  }
});

// ---------- Order item endpoints ----------

// GET /order-items — fetch every order item in the database
app.get("/order-items", async (req, res) => {
  try {
    const orderItems = await OrderItem.list();
    res.json(orderItems);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch order items" });
  }
});

// ---------- Order endpoints ----------

// GET /orders — fetch all orders
app.get("/orders", async (req, res) => {
  try {
    const orders = await Order.list(req.query);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// GET /orders/:id — fetch one order by id
app.get("/orders/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const order = await Order.get(id);
    if (!order) {
      return res.status(404).json({ error: `Order with id ${id} not found` });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

// POST /orders — create an order and all its items atomically.
// Body: { customer, status?, items: [{ productId, quantity }, ...] }
// The order, its items, and the computed total are written in one transaction;
// if any product doesn't exist the whole thing rolls back and nothing is created.
app.post("/orders", async (req, res) => {
  try {
    const { customer, items } = req.body;

    if (customer === undefined) {
      return res.status(400).json({ error: "customer is required" });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "An order must contain at least one item" });
    }

    const order = await Order.createWithItems(req.body);
    res.status(201).json(order);
  } catch (err) {
    // A nonexistent productId is a client error (400), not a server error (500).
    if (err.code === "PRODUCT_NOT_FOUND") {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: "Failed to create order" });
  }
});

// POST /orders/:order_id/items — add a new line item to an existing order.
// Body: { productId, quantity? }. The price is taken from the product in the DB
// and the order's total is updated in the same transaction.
app.post("/orders/:order_id/items", async (req, res) => {
  try {
    const orderId = Number(req.params.order_id);
    const { productId } = req.body;

    if (productId === undefined) {
      return res.status(400).json({ error: "productId is required" });
    }

    const orderItem = await OrderItem.addToOrder(orderId, req.body);
    res.status(201).json(orderItem);
  } catch (err) {
    // Missing order or product is a client error (400/404), not a 500.
    if (err.code === "ORDER_NOT_FOUND") {
      return res.status(404).json({ error: err.message });
    }
    if (err.code === "PRODUCT_NOT_FOUND") {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: "Failed to add item to order" });
  }
});

// PUT /orders/:id — update an existing order (e.g. change status)
app.put("/orders/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const existing = await Order.get(id);
    if (!existing) {
      return res.status(404).json({ error: `Order with id ${id} not found` });
    }
    const order = await Order.update(id, req.body);
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: "Failed to update order" });
  }
});

// DELETE /orders/:id — remove an order
app.delete("/orders/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const existing = await Order.get(id);
    if (!existing) {
      return res.status(404).json({ error: `Order with id ${id} not found` });
    }
    await Order.remove(id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Failed to delete order" });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

