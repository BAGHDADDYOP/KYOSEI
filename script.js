// script.js (Enhanced with user profile collection)

const form = document.getElementById('input-form');
const input = document.getElementById('user-input');
const chatContainer = document.getElementById('chat-container');
const mainElement = document.querySelector('main');

// Track user profile data
let userProfile = {
    physiologicalDetails: null,
    goals: null,
    occupation: null,
    profileComplete: false
};

// Profile collection stage
let profileCollectionStage = 0;

// System Instruction with updated guidance
const SYSTEM_INSTRUCTION = `You are a helpful AI assistant focused **exclusively** on providing information about:
1. Healthcare (general information, disease explanations)
2. Nutrition (healthy eating, macronutrients, micronutrients, diet types)
3. Physical Training (exercise types, workout routines, fitness principles)
4. Behavioral Tools (mindfulness, stress management techniques, habit formation)

IMPORTANT: When a user first engages with you, ALWAYS follow this flow:
1. First, ask about their physiological details (age, height, weight, any health conditions or limitations).
2. Second, ask about their specific health and fitness goals.
3. Third, ask about their occupational routine (job type, activity level, work hours, stress factors).
4. Only AFTER collecting this information should you provide personalized advice and plans.

If a user asks a question before completing this profile, politely explain that you need this information to provide personalized advice.

Keep your answers concise, informative, and easy to understand.
Structure information clearly, using bullet points or numbered lists where appropriate.
**Strictly refuse** to answer questions outside these topics. If asked about something unrelated, politely state that you can only discuss healthcare, nutrition, fitness, and behavioral tools.`;

// Store conversation history
let conversationHistory = [
    { role: "user", parts: [{ text: SYSTEM_INSTRUCTION }] },
    { role: "model", parts: [{ text: "Welcome! To provide you with personalized health and fitness guidance, I'd like to learn a bit about you first.\n\nCould you please share some physiological details such as your age, height, weight, and any health conditions or limitations you may have?" }] },
];

// Improved content formatting for AI responses
function formatAIContent(text) {
    // Format section titles (e.g., **I. Nutrition**)
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Format subsection titles with proper spacing
    formatted = formatted.replace(/\*\s(.*?)\*/g, '<div class="section-title">$1</div>');
    
    // Handle bullet points with proper spacing and structure
    formatted = formatted.replace(/^\s*[\*\-]\s(.*)$/gm, '<div class="bullet-point">$1</div>');
    
    // Handle numbered lists with proper spacing
    formatted = formatted.replace(/^\s*(\d+)\.\s(.*)$/gm, '<div class="bullet-point"><strong>$1.</strong> $2</div>');
    
    // Handle paragraphs
    formatted = formatted.replace(/\n\n/g, '</p><p>');
    
    // Handle line breaks
    formatted = formatted.replace(/\n/g, '<br>');
    
    // Wrap in paragraph if not already
    if (!formatted.startsWith('<p>')) {
        formatted = '<p>' + formatted + '</p>';
    }
    
    return formatted;
}

