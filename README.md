
# SpamGuard

This project focuses on detecting spam in SMS and email messages based on the text content and the sender's mobile number. The system is designed to classify incoming messages as either SPAM or HAM (legitimate). In addition to the classification, the system provides a detailed output showing the confidence score and the reason behind the classification.


## Features

-Message Classification: The system analyzes SMS and email text messages to predict whether they are spam or ham.

-Mobile Number Validation: It checks mobile numbers for patterns commonly associated with spam messages.

Detailed Result Output:

-Result: Displays "SPAM" or "HAM" based on the prediction.

-Confidence: The system provides a confidence score indicating the certainty of the prediction.

-Reason: A brief explanation of why the message was classified as spam or ham.

Example Output:

Result: SPAM
Confidence: 92%
Reason: Contains promotional phrases and suspicious phone number pattern.

## How It Works

-Text Analysis: Uses NLP techniques to analyze the content of the message (SMS or email) and identify common spam patterns such as unsolicited offers, urgent calls to action, and suspicious links.

-Phone Number Pattern Matching: Evaluates mobile numbers to detect common patterns of spam (e.g., premium-rate or international numbers).

-Machine Learning Model: A trained classifier (e.g., Random Forest, Naive Bayes) processes both the text and phone number to predict whether the message is spam or ham.

-Confidence Score: The classifier provides a confidence score based on the message features and phone number.

-Reasoning: The system explains the classification decision by citing the presence of specific keywords in the text or a suspicious phone number pattern.

## Screenshots

![Screenshot 2025-01-02 233600](https://github.com/user-attachments/assets/1fdd494f-2f0b-47f0-be85-c294bd80b2b2)

![Screenshot 2025-01-02 233620](https://github.com/user-attachments/assets/00fd459a-b842-4e27-98d1-dceea4ad9ec1)

## Installation

Follow these steps to set up the system:

Clone the repository:

git clone https://github.com/AvaniK-2002/SpamGuard

Install the required dependencies:

npm install

Train the model using your dataset:

npm start
```
    
## Tech Stack

-Backend (Python):
Python: Core programming language.

scikit-learn==1.3.0: Machine learning library used for building and training the spam detection model.

pandas==2.0.3: Used for data handling and manipulation.

fastapi==0.103.1: Framework used for building the web API to interact with the spam detection model.

uvicorn==0.23.2: ASGI server for running the FastAPI application.

python-multipart==0.0.6: Library for handling multipart file uploads (e.g., CSV file uploads for training).

-Model Serialization:

joblib==1.3.2: Used for saving and loading the trained model and phone blacklist.

-Frontend (JavaScript):

JavaScript: Used for frontend functionality, potentially for interacting with the backend API and displaying results.


## Contributing

Feel free to contribute to this project by submitting a pull request or opening an issue. Please ensure any code contributions are well-documented and tested.



## Deployment

To deploy this project run

```bash
  npm run deploy
```
## Demo

https://avanik-2002.github.io/SpamGuard/

