// Enhanced script.js with complete functionality and aesthetic improvements

document.addEventListener('DOMContentLoaded', function() {
    // Cache DOM elements for better performance
    const form = document.getElementById('input-form');
    const input = document.getElementById('user-input');
    const chatContainer = document.getElementById('chat-container');
    const quizContainer = document.getElementById('quiz-container');
    const mainElement = document.querySelector('main');
    const welcomeAnimation = document.getElementById('welcome-animation');
    const loadingScreen = document.getElementById('loading-screen');
    const loaderText = document.querySelector('.loader-text');
    const sidebar = document.getElementById('sidebar');
    const sidebarContent = document.getElementById('sidebar-content');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const toggleToolkitBtn = document.getElementById('toggle-toolkit-btn');
    const closeSidebarBtn = document.getElementById('close-sidebar');
    
    // Add loading animation text sequence
    const connectingTexts = ['Connecting', 'Harmonizing', 'Synchronizing', 'Aligning'];
    let textIndex = 0;

    // Animate the loading text before fading out
    const loadingTextInterval = setInterval(function() {
        if (loaderText) {
            loaderText.textContent = connectingTexts[textIndex] + '...';
            textIndex = (textIndex + 1) % connectingTexts.length;
        }
    }, 800);
    
    // Remove the loading screen after animation completes
    setTimeout(function() {
        clearInterval(loadingTextInterval);
        if (loaderText) loaderText.textContent = 'Welcome to Kyōsei';
        
        setTimeout(function() {
            loadingScreen.classList.add('fade-out');
            setTimeout(function() {
                loadingScreen.style.display = 'none';
                animateSymbioticBackground();
            }, 600);
        }, 800);
    }, 2500);
    
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

    // Define knowledge toolkit protocols to populate sidebar
    const knowledgeProtocols = [
        {
            title: "Sleep Optimization",
            icon: "🌙",
            content: `<h3>Sleep Optimization Protocol</h3>
                      <p>Enhance your sleep quality through interconnected approaches:</p>
                      <ul>
                          <li><strong>Morning Light Exposure:</strong> 10-20 minutes of morning sunlight resets your circadian rhythm</li>
                          <li><strong>Temperature Regulation:</strong> Cooler sleeping environment (65-68°F/18-20°C) facilitates deeper sleep</li>
                          <li><strong>Consistent Cycles:</strong> Regular sleep-wake times harmonize your body's internal clock</li>
                          <li><strong>Evening Wind-Down:</strong> Reduce blue light 1-2 hours before sleep to enhance melatonin production</li>
                      </ul>`
        },
        {
            title: "Stress Management",
            icon: "🧘",
            content: `<h3>Stress Management Protocol</h3>
                      <p>Develop resilience through proven techniques:</p>
                      <ul>
                          <li><strong>Breathwork:</strong> Physiological sighs (double inhale, extended exhale) calm your nervous system</li>
                          <li><strong>Temperature Contrast:</strong> Cold/heat exposure builds physical and mental adaptability</li>
                          <li><strong>Movement:</strong> Regular exercise releases tension and builds stress tolerance</li>
                          <li><strong>Presence Practice:</strong> Daily mindfulness strengthens your attention control networks</li>
                      </ul>`
        },
        {
            title: "Focus & Performance",
            icon: "🎯",
            content: `<h3>Focus & Performance Protocol</h3>
                      <p>Optimize your cognitive function:</p>
                      <ul>
                          <li><strong>Ultradian Rhythm:</strong> 90-minute focus blocks with 15-20 minute breaks align with natural attention cycles</li>
                          <li><strong>Nutrition Support:</strong> Protein, healthy fats, and complex carbs provide sustained mental energy</li>
                          <li><strong>Environment Design:</strong> Create spaces that minimize distractions and support deep work</li>
                          <li><strong>Recovery:</strong> Integrate micro-breaks with movement to restore mental capacity</li>
                      </ul>`
        },
        {
            title: "Physical Training",
            icon: "💪",
            content: `<h3>Physical Training Protocol</h3>
                      <p>Build strength and resilience through balanced approaches:</p>
                      <ul>
                          <li><strong>Zone 2 Cardio:</strong> Moderate-intensity exercise where you can maintain conversation builds cardiovascular base</li>
                          <li><strong>Resistance:</strong> Progressive overload through increased weight, reps, or density builds functional strength</li>
                          <li><strong>Recovery:</strong> Protein timing, sleep quality, and active recovery optimize adaptation</li>
                          <li><strong>Movement Variety:</strong> Diverse motion patterns prevent adaptations and build broader capacities</li>
                      </ul>`
        },
        {
            title: "Nutrition Foundations",
            icon: "🥗",
            content: `<h3>Nutrition Foundations Protocol</h3>
                      <p>Nourish your body with evidence-based approaches:</p>
                      <ul>
                          <li><strong>Time-Restricted Eating:</strong> Aligning food intake with your circadian rhythm enhances metabolic health</li>
                          <li><strong>Protein Priority:</strong> Adequate protein (1.6-2.2g/kg) supports muscle maintenance and satiety</li>
                          <li><strong>Whole Foods:</strong> Minimally processed foods provide micronutrients and support gut microbiome</li>
                          <li><strong>Hydration:</strong> Consistent water intake supports all physiological processes</li>
                      </ul>`
        }
    ];

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

    // Add event listeners for sidebar functionality
    if (toggleToolkitBtn) {
        toggleToolkitBtn.addEventListener('click', function() {
            sidebar.classList.add('active');
            sidebarOverlay.classList.add('active');
            
            // Animate sidebar elements entrance
            const sidebarItems = document.querySelectorAll('.protocol-card');
            sidebarItems.forEach((item, index) => {
                setTimeout(() => {
                    item.classList.add('active');
                }, 100 * index);
            });
        });
    }

    if (closeSidebarBtn) {
        closeSidebarBtn.addEventListener('click', closeSidebar);
    }

    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', closeSidebar);
    }

    // Function to close sidebar with animation
    function closeSidebar() {
        // Animate sidebar items exit
        const sidebarItems = document.querySelectorAll('.protocol-card');
        sidebarItems.forEach((item) => {
            item.classList.remove('active');
        });
        
        // Delay sidebar closing to allow for animations
        setTimeout(() => {
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
        }, 200);
    }

    // Populate sidebar with knowledge protocols
    function populateSidebar() {
        if (!sidebarContent) return;
        
        knowledgeProtocols.forEach((protocol, index) => {
            const card = document.createElement('div');
            card.className = 'protocol-card';
            card.innerHTML = `
                <div class="protocol-header">
                    <span class="protocol-icon">${protocol.icon}</span>
                    <h3 class="protocol-title">${protocol.title}</h3>
                </div>
                <div class="protocol-content">
                    ${protocol.content}
                </div>
            `;
            
            // Add click event to expand/collapse
            const header = card.querySelector('.protocol-header');
            header.addEventListener('click', function() {
                card.classList.toggle('expanded');
            });
            
            sidebarContent.appendChild(card);
        });
    }

    // Animate symbiotic background elements
    function animateSymbioticBackground() {
        const shapes = document.querySelectorAll('.symbiotic-shape');
        shapes.forEach((shape, index) => {
            // Set random initial positions
            const randomX = Math.random() * 100;
            const randomY = Math.random() * 100;
            shape.style.left = `${randomX}%`;
            shape.style.top = `${randomY}%`;
            
            // Set animation properties
            shape.style.animationDelay = `${index * 0.7}s`;
            shape.style.animationDuration = `${20 + (index * 5)}s`;
            
            // Add animation class
            setTimeout(() => {
                shape.classList.add('animate');
            }, 500 * index);
        });
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
        
        // Add subtle entrance animation to quiz container
        quizContainer.animate([
            { opacity: 0, transform: 'translateY(20px)' },
            { opacity: 1, transform: 'translateY(0)' }
        ], {
            duration: 800,
            easing: 'cubic-bezier(0.25, 0.8, 0.25, 1)',
            fill: 'forwards'
        });
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
            
            // Add staggered animation to options
            const options = document.querySelectorAll('.quiz-option');
            options.forEach((option, index) => {
                option.style.opacity = 0;
                option.style.transform = 'translateY(10px)';
                setTimeout(() => {
                    option.style.transition = 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)';
                    option.style.opacity = 1;
                    option.style.transform = 'translateY(0)';
                }, 50 * index);
            });
        }, 300);
    }

    // Function to update profile progress indicators with enhanced animation
    function updateProfileProgress(step) {
        // Update progress steps
        for (let i = 1; i <= 3; i++) {
            const progressStep = document.getElementById(`step-${i}`);
            const progressLabel = document.getElementById(`label-${i}`);
            
            if (!progressStep || !progressLabel) continue;
            
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
            const progressEl = document.getElementById('profile-progress');
            const labelsEl = document.getElementById('progress-labels');
            
            if (progressEl) progressEl.classList.add('complete');
            if (labelsEl) labelsEl.classList.add('complete');
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

    // Function to finish profile collection and enable chat interface
    function finishProfileCollection() {
        // Update user profile data
        userProfile.physicalVessel = currentQuizAnswers.physiology;
        userProfile.consciousIntent = currentQuizAnswers.goals;
        userProfile.dailyRhythms = currentQuizAnswers.occupation;
        userProfile.profileComplete = true;
        
        // Hide quiz elements with animation
        quizContainer.animate([
            { opacity: 1, transform: 'translateY(0)' },
            { opacity: 0, transform: 'translateY(-20px)' }
        ], {
            duration: 600,
            easing: 'cubic-bezier(0.25, 0.8, 0.25, 1)',
            fill: 'forwards'
        });
        
        setTimeout(() => {
            // Hide quiz container and show chat interface
            quizContainer.style.display = 'none';
            chatContainer.style.display = 'block';
            form.style.display = 'flex';
            
            // Animate chat container entrance
            chatContainer.animate([
                { opacity: 0, transform: 'translateY(20px)' },
                { opacity: 1, transform: 'translateY(0)' }
            ], {
                duration: 800,
                easing: 'cubic-bezier(0.25, 0.8, 0.25, 1)',
                fill: 'forwards'
            });
            
            // Animate form entrance
            form.animate([
                { opacity: 0, transform: 'translateY(20px)' },
                { opacity: 1, transform: 'translateY(0)' }
            ], {
                duration: 800,
                delay: 200,
                easing: 'cubic-bezier(0.25, 0.8, 0.25, 1)',
                fill: 'forwards'
            });
            
            // Update progress indicators
            updateProfileProgress(4);
            
            // Send profile data to AI
            sendProfileToAI();
        }, 600);
    }

    // Function to send profile data to AI
    function sendProfileToAI() {
        // Create message from profile data
        let profileMessage = "Here's my information:\n\n";
        
        // Physical data
        profileMessage += "Physical Vessel:\n";
        for (const [question, answer] of Object.entries(userProfile.physicalVessel)) {
            profileMessage += `- ${question}: ${Array.isArray(answer) ? answer.join(", ") : answer}\n`;
        }
        
        // Goals data
        profileMessage += "\nConscious Intent:\n";
        for (const [question, answer] of Object.entries(userProfile.consciousIntent)) {
            profileMessage += `- ${question}: ${Array.isArray(answer) ? answer.join(", ") : answer}\n`;
        }
        
        // Occupation data
        profileMessage += "\nDaily Rhythms:\n";
        for (const [question, answer] of Object.entries(userProfile.dailyRhythms)) {
            profileMessage += `- ${question}: ${Array.isArray(answer) ? answer.join(", ") : answer}\n`;
        }
        
        // Add to conversation history
        addUserMessage(profileMessage);
        
        // Generate AI response
        getAIResponse();
    }

    // Function to add user message to chat
    function addUserMessage(text) {
        // Add to UI
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user-message';
        messageDiv.textContent = text;
        
        // Set initial state for animation
        messageDiv.style.opacity = 0;
        messageDiv.style.transform = 'translateY(10px)';
        
        chatContainer.appendChild(messageDiv);
        
        // Animate entrance
        setTimeout(() => {
            messageDiv.style.transition = 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)';
            messageDiv.style.opacity = 1;
            messageDiv.style.transform = 'translateY(0)';
        }, 10);
        
        // Add to conversation history
        conversationHistory.push({ role: "user", parts: [{ text: text }] });
        
        // Scroll to bottom
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    // Function to add AI message to chat
    function addAIMessage(text) {
        // Add to UI
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message ai-message';
        messageDiv.innerHTML = formatAIMessage(text);
        
        // Set initial state for animation
        messageDiv.style.opacity = 0;
        messageDiv.style.transform = 'translateY(10px)';
        
        chatContainer.appendChild(messageDiv);
        
        // Animate entrance
        setTimeout(() => {
            messageDiv.style.transition = 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)';
            messageDiv.style.opacity = 1;
            messageDiv.style.transform = 'translateY(0)';
        }, 10);
        
        // Add to conversation history
        conversationHistory.push({ role: "model", parts: [{ text: text }] });
        
        // Scroll to bottom
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
    
    // Function to format AI message with rich formatting
    function formatAIMessage(text) {
        // Convert line breaks to HTML
        let formattedText = text.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>');
        
        // Wrap in paragraph
        formattedText = `<p>${formattedText}</p>`;
        
        // Format section titles and emphasis
        formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        return formattedText;
    }
    
    // Function to show "AI is thinking" indicator
    function showThinkingIndicator() {
        const thinkingDiv = document.createElement('div');
        thinkingDiv.className = 'message ai-message thinking';
        thinkingDiv.id = 'thinking-indicator';
        
        const dotsDiv = document.createElement('div');
        dotsDiv.className = 'thinking-dots';
        
        for (let i = 0; i < 3; i++) {
            const dotSpan = document.createElement('span');
            dotsDiv.appendChild(dotSpan);
        }
        
        thinkingDiv.appendChild(dotsDiv);
        chatContainer.appendChild(thinkingDiv);
        
        // Scroll to bottom
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
    
    // Function to remove thinking indicator
    function removeThinkingIndicator() {
        const indicator = document.getElementById('thinking-indicator');
        if (indicator) {
            // Fade out animation
            indicator.style.opacity = '0';
            indicator.style.transform = 'translateY(10px)';
            
            setTimeout(() => {
                indicator.remove();
            }, 300);
        }
    }
    
    // Function to get AI response
    async function getAIResponse() {
        // Show thinking indicator
        showThinkingIndicator();
        
        try {
            // Prepare request
            const requestBody = {
                history: conversationHistory
            };
            
            // Make API call
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });
            
            // Process response
            const data = await response.json();
            
            // Remove thinking indicator
            removeThinkingIndicator();
            
            if (data.error) {
                console.error('API Error:', data.error);
                addAIMessage('I apologize, but I encountered an issue processing your request. Please try again later.');
            } else {
                // Add AI message to chat
                addAIMessage(data.aiResponse);
            }
        } catch (error) {
            console.error('Chat Error:', error);
            
            // Remove thinking indicator
            removeThinkingIndicator();
            
            // Show error message
            addAIMessage('I apologize, but I encountered an issue connecting to the server. Please check your internet connection and try again.');
        }
    }
    
    // Initialize the app
    function init() {
        // Populate the sidebar with knowledge protocols
        populateSidebar();
        
        // Start profile collection once loading screen is gone
        setTimeout(() => {
            startProfileCollection();
        }, 3000);

        // Add form submit event listener
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const userText = input.value.trim();
            
            if (userText) {
                // Add user message
                addUserMessage(userText);
                
                // Clear input
                input.value = '';
                
                // Get AI response
                getAIResponse();
            }
        });
        
        // Add input animations
        input.addEventListener('focus', function() {
            form.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            form.classList.remove('focused');
        });
        
        // Enable offline detection
        window.addEventListener('online', function() {
            if (chatContainer.style.display === 'block') {
                addAIMessage("I notice you're back online. How can I assist you further?");
            }
        });
        
        window.addEventListener('offline', function() {
            if (chatContainer.style.display === 'block') {
                addAIMessage("It seems you've gone offline. Your previous interactions are saved, and I'll be here when your connection returns.");
            }
        });
    }

    // Initialize the app
    init();
});
