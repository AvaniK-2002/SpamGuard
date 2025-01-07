const natural = require('natural');
const stopword = require('stopword');

class TextPreprocessor {
  constructor() {
    this.tokenizer = new natural.WordTokenizer();
    this.stemmer = natural.PorterStemmer;
  }

  preprocess(text) {
    // Convert to lowercase
    let processed = text.toLowerCase();
    
    // Remove special characters and numbers
    processed = processed.replace(/[^a-zA-Z\s]/g, ' ');
    
    // Tokenize
    let tokens = this.tokenizer.tokenize(processed);
    
    // Remove stopwords
    tokens = stopword.removeStopwords(tokens);
    
    // Stem words
    tokens = tokens.map(token => this.stemmer.stem(token));
    
    return tokens;
  }
}

module.exports = new TextPreprocessor();