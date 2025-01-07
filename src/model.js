const natural = require('natural');
const preprocessor = require('./preprocessor');

class SpamDetectionModel {
  constructor() {
    this.classifier = new natural.BayesClassifier();
    this.phoneBlacklist = new Set();
    this.spamPhoneMetrics = new Map();
    this.trained = false;
    
    this.spamKeywords = new Set([
      'free', 'win', 'winner', 'won', 'prize', 'urgent', 'offer', 
      'guaranteed', 'instant', 'casino', 'bonus', 'lucky', '$', '£',
      'prize', 'winner', 'selected', 'urgent', 'verify', 'account',
      'suspended', 'inheritance', 'offer', 'limited', 'click',
      'opportunity', 'investment', 'discount', 'guaranteed', 'claim',
      'exclusive', 'expires', 'password', 'verify', 'action', 'required'
    ]);

    this.spamAreaCodes = new Set([
      '419', '709', '900', '876', '284', '473', '268', '809'
    ]);

    this.phonePatternScores = {
      sequential: 0.7,
      repeated: 0.7,
      premium: 0.9,
      blacklisted: 1.0,
      spamArea: 0.9,
      shortCode: 0.8
    };
  }

  normalizePhone(phone) {
    if (!phone) return null;
    return phone.replace(/[^0-9+]/g, '');
  }

  analyzePhoneNumber(phone) {
    if (!phone) return { score: 0, reasons: [] };
    
    const normalizedPhone = this.normalizePhone(phone);
    let score = 0;
    const reasons = [];

    if (this.phoneBlacklist.has(normalizedPhone)) {
      return {
        score: 1,
        reasons: ['[PHONE] Blacklisted spam number']
      };
    }

    const metrics = this.spamPhoneMetrics.get(normalizedPhone);
    if (metrics) {
      const spamRatio = metrics.spamCount / metrics.total;
      if (spamRatio > 0.2) {
        score += spamRatio * 1.5;
        reasons.push(`[PHONE] High spam history (${(spamRatio * 100).toFixed(1)}% spam rate)`);
      }
    }

    const areaCode = this.extractAreaCode(normalizedPhone);
    if (this.spamAreaCodes.has(areaCode)) {
      score += this.phonePatternScores.spamArea;
      reasons.push('[PHONE] Known spam area code');
    }

    if (/(.)\1{2,}/.test(normalizedPhone)) {
      score += this.phonePatternScores.repeated;
      reasons.push('[PHONE] Suspicious repeated digits');
    }

    if (/(?:0123|1234|2345|3456|4567|5678|6789|7890|9876|8765|7654|6543|5432|4321|3210)/.test(normalizedPhone)) {
      score += this.phonePatternScores.sequential;
      reasons.push('[PHONE] Sequential number pattern');
    }

    if (/^\d{4,6}$/.test(normalizedPhone)) {
      score += this.phonePatternScores.shortCode;
      reasons.push('[PHONE] Short code format');
    }

    if (/^(\+|00)?(900|976|809|284|473|268|876|649)/.test(normalizedPhone)) {
      score += this.phonePatternScores.premium;
      reasons.push('[PHONE] Premium or scam prefix');
    }

    return {
      score: Math.min(score, 1),
      reasons
    };
  }

  extractAreaCode(phone) {
    if (!phone) return '';
    const cleaned = phone.replace(/^\+|^00/, '');
    return cleaned.slice(0, 3);
  }

  calculateTextSpamScore(text) {
    if (!text) return { score: 0, reasons: [] };

    const tokens = preprocessor.preprocess(text);
    const reasons = [];
    let score = 0;

    const spamWords = tokens.filter(token => this.spamKeywords.has(token));
    if (spamWords.length > 0) {
      const keywordRatio = spamWords.length / tokens.length;
      score += keywordRatio * 1.0;
      reasons.push(`[TEXT] Spam keywords detected: ${spamWords.join(', ')}`);
    }

    if ((text.match(/!/g) || []).length > 0) {
      score += 0.4;
      reasons.push('[STYLE] Multiple exclamation marks');
    }

    const upperCaseRatio = text.replace(/[^A-Z]/g, '').length / text.replace(/[^A-Za-z]/g, '').length;
    if (upperCaseRatio > 0.2) {
      score += 0.5;
      reasons.push('[STYLE] Excessive capitalization');
    }

    if (/[$£€]\d+/.test(text)) {
      score += 0.6;
      reasons.push('[TEXT] Contains monetary amounts');
    }

    if (/urgent|immediate|now|hurry|limited|act fast/i.test(text)) {
      score += 0.7;
      reasons.push('[TEXT] Urgency indicators');
    }

    if (/http|www|\.com|\.net|\.org|click|link/i.test(text)) {
      score += 0.6;
      reasons.push('[TEXT] Contains URLs or link references');
    }

    return {
      score: Math.min(score, 1),
      reasons
    };
  }

  train(dataset) {
    if (!Array.isArray(dataset)) {
      throw new Error('Dataset must be an array');
    }

    dataset.forEach(item => {
      if (!item.phone) return;
      
      const normalizedPhone = this.normalizePhone(item.phone);
      if (!normalizedPhone) return;

      const metrics = this.spamPhoneMetrics.get(normalizedPhone) || {
        spamCount: 0,
        hamCount: 0,
        total: 0
      };

      if (item.label === 'spam') {
        metrics.spamCount++;
        this.phoneBlacklist.add(normalizedPhone);
      } else {
        metrics.hamCount++;
      }
      
      metrics.total = metrics.spamCount + metrics.hamCount;
      this.spamPhoneMetrics.set(normalizedPhone, metrics);
    });

    dataset.forEach(item => {
      if (item.text) {
        const tokens = preprocessor.preprocess(item.text);
        this.classifier.addDocument(tokens, item.label);
      }
    });
    
    this.classifier.train();
    this.trained = true;
  }

  predict(text, phone = null) {
    if (!this.trained) {
      throw new Error('Model not trained');
    }

    if (!text && !phone) {
      throw new Error('Either text or phone number is required');
    }

    const phoneAnalysis = this.analyzePhoneNumber(phone);
    const textAnalysis = this.calculateTextSpamScore(text);
    
    let classifierScore = 0;
    if (text) {
      const tokens = preprocessor.preprocess(text);
      const classifications = this.classifier.getClassifications(tokens);
      classifierScore = classifications.find(c => c.label === 'spam')?.value || 0;
    }

    const weights = {
      phone: 0.5,
      text: 0.4,
      classifier: 0.1
    };

    const combinedScore = (
      (phoneAnalysis.score * weights.phone) +
      (textAnalysis.score * weights.text) +
      (classifierScore * weights.classifier)
    );

    const allReasons = [
      ...phoneAnalysis.reasons,
      ...textAnalysis.reasons
    ];

    const prediction = combinedScore > 0.3 ? 'spam' : 'ham';

    return {
      prediction,
      confidence: Number(combinedScore.toFixed(3)),
      reason: allReasons.length > 0 
        ? allReasons.join(' | ')
        : prediction === 'spam' 
          ? '[ANALYSIS] Multiple spam indicators detected'
          : '[ANALYSIS] No spam indicators found'
    };
  }
}

module.exports = new SpamDetectionModel();