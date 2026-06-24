const prisma = require("../db/db");

// Product model — wraps all Prisma Client calls for the products table.
// Keeping DB logic here keeps the route handlers in server.js thin.
class Product {
  // GET /products — return every product
  static async list() {
    return prisma.product.findMany();
  }

  // GET /products/:id — return one product, or null if it doesn't exist
  static async get(id) {
    return prisma.product.findUnique({ where: { id } });
  }

  // POST /products — create a new product from the request body
  static async create(data) {
    return prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        imageUrl: data.imageUrl,
        category: data.category,
      },
    });
  }

  // PUT /products/:id — update an existing product
  static async update(id, data) {
    return prisma.product.update({
      where: { id },
      data,
    });
  }

  // DELETE /products/:id — remove a product (cascades to its order items later)
  static async remove(id) {
    return prisma.product.delete({ where: { id } });
  }
}

module.exports = Product;
