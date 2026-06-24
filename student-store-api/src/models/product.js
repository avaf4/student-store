const prisma = require("../db/db");

// Product model — wraps all Prisma Client calls for the products table.
// Keeping DB logic here keeps the route handlers in server.js thin.
class Product {
  // GET /products — return products, optionally filtered/sorted.
  // Accepts query params: { category, sort }. Builds Prisma's `where`
  // and `orderBy` dynamically so omitted params simply aren't applied.
  static async list(query = {}) {
    const { category, sort } = query;

    const where = {};
    if (category) {
      // case-insensitive exact match on category
      where.category = { equals: category, mode: "insensitive" };
    }

    let orderBy;
    if (sort === "price" || sort === "name") {
      orderBy = { [sort]: "asc" };
    }
    // any other sort value → leave orderBy undefined (unordered)

    return prisma.product.findMany({ where, orderBy });
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
