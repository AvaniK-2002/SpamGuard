const natural = require('natural');
const tokenizer = new natural.WordTokenizer();
const classifier = new natural.BayesClassifier();

class SpamDetectionModel {
  constructor() {
    this.phoneBlacklist = new Set();
    this.trained = false;
  }

  preprocessText(text) {
    return tokenizer.tokenize(text.toLowerCase());
  }

  train(dataset) {
    dataset.forEach(item => {
      if (item.label === 'spam' && item.phone) {
        this.phoneBlacklist.add(item.phone);
      }
      if (item.text) {
        classifier.addDocument(this.preprocessText(item.text), item.label);
      }
    });
    
    classifier.train();
    this.trained = true;
  }

  predict(text, phone = null) {
    if (!this.trained) {
      throw new Error('Model not trained');
    }

    if (phone && this.phoneBlacklist.has(phone)) {
      return { 
        prediction: 'spam',
        confidence: 1,
        reason: 'Phone number in blacklist'
      };
    }

    const classification = classifier.getClassifications(this.preprocessText(text));
    const prediction = classifier.classify(this.preprocessText(text));
    const confidence = classification.find(c => c.label === prediction).value;

    return {
      prediction,
      confidence,
      reason: 'Text content analysis'
    };
  }
}

module.exports = new SpamDetectionModel();