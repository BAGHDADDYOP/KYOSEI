// script.js (Enhanced with quiz-like profile collection)

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('input-form');
    const input = document.getElementById('user-input');
    const chatContainer = document.getElementById('chat-container');
    const quizContainer = document.getElementById('quiz-container');
    const mainElement = document.querySelector('main');
    const welcomeAnimation = document.getElementById('welcome-animation');

    // Track user profile data
    let userProfile = {
        physicalVessel: {},
        consciousIntent: {},
        dailyRhythms: {},
        profileComplete: false
    };

    // Profile collection stage
    let profileCollectionStage = 0;

    // System Instruction with updated guidance
   const SYSTEM_INSTRUCTION = `You represent Kyōsei, a wellness guide focused on the symbiotic relationship between mind, body, gut microbiome, and consciousness. Your purpose is to help users discover how these systems work together for optimal wellness.

Always emphasize:
1. The interconnectedness of physical, mental, and microbial health
2. How changes in one system positively influence others
3. The natural capacity for adaptation and growth (neuroplasticity)
4. The wisdom inherent in holistic balance

Present wellness as a journey of self-discovery rather than a problem to be fixed. Use language that evokes harmony, integration, and mutual benefit. Draw from principles of neuroplasticity and holistic wellbeing without using religious terminology.

IMPORTANT: When a user first engages with you, ALWAYS follow this flow:
1. First, ask about their physical vessel (age, height, weight, digestive patterns, energy levels).
2. Second, ask about their conscious intent (goals, aspirations, areas seeking harmony).
3. Third, ask about their daily rhythms (occupation, sleep patterns, stress sources).
4. Only AFTER collecting this information should you provide personalized guidance.

Frame recommendations to show how they benefit multiple systems simultaneously.`;

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
            },
            {
                question: "How would you describe your digestive health?",
                type: "select",
                options: ["Excellent - No issues", "Good - Occasional discomfort", "Fair - Regular minor issues", "Poor - Frequent discomfort"]
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
            },
            {
                question: "Which aspect of your mind-body connection do you want to strengthen?",
                type: "select",
                options: ["Mental clarity", "Emotional balance", "Physical energy", "Resilience to stress", "Sleep quality"],
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

    // Function to show the current quiz question
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
                    <div class="quiz-option" data-value="${option}" onclick="selectQuizOption(this, ${currentQuestion.allowMultiple || false})">
                        <span class="option-text">${option}</span>
                    </div>
                `;
            });
            
            if (currentQuestion.allowCustom) {
                quizHTML += `
                    <div class="custom-input-container">
                        <input type="text" class="quiz-custom-input" 
                               placeholder="${currentQuestion.customLabel || 'Enter custom answer'}" 
                               id="custom-quiz-input"
                               oninput="handleCustomInput(this)">
                    </div>
                `;
            }
        } else if (currentQuestion.type === 'custom') {
            quizHTML += `
                <div class="custom-input-container">
                    <input type="text" class="quiz-custom-input" 
                           placeholder="${currentQuestion.placeholder || 'Enter your answer'}" 
                           id="custom-quiz-input"
                           oninput="handleCustomInput(this)">
                </div>
            `;
        }
        
        quizHTML += `
            </div>
            <button class="quiz-button" onclick="submitQuizAnswer()" disabled>Next</button>
        `;
        
        quizContainer.innerHTML = quizHTML;
        
        // Add focus to the custom input if it's a custom question
        if (currentQuestion.type === 'custom') {
            setTimeout(() => {
                const customInput = document.getElementById('custom-quiz-input');
                if (customInput) customInput.focus();
            }, 100);
        }
    }

    // Function to update profile progress indicators
    function updateProfileProgress(step) {
        // Update progress steps
        for (let i = 1; i <= 3; i++) {
            const progressStep = document.getElementById(`step-${i}`);
            const progressLabel = document.getElementById(`label-${i}`);
            
            if (i < step) {
                progressStep.classList.add('complete');
                progressLabel.classList.add('complete');
            } else if (i === step) {
                progressStep.classList.add('active');
                progressLabel.classList.add('active');
            } else {
                progressStep.classList.remove('active', 'complete');
                progressLabel.classList.remove('active', 'complete');
            }
        }
        
        // Hide progress when at step 4 (profile complete)
        if (step === 4) {
            document.getElementById('profile-progress').classList.add('complete');
            document.getElementById('progress-labels').classList.add('complete');
        }
    }

    // Function to handle quiz option selection
    window.selectQuizOption = function(element, allowMultiple) {
        const selectedClass = 'selected';
        
        if (allowMultiple) {
            // Toggle selection for multiple-choice options
            element.classList.toggle(selectedClass);
            
            // Add subtle animation for selection
            if (element.classList.contains(selectedClass)) {
                element.style.animation = 'selectPulse 0.3s ease';
                setTimeout(() => {
                    element.style.animation = '';
                }, 300);
            }
        } else {
            // For single-choice options, deselect all others
            document.querySelectorAll('.quiz-option').forEach(opt => {
                opt.classList.remove(selectedClass);
                opt.style.animation = '';
            });
            
            // Select the clicked option with animation
            element.classList.add(selectedClass);
            element.style.animation = 'selectPulse 0.3s ease';
            setTimeout(() => {
                element.style.animation = '';
            }, 300);
        }
        
        // Enable/disable the next button based on selection
        const nextButton = document.querySelector('.quiz-button');
        const hasSelection = document.querySelector('.quiz-option.selected') || 
                             (document.getElementById('custom-quiz-input') && 
                              document.getElementById('custom-quiz-input').value.trim() !== '');
        
        if (nextButton) {
            nextButton.disabled = !hasSelection;
            if (hasSelection) {
                nextButton.classList.add('active');
            } else {
                nextButton.classList.remove('active');
            }
        }
    };

    // Function to handle custom input changes
    window.handleCustomInput = function(inputElement) {
        const nextButton = document.querySelector('.quiz-button');
        if (nextButton) {
            nextButton.disabled = inputElement.value.trim() === '';
            if (inputElement.value.trim() !== '') {
                nextButton.classList.add('active');
            } else {
                nextButton.classList.remove('active');
            }
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

    // Add thinking indicator to show the AI is processing
    function addThinkingIndicator() {
        const thinkingDiv = document.createElement('div');
        thinkingDiv.classList.add('message', 'ai-message', 'thinking');
        thinkingDiv.innerHTML = '<div class="thinking-dots"><span>.</span><span>.</span><span>.</span></div>';
        chatContainer.appendChild(thinkingDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        return thinkingDiv;
    }

    // Function to call backend API endpoint (/api/chat)
    async function getAiResponse(userText) {
        // Add user message to history if not already added (for profile summary)
        if (conversationHistory[conversationHistory.length - 1].role !== "user" || 
            conversationHistory[conversationHistory.length - 1].parts[0].text !== userText) {
            conversationHistory.push({ role: "user", parts: [{ text: userText }] });
        }

        // Add thinking indicator
        const thinkingIndicator = addThinkingIndicator();

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ history: conversationHistory }),
            });

            // Remove thinking indicator
            thinkingIndicator.remove();

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Add AI response to UI and history
            addMessage('ai', data.aiResponse);
            conversationHistory.push({ role: "model", parts: [{ text: data.aiResponse }] });
            
        } catch (error) {
            // Remove thinking indicator
            thinkingIndicator.remove();
            
            console.error('Error:', error);
            addMessage('ai', "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.");
        }
    }

    // Form submission handler
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const userText = input.value.trim();
        
        if (userText) {
            addMessage('user', userText);
            input.value = '';
            
            getAiResponse(userText);
        }
    });

    // Initialize - Start profile collection when page loads
    function init() {
        // Hide welcome animation after a delay
        setTimeout(() => {
            if (welcomeAnimation) {
                welcomeAnimation.style.display = 'none';
            }
            // Start profile collection
            startProfileCollection();
        }, 1000);
    }

    // Run initialization
    init();
});

// Add at the end of your script.js file
// Loading screen handler
window.addEventListener('load', function() {
    setTimeout(function() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('fade-out');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }, 1000);
});

// Define selectPulse animation in JavaScript (since it was commented out in CSS)
document.head.insertAdjacentHTML('beforeend', `
    <style>
    @keyframes selectPulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.02); }
        100% { transform: scale(1); }
    }
    </style>
