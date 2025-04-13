// netlify/functions/chat.js
const { GoogleGenerativeAI } = require('@google/generative-ai');

exports.handler = async function(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse the request body
    const requestBody = JSON.parse(event.body);
    const { history } = requestBody;

    // Validate history
    if (!history || !Array.isArray(history)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid conversation history format' })
      };
    }

    // Get API key from environment variables
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'API key not configured' })
      };
    }

    // Initialize Google Generative AI client
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Convert history format
    const googleAIHistory = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: msg.parts
    }));

    // Start chat with history
    const chat = model.startChat({
      history: googleAIHistory.slice(0, -1), // Exclude last user message
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });

    // Get last user message
    const userMessage = history[history.length - 1].parts[0].text;

    // Generate response
    const result = await chat.sendMessage(userMessage);
    const aiResponse = result.response.text();

    // Return response
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ aiResponse })
    };

  } catch (error) {
    console.error('Error processing chat request:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to process request',
        details: error.message 
      })
    };
  }
};
