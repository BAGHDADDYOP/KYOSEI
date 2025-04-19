// Roadmap and PDF generation functionality

/**
 * Creates an interactive roadmap visualization for a wellness plan
 * @param {string} title - The title of the roadmap
 * @param {Array} steps - Array of step objects with title, description, and timeframe
 * @return {HTMLElement} - The created roadmap container element
 */
function createInteractiveRoadmap(title, steps) {
    // Create roadmap container
    const roadmapContainer = document.createElement('div');
    roadmapContainer.className = 'roadmap-container';
    
    // Create roadmap header
    const roadmapHeader = document.createElement('div');
    roadmapHeader.className = 'roadmap-header';
    roadmapHeader.innerHTML = `
        <h3>${title}</h3>
        <div class="roadmap-controls">
            <button class="roadmap-fullscreen-btn">Expand</button>
            <button class="roadmap-pdf-btn">Save as PDF</button>
        </div>
    `;
    
    // Create roadmap content and timeline
    const roadmapContent = document.createElement('div');
    roadmapContent.className = 'roadmap-content';
    
    const timeline = document.createElement('div');
    timeline.className = 'roadmap-timeline';
    
    // Add each step to the timeline
    steps.forEach((step, index) => {
        const stepElement = document.createElement('div');
        stepElement.className = 'roadmap-step';
        stepElement.innerHTML = `
            <div class="roadmap-step-number">${index + 1}</div>
            <div class="roadmap-step-content">
                <h4>${step.title}</h4>
                <p>${step.description}</p>
                <div class="roadmap-step-timeframe">${step.timeframe}</div>
            </div>
        `;
        
        timeline.appendChild(stepElement);
    });
    
    // Assemble the roadmap components
    roadmapContent.appendChild(timeline);
    roadmapContainer.appendChild(roadmapHeader);
    roadmapContainer.appendChild(roadmapContent);
    
    // Add event listeners for controls
    roadmapContainer.querySelector('.roadmap-fullscreen-btn').addEventListener('click', function() {
        toggleRoadmapFullscreen(roadmapContainer);
    });
    
    roadmapContainer.querySelector('.roadmap-pdf-btn').addEventListener('click', function() {
        generatePDFFromRoadmap(title, steps);
    });
    
    return roadmapContainer;
}

/**
 * Toggles fullscreen mode for a roadmap
 * @param {HTMLElement} roadmapContainer - The roadmap container element
 */
function toggleRoadmapFullscreen(roadmapContainer) {
    const isFullscreen = roadmapContainer.closest('.roadmap-fullscreen');
    const fullscreenBtn = roadmapContainer.querySelector('.roadmap-fullscreen-btn');
    
    if (isFullscreen) {
        // Exit fullscreen
        const parent = isFullscreen.parentNode;
        parent.appendChild(roadmapContainer);
        isFullscreen.remove();
        fullscreenBtn.textContent = 'Expand';
    } else {
        // Enter fullscreen
        const fullscreenContainer = document.createElement('div');
        fullscreenContainer.className = 'roadmap-fullscreen';
        document.body.appendChild(fullscreenContainer);
        fullscreenContainer.appendChild(roadmapContainer);
        fullscreenBtn.textContent = 'Minimize';
        
        // Add close button to fullscreen view
        const closeBtn = document.createElement('button');
        closeBtn.className = 'roadmap-close-fullscreen-btn';
        closeBtn.textContent = '×';
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = '20px';
        closeBtn.style.right = '20px';
        closeBtn.style.background = 'none';
        closeBtn.style.border = 'none';
        closeBtn.style.color = 'white';
        closeBtn.style.fontSize = '2rem';
        closeBtn.style.cursor = 'pointer';
        
        closeBtn.addEventListener('click', function() {
            toggleRoadmapFullscreen(roadmapContainer);
        });
        
        fullscreenContainer.appendChild(closeBtn);
    }
}

/**
 * Generates a PDF from roadmap data
 * @param {string} title - The title of the roadmap
 * @param {Array} steps - Array of step objects with title, description, and timeframe
 */
function generatePDFFromRoadmap(title, steps) {
    // In a full implementation, this would use a PDF library
    // For now, we'll simulate PDF generation with a modal
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'pdf-modal';
    modal.innerHTML = `
        <div class="pdf-modal-content">
            <h3>PDF Generated</h3>
            <p>Your "${title}" roadmap has been converted to a PDF document.</p>
            <div class="pdf-thumbnail">
                <div class="pdf-icon">PDF</div>
            </div>
            <button class="pdf-download-btn">Download PDF</button>
            <button class="pdf-close-btn">Close</button>
        </div>
    `;
    
    // Add to document
    document.body.appendChild(modal);
    
    // Add event listeners
    modal.querySelector('.pdf-download-btn').addEventListener('click', function() {
        this.textContent = 'Downloaded!';
        setTimeout(() => {
            document.body.removeChild(modal);
        }, 1500);
    });
    
    modal.querySelector('.pdf-close-btn').addEventListener('click', function() {
        document.body.removeChild(modal);
    });
}

