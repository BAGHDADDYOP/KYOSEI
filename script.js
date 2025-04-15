// Enhanced script.js with sidebar functionality and original terminology

document.addEventListener('DOMContentLoaded', function() {
    // Cache DOM elements for better performance
    const form = document.getElementById('input-form');
    const input = document.getElementById('user-input');
    const chatContainer = document.getElementById('chat-container');
    const quizContainer = document.getElementById('quiz-container');
    const mainElement = document.querySelector('main');
    const welcomeAnimation = document.getElementById('welcome-animation');
    const loadingScreen = document.getElementById('loading-screen');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const toggleToolkitBtn = document.getElementById('toggle-toolkit-btn');
    const closeSidebarBtn = document.getElementById('close-sidebar');
    
    // Track user profile data
    let userProfile = {
        physicalVessel: {},
        consciousIntent: {},
        dailyRhythms: {},
        profileComplete: false
    };

    // Profile collection stage
    let profileCollectionStage = 0;

    // System Instruction with the original guidance
    const SYSTEM_INSTRUCTION = `You represent Kyōsei, a wellness guide focused on the symbiotic relationship between mind, body, gut microbiome, and consciousness. Your purpose is to help users discover how these systems work together for optimal wellness.

Always emphasize:
1. The interconnectedness of physical, mental, and microbial health
2. How changes in one system positively influence others
3. The natural capacity for adaptation and growth (neuroplasticity)
4. The wisdom inherent in holistic balance

Present wellness as a journey of self-discovery rather than a problem to be fixed. Use language that evokes harmony, integration, and mutual benefit. Draw from principles of neuroplasticity, holistic wellbeing, and philosophical concepts from Upanishads and Kashmiri Shaivism without using religious terminology.

IMPORTANT: When a user first engages with you, ALWAYS follow this flow:
1. First, ask about their physical vessel (age, height, weight, digestive patterns, energy levels).
2. Second, ask about their conscious intent (goals, aspirations, areas seeking harmony).
3. Third, ask about their daily rhythms (occupation, sleep patterns, stress sources).
4. Only AFTER collecting this information should you provide personalized guidance.

Frame recommendations to show how they benefit multiple systems simultaneously.`;

    // Store conversation history
    let conversationHistory = [
        { role: "user", parts: [{ text: SYSTEM_INSTRUCTION }] },
        { role: "model", parts: [{ text: "Welcome! To provide you with personalized health and fitness guidance, I'd like to learn a bit about you first.\n\nCould you please share some details about your physical vessel such as your age, height, weight, and any health conditions or limitations you may have?" }] },
    ];

    // Define quiz questions with original language
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

    // Debounce function to optimize event handlers
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

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

    // Function to show the current quiz question with enhanced animation
    function showCurrentQuizQuestion() {
        const questions = quizQuestions[currentQuizSection];
        const currentQuestion = questions[currentQuizQuestionIndex];
        
        // Create quiz HTML
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
        
        // Apply fade-out animation to current content
        quizContainer.style.opacity = '0';
        quizContainer.style.transform = 'translateY(10px)';
        
        setTimeout(() => {
            // Update content
            quizContainer.innerHTML = quizHTML;
            
            // Apply fade-in animation
            quizContainer.style.opacity = '1';
            quizContainer.style.transform = 'translateY(0)';
            
            // Add focus to the custom input if it's a custom question
            if (currentQuestion.type === 'custom') {
                setTimeout(() => {
                    const customInput = document.getElementById('custom-quiz-input');
                    if (customInput) customInput.focus();
                }, 100);
            }
        }, 300);
    }

    // Function to update profile progress indicators with enhanced animation
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
                
                // Add subtle animation to active step
                progressStep.animate([
                    { transform: 'scale(1)', opacity: 0.8 },
                    { transform: 'scale(1.2)', opacity: 1 },
                    { transform: 'scale(1.1)', opacity: 1 }
                ], {
                    duration: 600,
                    easing: 'cubic-bezier(0.25, 0.8, 0.25, 1)',
                    fill: 'forwards'
                });
                
                // Add subtle animation to active label
                progressLabel.animate([
                    { opacity: 0.8, transform: 'translateY(3px)' },
                    { opacity: 1, transform: 'translateY(0)' }
                ], {
                    duration: 500,
                    easing: 'cubic-bezier(0.25, 0.8, 0.25, 1)',
                    fill: 'forwards'
                });
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

    // Function to handle quiz option selection with enhanced animation
    window.selectQuizOption = function(element, allowMultiple) {
        const selectedClass = 'selected';
        
        if (allowMultiple) {
            // Toggle selection for multiple-choice options
            element.classList.toggle(selectedClass);
            
            // Add subtle animation for selection
            if (element.classList.contains(selectedClass)) {
                element.animate([
                    { transform: 'translateY(0)' },
                    { transform: 'translateY(-3px)' },
                    { transform: 'translateY(-1px)' }
                ], {
                    duration: 300,
                    easing: 'cubic-bezier(0.25, 0.8, 0.25, 1)'
                });
            }
        } else {
            // For single-choice options, deselect all others
            document.querySelectorAll('.quiz-option').forEach(opt => {
                opt.classList.remove(selectedClass);
            });
            
            // Select the clicked option with animation
            element.classList.add(selectedClass);
            element.animate([
                { transform: 'translateY(0)' },
                { transform: 'translateY(-3px)' },
                { transform: 'translateY(-1px)' }
            ], {
                duration: 300,
                easing: 'cubic-bezier(0.25, 0.8, 0.25, 1)'
            });
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
                
                // Add button activation animation
                nextButton.animate([
                    { opacity: 0.5, transform: 'scale(0.98)' },
                    { opacity: 1, transform: 'scale(1)' }
                ], {
                    duration: 300,
                    easing: 'cubic-bezier(0.25, 0.8, 0.25, 1)',
                    fill: 'forwards'
                });
            } else {
                nextButton.classList.remove('active');
            }
        }
    };

    // Function to handle custom input changes with debounce for performance
    window.handleCustomInput = debounce(function(inputElement) {
        const nextButton = document.querySelector('.quiz-button');
        if (nextButton) {
            const hasValue = inputElement.value.trim() !== '';
            nextButton.disabled = !hasValue;
            
            if (hasValue) {
                nextButton.classList.add('active');
                
                // Subtle button activation animation 
                nextButton.animate([
                    { opacity: 0.5, transform: 'scale(0.98)' },
                    { opacity: 1, transform: 'scale(1)' }
                ], {
                    duration: 300,
                    easing: 'cubic-bezier(0.25, 0.8, 0.25, 1)',
                    fill: 'forwards'
                });
            } else {
                nextButton.classList.remove('active');
            }
        }
    }, 100);
    
    // Function to submit quiz answer and move to next question with enhanced transition
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
        
        // Apply transition animation
        quizContainer.style.opacity = '0';
        quizContainer.style.transform = 'translateY(10px)';
        
        setTimeout(() => {
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
            
            // Apply fade-in animation
            quizContainer.style.opacity = '1';
            quizContainer.style.transform = 'translateY(0)';
        }, 300);
    };
