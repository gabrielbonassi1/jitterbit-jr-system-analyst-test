// dataMapper.js

/**
 * Transforms the incoming order data to database format
 * @param {Object} inputData - Data received from /order endpoint
 * @returns {Object} - Data with field names ready for database
 */
function mapOrderInputToDatabase(inputData) {
  if (!inputData) {
    throw new Error('Input data is required');
  }

  // validate required fields
  if (!inputData.numeroPedido) {
    throw new Error('numeroPedido is required');
  }
  if (inputData.valorTotal === undefined || inputData.valorTotal === null) {
    throw new Error('valorTotal is required');
  }
  if (!inputData.dataCriacao) {
    throw new Error('dataCriacao is required');
  }
  if (!Array.isArray(inputData.items) || inputData.items.length === 0) {
    throw new Error('items array is required and must not be empty');
  }

  // map order fields
  const mappedOrder = {
    orderId: inputData.numeroPedido,
    value: parseFloat(inputData.valorTotal),
    creationDate: new Date(inputData.dataCriacao).toISOString(),
    items: inputData.items.map((item, index) => {
      if (!item.idItem) {
        throw new Error(`Item at index ${index}: idItem is required`);
      }
      if (item.quantidadeItem === undefined || item.quantidadeItem === null) {
        throw new Error(`Item at index ${index}: quantidadeItem is required`);
      }
      if (item.valorItem === undefined || item.valorItem === null) {
        throw new Error(`Item at index ${index}: valorItem is required`);
      }

      return {
        productId: parseInt(item.idItem, 10),
        quantity: parseInt(item.quantidadeItem, 10),
        price: parseFloat(item.valorItem)
      };
    })
  };

  return mappedOrder;
}

/**
 * Transforms database order data back to output format
 * @param {Object} dbData - Data from database
 * @returns {Object} - Data ready to be returned in /order/{orderId}
 */
function mapOrderDatabaseToOutput(dbData) {
  if (!dbData) {
    return null;
  }

  return {
    numeroPedido: dbData.orderId,
    valorTotal: parseFloat(dbData.value),
    dataCriacao: dbData.creationDate,
    items: dbData.items ? dbData.items.map(item => ({
      idItem: String(item.productId),
      quantidadeItem: item.quantity,
      valorItem: parseFloat(item.price)
    })) : []
  };
}

export {
  mapOrderInputToDatabase,
  mapOrderDatabaseToOutput
};