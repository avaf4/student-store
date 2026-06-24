const prisma = require("../db/db");

// OrderItem model — wraps Prisma Client calls for the order_items table.
// An OrderItem is one product line within an order (which product, how many,
// at what price). It holds foreign keys to both Order and Product.
class OrderItem {
  // Fetch all order items
  static async list() {
    return prisma.orderItem.findMany();
  }

  // Fetch one order item by id, or null if it doesn't exist
  static async get(id) {
    return prisma.orderItem.findUnique({ where: { id } });
  }

  // Create a single order item linked to an existing order + product
  static async create(data) {
    return prisma.orderItem.create({
      data: {
        orderId: data.orderId,
        productId: data.productId,
        quantity: data.quantity,
        price: data.price,
      },
    });
  }
}

module.exports = OrderItem;
