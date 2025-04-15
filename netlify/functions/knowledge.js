// netlify/functions/knowledge.js
const axios = require('axios');

// Function to fetch nutrition information
async function getNutritionInfo(query) {
  try {
    const response = await axios.get(`https://api.edamam.com/api/nutrition-data`, {
      params: {
        app_id: process.env.EDAMAM_APP_ID,
        app_key: process.env.EDAMAM_APP_KEY,
        ingr: query
      }
    });
    return response.data;
  } catch (error) {
    console.error('Nutrition API error:', error);
    return { error: 'Unable to fetch nutrition data' };
  }
}

// Function to fetch exercise information
async function getExerciseInfo(type, difficulty) {
  try {
    const response = await axios.get(`https://exercisedb.p.rapidapi.com/exercises`, {
      params: { type, difficulty },
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Exercise API error:', error);
    return { error: 'Unable to fetch exercise data' };
  }
}

// Function to fetch scientific research
async function getResearch(topic) {
  try {
    const response = await axios.get(`https://api.semanticscholar.org/graph/v1/paper/search`, {
      params: {
        query: `${topic} wellness health`,
        limit: 5,
        fields: 'title,abstract,year,authors,url'
      }
    });
    return response.data.data;
  } catch (error) {
    console.error('Research API error:', error);
    return { error: 'Unable to fetch research data' };
  }
}

module.exports = {
  getNutritionInfo,
  getExerciseInfo,
  getResearch
};
