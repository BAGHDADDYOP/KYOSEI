const form = document.getElementById('input-form');
const input = document.getElementById('user-input');
const chatContainer = document.getElementById('chat-container');

// --- !!! WARNING: INSECURE FOR PUBLIC REPOS !!! ---
// Replace 'YOUR_API_KEY' with your actual Google AI Studio API key for local testing ONLY.
// We will replace this with a secure method for Vercel deployment.
const GEMINI_API_KEY = 'AIzaSyAjSVByajeUsAxkDXZEShmAd0BkhSQPn44';
// --- !!! END WARNING !!! ---

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyAjSVByajeUsAxkDXZEShmAd0BkhSQPn44"

// System Instruction to guide the AI
const SYSTEM_INSTRUCTION = `You are a helpful AI assistant focused **exclusively** on providing information about:
1.  Healthcare (general information, disease explanations - **never give medical advice or diagnoses**)
2.  Nutrition (healthy eating, macronutrients, micronutrients, diet types)
3.  Physical Training (exercise types, workout routines, fitness principles)
4.  Behavioral Tools (mindfulness, stress management techniques, habit formation)

Keep your answers concise, informative, and easy to understand.
Structure information clearly, using bullet points or numbered lists where appropriate.
**Strictly refuse** to answer questions outside these topics. If asked about something unrelated, politely state that you can only discuss healthcare, nutrition, fitness, and behavioral tools.
**Crucially, always include a disclaimer that your information is not a substitute for professional medical advice, diagnosis, or treatment.** Always consult with a qualified healthcare provider for any health concerns.`;

// Store conversation history (simple approach)
let conversationHistory = [
    { role: "user", parts: [{ text: SYSTEM_INSTRUCTION }] }, // Prime the model
    { role: "model", parts: [{ text: "Understood. I will focus on healthcare, nutrition, fitness, and behavioral tools, and always include a disclaimer. How can I help?" }] }
];


// Function to add a message to the chat display
function addMessage(sender, text) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');

    if (sender === 'user') {
        messageDiv.classList.add('user-message');
        messageDiv.textContent = text;
    } else { // sender === 'ai'
        messageDiv.classList.add('ai-message');
        // Basic Markdown support (replace newline with <br>, simple bold/italics)
        let formattedText = text.replace(/\n/g, '<br>');
        // Caution: More complex markdown needs a dedicated library
        messageDiv.innerHTML = formattedText; // Use innerHTML carefully
    }

    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight; // Scroll to bottom
}

// Function to call the Gemini API
async function getAiResponse(userText) {
    // Add user message to history
    conversationHistory.push({ role: "user", parts: [{ text: userText }] });

    // Add a thinking indicator
    const thinkingDiv = document.createElement('div');
    thinkingDiv.classList.add('message', 'ai-message');
    thinkingDiv.innerHTML = '<i>Thinking...</i>';
    chatContainer.appendChild(thinkingDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    try {
        const response = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                // Send relevant history (can be trimmed for longer convos)
                "contents": conversationHistory,
                "generationConfig": {
                    "temperature": 0.7, // Adjust creativity vs factualness
                    "topK": 1,
                    "topP": 1,
                    "maxOutputTokens": 512, // Limit response length
                },
                // Safety settings (optional but recommended)
                "safetySettings": [
                    {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
                    {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
                    {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
                    {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"}
                ]
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("API Error:", errorData);
            throw new Error(`API Error: ${response.statusText} - ${errorData?.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();

        // Remove thinking indicator
        chatContainer.removeChild(thinkingDiv);

        // Extract the AI's response text
        // Check different possible locations for the text based on API response structure
        let aiText = "Sorry, I couldn't get a response."; // Default error text
        if (data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts.length > 0) {
           aiText = data.candidates[0].content.parts[0].text;
           // Add AI response to history
           conversationHistory.push({ role: "model", parts: [{ text: aiText }] });
        } else if (data.promptFeedback) {
             aiText = `Request blocked due to safety settings: ${data.promptFeedback.blockReason}`;
             // Don't add blocked response to history for next turn
        } else {
             console.error("Unexpected API response structure:", data);
             aiText = "Sorry, the response format was unexpected.";
        }


        // Add the final AI message
        addMessage('ai', aiText);

    } catch (error) {
         // Remove thinking indicator on error too
         if (chatContainer.contains(thinkingDiv)) {
             chatContainer.removeChild(thinkingDiv);
         }
        console.error('Error fetching AI response:', error);
        addMessage('ai', `Error: ${error.message}. Please check the console for details.`);
    }
}

// Handle form submission
form.addEventListener('submit', (event) => {
    event.preventDefault();
    const userText = input.value.trim();
    if (userText) {
        addMessage('user', userText);
        input.value = ''; // Clear input field immediately
        getAiResponse(userText); // Call the AI function
    }
});

// Initial welcome message
window.addEventListener('load', () => {
    // Use the predefined welcome message from history priming
    const initialAiMessage = conversationHistory.find(msg => msg.role === 'model');
    if (initialAiMessage) {
       addMessage('ai', initialAiMessage.parts[0].text);
    } else {
       addMessage('ai', 'Welcome! Ask me about healthcare, nutrition, physical training, or behavioral tools.'); // Fallback
    }
});