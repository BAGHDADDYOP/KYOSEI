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
                description: "Get evidence-based exercise recommendations based on type and difficulty",
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
                description: "Get peer-reviewed research summary on wellness topics",
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
              },
              {
                name: "generatePDF",
                description: "Generate a PDF document with structured wellness content",
                parameters: {
                  type: "object",
                  properties: {
                    title: {
                      type: "string",
                      description: "Title of the PDF document"
                    },
                    contentType: {
                      type: "string",
                      description: "Type of content (e.g., 'meal plan', 'workout plan', 'sleep protocol')"
                    },
                    userData: {
                      type: "object",
                      description: "User profile data"
                    }
                  },
                  required: ["title", "contentType"]
                }
              },
              {
                name: "createInteractiveRoadmap",
                description: "Create an interactive wellness roadmap",
                parameters: {
                  type: "object",
                  properties: {
                    title: {
                      type: "string",
                      description: "Title of the roadmap"
                    },
                    goal: {
                      type: "string",
                      description: "Main goal of the roadmap"
                    },
                    steps: {
                      type: "array",
                      description: "Sequential steps in the roadmap",
                      items: {
                        type: "object",
                        properties: {
                          title: {
                            type: "string",
                            description: "Step title"
                          },
                          description: {
                            type: "string",
                            description: "Detailed step description"
                          },
                          timeframe: {
                            type: "string",
                            description: "Estimated timeframe for this step"
                          }
                        }
                      }
                    }
                  },
                  required: ["title", "steps"]
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
      
      1. PRECISE: Focus on specific, actionable guidance supported by research
      2. PRACTICAL: Offer clear implementation steps with realistic timelines
      3. EVIDENCE-BASED: Reference specific mechanisms and research when relevant
      4. PROFESSIONAL: Use precise scientific terminology while remaining accessible
      
      Follow this exact sequence when first speaking with a user:
      1. First ask for PHYSICAL METRICS (age, height, weight, relevant health conditions, biomarkers if available)
      2. Then ask for OBJECTIVES (specific, measurable goals with defined timelines)
      3. Then ask for CURRENT PATTERNS (job, schedule, current habits, constraints)
      4. Only AFTER collecting all this information, provide personalized recommendations
      
      When providing recommendations, incorporate these evidence-based protocols:
      
      SLEEP OPTIMIZATION:
      - Circadian entrainment through morning light exposure (optimal: 5-10 minutes, 100,000+ lux)
      - Temperature regulation (optimal sleep environment: 65-68°F/18-20°C)
      - Consistent sleep-wake cycles to stabilize circadian rhythm
      - Evening wind-down protocols to facilitate melatonin production
      
      STRESS REGULATION:
      - Physiological sigh breathing (double inhale through nose, extended exhale through mouth)
      - Hormetic stress exposure (cold/heat application) for autonomic adaptation
      - Exercise as a neuroendocrine regulator (frequency, intensity, timing considerations)
      - Attentional control practices with specific neural pathway targets
      
      COGNITIVE OPTIMIZATION:
      - Ultradian rhythm alignment (90min focus blocks with 15-20min recovery)
      - Nutritional support targeting neurotransmitter precursors
      - Environmental optimization for sustained attention
      - Recovery protocols for neural resource replenishment
      
      EXERCISE PROTOCOL DESIGN:
      - Zone 2 cardiovascular training for mitochondrial biogenesis
      - Progressive resistance training with periodization structure
      - Recovery optimization through protein timing and sleep architecture
      - Movement pattern diversification for comprehensive adaptation
      
      NUTRITION STRATEGY:
      - Time-restricted eating windows aligned with circadian rhythm
      - Protein requirements based on lean body mass and activity level
      - Whole food prioritization for micronutrient density and fiber content
      - Hydration strategy with electrolyte considerations
      
      PDF AND ROADMAP FUNCTIONALITY:
      - When a user requests a comprehensive plan or document, offer to generate a PDF or interactive roadmap
      - For PDFs, frame the response with [PDF]{json data}[/PDF] tags
      - For interactive roadmaps, frame the response with [ROADMAP]{json data}[/ROADMAP] tags
      - Structure these responses with clear sections, timelines, and measurable milestones
      
      Always provide specific mechanisms of action alongside recommendations, frame content in terms of adaptation rather than "fixing problems," and acknowledge the limitations of current research when appropriate. Implement evidence-based protocols within the context of individual constraints, preferences, and goals.
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
              case "generatePDF":
                functionResponse = handlePDFGeneration(args.title, args.contentType, args.userData);
                break;
              case "createInteractiveRoadmap":
                functionResponse = handleRoadmapCreation(args.title, args.goal, args.steps);
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
      },
      micronutrients: extractKeyMicronutrients(nutrientData)
    };
    
    return JSON.stringify(formattedData);
  } catch (error) {
    console.error('Nutrition API error:', error);
    return JSON.stringify({ error: 'Unable to fetch nutrition data for ' + food });
  }
}

