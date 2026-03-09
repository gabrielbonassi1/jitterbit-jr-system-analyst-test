// order.controller.js

import { 
  createOrder, 
  getOrderById, 
  getAllOrders, 
  updateOrder, 
  deleteOrder 
} from '../services/order.service.js';
import { 
  mapOrderInputToDatabase, 
  mapOrderDatabaseToOutput 
} from '../utils/dataMapper.js';

/**
 * POST /order - Creates a new order
 * @param {Request} req - request object
 * @param {Response} res - response object
 */
async function createOrderController(req, res) {
  try {
    const inputData = req.body;

    const orderData = mapOrderInputToDatabase(inputData);

    const createdOrder = await createOrder(orderData);

    const outputData = mapOrderDatabaseToOutput(createdOrder);

    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: outputData
    });
  } catch (error) {
    console.error('Error creating order:', error);

    // validation errors
    if (error.message.includes('required') || error.message.includes('must not be empty')) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.message
      });
    }

    // database errors
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Order ID already exists',
        error: error.message
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

/**
 * GET /order/:orderId - Gets an order by ID
 * @param {Request} req - request object
 * @param {Response} res - response object
 */
async function getOrderByIdController(req, res) {
  try {
    const { orderId } = req.params;

    const order = await getOrderById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const outputData = mapOrderDatabaseToOutput(order);

    return res.status(200).json({
      success: true,
      data: outputData
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

/**
 * GET /order/list - Gets all orders
 * @param {Request} req - request object
 * @param {Response} res - response object
 */
async function getAllOrdersController(req, res) {
  try {
    const orders = await getAllOrders();

    const outputData = orders.map(order => mapOrderDatabaseToOutput(order));

    return res.status(200).json({
      success: true,
      count: outputData.length,
      data: outputData
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

/**
 * PUT /order/:orderId - Updates an order
 * @param {Request} req - request object
 * @param {Response} res - response object
 */
async function updateOrderController(req, res) {
  try {
    const { orderId } = req.params;
    const inputData = req.body;

    // check if order exists
    const existingOrder = await getOrderById(orderId);
    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const orderData = mapOrderInputToDatabase(inputData);

    const updatedOrder = await updateOrder(orderId, orderData);

    const outputData = mapOrderDatabaseToOutput(updatedOrder);

    return res.status(200).json({
      success: true,
      message: 'Order updated successfully',
      data: outputData
    });
  } catch (error) {
    console.error('Error updating order:', error);

    if (error.message.includes('required') || error.message.includes('must not be empty')) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.message
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

/**
 * DELETE /order/:orderId - Deletes an order
 * @param {Request} req - request object
 * @param {Response} res - response object
 */
async function deleteOrderController(req, res) {
  try {
    const { orderId } = req.params;

    const deleted = await deleteOrder(orderId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting order:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

export {
  createOrderController,
  getOrderByIdController,
  getAllOrdersController,
  updateOrderController,
  deleteOrderController
};
