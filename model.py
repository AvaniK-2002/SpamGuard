import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
import joblib

class SpamDetector:
    def __init__(self):
        self.pipeline = Pipeline([
            ('tfidf', TfidfVectorizer(max_features=5000)),
            ('classifier', RandomForestClassifier(n_estimators=100, random_state=42))
        ])
        self.phone_blacklist = set()
        self.is_trained = False

    def train(self, dataset_path):
        # Read dataset
        df = pd.read_csv(dataset_path)
        
        # Update phone blacklist
        spam_phones = df[df['label'] == 'spam']['phone'].dropna()
        self.phone_blacklist.update(spam_phones)

        # Train the model
        X = df['text'].fillna('')
        y = df['label']
        
        self.pipeline.fit(X, y)
        self.is_trained = True
        
        # Save the model
        self.save_model()
        
        return {
            'status': 'success',
            'message': f'Model trained on {len(df)} samples'
        }

    def predict(self, text, phone=None):
        if not self.is_trained:
            raise ValueError("Model not trained yet")

        # Check phone blacklist first
        if phone and phone in self.phone_blacklist:
            return {
                'prediction': 'spam',
                'confidence': 1.0,
                'reason': 'Phone number in blacklist'
            }

        # Predict using the ML model
        proba = self.pipeline.predict_proba([text])[0]
        prediction = 'spam' if proba[1] > 0.5 else 'ham'
        confidence = float(max(proba))

        return {
            'prediction': prediction,
            'confidence': confidence,
            'reason': 'Text content analysis'
        }

    def save_model(self, path='spam_detector.joblib'):
        if self.is_trained:
            model_data = {
                'pipeline': self.pipeline,
                'phone_blacklist': self.phone_blacklist
            }
            joblib.dump(model_data, path)

    def load_model(self, path='spam_detector.joblib'):
        try:
            model_data = joblib.load(path)
            self.pipeline = model_data['pipeline']
            self.phone_blacklist = model_data['phone_blacklist']
            self.is_trained = True
            return True
        except:
            return False