/**
 * Generates a PDF from data
 * @param {string} contentType - The type of content being generated
 * @param {Object} data - The data to include in the PDF
 */
function generatePDF(contentType, data) {
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'pdf-modal';
    modal.innerHTML = `
        <div class="pdf-modal-content">
            <h3>PDF Generated</h3>
            <p>Your personalized ${contentType} document has been created.</p>
            <div class="pdf-thumbnail">
                <div class="pdf-icon">PDF</div>
            </div>
            <button class="pdf-download-btn">Download PDF</button>
            <button class="pdf-close-btn">Close</button>
        </div>
    `;
    
    // Add to document
    document.body.appendChild(modal);
    
    // Add event listeners
    modal.querySelector('.pdf-download-btn').addEventListener('click', function() {
        this.textContent = 'Downloaded!';
        setTimeout(() => {
            document.body.removeChild(modal);
        }, 1500);
    });
    
    modal.querySelector('.pdf-close-btn').addEventListener('click', function() {
        document.body.removeChild(modal);
    });
}

/**
 * Creates a React component for displaying charts in artifacts
 * This is the corrected function with proper syntax
 */
function createChartComponent() {
    return `
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const MonthlyProfitChart = () => {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await window.fs.readFile('monthly-profits.csv');
        const text = new TextDecoder().decode(response);
        const parsedData = parseCSV(text);
        setData(parsedData);
      } catch (error) {
        console.error('Error reading file:', error);
      }
    };
    
    fetchData();
  }, []); // This closing bracket was missing

  const parseCSV = (csvText) => {
    const lines = csvText.split('\\n');
    const headers = lines[0].split(',');
    
    return lines.slice(1).filter(line => line.trim()).map(line => {
      const values = line.split(',');
      const entry = {};
      
      headers.forEach((header, index) => {
        entry[header.trim()] = isNaN(values[index]) ? 
          values[index] : parseFloat(values[index]);
      });
      
      return entry;
    });
  };
  
  return (
    <div className="chart-container">
      <h3>Monthly Profits</h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="profit" stroke="#8884d8" activeDot={{ r: 8 }} />
          <Line type="monotone" dataKey="revenue" stroke="#82ca9d" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyProfitChart;
    `;
}

/**
 * Handles roadmap data from AI response
 * @param {string} aiResponse - The AI response text
 */
function handleRoadmapRequest(aiResponse) {
    // Extract roadmap data from AI response
    const roadmapMatch = aiResponse.match(/\[ROADMAP\]([\s\S]*?)\[\/ROADMAP\]/);
    
    if (roadmapMatch && roadmapMatch[1]) {
        try {
            // Remove the roadmap tags from the response
            const cleanResponse = aiResponse.replace(/\[ROADMAP\]([\s\S]*?)\[\/ROADMAP\]/, '');
            
            // Parse the roadmap data
            const roadmapData = JSON.parse(roadmapMatch[1]);
            
            // Display the clean response
            return {
                cleanResponse: cleanResponse,
                roadmapData: roadmapData
            };
        } catch (error) {
            console.error('Roadmap parsing error:', error);
            return {
                cleanResponse: aiResponse,
                error: 'Failed to parse roadmap data'
            };
        }
    } else {
        // If no valid roadmap data found, just return the original response
        return {
            cleanResponse: aiResponse
        };
    }
}

/**
 * Handles PDF request from AI response
 * @param {string} aiResponse - The AI response text
 */
function handlePDFRequest(aiResponse) {
    // Extract PDF data from AI response
    const pdfMatch = aiResponse.match(/\[PDF\]([\s\S]*?)\[\/PDF\]/);
    
    if (pdfMatch && pdfMatch[1]) {
        try {
            // Remove the PDF tags from the response
            const cleanResponse = aiResponse.replace(/\[PDF\]([\s\S]*?)\[\/PDF\]/, '');
            
            // Parse the PDF data
            const pdfData = JSON.parse(pdfMatch[1]);
            
            // Return clean response and PDF data
            return {
                cleanResponse: cleanResponse,
                pdfData: pdfData
            };
        } catch (error) {
            console.error('PDF parsing error:', error);
            return {
                cleanResponse: aiResponse,
                error: 'Failed to parse PDF data'
            };
        }
    } else {
        // If no valid PDF data found, just return the original response
        return {
            cleanResponse: aiResponse
        };
    }
}
