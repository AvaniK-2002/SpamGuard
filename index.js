const express = require('express');
const cors = require('cors');
const model = require('./src/model');
const path = require('path');

const app = express();

// Middleware setup
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Train the model on startup
require('./src/train');

// Serve the HTML page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API endpoint for spam analysis
app.post('/analyze', async (req, res) => {
    try {
        const { text, phone } = req.body;
        
        // Validate input
        if (!text && !phone) {
            return res.status(400).json({ 
                error: 'Either message text or phone number is required'
            });
        }

        // Ensure text is a string if provided
        const messageText = text ? String(text) : '';
        const phoneNumber = phone ? String(phone) : null;

        const result = model.predict(messageText, phoneNumber);
        
        // Ensure the response is valid JSON
        res.json({
            prediction: result.prediction,
            confidence: result.confidence,
            reason: result.reason
        });
    } catch (error) {
        console.error('Analysis error:', error);
        res.status(500).json({ 
            error: error.message || 'Internal server error'
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});