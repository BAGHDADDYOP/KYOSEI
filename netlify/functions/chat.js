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

    console.log("API key present, attempting to initialize Google Generative AI");
    
    try {
      // Initialize Google Generative AI client with updated model name
      const genAI = new GoogleGenerativeAI(apiKey);
      
      // Use the Gemini 2.0 Flash model
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.0-flash',
        // Add safety settings to ensure appropriate responses
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      });

      // Enhanced system prompt to ensure profile collection
      const userProfilePrompt = `
      IMPORTANT ADDITIONAL GUIDANCE:
      
      You're speaking with a user who needs health, fitness, nutrition, or behavioral advice.
      
      Follow this exact sequence in your conversation:
      1. First ask for PHYSIOLOGICAL DETAILS (age, height, weight, relevant health conditions)
      2. Then ask for GOALS (what they want to achieve with fitness, nutrition, health, etc.)
      3. Then ask for OCCUPATIONAL ROUTINE (job type, hours, stress level, activity level)
      4. Only AFTER collecting all this information, provide personalized recommendations
      
      If the user tries to skip steps or ask questions before completing the profile, politely steer them back to providing the missing information.
      
      Your responses should be clear, helpful, and formatted in an easy-to-read manner. When providing plans or routines, use clear headings and bullet points.
      `;

      // Convert history format
      const googleAIHistory = history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.parts[0].text }]
      }));
      
      // Add additional profile collection guidance to system instruction
      if (googleAIHistory.length >= 2 && googleAIHistory[0].role === 'user') {
        googleAIHistory[0].parts[0].text += "\n\n" + userProfilePrompt;
      }

      console.log("History converted, starting chat");
      
      try {
        // Start chat with history - use empty history if there's only one message
        const chat = googleAIHistory.length > 1 ? 
          model.startChat({
            history: googleAIHistory.slice(0, -1), // Exclude last user message
            generationConfig: {
              maxOutputTokens: 1000,
              temperature: 0.7,
            },
          }) : 
          model.startChat({
            generationConfig: {
              maxOutputTokens: 1000,
              temperature: 0.7,
            },
          });

        // Get last user message
        const userMessage = history[history.length - 1].parts[0].text;
        console.log("Sending message to API:", userMessage.substring(0, 50) + "...");
        
        // Generate response
        const result = await chat.sendMessage(userMessage);
        const aiResponse = result.response.text();
        console.log("Response received from API");

        // Return response
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ aiResponse })
        };
      } catch (chatError) {
        console.error("Chat error:", chatError);
        return {
          statusCode: 500,
          body: JSON.stringify({ 
            error: 'Chat processing error', 
            details: chatError.message,
            stack: chatError.stack
          })
        };
      }
    } catch (modelError) {
      console.error("Model initialization error:", modelError);
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: 'Model initialization error', 
          details: modelError.message,
          stack: modelError.stack
        })
      };
    }
  } catch (error) {
    console.error('Error processing chat request:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to process request',
        details: error.message,
        stack: error.stack
      })
    };
  }
};