// Helper function to extract key micronutrients
function extractKeyMicronutrients(nutrientData) {
  const micronutrients = {};
  const keyMicronutrients = ['VITA_RAE', 'VITC', 'VITD', 'VITB12', 'FE', 'CA', 'MG', 'K', 'ZN'];
  
  keyMicronutrients.forEach(nutrient => {
    if (nutrientData.totalNutrients[nutrient]) {
      micronutrients[nutrient] = {
        name: nutrientData.totalNutrients[nutrient].label,
        amount: nutrientData.totalNutrients[nutrient].quantity,
        unit: nutrientData.totalNutrients[nutrient].unit
      };
    }
  });
  
  return micronutrients;
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
        secondaryMuscles: ex.secondaryMuscles.join(', '),
        instructions: ex.instructions,
        mechanicalTension: getMechanicalTensionRating(ex), // Added scientific metrics
        metabolicStress: getMetabolicStressRating(ex)
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
          suggestions: "Based on current exercise science for your requested parameters, I recommend focusing on progressive overload principles, proper biomechanics, and appropriate recovery intervals. For specific exercise selection, consult a qualified exercise professional for personalized recommendations."
        }
      ]
    });
  }
}

// Helper functions for exercise science metrics
function getMechanicalTensionRating(exercise) {
  // Simplified algorithm to estimate mechanical tension based on exercise type
  // In a real implementation, this would use more sophisticated analysis
  const highTensionExercises = ['squat', 'deadlift', 'bench press', 'overhead press', 'row'];
  const exerciseName = exercise.name.toLowerCase();
  
  if (highTensionExercises.some(ex => exerciseName.includes(ex))) {
    return "High";
  } else if (exercise.equipment === "body weight") {
    return "Low to Moderate";
  } else {
    return "Moderate";
  }
}

function getMetabolicStressRating(exercise) {
  // Simplified algorithm to estimate metabolic stress based on exercise characteristics
  const highMetabolicExercises = ['burpee', 'sprint', 'thruster', 'clean', 'snatch', 'jerk'];
  const exerciseName = exercise.name.toLowerCase();
  
  if (highMetabolicExercises.some(ex => exerciseName.includes(ex))) {
    return "High";
  } else if (exercise.secondaryMuscles && exercise.secondaryMuscles.length > 2) {
    return "Moderate to High";
  } else {
    return "Low to Moderate";
  }
}

