const fs = require('fs');
const csv = require('csv-parser');
const model = require('./model');

console.log('Starting model training...');

const dataset = [];

fs.createReadStream('dataset.csv')
  .pipe(csv())
  .on('data', (data) => {
    // Validate data
    if (data.text && data.label) {
      dataset.push({
        text: data.text.trim(),
        label: data.label.trim().toLowerCase(),
        phone: data.phone ? data.phone.trim() : null
      });
    }
  })
  .on('end', () => {
    try {
      console.log(`Training model with ${dataset.length} records`);
      model.train(dataset);
      console.log('Model training completed successfully');
    } catch (error) {
      console.error('Error during training:', error.message);
      process.exit(1);
    }
  })
  .on('error', (error) => {
    console.error('Error reading dataset:', error.message);
    process.exit(1);
  });