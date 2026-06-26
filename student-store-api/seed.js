const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const fs = require('fs')
const path = require('path')

async function seed() {
  try {
    console.log('Seeding database...\n')

    // Clear existing data (in order due to relations)
    await prisma.orderItem.deleteMany()
    await prisma.order.deleteMany()
    await prisma.product.deleteMany()

    // Load JSON data
    const productsData = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'data/products.json'), 'utf8')
    )

    const ordersData = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'data/orders.json'), 'utf8')
    )

    // Seed products. The DB assigns its own autoincrement ids (which won't
    // match the ids in products.json after re-seeds), so remember the mapping
    // from each JSON id → the real DB id to translate order items below.
    const productIdMap = new Map()
    for (const product of productsData.products) {
      const created = await prisma.product.create({
        data: {
          name: product.name,
          description: product.description,
          price: product.price,
          imageUrl: product.image_url,
          category: product.category,
        },
      })
      productIdMap.set(product.id, created.id)
    }

    // Seed orders and items
    for (const order of ordersData.orders) {
      const createdOrder = await prisma.order.create({
        data: {
          customer: order.customer_email,
          totalPrice: order.total_price,
          status: order.status,
          createdAt: new Date(order.created_at),
          orderItems: {
            create: order.items.map((item) => ({
              productId: productIdMap.get(item.product_id),
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
      })

      console.log(`Created order #${createdOrder.id}`)
    }

    console.log('\nSeeding complete!')
  } catch (err) {
    console.error('Error seeding:', err)
  } finally {
    await prisma.$disconnect()
  }
}

seed()
