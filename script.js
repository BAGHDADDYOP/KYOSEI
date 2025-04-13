// script.js (Modified for Vercel Deployment)

const form = document.getElementById('input-form');
const input = document.getElementById('user-input');
const chatContainer = document.getElementById('chat-container');

// --- API Key REMOVED from frontend code ---

// System Instruction (Keep this)
const SYSTEM_INSTRUCTION = `You are a helpful AI assistant focused **exclusively** on providing information about:
1.  Healthcare (general information, disease explanations - **never give medical advice or diagnoses**)
2.  Nutrition (healthy eating, macronutrients, micronutrients, diet types)
3.  Physical Training (exercise types, workout routines, fitness principles)
4.  Behavioral Tools (mindfulness, stress management techniques, habit formation)

Keep your answers concise, informative, and easy to understand.
Structure information clearly, using bullet points or numbered lists where appropriate.
**Strictly refuse** to answer questions outside these topics. If asked about something unrelated, politely state that you can only discuss healthcare, nutrition, fitness, and behavioral tools.
**Crucially, always include a disclaimer that your information is not a substitute for professional medical advice, diagnosis, or treatment.** Always consult with a qualified healthcare provider for any health concerns.`;

// Store conversation history (Keep this)
let conversationHistory = [
    { role: "user", parts: [{ text: SYSTEM_INSTRUCTION }] },
    { role: "model", parts: [{ text: "Understood. I will focus on healthcare, nutrition, fitness, and behavioral tools, and always include a disclaimer. How can I help?" }] }
];

// addMessage function (Keep this, same as before)
function addMessage(sender, text) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');

    if (sender === 'user') {
        messageDiv.classList.add('user-message');
        messageDiv.textContent = text;
    } else { // sender === 'ai'
        messageDiv.classList.add('ai-message');
        let formattedText = text.replace(/\n/g, '<br>');
        messageDiv.innerHTML = formattedText;
    }

    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}


// Function to call OUR backend API endpoint (/api/chat)
async function getAiResponse(userText) {
    // Add user message to history
    conversationHistory.push({ role: "user", parts: [{ text: userText }] });

    // Add thinking indicator (same as before)
    const thinkingDiv = document.createElement('div');
    thinkingDiv.classList.add('message', 'ai-message');
    thinkingDiv.innerHTML = '<i>Thinking...</i>';
    chatContainer.appendChild(thinkingDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    try {
        // --- Call OUR serverless function ---
        const response = await fetch('/api/chat', { // Relative URL to our function
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // Send the current conversation history
            body: JSON.stringify({ history: conversationHistory }),
        });
        // --- End call to our function ---

        // Remove thinking indicator
        chatContainer.removeChild(thinkingDiv);

        if (!response.ok) {
             const errorData = await response.json();
             console.error("Backend API Error:", errorData);
             throw new Error(`Error from backend: ${errorData.error || response.statusText}`);
        }

        const data = await response.json();
        const aiText = data.aiResponse; // Get response from our backend structure

        // Add AI response to history *after* getting it back
         conversationHistory.push({ role: "model", parts: [{ text: aiText }] });

        // Add the final AI message
        addMessage('ai', aiText);

    } catch (error) {
        // Remove thinking indicator on error too
         if (chatContainer.contains(thinkingDiv)) {
             chatContainer.removeChild(thinkingDiv);
         }
        console.error('Error fetching AI response via backend:', error);
        addMessage('ai', `Error: ${error.message}. Please check the console for details.`);
    }
}


// Handle form submission (Keep this, same as before)
form.addEventListener('submit', (event) => {
    event.preventDefault();
    const userText = input.value.trim();
    if (userText) {
        addMessage('user', userText);
        input.value = '';
        getAiResponse(userText);
    }
});

// Initial welcome message (Keep this, same as before)
window.addEventListener('load', () => {
    const initialAiMessage = conversationHistory.find(msg => msg.role === 'model');
    if (initialAiMessage) {
       addMessage('ai', initialAiMessage.parts[0].text);
    } else {
       addMessage('ai', 'Welcome! Ask me about healthcare, nutrition, physical training, or behavioral tools.');
    }
});