`);
// Add this to your script.js or create a new file

function createProtocolToolkitCards() {
  // Create a container for protocol cards
  const protocolContainer = document.createElement('div');
  protocolContainer.className = 'protocol-cards-container';
  protocolContainer.style.display = 'none'; // Hidden by default
  
  // Create cards for different topics
  const protocolTopics = [
    {
      title: "Optimizing Sleep",
      protocols: [
        "Get 30-60 min of morning sunlight within 30-60 min of waking",
        "Avoid bright artificial light 2-3 hours before sleep",
        "Lower room temperature by 1-3°F at night",
        "Maintain consistent sleep-wake times",
        "Try NSDR (Non-Sleep Deep Rest) for midday recovery"
      ]
    },
    {
      title: "Managing Stress",
      protocols: [
        "Practice physiological sighs (double inhale, extended exhale)",
        "Try cyclical hyperventilation and breath holds",
        "Use deliberate cold exposure (30-60 sec cold shower)",
        "Consider heat exposure (sauna) followed by cooling",
        "Incorporate mindfulness practices with specific durations"
      ]
    },
    {
      title: "Focus & Cognition",
      protocols: [
        "Work in 90-minute focused sessions with 5-15 min breaks",
        "Practice visual focus exercises daily",
        "Consider caffeine + L-theanine for focus",
        "Use ultradian rhythms (90 min work/20 min rest)",
        "Combine specific nutritional support with behavioral protocols"
      ]
    },
    {
      title: "Physical Performance",
      protocols: [
        "Include Zone 2 cardio (nose-breathing pace) 150 min/week",
        "Resistance train 2-4x weekly with progressive overload",
        "Optimize post-workout nutrition within 30-90 min window",
        "Balance training intensity with recovery protocols",
        "Use specific supplement protocols when appropriate"
      ]
    }
  ];
  
  // Create each card
  protocolTopics.forEach(topic => {
    const card = document.createElement('div');
    card.className = 'protocol-card';
    
    const cardHeader = document.createElement('div');
    cardHeader.className = 'card-header';
    
    const title = document.createElement('h3');
    title.className = 'card-title';
    title.textContent = topic.title;
    
    cardHeader.appendChild(title);
    
    const cardContent = document.createElement('div');
    cardContent.className = 'card-content';
    
    const protocolList = document.createElement('ul');
    protocolList.className = 'protocol-list';
    
    topic.protocols.forEach(protocol => {
      const item = document.createElement('li');
      item.textContent = protocol;
      protocolList.appendChild(item);
    });
    
    cardContent.appendChild(protocolList);
    
    // Learn more button
    const learnMoreBtn = document.createElement('button');
    learnMoreBtn.className = 'learn-more-btn';
    learnMoreBtn.textContent = 'Ask About This';
    learnMoreBtn.setAttribute('data-topic', topic.title);
    learnMoreBtn.addEventListener('click', function() {
      const userInput = document.getElementById('user-input');
      userInput.value = `Tell me more about ${this.getAttribute('data-topic')} techniques`;
      userInput.focus();
    });
    
    card.appendChild(cardHeader);
    card.appendChild(cardContent);
    card.appendChild(learnMoreBtn);
    
    protocolContainer.appendChild(card);
  });
  
  // Add toggle button
  const toggleButton = document.createElement('button');
  toggleButton.className = 'toggle-protocols-btn';
  toggleButton.textContent = 'Toolkit';
  toggleButton.addEventListener('click', function() {
    if (protocolContainer.style.display === 'none') {
      protocolContainer.style.display = 'flex';
      this.classList.add('active');
    } else {
      protocolContainer.style.display = 'none';
      this.classList.remove('active');
    }
  });
  
  // Add to the page
  const mainElement = document.querySelector('main');
  mainElement.appendChild(toggleButton);
  mainElement.appendChild(protocolContainer);
  
  // Add styles
  const style = document.createElement('style');
  style.textContent = `
    .toggle-protocols-btn {
      background-color: rgba(30, 30, 30, 0.8);
      color: #fff;
      border: 1px solid #444;
      border-radius: 8px;
      padding: 10px 15px;
      margin: 15px 0;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.3s ease;
    }
    
    .toggle-protocols-btn.active {
      background-color: rgba(50, 50, 50, 0.8);
      box-shadow: 0 0 15px rgba(255, 255, 255, 0.1);
    }
    
    .protocol-cards-container {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
      justify-content: center;
      margin: 10px 0 25px;
      width: 100%;
    }
    
    .protocol-card {
      background-color: #000000;
      border: 1px solid #333;
      border-radius: 12px;
      width: calc(50% - 15px);
      min-width: 250px;
      overflow: hidden;
      transition: all 0.3s ease;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    }
    
    .protocol-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
      border-color: #444;
    }
    
    .card-header {
      padding: 15px;
      display: flex;
      align-items: center;
      background-color: rgba(30, 30, 30, 0.8);
      border-bottom: 1px solid #333;
    }
    
    .card-title {
      font-size: 1.1rem;
      font-weight: 600;
    }
    
    .card-content {
      padding: 15px;
    }
    
    .protocol-list {
      list-style-type: none;
      padding: 0;
      margin: 0;
    }
    
    .protocol-list li {
      padding: 8px 0;
      border-bottom: 1px;;
      margin: 0;
    }
    
    .protocol-list li {
      padding: 8px 0;
      border-bottom: 1px solid rgba(60, 60, 60, 0.3);
      font-size: 0.95rem;
      line-height: 1.5;
    }
    
    .protocol-list li:last-child {
      border-bottom: none;
    }
    
    .learn-more-btn {
      width: 100%;
      padding: 12px;
      background-color: rgba(40, 40, 40, 0.8);
      border: none;
      border-top: 1px solid #333;
      color: #fff;
      font-size: 0.95rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .learn-more-btn:hover {
      background-color: rgba(60, 60, 60, 0.8);
    }
    
    @media (max-width: 768px) {
      .protocol-card {
        width: 100%;
      }
    }
  `;
  
  document.head.appendChild(style);
};

// Call this function after the chat is initialized
document.addEventListener('DOMContentLoaded', function() {
  // Add this line to your existing DOMContentLoaded event handler
  setTimeout(createProtocolToolkitCards, 1500);
});

