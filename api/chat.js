// api/chat.js - Vercel Serverless Function (Node.js runtime)

// Use Node's built-in fetch (available in recent Node versions Vercel uses)
// If deployment fails, you might need to install 'node-fetch': npm install node-fetch
// and then use: const fetch = require('node-fetch');

export default async function handler(request, response) {
    // Allow requests only from your deployed site (or '*' for testing, less secure)
    // Vercel automatically sets VERCEL_URL
    const allowedOrigin = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'; // Adjust localhost port if needed for local dev
    response.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle OPTIONS request for CORS preflight
    if (request.method === 'OPTIONS') {
        return response.status(200).end();
    }

    // Only allow POST requests
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    // --- Securely get API Key from Environment Variables ---
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
         console.error("API Key not found in environment variables.");
         return response.status(500).json({ error: 'Server configuration error: API Key missing.' });
    }

    // Construct the API URL
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

    try {
        // Get the conversation history from the request body sent by the frontend
        const { history } = request.body;

        if (!history || !Array.isArray(history)) {
            return response.status(400).json({ error: 'Bad Request: Missing or invalid conversation history.' });
        }

        // Make the API call to Google Gemini
        const apiResponse = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "contents": history, // Send the history received from frontend
                 "generationConfig": {
                    "temperature": 0.7,
                    "topK": 1,
                    "topP": 1,
                    "maxOutputTokens": 512,
                },
                 "safetySettings": [
                    {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
                    {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
                    {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
                    {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"}
                ]
            }),
        });

        const responseData = await apiResponse.json();

        if (!apiResponse.ok) {
            console.error("Google API Error:", responseData);
            // Forward a generic error or specific details if safe
            const errorMessage = responseData?.error?.message || `Google API Error: ${apiResponse.statusText}`;
            return response.status(apiResponse.status).json({ error: errorMessage });
        }

         // Extract the AI's response text - Same logic as frontend
        let aiText = "Sorry, I couldn't get a response."; // Default error text
        if (responseData.candidates && responseData.candidates.length > 0 && responseData.candidates[0].content && responseData.candidates[0].content.parts && responseData.candidates[0].content.parts.length > 0) {
           aiText = responseData.candidates[0].content.parts[0].text;
        } else if (responseData.promptFeedback) {
             aiText = `Request blocked due to safety settings: ${responseData.promptFeedback.blockReason}`;
        } else {
             console.warn("Unexpected Google API response structure:", responseData);
             aiText = "Sorry, the response format was unexpected.";
        }

        // Send the AI's text back to the frontend
        response.status(200).json({ aiResponse: aiText });

    } catch (error) {
        console.error('Serverless function error:', error);
        response.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}