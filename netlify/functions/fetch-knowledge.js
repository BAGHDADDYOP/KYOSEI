// netlify/functions/fetch-knowledge.js
const { getNutritionInfo, getExerciseInfo, getResearch } = require('./knowledge');

exports.handler = async function(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const requestBody = JSON.parse(event.body);
    const { type, query } = requestBody;
    
    let result;
    
    switch (type) {
      case 'nutrition':
        result = await getNutritionInfo(query);
        break;
      case 'exercise':
        const { exerciseType, difficulty } = query;
        result = await getExerciseInfo(exerciseType, difficulty);
        break;
      case 'research':
        result = await getResearch(query);
        break;
      default:
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Invalid knowledge type' })
        };
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify(result)
    };
  } catch (error) {
    console.error('Error processing knowledge request:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to process request' })
    };
  }
};
