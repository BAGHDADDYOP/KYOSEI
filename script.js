// script.js (Enhanced with quiz-like profile collection)

const form = document.getElementById('input-form');
const input = document.getElementById('user-input');
const chatContainer = document.getElementById('chat-container');
const quizContainer = document.getElementById('quiz-container');
const mainElement = document.querySelector('main');

// Track user profile data
let userProfile = {
    physiologicalDetails: {},
    goals: {},
    occupation: {},
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

// Define quiz questions
const quizQuestions = {
    physiology: [
        {
            question: "What is your age?",
            type: "select",
            options: ["Under 18", "18-24", "25-34", "35-44", "45-54", "55-64", "65 or older"],
            allowCustom: true,
            customLabel: "Enter your specific age"
        },
        {
            question: "What is your height?",
            type: "custom",
            placeholder: "e.g., 5'10\" or 178 cm"
        },
        {
            question: "What is your weight?",
            type: "custom",
            placeholder: "e.g., 160 lbs or 73 kg"
        },
        {
            question: "Do you have any health conditions or limitations?",
            type: "select",
            options: ["None", "High blood pressure", "Diabetes", "Joint pain/arthritis", "Back problems", "Heart condition", "Respiratory issues"],
            allowCustom: true,
            customLabel: "Enter other health conditions",
            allowMultiple: true
        }
    ],
    goals: [
        {
            question: "What are your primary fitness goals?",
            type: "select",
            options: ["Weight loss", "Muscle gain", "Improved endurance", "Better flexibility", "Overall health", "Sports performance", "Rehabilitation"],
            allowMultiple: true
        },
        {
            question: "How would you describe your current fitness level?",
            type: "select",
            options: ["Beginner - New to exercise", "Intermediate - Exercise occasionally", "Advanced - Regular exercise", "Athletic - Trained regularly for years"]
        },
        {
            question: "What specific areas would you like to focus on?",
            type: "select",
            options: ["Full body", "Upper body", "Lower body", "Core strength", "Cardiovascular health", "Functional mobility"],
            allowMultiple: true
        }
    ],
    occupation: [
        {
            question: "What is your occupation or job type?",
            type: "select",
            options: ["Office/Desk job", "Physical/Manual labor", "Healthcare", "Education", "Service industry", "Remote/Work from home", "Student", "Retired"],
            allowCustom: true,
            customLabel: "Enter your specific occupation"
        },
        {
            question: "How many hours do you typically work per day?",
            type: "select",
            options: ["Less than 4 hours", "4-6 hours", "7-8 hours", "9-10 hours", "More than 10 hours", "Variable schedule"]
        },
        {
            question: "How would you rate your daily activity level at work?",
            type: "select",
            options: ["Mostly sedentary (sitting)", "Light activity (occasional walking)", "Moderate activity (regular walking/standing)", "High activity (physically demanding)"]
        },
        {
            question: "How would you rate your work stress level?",
            type: "select",
            options: ["Low stress", "Moderate stress", "High stress", "Variable/depends on the day"]
        }
    ]
};

// Current quiz data
let currentQuizSection = 'physiology';
let currentQuizQuestionIndex = 0;
let currentQuizAnswers = {};

// Function to start the profile collection process
function startProfileCollection() {
    // Hide standard input form and show quiz
    form.style.display = 'none';
    quizContainer.style.display = 'block';
    
    // Initialize the first question
    showCurrentQuizQuestion();
    
    // Update progress indicators
    updateProfileProgress(1);
}

// Function to render the current quiz question
function showCurrentQuizQuestion() {
    const questions = quizQuestions[currentQuizSection];
    const currentQuestion = questions[currentQuizQuestionIndex];
    
    let quizHTML = `
        <div class="quiz-question">${currentQuestion.question}</div>
        <div class="quiz-options">
    `;
    
    if (currentQuestion.type === 'select') {
        currentQuestion.options.forEach((option, index) => {
            quizHTML += `
                <div class="quiz-option" data-value="${option}" onclick="selectQuizOption(this, ${currentQuestion.allowMultiple || false})">${option}</div>
            `;
        });
        
        if (currentQuestion.allowCustom) {
            quizHTML += `
                <input type="text" class="quiz-custom-input" placeholder="${currentQuestion.customLabel || 'Enter custom answer'}" id="custom-quiz-input">
            `;
        }
    } else if (currentQuestion.type === 'custom') {
        quizHTML += `
            <input type="text" class="quiz-custom-input" placeholder="${currentQuestion.placeholder || 'Enter your answer'}" id="custom-quiz-input">
        `;
    }
    
    quizHTML += `
        </div>
        <button class="quiz-button" onclick="submitQuizAnswer()">Next</button>
    `;
    
    quizContainer.innerHTML = quizHTML;
}

// Function to handle quiz option selection
window.selectQuizOption = function(element, allowMultiple) {
    if (allowMultiple) {
        element.classList.toggle('selected');
    } else {
        // Remove selection from all options
        document.querySelectorAll('.quiz-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        element.classList.add('selected');
    }
};

// Function to submit quiz answer and move to next question
window.submitQuizAnswer = function() {
    const questions = quizQuestions[currentQuizSection];
    const currentQuestion = questions[currentQuizQuestionIndex];
    let answer;
    
    if (currentQuestion.type === 'select') {
        if (currentQuestion.allowMultiple) {
            answer = Array.from(document.querySelectorAll('.quiz-option.selected')).map(el => el.dataset.value);
        } else {
            const selected = document.querySelector('.quiz-option.selected');
            answer = selected ? selected.dataset.value : null;
        }
        
        // Handle custom input if present
        const customInput = document.getElementById('custom-quiz-input');
        if (customInput && customInput.value.trim()) {
            if (Array.isArray(answer)) {
                answer.push(customInput.value.trim());
            } else if (!answer) {
                answer = customInput.value.trim();
            }
        }
    } else if (currentQuestion.type === 'custom') {
        answer = document.getElementById('custom-quiz-input').value.trim();
    }
    
    // Save answer
    if (!currentQuizAnswers[currentQuizSection]) {
        currentQuizAnswers[currentQuizSection] = {};
    }
    currentQuizAnswers[currentQuizSection][currentQuestion.question] = answer;
    
    // Move to next question or section
    currentQuizQuestionIndex++;
    
    if (currentQuizQuestionIndex >= questions.length) {
        // Move to next section or complete profile
        if (currentQuizSection === 'physiology') {
            currentQuizSection = 'goals';
            currentQuizQuestionIndex = 0;
            updateProfileProgress(2);
        } else if (currentQuizSection === 'goals') {
            currentQuizSection = 'occupation';
            currentQuizQuestionIndex = 0;
            updateProfileProgress(3);
        } else {
            // Profile complete
            finishProfileCollection();
            return;
        }
    }
    
    // Show next question
    showCurrentQuizQuestion();
};

// Function to finish profile collection and start chat
function finishProfileCollection() {
    // Update user profile with collected answers
    userProfile.physiologicalDetails = currentQuizAnswers.physiology;
    userProfile.goals = currentQuizAnswers.goals;
    userProfile.occupation = currentQuizAnswers.occupation;
    userProfile.profileComplete = true;
    
    // Format profile data for the AI
    const profileSummary = formatProfileSummary();
    
    // Update profile progress
    updateProfileProgress(4);
    
    // Hide quiz container and show chat
    quizContainer.style.display = 'none';
    chatContainer.style.display = 'block';
    form.style.display = 'flex';
    
    // Add user profile message to chat and history
    addMessage('user', profileSummary);
    conversationHistory.push({ role: "user", parts: [{ text: profileSummary }] });
    
    // Get AI response with the profile data
    getAiResponse(profileSummary);
}

// Format user profile as a summary for the AI
function formatProfileSummary() {
    let summary = "Here's my information:\n\nPhysiological Details:\n";
    
    // Add physiology details
    Object.entries(userProfile.physiologicalDetails).forEach(([question, answer]) => {
        const shortQ = question.replace("What is your ", "")
                              .replace("Do you have any ", "");
        summary += `- ${shortQ}: ${Array.isArray(answer) ? answer.join(", ") : answer}\n`;
    });
    
    // Add goals
    summary += "\nGoals:\n";
    Object.entries(userProfile.goals).forEach(([question, answer]) => {
        const shortQ = question.replace("What are your ", "")
                              .replace("How would you describe your ", "")
                              .replace("What specific ", "");
        summary += `- ${shortQ}: ${Array.isArray(answer) ? answer.join(", ") : answer}\n`;
    });
    
    // Add occupation details
    summary += "\nOccupational Information:\n";
    Object.entries(userProfile.occupation).forEach(([question, answer]) => {
        const shortQ = question.replace("What is your ", "")
                              .replace("How many ", "")
                              .replace("How would you rate your ", "");
        summary += `- ${shortQ}: ${Array.isArray(answer) ? answer.join(", ") : answer}\n`;
    });
    
    summary += "\nBased on this information, could you provide me with personalized health and fitness guidance?";
    return summary;
}

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

// Function to call backend API endpoint (/api/chat)
async function getAiResponse(userText) {
    // Add user message to history if not already added (for profile summary)
    if (conversationHistory[conversationHistory.length - 1].role !== "user" || 
        conversationHistory[conversationHistory.length - 1].parts[0].text !== userText) {
        conversationHistory.push({ role: "user", parts: [{ text: userText }] });
    }

    // Add thinking indicator
