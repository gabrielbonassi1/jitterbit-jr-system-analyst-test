// dataMapper.test.js

import { mapOrderInputToDatabase, mapOrderDatabaseToOutput } from "./dataMapper.js"

console.log('TEST: Testing dataMapper.js\n');

const inputData = {
  numeroPedido: "v10089015vdb-01",
  valorTotal: 10000,
  dataCriacao: "2023-07-19T12:24:11.5",
  items: [
    {
      idItem: "2434",
      quantidadeItem: 1,
      valorItem: 1000
    }
  ]
};

console.log('TEST: Input Data:');
console.log(JSON.stringify(inputData, null, 2));
console.log('\n---\n');

try {
  const dbFormat = mapOrderInputToDatabase(inputData);
  console.log('TEST: Database Format:');
  console.log(JSON.stringify(dbFormat, null, 2));
  console.log('\n---\n');

  const outputFormat = mapOrderDatabaseToOutput(dbFormat);
  console.log('TEST: Output Format:');
  console.log(JSON.stringify(outputFormat, null, 2));
  console.log('\nTEST: All transformations successful!');
} catch (error) {
  console.error('TEST: Error:', error.message);
}
