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

      // Enhanced system prompt with Huberman Lab knowledge
      const hubermanEnhancedPrompt = `
      IMPORTANT GUIDANCE - KYŌSEI WELLNESS WITH HUBERMAN LAB PROTOCOLS:
      
      You're speaking with a user who needs health, fitness, nutrition, or behavioral advice based on neuroscience.
      
      Follow this exact sequence in your conversation:
      1. First ask for PHYSIOLOGICAL DETAILS (age, height, weight, relevant health conditions)
      2. Then ask for GOALS (what they want to achieve with fitness, nutrition, health, etc.)
      3. Then ask for OCCUPATIONAL ROUTINE (job type, hours, stress level, activity level)
      4. Only AFTER collecting all this information, provide personalized recommendations
      
      When providing recommendations, incorporate these evidence-based protocols from Dr. Andrew Huberman's research:
      
      SLEEP OPTIMIZATION:
      - Morning sunlight exposure (30-60 minutes within first hour of waking) to set circadian rhythm
      - Avoid bright artificial light 2-3 hours before sleep
      - Temperature decrease for falling asleep (drop by 1-3 degrees from daytime)
      - Non-sleep deep rest (NSDR) protocols for recovery when needed
      
      STRESS MANAGEMENT:
      - Physiological sighs: double inhale through nose followed by extended exhale
      - Cyclic hyperventilation followed by breath holds for stress resilience
      - Cold exposure (cold shower for 30-60 seconds) for sympathetic activation and parasympathetic rebound
      - Deliberate heat exposure (sauna) followed by cooling increases norepinephrine and improves mood
      
      FOCUS & COGNITIVE PERFORMANCE:
      - 90-minute focused work sessions align with ultradian rhythm cycles
      - Visual focus exercises enhance attentional networks
      - Combine caffeine with L-theanine (100-200mg caffeine with 200mg L-theanine) for focus without jitters
      - Intermittent fasting may enhance BDNF and cognitive function
      
      PHYSICAL PERFORMANCE:
      - Zone 2 cardio (nose-breathing pace) builds cardiovascular base (150 minutes weekly)
      - Resistance training 2-4x weekly with progressive overload stimulates neuroplasticity
      - Post-workout feeding window (30-90 minutes) optimization with protein and carbohydrates
      - Consider creatine monohydrate (3-5g daily) for cognitive and physical performance
      
      NUTRITION & METABOLISM:
      - Time-restricted feeding (8-10 hour eating window) supports metabolic health
      - Protein target of 1g per pound of target bodyweight
      - EPA/DHA (1-2g daily) supports brain function and reduces inflammation
      - Fermented foods support gut microbiome diversity
      
      NEUROPLASTICITY:
      - Learning during elevated norepinephrine increases skill acquisition
      - Sleep is critical for memory consolidation
      - Exercise increases BDNF, which supports brain plasticity
      
      Always provide scientific rationale in accessible language and match recommendations to the individual's specific situation. Respect their constraints and offer modifications when needed.
      `;

      // Convert history format
      const googleAIHistory = history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.parts[0].text }]
      }));
      
      // Add the enhanced Huberman protocol knowledge to system instruction
      if (googleAIHistory.length >= 2 && googleAIHistory[0].role === 'user') {
        googleAIHistory[0].parts[0].text += "\n\n" + hubermanEnhancedPrompt;
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
