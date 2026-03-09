// server.test.js
// Make sure the server is running: npm start

const BASE_URL = 'http://localhost:3000';

// test data
const testOrder = {
  numeroPedido: `TEST-${Date.now()}`,
  valorTotal: 350.75,
  dataCriacao: new Date().toISOString(),
  items: [
    {
      idItem: "1001",
      quantidadeItem: 2,
      valorItem: 125.25
    },
    {
      idItem: "1002",
      quantidadeItem: 1,
      valorItem: 100.25
    }
  ]
};

let createdOrderId = null;
let authToken = null; // JWT token

// helper function to make requests
async function makeRequest(method, path, body = null, useAuth = true) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  // add authorization header if token exists and useAuth is true
  if (authToken && useAuth) {
    options.headers['Authorization'] = `Bearer ${authToken}`;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${path}`, options);
  const data = await response.json();
  
  return {
    status: response.status,
    data
  };
}

// test functions
async function testHealthCheck() {
  console.log('### Testing GET /health...');
  try {
    const { status, data } = await makeRequest('GET', '/health', null, false);
    
    if (status === 200 && data.success) {
      console.log('Health check passed');
      console.log(`Message: ${data.message}`);
    } else {
      console.log('Health check failed');
    }
  } catch (error) {
    console.log('Health check failed:', error.message);
  }
  console.log();
}

async function testLogin() {
  console.log('Testing POST /auth/login...');
  try {
    const credentials = {
      username: 'admin',
      password: 'admin123'
    };

    const { status, data } = await makeRequest('POST', '/auth/login', credentials, false);
    
    if (status === 200 && data.success && data.token) {
      console.log('Login successful');
      console.log(`- Username: ${data.user.username}`);
      console.log(`- Role: ${data.user.role}`);
      console.log(`- Token: ${data.token.substring(0, 20)}...`);
      authToken = data.token; // save token for subsequent requests
    } else {
      console.log('Login failed');
      console.log(`- Status: ${status}`);
      console.log(`- Response:`, data);
    }
  } catch (error) {
    console.log('Login failed:', error.message);
  }
  console.log();
}

async function testLoginInvalidCredentials() {
  console.log('Testing POST /auth/login (invalid credentials)...');
  try {
    const credentials = {
      username: 'admin',
      password: 'wrongpassword'
    };

    const { status, data } = await makeRequest('POST', '/auth/login', credentials, false);
    
    if (status === 401 && !data.success) {
      console.log('Correctly rejected invalid credentials');
      console.log(`- Message: ${data.message}`);
    } else {
      console.log('Should have returned 401');
      console.log(`- Status: ${status}`);
    }
  } catch (error) {
    console.log('Test failed:', error.message);
  }
  console.log();
}

async function testGetCurrentUser() {
  console.log('Testing GET /auth/me...');
  try {
    if (!authToken) {
      console.log('Skipping (not authenticated)');
      console.log();
      return;
    }

    const { status, data } = await makeRequest('GET', '/auth/me');
    
    if (status === 200 && data.success) {
      console.log('Current user retrieved successfully');
      console.log(`- Username: ${data.user.username}`);
      console.log(`- Role: ${data.user.role}`);
    } else {
      console.log('Failed to get current user');
      console.log(`- Status: ${status}`);
    }
  } catch (error) {
    console.log('Get current user failed:', error.message);
  }
  console.log();
}

async function testUnauthorizedAccess() {
  console.log('Testing protected endpoint without token...');
  try {
    // temporarily remove token
    const tempToken = authToken;
    authToken = null;

    const { status, data } = await makeRequest('GET', '/order/list');
    
    authToken = tempToken; // restore token

    if (status === 401) {
      console.log('Correctly blocked unauthorized access');
      console.log(`- Message: ${data.message}`);
    } else {
      console.log('Should have returned 401');
      console.log(`- Status: ${status}`);
    }
  } catch (error) {
    console.log('Test failed:', error.message);
  }
  console.log();
}

async function testCreateOrder() {
  console.log('Testing POST /order...');
  try {
    const { status, data } = await makeRequest('POST', '/order', testOrder);
    
    if (status === 201 && data.success) {
      console.log('Order created successfully');
      console.log(`- Order ID: ${data.data.numeroPedido}`);
      console.log(`- Total: ${data.data.valorTotal}`);
      console.log(`- Items: ${data.data.items.length}`);
      createdOrderId = data.data.numeroPedido;
    } else {
      console.log('Failed to create order');
      console.log(`- Status: ${status}`);
      console.log(`- Response:`, data);
    }
  } catch (error) {
    console.log('Create order failed:', error.message);
  }
  console.log();
}

async function testGetOrderById() {
  console.log('Testing GET /order/:orderId...');
  try {
    if (!createdOrderId) {
      console.log('Skipping (no order created)');
      console.log();
      return;
    }

    const { status, data } = await makeRequest('GET', `/order/${createdOrderId}`);
    
    if (status === 200 && data.success) {
      console.log('Order retrieved successfully');
      console.log(`- Order ID: ${data.data.numeroPedido}`);
      console.log(`- Total: ${data.data.valorTotal}`);
      console.log(`- Items: ${data.data.items.length}`);
    } else {
      console.log('Failed to get order');
      console.log(`- Status: ${status}`);
    }
  } catch (error) {
    console.log('Get order failed:', error.message);
  }
  console.log();
}

async function testGetNonExistentOrder() {
  console.log('Testing GET /order/:orderId (non-existent)...');
  try {
    const { status, data } = await makeRequest('GET', '/order/NON-EXISTENT-ID');
    
    if (status === 404 && !data.success) {
      console.log('Correctly returned 404 for non-existent order');
      console.log(`- Message: ${data.message}`);
    } else {
      console.log('Should have returned 404');
      console.log(`- Status: ${status}`);
    }
  } catch (error) {
    console.log('Test failed:', error.message);
  }
  console.log();
}

async function testGetAllOrders() {
  console.log('Testing GET /order/list...');
  try {
    const { status, data } = await makeRequest('GET', '/order/list');
    
    if (status === 200 && data.success) {
      console.log('Orders list retrieved successfully');
      console.log(`- Total orders: ${data.count}`);
      if (data.count > 0) {
        console.log(`- First order: ${data.data[0].numeroPedido}`);
      }
    } else {
      console.log('Failed to get orders list');
      console.log(`- Status: ${status}`);
    }
  } catch (error) {
    console.log('Get orders list failed:', error.message);
  }
  console.log();
}

async function testUpdateOrder() {
  console.log('Testing PUT /order/:orderId...');
  try {
    if (!createdOrderId) {
      console.log('Skipping (no order created)');
      console.log();
      return;
    }

    const updatedData = {
      ...testOrder,
      valorTotal: 500.00,
      items: [
        {
          idItem: "2001",
          quantidadeItem: 5,
          valorItem: 100.00
        }
      ]
    };

    const { status, data } = await makeRequest('PUT', `/order/${createdOrderId}`, updatedData);
    
    if (status === 200 && data.success) {
      console.log('Order updated successfully');
      console.log(`- New total: ${data.data.valorTotal}`);
      console.log(`- New items count: ${data.data.items.length}`);
    } else {
      console.log('Failed to update order');
      console.log(`- Status: ${status}`);
    }
  } catch (error) {
    console.log('Update order failed:', error.message);
  }
  console.log();
}

async function testCreateOrderValidation() {
  console.log('Testing POST /order (validation error)...');
  try {
    const invalidData = {
      numeroPedido: "INVALID-ORDER",
      valorTotal: 100
      // missing dataCriacao and items
    };

    const { status, data } = await makeRequest('POST', '/order', invalidData);
    
    if (status === 400 && !data.success) {
      console.log('Validation error handled correctly');
      console.log(`- Error: ${data.error}`);
    } else {
      console.log('Should have returned 400 validation error');
      console.log(`- Status: ${status}`);
    }
  } catch (error) {
    console.log('Test failed:', error.message);
  }
  console.log();
}

async function testDeleteOrder() {
  console.log('Testing DELETE /order/:orderId...');
  try {
    if (!createdOrderId) {
      console.log('Skipping (no order created)');
      console.log();
      return;
    }

    const { status, data } = await makeRequest('DELETE', `/order/${createdOrderId}`);
    
    if (status === 200 && data.success) {
      console.log('Order deleted successfully');
      console.log(`- Message: ${data.message}`);
    } else {
      console.log('Failed to delete order');
      console.log(`- Status: ${status}`);
    }
  } catch (error) {
    console.log('Delete order failed:', error.message);
  }
  console.log();
}

async function testDeleteNonExistentOrder() {
  console.log('Testing DELETE /order/:orderId (non-existent)...');
  try {
    const { status, data } = await makeRequest('DELETE', '/order/NON-EXISTENT-ID');
    
    if (status === 404 && !data.success) {
      console.log('Correctly returned 404 for non-existent order');
      console.log(`- Message: ${data.message}`);
    } else {
      console.log('Should have returned 404');
      console.log(`- Status: ${status}`);
    }
  } catch (error) {
    console.log('Test failed:', error.message);
  }
  console.log();
}

async function test404Endpoint() {
  console.log('Testing 404 handler...');
  try {
    const { status, data } = await makeRequest('GET', '/non-existent-endpoint');
    
    if (status === 404) {
      console.log('404 handler working correctly');
      console.log(`- Message: ${data.message}`);
    } else {
      console.log('Should have returned 404');
      console.log(`- Status: ${status}`);
    }
  } catch (error) {
    console.log('Test failed:', error.message);
  }
  console.log();
}

// run all tests
async function runAllTests() {
  console.log('========================================');
  console.log('Running API Endpoint Tests');
  console.log('========================================');
  console.log(`Base URL: ${BASE_URL}`);
  console.log('========================================\n');

  try {
    await testHealthCheck();
    await testLogin();
    await testLoginInvalidCredentials();
    await testGetCurrentUser();
    await testUnauthorizedAccess();
    await testCreateOrder();
    await testGetOrderById();
    await testGetNonExistentOrder();
    await testGetAllOrders();
    await testUpdateOrder();
    await testCreateOrderValidation();
    await testDeleteOrder();
    await testDeleteNonExistentOrder();
    await test404Endpoint();

    console.log('========================================');
    console.log('All tests sucessful!');
    console.log('========================================');
  } catch (error) {
    console.error('Test suite failed:', error);
  }
}

// check if server is running before starting tests
async function checkServer() {
  try {
    await fetch(`${BASE_URL}/health`);
    return true;
  } catch (error) {
    return false;
  }
}

// main
(async () => {
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.error('Server is not running, please start the server with: npm start');
    process.exit(1);
  }

  await runAllTests();
})();
