// order.service.js

import db from '../config/database.js';

/**
 * Creates a new order with its items in the database
 * @param {Object} orderData - Order data already transformed to database format
 * @returns {Promise<Object>} - Created order with items
 */
async function createOrder(orderData) {
  return db.tx(async t => {
    await t.none(
      `INSERT INTO "Order" ("orderId", "value", "creationDate") 
       VALUES ($1, $2, $3)`,
      [orderData.orderId, orderData.value, orderData.creationDate]
    );

    const itemInserts = orderData.items.map(item => {
      return t.none(
        `INSERT INTO "Items" ("orderId", "productId", "quantity", "price") 
         VALUES ($1, $2, $3, $4)`,
        [orderData.orderId, item.productId, item.quantity, item.price]
      );
    });

    await t.batch(itemInserts);

    return orderData;
  });
}

/**
 * Gets an order by ID with its items
 * @param {string} orderId - Order ID
 * @returns {Promise<Object|null>} - Order with items or null if not found
 */
async function getOrderById(orderId) {
  try {
    const order = await db.one(
      `SELECT "orderId", "value", "creationDate", "updatedAt" 
       FROM "Order" 
       WHERE "orderId" = $1`,
      [orderId]
    );

    const items = await db.any(
      `SELECT "productId", "quantity", "price" 
       FROM "Items" 
       WHERE "orderId" = $1`,
      [orderId]
    );

    return {
      ...order,
      items
    };
  } catch (error) {
    if (error.code === 0) {
      return null;
    }
    throw error;
  }
}

/**
 * Gets all orders with their items
 * @returns {Promise<Array>} - Array of orders with items
 */
async function getAllOrders() {
  const orders = await db.any(
    `SELECT "orderId", "value", "creationDate", "updatedAt" 
     FROM "Order" 
     ORDER BY "creationDate" DESC`
  );

  const ordersWithItems = await Promise.all(
    orders.map(async order => {
      const items = await db.any(
        `SELECT "productId", "quantity", "price" 
         FROM "Items" 
         WHERE "orderId" = $1`,
        [order.orderId]
      );
      return {
        ...order,
        items
      };
    })
  );

  return ordersWithItems;
}

/**
 * Updates an order and its items
 * @param {string} orderId - Order ID
 * @param {Object} orderData - Order data to update
 * @returns {Promise<Object>} - Updated order
 */
async function updateOrder(orderId, orderData) {
  return db.tx(async t => {
    await t.none(
      `UPDATE "Order" 
       SET "value" = $1, "updatedAt" = CURRENT_TIMESTAMP 
       WHERE "orderId" = $2`,
      [orderData.value, orderId]
    );

    await t.none(
      `DELETE FROM "Items" WHERE "orderId" = $1`,
      [orderId]
    );

    const itemInserts = orderData.items.map(item => {
      return t.none(
        `INSERT INTO "Items" ("orderId", "productId", "quantity", "price") 
         VALUES ($1, $2, $3, $4)`,
        [orderId, item.productId, item.quantity, item.price]
      );
    });

    await t.batch(itemInserts);

    return getOrderById(orderId);
  });
}

/**
 * Deletes an order and its items (cascade)
 * @param {string} orderId - Order ID
 * @returns {Promise<boolean>} - True if deleted, false if not found
 */
async function deleteOrder(orderId) {
  const result = await db.result(
    `DELETE FROM "Order" WHERE "orderId" = $1`,
    [orderId]
  );
  return result.rowCount > 0;
}

export {
  createOrder,
  getOrderById,
  getAllOrders,
  updateOrder,
  deleteOrder
};
