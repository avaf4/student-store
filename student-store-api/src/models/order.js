const prisma = require("../db/db");

// Order model — wraps all Prisma Client calls for the orders table.
// Note: creating an order with its items (POST /orders) is the transactional
// endpoint built in Milestone 5. The order/items relation arrives in Milestone 4.
class Order {
  // GET /orders — return every order, each with its associated order items
  static async list() {
    return prisma.order.findMany({ include: { orderItems: true } });
  }

  // GET /orders/:id — return one order along with its order items (Prisma's
  // `include` joins in the related OrderItem rows), or null if it doesn't exist
  static async get(id) {
    return prisma.order.findUnique({
      where: { id },
      include: { orderItems: true },
    });
  }

  // POST /orders — create an order AND its items atomically.
  // `data` shape: { customer, status?, items: [{ productId, quantity }, ...] }
  //
  // Everything runs inside prisma.$transaction so the whole thing either commits
  // together or rolls back together — no half-created orders. If any productId
  // doesn't exist we throw, which aborts the transaction before anything is written.
  static async createWithItems(data) {
    const { customer, status, items } = data;

    return prisma.$transaction(async (tx) => {
      // 1. Look up every referenced product (also gives us the authoritative price)
      const productIds = items.map((item) => item.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
      });

      // 2. Verify each requested product exists; abort if not
      const productById = new Map(products.map((p) => [p.id, p]));
      for (const item of items) {
        if (!productById.has(item.productId)) {
          // Throwing inside $transaction rolls back everything done so far.
          const err = new Error(`Product with id ${item.productId} does not exist`);
          err.code = "PRODUCT_NOT_FOUND";
          throw err;
        }
      }

      // 3. Compute each line price (from the DB, not the client) and the total
      const orderItemsData = items.map((item) => {
        const product = productById.get(item.productId);
        return {
          productId: item.productId,
          quantity: item.quantity,
          price: product.price,
        };
      });
      const totalPrice = orderItemsData.reduce(
        (sum, line) => sum + line.price * line.quantity,
        0
      );

      // 4. Create the order and its items together, returning them included
      return tx.order.create({
        data: {
          customer,
          status,
          totalPrice,
          orderItems: { create: orderItemsData },
        },
        include: { orderItems: true },
      });
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
