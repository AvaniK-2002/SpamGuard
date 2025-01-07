const fs = require('fs');
const csv = require('csv-parser');
const model = require('./model');

const dataset = [];

fs.createReadStream('dataset.csv')
  .pipe(csv())
  .on('data', (data) => dataset.push(data))
  .on('end', () => {
    console.log('Training model with', dataset.length, 'records');
    model.train(dataset);
    console.log('Model training completed');
  });