// script.js (Modified for minimal UI)

const form = document.getElementById('input-form');
const input = document.getElementById('user-input');
const chatContainer = document.getElementById('chat-container');

// System Instruction (Keep this)
const SYSTEM_INSTRUCTION = `You are a helpful AI assistant focused **exclusively** on providing information about:
1.  Healthcare (general information, disease explanations)
2.  Nutrition (healthy eating, macronutrients, micronutrients, diet types)
3.  Physical Training (exercise types, workout routines, fitness principles)
4.  Behavioral Tools (mindfulness, stress management techniques, habit formation)

Keep your answers concise, informative, and easy to understand.
Structure information clearly, using bullet points or numbered lists where appropriate.
**Strictly refuse** to answer questions outside these topics. If asked about something unrelated, politely state that you can only discuss healthcare, nutrition, fitness, and behavioral tools.`;

// Store conversation history (Keep this)
let conversationHistory = [
    { role: "user", parts: [{ text: SYSTEM_INSTRUCTION }] },
    { role: "model", parts: [{ text: "Understood. I will focus on healthcare, nutrition, fitness, and behavioral tools. How can I help?" }] }
];

// addMessage function - Modified to show responses when needed
function addMessage(sender, text) {
    if (sender === 'ai') {
        // Make chat container visible when AI responds
        chatContainer.style.display = 'block';
    }
    
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

// Function to call backend API endpoint (/api/chat)
async function getAiResponse(userText) {
    // Add user message to history
    conversationHistory.push({ role: "user", parts: [{ text: userText }] });

    // Add thinking indicator
    const thinkingDiv = document.createElement('div');
    thinkingDiv.classList.add('message', 'ai-message');
    thinkingDiv.innerHTML = '<i>Thinking...</i>';
    
    // Make chat container visible when sending message
    chatContainer.style.display = 'block';
    chatContainer.appendChild(thinkingDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    try {
        // Call serverless function
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ history: conversationHistory }),
        });

        // Remove thinking indicator
        chatContainer.removeChild(thinkingDiv);

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Backend API Error:", errorData);
            throw new Error(`Error from backend: ${errorData.error || response.statusText}`);
        }

        const data = await response.json();
        const aiText = data.aiResponse;

        // Add AI response to history
        conversationHistory.push({ role: "model", parts: [{ text: aiText }] });

        // Add the final AI message
        addMessage('ai', aiText);

    } catch (error) {
        // Remove thinking indicator on error
        if (chatContainer.contains(thinkingDiv)) {
            chatContainer.removeChild(thinkingDiv);
        }
        console.error('Error fetching AI response via backend:', error);
        addMessage('ai', `Error: ${error.message}. Please check the console for details.`);
    }
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

// No initial welcome message - chat starts completely blank
