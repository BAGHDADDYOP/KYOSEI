// netlify/functions/chat.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

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
      // Initialize Google Generative AI client
      const genAI = new GoogleGenerativeAI(apiKey);
      
      // Use the Gemini 2.0 Flash model with function calling capabilities
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.0-flash',
        // Add function calling capability
        tools: [
          {
            functionDeclarations: [
              {
                name: "getNutritionInfo",
                description: "Get detailed nutrition information about specific foods",
                parameters: {
                  type: "object",
                  properties: {
                    food: {
                      type: "string",
                      description: "The food item to get nutrition information about"
                    }
                  },
                  required: ["food"]
                }
              },
              {
                name: "getExerciseRecommendations",
                description: "Get exercise recommendations based on type and difficulty",
                parameters: {
                  type: "object",
                  properties: {
                    type: {
                      type: "string",
                      description: "Type of exercise (e.g., 'cardio', 'strength', 'flexibility')"
                    },
                    level: {
                      type: "string",
                      description: "Difficulty level (e.g., 'beginner', 'intermediate', 'advanced')"
                    }
                  },
                  required: ["type", "level"]
                }
              },
              {
                name: "getResearchSummary",
                description: "Get evidence-based research summary on wellness topics",
                parameters: {
                  type: "object",
                  properties: {
                    topic: {
                      type: "string",
                      description: "The wellness topic to research"
                    }
                  },
                  required: ["topic"]
                }
              }
            ]
          }
        ],
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

      // Enhanced system prompt with professional tone and evidence-based guidance
      const enhancedPrompt = `
      IMPORTANT GUIDANCE - PROFESSIONAL WELLNESS ADVISOR:
      
      You are a professional wellness advisor providing evidence-based recommendations. Your responses should be:
      
      1. CONCISE: Keep answers brief and to the point
      2. PRACTICAL: Focus on actionable advice
      3. EVIDENCE-BASED: Reference scientific research when relevant
      4. PROFESSIONAL: Use clear, straightforward language without philosophical or spiritual terminology
      
      Follow this exact sequence when first speaking with a user:
      1. First ask for PHYSICAL INFORMATION (age, height, weight, relevant health conditions)
      2. Then ask for GOALS (specific outcomes they want to achieve)
      3. Then ask for DAILY ROUTINE (job type, hours, activity level)
      4. Only AFTER collecting all this information, provide personalized recommendations
      
      When providing recommendations, incorporate these evidence-based protocols:
      
      SLEEP OPTIMIZATION:
      - Morning light exposure to set circadian rhythm
      - Temperature regulation for optimal sleep
      - Consistent sleep-wake cycles
      - Strategic use of relaxation techniques
      
      STRESS MANAGEMENT:
      - Breathwork techniques (physiological sighs, cyclic breathing)
      - Cold/heat exposure benefits for resilience
      - Exercise as a stress regulation tool
      - Mindfulness and attention training
      
      FOCUS & PERFORMANCE:
      - Optimized work/break cycles based on ultradian rhythms
      - Nutritional support for cognitive function
      - Environment design for sustained focus
      - Recovery protocols for mental performance
      
      PHYSICAL TRAINING:
      - Zone 2 cardio for cardiovascular base
      - Resistance training with progressive overload
      - Post-exercise recovery strategies
      - Evidence-based supplement considerations
      
      NUTRITION:
      - Time-restricted eating patterns
      - Protein requirements for different goals
      - Whole food priorities and simple guidelines
      - Hydration strategies
      
      Always provide a scientific rationale in accessible language, and offer modifications when needed. Avoid making claims not supported by evidence, and acknowledge when certain approaches have limited research.
      
      When a user mentions a specific food, exercise, or wellness topic, use your function calling capabilities (getNutritionInfo, getExerciseRecommendations, getResearchSummary) to provide accurate information.
      `;

      // Convert history format
      const googleAIHistory = history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.parts[0].text }]
      }));
      
      // Add the enhanced professional knowledge to system instruction
      if (googleAIHistory.length >= 2 && googleAIHistory[0].role === 'user') {
        googleAIHistory[0].parts[0].text += "\n\n" + enhancedPrompt;
      }

      console.log("History converted, starting chat");
      
      try {
        // Start chat with history - use empty history if there's only one message
        const chat = googleAIHistory.length > 1 ? 
          model.startChat({
            history: googleAIHistory.slice(0, -1), // Exclude last user message
            generationConfig: {
              maxOutputTokens: 1000,
              temperature: 0.5, // Lower temperature for more professional responses
            },
          }) : 
          model.startChat({
            generationConfig: {
              maxOutputTokens: 1000,
              temperature: 0.5,
            },
          });

        // Get last user message
        const userMessage = history[history.length - 1].parts[0].text;
        console.log("Sending message to API:", userMessage.substring(0, 50) + "...");
        
        // Send message and handle function calling
        const result = await chat.sendMessageStream(userMessage);
        let aiResponse = "";
        let functionCalls = [];
        
        for await (const chunk of result.stream) {
          const partContent = chunk.text();
          if (partContent) {
            aiResponse += partContent;
          }
          
          // Check for function calls
          if (chunk.functionCalls && chunk.functionCalls.length > 0) {
            functionCalls = functionCalls.concat(chunk.functionCalls);
          }
        }
        
        // Handle function calls if any
        if (functionCalls.length > 0) {
          for (const functionCall of functionCalls) {
            const { name, args } = functionCall;
            let functionResponse;
            
            // Execute the appropriate function based on name
            switch (name) {
              case "getNutritionInfo":
                functionResponse = await fetchNutritionData(args.food);
                break;
              case "getExerciseRecommendations":
                functionResponse = await fetchExerciseData(args.type, args.level);
                break;
              case "getResearchSummary":
                functionResponse = await fetchResearchData(args.topic);
                break;
            }
            
            // Get response from model with function data
            const functionResponseResult = await chat.sendMessage({
              functionResponse: {
                name: name,
                response: functionResponse
              }
            });
            
            // Add function response data to the AI response
            aiResponse += "\n\n" + functionResponseResult.text();
          }
        }

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

// Helper function to get nutrition data
async function fetchNutritionData(food) {
  try {
    const response = await axios.get(`https://api.edamam.com/api/nutrition-data`, {
      params: {
        app_id: process.env.EDAMAM_APP_ID,
        app_key: process.env.EDAMAM_APP_KEY,
        ingr: food
      }
    });
    
    // Format the response data for clarity
    const nutrientData = response.data;
    const formattedData = {
      food: food,
      calories: nutrientData.calories || 0,
      macronutrients: {
        protein: nutrientData.totalNutrients.PROCNT ? {
          amount: nutrientData.totalNutrients.PROCNT.quantity,
          unit: nutrientData.totalNutrients.PROCNT.unit
        } : null,
        carbs: nutrientData.totalNutrients.CHOCDF ? {
          amount: nutrientData.totalNutrients.CHOCDF.quantity,
          unit: nutrientData.totalNutrients.CHOCDF.unit
        } : null,
        fat: nutrientData.totalNutrients.FAT ? {
          amount: nutrientData.totalNutrients.FAT.quantity,
          unit: nutrientData.totalNutrients.FAT.unit
        } : null,
        fiber: nutrientData.totalNutrients.FIBTG ? {
          amount: nutrientData.totalNutrients.FIBTG.quantity,
          unit: nutrientData.totalNutrients.FIBTG.unit
        } : null
      }
    };
    
    return JSON.stringify(formattedData);
  } catch (error) {
    console.error('Nutrition API error:', error);
    return JSON.stringify({ error: 'Unable to fetch nutrition data for ' + food });
  }
}

// Helper function to get exercise data
async function fetchExerciseData(type, level) {
  try {
    const response = await axios.get(`https://exercisedb.p.rapidapi.com/exercises`, {
      params: { type, difficulty: level },
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
      }
    });
    
    // Select a subset of exercises and format the response
    const exercises = response.data.slice(0, 5);
    const formattedData = {
      exerciseType: type,
      difficultyLevel: level,
      recommendations: exercises.map(ex => ({
        name: ex.name,
        equipment: ex.equipment,
        primaryMuscle: ex.primaryMuscles.join(', '),
        instructions: ex.instructions
      }))
    };
    
    return JSON.stringify(formattedData);
  } catch (error) {
    console.error('Exercise API error:', error);
    return JSON.stringify({ 
      error: 'Unable to fetch exercise data',
      recommendations: [
        {
          exerciseType: type,
          difficultyLevel: level,
          suggestions: "Based on your request, I would typically recommend exercises focusing on proper form, appropriate intensity, and progressive overload principles. Since I couldn't access specific exercise data at this moment, I suggest consulting a qualified fitness professional for personalized recommendations."
        }
      ]
    });
  }
}

// Helper function to get research data
async function fetchResearchData(topic) {
  try {
    const response = await axios.get(`https://api.semanticscholar.org/graph/v1/paper/search`, {
      params: {
        query: `${topic} health evidence-based`,
        limit: 3,
        fields: 'title,abstract,year,authors,url'
      }
    });
    
    // Format research data
    const papers = response.data.data;
    const formattedData = {
      topic: topic,
      researchSummary: "Here's what current research indicates about this topic:",
      papers: papers.map(paper => ({
        title: paper.title,
        year: paper.year,
        authors: paper.authors.map(author => author.name).join(', '),
        summary: paper.abstract ? paper.abstract.substring(0, 200) + '...' : 'No abstract available'
      }))
    };
    
    return JSON.stringify(formattedData);
  } catch (error) {
    console.error('Research API error:', error);
    return JSON.stringify({ 
      topic: topic,
      researchSummary: "While I couldn't access specific research papers at this moment, the general scientific consensus on this topic suggests focusing on evidence-based approaches. For the most current research, I recommend consulting peer-reviewed journals or speaking with qualified healthcare professionals."
    });
  }
}