// Helper function to get research data
async function fetchResearchData(topic) {
  try {
    const response = await axios.get(`https://api.semanticscholar.org/graph/v1/paper/search`, {
      params: {
        query: `${topic} health evidence-based peer-reviewed`,
        limit: 3,
        fields: 'title,abstract,year,authors,url,venue'
      }
    });
    
    // Format research data
    const papers = response.data.data;
    const formattedData = {
      topic: topic,
      researchSummary: "Here's what current peer-reviewed research indicates about this topic:",
      papers: papers.map(paper => ({
        title: paper.title,
        year: paper.year,
        journal: paper.venue,
        authors: paper.authors.map(author => author.name).join(', '),
        summary: paper.abstract ? paper.abstract.substring(0, 300) + '...' : 'No abstract available',
        doi: paper.url
      }))
    };
    
    return JSON.stringify(formattedData);
  } catch (error) {
    console.error('Research API error:', error);
    return JSON.stringify({ 
      topic: topic,
      researchSummary: "While I couldn't access specific research papers at this moment, the general scientific consensus on this topic suggests focusing on evidence-based approaches. For the most current research, I recommend consulting peer-reviewed journals in relevant fields like exercise physiology, nutritional science, or behavioral psychology."
    });
  }
}

// New helper function to handle PDF generation
function handlePDFGeneration(title, contentType, userData) {
  // In a production environment, this would generate an actual PDF
  // Here we're returning data that will be formatted as PDF content
  
  const pdfData = {
    title: title,
    contentType: contentType,
    userData: userData || {},
    generatedDate: new Date().toISOString(),
    contentSections: generateContentSections(contentType)
  };
  
  return JSON.stringify({
    success: true,
    message: "PDF document generated successfully",
    pdfData: pdfData
  });
}

// New helper function to handle roadmap creation
function handleRoadmapCreation(title, goal, steps) {
  // Format roadmap data for the frontend
  const roadmapData = {
    title: title,
    goal: goal,
    steps: steps || [],
    createdDate: new Date().toISOString()
  };
  
  return JSON.stringify({
    success: true,
    message: "Interactive roadmap created successfully",
    roadmapData: roadmapData
  });
}

// Helper function to generate content sections for PDF
function generateContentSections(contentType) {
  // Generate appropriate sections based on content type
  let sections = [];
  
  switch (contentType.toLowerCase()) {
    case 'meal plan':
      sections = [
        { title: "Nutritional Overview", content: "Summary of macronutrient and micronutrient targets" },
        { title: "Weekly Meal Schedule", content: "Day-by-day meal recommendations" },
        { title: "Grocery List", content: "Complete shopping list organized by food category" },
        { title: "Preparation Guidelines", content: "Meal prep instructions and time-saving tips" },
        { title: "Adaptation Protocol", content: "Guidelines for adjusting the plan based on progress" }
      ];
      break;
    case 'workout plan':
      sections = [
        { title: "Training Methodology", content: "Overview of exercise selection and programming principles" },
        { title: "Weekly Schedule", content: "Detailed day-by-day workout structure" },
        { title: "Exercise Library", content: "Technique guidelines for key movements" },
        { title: "Progression Framework", content: "Protocol for advancing difficulty over time" },
        { title: "Recovery Strategy", content: "Guidelines for optimizing adaptation between sessions" }
      ];
      break;
    case 'sleep protocol':
      sections = [
        { title: "Sleep Architecture Overview", content: "Background on sleep cycles and architecture" },
        { title: "Environmental Optimization", content: "Bedroom setup and technology guidelines" },
        { title: "Evening Routine", content: "Step-by-step wind-down protocol" },
        { title: "Morning Routine", content: "Wake-up optimization for circadian entrainment" },
        { title: "Troubleshooting Guide", content: "Solutions for common sleep disruptions" }
      ];
      break;
    default:
      sections = [
        { title: "Overview", content: "Introduction to the personalized protocol" },
        { title: "Implementation Guide", content: "Step-by-step implementation instructions" },
        { title: "Resources", content: "Additional tools and information" },
        { title: "Progress Tracking", content: "Methods to monitor effectiveness" },
        { title: "Adaptation Framework", content: "Guidelines for adjusting based on results" }
      ];
  }
  
  return sections;
}
