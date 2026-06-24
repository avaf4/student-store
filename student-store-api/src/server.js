const express = require("express");
const cors = require("cors");
const Product = require("./models/product");
const Order = require("./models/order");

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

// ---------- Order endpoints ----------

// GET /orders — fetch all orders
app.get("/orders", async (req, res) => {
  try {
    const orders = await Order.list();
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

// POST /orders — create a new order
// NOTE: the full transactional version (creating the order WITH its items and
// computing totalPrice) is built in Milestone 5. This is a basic create for now.
app.post("/orders", async (req, res) => {
  try {
    const { customer, totalPrice } = req.body;
    if (customer === undefined || totalPrice === undefined) {
      return res.status(400).json({ error: "customer and totalPrice are required" });
    }
    const order = await Order.create(req.body);
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: "Failed to create order" });
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

