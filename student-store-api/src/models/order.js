const prisma = require("../db/db");

// Order model — wraps all Prisma Client calls for the orders table.
// Note: creating an order with its items (POST /orders) is the transactional
// endpoint built in Milestone 5. The order/items relation arrives in Milestone 4.
class Order {
  // GET /orders — return every order
  static async list() {
    return prisma.order.findMany();
  }

  // GET /orders/:id — return one order, or null if it doesn't exist
  static async get(id) {
    return prisma.order.findUnique({ where: { id } });
  }

  // POST /orders — simple create (full transactional version comes in Milestone 5)
  static async create(data) {
    return prisma.order.create({
      data: {
        customer: data.customer,
        totalPrice: data.totalPrice,
        status: data.status,
      },
    });
  }

  // PUT /orders/:id — update an order (e.g. change its status)
  static async update(id, data) {
    return prisma.order.update({
      where: { id },
      data,
    });
  }

  // DELETE /orders/:id — remove an order (cascades to its order items in Milestone 4)
  static async remove(id) {
    return prisma.order.delete({ where: { id } });
  }
}

module.exports = Order;