// Enhanced addMessage function
function addMessage(sender, text) {
    // Make chat container visible when conversation starts
    if (chatContainer.style.display !== 'block') {
        chatContainer.style.display = 'block';
        mainElement.classList.add('conversation-active');
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');

    if (sender === 'user') {
        messageDiv.classList.add('user-message');
        messageDiv.textContent = text;
        chatContainer.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    } else { // sender === 'ai'
        messageDiv.classList.add('ai-message');
        chatContainer.appendChild(messageDiv);
        
        // Apply formatting for better readability
        const formattedText = formatAIContent(text);
        
        // Add content with gradual reveal
        let i = 0;
        const speed = 5; // Lower number = faster typing
        messageDiv.innerHTML = ''; // Start empty
        
        function typeWriter() {
            if (i < formattedText.length) {
                // Handle HTML tags - add them all at once
                if (formattedText.charAt(i) === '<') {
                    const closeTagIndex = formattedText.indexOf('>', i);
                    if (closeTagIndex !== -1) {
                        messageDiv.innerHTML += formattedText.substring(i, closeTagIndex + 1);
                        i = closeTagIndex + 1;
                    } else {
                        messageDiv.innerHTML += formattedText.charAt(i);
                        i++;
                    }
                } else {
                    messageDiv.innerHTML += formattedText.charAt(i);
                    i++;
                }
                
                // Speed up typing for very long responses
                const timeoutDelay = formattedText.length > 1000 ? 1 : speed;
                setTimeout(typeWriter, timeoutDelay);
                chatContainer.scrollTop = chatContainer.scrollHeight;
            }
        }
        
        typeWriter();
    }
}

// Function to update user profile based on AI response analysis
function updateUserProfileStage(userMessage, aiResponse) {
    // Simple progression through profile stages based on AI responses
    if (!userProfile.profileComplete) {
        if (aiResponse.includes("goals") && !userProfile.physiologicalDetails) {
            // AI asked about goals, which means physiological details were provided
            userProfile.physiologicalDetails = userMessage;
            profileCollectionStage = 1; // Move to goals stage
        } 
        else if (aiResponse.includes("occupational routine") && !userProfile.goals) {
            // AI asked about occupation, which means goals were provided
            userProfile.goals = userMessage;
            profileCollectionStage = 2; // Move to occupation stage
        }
        else if ((aiResponse.includes("personalized") || aiResponse.includes("plan") || aiResponse.includes("recommend")) && 
                 userProfile.physiologicalDetails && userProfile.goals && !userProfile.occupation) {
            // AI is giving advice, which means occupation was provided
            userProfile.occupation = userMessage;
            userProfile.profileComplete = true;
            profileCollectionStage = 3; // Profile complete
            console.log("User profile complete:", userProfile);
        }
    }
}

// Function to call backend API endpoint (/api/chat)
async function getAiResponse(userText) {
    // Add user message to history
    conversationHistory.push({ role: "user", parts: [{ text: userText }] });

    // Add thinking indicator
    const thinkingDiv = document.createElement('div');
    thinkingDiv.classList.add('message', 'ai-message');
    thinkingDiv.innerHTML = '<span class="thinking">AI thinking<span class="dots">...</span></span>';
    
    // Make chat container visible when sending message
    if (chatContainer.style.display !== 'block') {
        chatContainer.style.display = 'block';
        mainElement.classList.add('conversation-active');
    }
    
    chatContainer.appendChild(thinkingDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // Animate the thinking dots
    const dots = thinkingDiv.querySelector('.dots');
    const thinkingAnimation = setInterval(() => {
        if (dots.textContent === '...') dots.textContent = '';
        else dots.textContent += '.';
    }, 500);

    try {
        // Call serverless function
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ history: conversationHistory }),
        });

        // Stop thinking animation
        clearInterval(thinkingAnimation);
        // Remove thinking indicator
        chatContainer.removeChild(thinkingDiv);

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Backend API Error:", errorData);
            throw new Error(`Error from backend: ${errorData.error || response.statusText}`);
        }

        const data = await response.json();
        const aiText = data.aiResponse;

        // Update user profile based on the interaction
        updateUserProfileStage(userText, aiText);

        // Add AI response to history
        conversationHistory.push({ role: "model", parts: [{ text: aiText }] });

        // Add the final AI message
        addMessage('ai', aiText);

    } catch (error) {
        // Stop thinking animation
        clearInterval(thinkingAnimation);
        // Remove thinking indicator on error
        if (chatContainer.contains(thinkingDiv)) {
            chatContainer.removeChild(thinkingDiv);
        }
        console.error('Error fetching AI response via backend:', error);
        addMessage('ai', `Error: ${error.message}. Please try again later.`);
    }
}

// Initialization - Add the initial AI message
function initialize() {
    // Add the AI's first message asking for physiological details
    addMessage('ai', conversationHistory[1].parts[0].text);
}

// Handle form submission
form.addEventListener('submit', (event) => {
    event.preventDefault();
    const userText = input.value.trim();
    if (userText) {
        addMessage('user', userText);
        input.value = '';
        getAiResponse(userText);
    }
});

// Add focus to input when page loads
window.addEventListener('load', () => {
    input.focus();
    initialize(); // Add the initial AI message on load
});

// Add a blinking cursor style to empty input
input.addEventListener('input', () => {
    if (input.value.length === 0) {
        input.classList.add('blinking-cursor');
    } else {
        input.classList.remove('blinking-cursor');
    }
});

// Initial class for cursor
input.classList.add('blinking-cursor');
