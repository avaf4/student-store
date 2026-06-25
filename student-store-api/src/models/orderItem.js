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

  // POST /orders/:order_id/items — add a new line item to an existing order.
  // `data` shape: { productId, quantity? }
  //
  // Runs inside prisma.$transaction so the new item AND the order's updated
  // total are written together. The price is taken from the product in the DB
  // (not the client), mirroring POST /orders. Throws ORDER_NOT_FOUND /
  // PRODUCT_NOT_FOUND so the route can map them to the right status codes.
  static async addToOrder(orderId, data) {
    const { productId } = data;
    const quantity = data.quantity ?? 1;

    return prisma.$transaction(async (tx) => {
      // 1. The order must exist to attach an item to it
      const order = await tx.order.findUnique({ where: { id: orderId } });
      if (!order) {
        const err = new Error(`Order with id ${orderId} does not exist`);
        err.code = "ORDER_NOT_FOUND";
        throw err;
      }

      // 2. The product must exist (also gives us the authoritative price)
      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product) {
        const err = new Error(`Product with id ${productId} does not exist`);
        err.code = "PRODUCT_NOT_FOUND";
        throw err;
      }

      // 3. Create the line item at the product's current price
      const orderItem = await tx.orderItem.create({
        data: { orderId, productId, quantity, price: product.price },
      });

      // 4. Keep the order total in sync with the new item
      await tx.order.update({
        where: { id: orderId },
        data: { totalPrice: order.totalPrice + product.price * quantity },
      });

      return orderItem;
    });
  }
}

module.exports = OrderItem;
