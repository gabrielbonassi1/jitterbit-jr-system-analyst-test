// order.service.test.js

import { createOrder, getOrderById, getAllOrders, deleteOrder } from './order.service.js';

console.log('Testing Order Service...\n');

// test data
const testOrderData = {
  orderId: 'TEST-ORDER-001',
  value: 250.50,
  creationDate: new Date().toISOString(),
  items: [
    {
      productId: 101,
      quantity: 2,
      price: 75.25
    },
    {
      productId: 102,
      quantity: 1,
      price: 100.00
    }
  ]
};

async function runTests() {
  try {
    // test 1: create order
    console.log('Testing createOrder...');
    const created = await createOrder(testOrderData);
    console.log('Order created:', created.orderId);
    console.log('- Items:', created.items.length);
    console.log();

    // test 2: get order by id
    console.log('Testing getOrderById...');
    const fetched = await getOrderById(testOrderData.orderId);
    if (fetched) {
      console.log('Order fetched:', fetched.orderId);
      console.log('- Value:', fetched.value);
      console.log('- Items:', fetched.items.length);
    } else {
      console.log('Order not found');
    }
    console.log();

    // test 3: get all orders
    console.log('Testing getAllOrders...');
    const allOrders = await getAllOrders();
    console.log('Total orders:', allOrders.length);
    if (allOrders.length > 0) {
      console.log('- First order:', allOrders[0].orderId);
    }
    console.log();

    // test 4: get non-existent order
    console.log('Testing getOrderById with non-existent ID...');
    const notFound = await getOrderById('NON-EXISTENT-ID');
    if (notFound === null) {
      console.log('Correctly returned null for non-existent order');
    } else {
      console.log('Should have returned null');
    }
    console.log();

    // cleanup: delete test order
    console.log('Cleaning up test data...');
    const deleted = await deleteOrder(testOrderData.orderId);
    console.log(deleted ? 'Test order deleted' : 'Failed to delete test order');
    console.log();

    console.log('All tests completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Test failed:', error.message);
    console.error(error);
    
    // try to cleanup
    try {
      await deleteOrder(testOrderData.orderId);
      console.log('Test order cleaned up');
    } catch (e) {
      // ignore cleanup errors
    }
    
    process.exit(1);
  }
}

runTests();
