// Enhanced script.js with complete functionality

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
    
    // Loading animation text sequence
    const connectingTexts = ['Connecting', 'Processing', 'Analyzing', 'Preparing'];
    let textIndex = 0;

    // Add loading animation text sequence with proper fallback
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
            if (loadingScreen) {
                loadingScreen.classList.add('fade-out');
                setTimeout(function() {
                    if (loadingScreen) {
                        loadingScreen.style.display = 'none';
                    }
                    animateSymbioticBackground();
                    // Explicitly start profile collection after loading screen is removed
                    startProfileCollection();
                }, 600);
            }
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

    // Store conversation history
    let conversationHistory = [
        { role: "user", parts: [{ text: "Welcome!" }] },
        { role: "model", parts: [{ text: "Welcome! To provide you with personalized health and fitness guidance, I'd like to learn a bit about you first.\n\nCould you please share some details about your physical vessel such as your age, height, weight, and any health conditions or limitations you may have?" }] },
    ];

    // Enhanced quiz questions with more personalized options
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
                options: ["None", "High blood pressure", "Diabetes", "Joint pain/arthritis", "Back problems", "Heart condition", "Respiratory issues", "Digestive disorders", "Hormonal imbalances", "Autoimmune conditions"],
                allowCustom: true,
                customLabel: "Enter other health conditions",
                allowMultiple: true
            },
            {
                question: "How would you describe your current energy levels?",
                type: "select",
                options: ["Very low - Frequently exhausted", "Low - Often tired", "Moderate - Occasional fatigue", "Good - Mostly energetic", "Excellent - Consistently energetic"]
            }
        ],
        goals: [
            {
                question: "What are your primary wellness goals?",
                type: "select",
                options: ["Weight management", "Muscle development", "Cardiovascular health", "Flexibility & mobility", "Energy optimization", "Stress reduction", "Sleep improvement", "Cognitive performance", "Longevity & healthspan"],
                allowMultiple: true
            },
            {
                question: "How would you describe your current fitness level?",
                type: "select",
                options: ["Beginner - New to structured exercise", "Novice - Exercise occasionally", "Intermediate - Regular activity", "Advanced - Consistent training", "Athletic - Sport-specific training"]
            },
            {
                question: "Which aspects of your physical capacity would you like to develop?",
                type: "select",
                options: ["Strength", "Endurance", "Speed", "Power", "Balance", "Coordination", "Flexibility", "Metabolic efficiency"],
                allowMultiple: true
            }
        ],
        lifestyle: [
            {
                question: "What is your occupation or primary daily activity?",
                type: "select",
                options: ["Office/Desk work", "Physical/Manual labor", "Healthcare", "Education", "Service industry", "Remote/Work from home", "Student", "Retired", "Caregiver"],
                allowCustom: true,
                customLabel: "Enter your specific occupation"
            },
            {
                question: "How would you describe your typical daily movement pattern?",
                type: "select",
                options: ["Mostly sedentary (sitting)", "Light activity (occasional walking)", "Moderate activity (regular walking/standing)", "Active (frequent movement)", "Very active (constant movement)"]
            },
            {
                question: "What is your typical sleep schedule?",
                type: "select",
                options: ["Early riser (5-6am wake)", "Standard schedule (6-8am wake)", "Later schedule (8-10am wake)", "Night owl (10am+ wake)", "Irregular/shift work pattern"]
            }
        ]
    };

    // Define knowledge toolkit protocols
    const knowledgeProtocols = [
        {
            title: "Sleep Optimization",
            icon: "S",
            content: `<h3>Sleep Optimization</h3>
                    <p>Enhance sleep quality through evidence-based approaches:</p>
                    <ul>
                        <li><strong>Circadian Entrainment:</strong> 10-20 minutes of morning sunlight exposure to regulate melatonin production</li>
                        <li><strong>Temperature Regulation:</strong> Cooler sleeping environment (65-68°F/18-20°C) facilitates deeper slow-wave sleep</li>
                        <li><strong>Consistent Schedule:</strong> Regular sleep-wake times stabilize circadian rhythm and optimize sleep architecture</li>
                        <li><strong>Evening Wind-Down:</strong> Reduce blue light exposure 1-2 hours before sleep to enhance melatonin production</li>
                    </ul>
                    <button class="inquire-button" data-protocol="Sleep Optimization">Inquire about this protocol</button>`
        },
        {
            title: "Stress Management",
            icon: "SM",
            content: `<h3>Stress Management</h3>
                    <p>Develop resilience through validated techniques:</p>
                    <ul>
                        <li><strong>Respiratory Regulation:</strong> Physiological sighs (double inhale, extended exhale) downregulate sympathetic activation</li>
                        <li><strong>Thermal Exposure:</strong> Cold/heat exposure triggers beneficial hormetic stress response and adaptation</li>
                        <li><strong>Targeted Exercise:</strong> Regular physical activity optimizes cortisol regulation and HPA axis function</li>
                        <li><strong>Attentional Control:</strong> Structured mindfulness practice enhances prefrontal regulation of limbic response</li>
                    </ul>
                    <button class="inquire-button" data-protocol="Stress Management">Inquire about this protocol</button>`
        },
        {
            title: "Focus & Performance",
            icon: "FP",
            content: `<h3>Focus & Performance</h3>
                    <p>Optimize cognitive function through validated methods:</p>
                    <ul>
                        <li><strong>Ultradian Rhythm Management:</strong> 90-minute focus blocks with 15-20 minute breaks align with natural attention cycles</li>
                        <li><strong>Nutritional Support:</strong> Protein, healthy fats, and complex carbohydrates provide optimal substrate for neurotransmitter production</li>
                        <li><strong>Environment Optimization:</strong> Structured workspace minimizes attentional switching costs and supports sustained focus</li>
                        <li><strong>Recovery Integration:</strong> Strategic micro-breaks with movement maintain prefrontal energy reserves</li>
                    </ul>
                    <button class="inquire-button" data-protocol="Focus & Performance">Inquire about this protocol</button>`
        },
        {
            title: "Physical Training",
            icon: "PT",
            content: `<h3>Physical Training</h3>
                    <p>Build capacity through validated training principles:</p>
                    <ul>
                        <li><strong>Zone 2 Cardiovascular Training:</strong> Moderate-intensity exercise at ventilatory threshold 1 maximizes mitochondrial development</li>
                        <li><strong>Resistance Training:</strong> Progressive tension overload through periodized programming optimizes muscle adaptation</li>
                        <li><strong>Recovery Optimization:</strong> Strategic protein timing, sleep hygiene, and parasympathetic activation enhance adaptation response</li>
                        <li><strong>Movement Pattern Diversity:</strong> Varied stimulus prevents adaptation plateaus and builds broader movement competency</li>
                    </ul>
                    <button class="inquire-button" data-protocol="Physical Training">Inquire about this protocol</button>`
        },
        {
            title: "Nutrition Foundations",
            icon: "NF",
            content: `<h3>Nutrition Foundations</h3>
                    <p>Optimize physiological function through evidence-based nutrition:</p>
                    <ul>
                        <li><strong>Time-Restricted Feeding:</strong> Aligning food intake with circadian rhythm enhances metabolic flexibility and autophagy</li>
                        <li><strong>Protein Optimization:</strong> Strategic protein distribution (1.6-2.2g/kg) supports muscle protein synthesis and satiety</li>
                        <li><strong>Whole Food Prioritization:</strong> Minimally processed foods maximize micronutrient density and support gut microbiome diversity</li>
                        <li><strong>Hydration Strategy:</strong> Consistent water intake supports optimal cellular function and metabolic processes</li>
                    </ul>
                    <button class="inquire-button" data-protocol="Nutrition Foundations">Inquire about this protocol</button>`
        }
    ];

    // Animate symbiotic background elements
    function animateSymbioticBackground() {
        const shapes = document.querySelectorAll('.symbiotic-shape');
        if (!shapes || shapes.length === 0) return;
        
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
        if (form) form.style.display = 'none';
        if (quizContainer) quizContainer.style.display = 'block';
        
        // Initialize the first question
        showCurrentQuizQuestion();
        
        // Update progress indicators
        updateProfileProgress(1);
        
        // Add subtle entrance animation to quiz container
        if (quizContainer) {
            quizContainer.animate([
                { opacity: 0, transform: 'translateY(20px)' },
                { opacity: 1, transform: 'translateY(0)' }
            ], {
                duration: 800,
                easing: 'cubic-bezier(0.25, 0.8, 0.25, 1)',
                fill: 'forwards'
            });
        }
    }
    
    // Current quiz data
    let currentQuizSection = 'physiology';
    let currentQuizQuestionIndex = 0;
    let currentQuizAnswers = {};

    // Function to show the current quiz question with enhanced animation
    function showCurrentQuizQuestion() {
        if (!quizContainer) return;
        
        const questions = quizQuestions[currentQuizSection];
        if (!questions || !questions[currentQuizQuestionIndex]) return;
        
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
        
        // Apply transition animation
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

    // Make these functions global so they can be accessed from inline HTML events
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
    window.handleCustomInput = function(inputElement) {
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
    };

    // Function to submit quiz answer and move to next question with enhanced transition
    window.submitQuizAnswer = function() {
        const questions = quizQuestions[currentQuizSection];
        if (!questions) return;
        
        const currentQuestion = questions[currentQuizQuestionIndex];
        if (!currentQuestion) return;
        
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
            const customInput = document.getElementById('custom-quiz-input');
            answer = customInput ? customInput.value.trim() : null;
        }
        
        // Store answer
        if (!currentQuizAnswers[currentQuizSection]) {
            currentQuizAnswers[currentQuizSection] = [];
        }
        currentQuizAnswers[currentQuizSection][currentQuizQuestionIndex] = answer;
        
        // Move to next question or section
        currentQuizQuestionIndex++;
        
        if (currentQuizQuestionIndex >= questions.length) {
            // Move to next section or complete the quiz
            currentQuizQuestionIndex = 0;
            
            if (currentQuizSection === 'physiology') {
                currentQuizSection = 'goals';
                updateProfileProgress(2);
                showCurrentQuizQuestion();
            } else if (currentQuizSection === 'goals') {
                currentQuizSection = 'lifestyle';
                updateProfileProgress(3);
                showCurrentQuizQuestion();
            } else {
                // Quiz complete - process all answers
                completeQuiz();
            }
        } else {
            // Show next question in current section
            showCurrentQuizQuestion();
        }
    };

    // Function to complete the quiz and transition to chat interface
    function completeQuiz() {
        // Store profile data
        userProfile = {
            physicalVessel: currentQuizAnswers.physiology || {},
            consciousIntent: currentQuizAnswers.goals || {},
            dailyRhythms: currentQuizAnswers.lifestyle || {},
            profileComplete: true
        };
        
        // Hide quiz container with fade-out animation
        if (quizContainer) {
            quizContainer.style.opacity = '0';
            quizContainer.style.transform = 'translateY(-20px)';
            
            setTimeout(() => {
                quizContainer.style.display = 'none';
                
                // Show chat container with fade-in animation
                if (chatContainer) {
                    chatContainer.style.display = 'block';
                    chatContainer.style.opacity = '0';
                    chatContainer.style.transform = 'translateY(20px)';
                    
                    setTimeout(() => {
                        chatContainer.style.opacity = '1';
                        chatContainer.style.transform = 'translateY(0)';
                        
                        // Add initial AI message
                        addInitialAIMessage();
                    }, 100);
                }
                
                // Show form with fade-in animation
                if (form) {
                    form.style.display = 'flex';
                    form.style.opacity = '0';
                    form.style.transform = 'translateY(20px)';
                    
                    setTimeout(() => {
                        form.style.opacity = '1';
                        form.style.transform = 'translateY(0)';
                    }, 150);
                }
                
                // Show toolkit button with fade-in animation
                if (toggleToolkitBtn) {
                    toggleToolkitBtn.style.display = 'block';
                    toggleToolkitBtn.style.opacity = '0';
                    toggleToolkitBtn.style.transform = 'translateY(20px)';
                    
                    setTimeout(() => {
                        toggleToolkitBtn.style.opacity = '1';
                        toggleToolkitBtn.style.transform = 'translateY(0)';
                    }, 200);
                }
                
                // Populate toolkit sidebar
                populateSidebar();
                
                // Hide progress steps
                updateProfileProgress(4);
            }, 300);
        }
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
            if (sidebar) sidebar.classList.remove('active');
            if (sidebarOverlay) sidebarOverlay.classList.remove('active');
        }, 200);
    }

    // Populate sidebar with knowledge protocols
    function populateSidebar() {
        if (!sidebarContent) return;
        
        // Clear any existing content first
        sidebarContent.innerHTML = '';
        
        knowledgeProtocols.forEach((protocol, index) => {
            const card = document.createElement('div');
            card.className = 'protocol-card';
            card.innerHTML = `
                <div class="protocol-header">
                    <div class="protocol-icon">${protocol.icon}</div>
                    <h3 class="protocol-title">${protocol.title}</h3>
                </div>
                <div class="protocol-content">
                    ${protocol.content}
                </div>
            `;
            
            // Add click event to expand/collapse
            const header = card.querySelector('.protocol-header');
            if (header) {
                header.addEventListener('click', function() {
                    card.classList.toggle('expanded');
                });
            }
            
            sidebarContent.appendChild(card);
        });
        
        // Add event listeners to all inquire buttons
        document.querySelectorAll('.inquire-button').forEach(button => {
            button.addEventListener('click', function(e) {
                e.stopPropagation(); // Prevent the expand/collapse from triggering
                const protocol = this.getAttribute('data-protocol');
                inquireAboutProtocol(protocol);
                closeSidebar();
            });
        });
    }

    // Function to handle protocol inquiries
    function inquireAboutProtocol(protocolName) {
        if (!protocolName) return;
        const inquiryMessage = `I'd like to learn more about the ${protocolName} protocol.`;
        
        // Add user message to chat
        addUserMessage(inquiryMessage);
        
        // Get AI response
        getAIResponse(inquiryMessage);
    }
    
    // Add initial AI message based on collected profile data
    function addInitialAIMessage() {
        let initialMessage = "Thank you for completing your profile. Based on the information you've shared, I can now provide personalized wellness guidance tailored to your specific needs.";
        
        initialMessage += "\n\nWhat specific aspect of your wellness journey would you like to focus on today?";
        
        // Add to chat
        addAIMessage(initialMessage);
    }
    
    // Function to add user message to chat
    function addUserMessage(text) {
        if (!text || !chatContainer) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user-message';
        messageDiv.textContent = text;
        
        chatContainer.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
    
    // Function to add AI message to chat
    function addAIMessage(text) {
        if (!text || !chatContainer) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message ai-message';
        
        // Convert newlines to paragraphs
        const paragraphs = text.split('\n\n');
        paragraphs.forEach(paragraph => {
            if (paragraph.trim() !== '') {
                const p = document.createElement('p');
                p.textContent = paragraph;
                messageDiv.appendChild(p);
            }
        });
        
        chatContainer.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
    
    // Function to show AI is thinking
    function showThinking() {
        if (!chatContainer) return null;
        
        const thinkingDiv = document.createElement('div');
        thinkingDiv.className = 'message ai-message thinking';
        thinkingDiv.innerHTML = `
            <div class="thinking-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        
        chatContainer.appendChild(thinkingDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        
        return thinkingDiv;
    }
    
    // Function to get AI response
    function getAIResponse(userMessage) {
        // Show thinking indicator
        const thinkingDiv = showThinking();
        
        // Simulate API call with a delay
        setTimeout(() => {
            // Remove thinking indicator
            if (thinkingDiv && thinkingDiv.parentNode) {
                thinkingDiv.parentNode.removeChild(thinkingDiv);
            }
            
            // Generate appropriate response based on user message
            let aiResponse = generateResponse(userMessage);
            
            // Add AI response to chat
            addAIMessage(aiResponse);
        }, 1500);
    }
    
    // Function to generate appropriate response (simulated AI logic)
    function generateResponse(userMessage) {
        if (!userMessage) return "I'm not sure I understand. Could you please clarify your question?";
        
        const lowerMessage = userMessage.toLowerCase();
        
        // Check for protocol inquiries
        if (lowerMessage.includes('sleep optimization')) {
            return "Sleep optimization is a foundational protocol that enhances cognitive performance, recovery, and overall health.\n\nThe protocol consists of four key components:\n\n1. Circadian Entrainment: Morning sunlight exposure (5-10 minutes, ideally within 30-60 minutes of waking) signals your SCN to properly regulate melatonin production later in the day. This enhances sleep onset and quality.\n\n2. Temperature Regulation: Maintaining a sleeping environment between 65-68°F (18-20°C) facilitates core temperature drops necessary for deep sleep. Consider using cooling mattress pads or adjusting ambient temperature.\n\n3. Consistent Schedule: Maintaining regular sleep-wake times stabilizes your circadian rhythm, optimizing sleep architecture and hormonal cascades that regulate energy and recovery.\n\n4. Evening Wind-Down: Implementing a 30-60 minute pre-sleep routine that reduces blue light exposure, minimizes psychological activation, and prepares your nervous system for restorative sleep.\n\nWould you like me to create a personalized sleep optimization protocol based on your specific profile?";
        }
        
        if (lowerMessage.includes('stress management')) {
            return "Stress management is a protocol designed to enhance resilience through regulated exposure to beneficial stressors while minimizing chronic, unproductive stress.\n\nThe protocol consists of four evidence-based pillars:\n\n1. Respiratory Regulation: The physiological sigh (double inhale through nose followed by extended exhale through mouth) activates parasympathetic response by influencing the vagus nerve, rapidly reducing stress hormone circulation.\n\n2. Thermal Exposure: Strategic exposure to cold (cold showers, ice baths) or heat (sauna sessions) triggers beneficial hormetic stress responses that improve stress resilience over time by enhancing mitochondrial function and stress protein expression.\n\n3. Exercise Calibration: Physical activity optimizes cortisol regulation through appropriate intensity and timing. Zone 2 cardio is particularly effective for balancing sympathetic/parasympathetic activity.\n\n4. Attentional Control: Structured mindfulness practices enhance prefrontal regulation of the amygdala and other limbic structures, improving emotional regulation and stress response management.\n\nWould you like a customized stress management protocol based on your specific needs and constraints?";
        }
        
        if (lowerMessage.includes('nutrition')) {
            return "Nutrition is foundational to all physiological functions and optimization efforts. The Nutrition Foundations protocol is based on four evidence-based principles:\n\n1. Time-Restricted Feeding: Aligning your eating window with your circadian rhythm (typically 8-10 hours) enhances metabolic flexibility, autophagy, and cellular repair mechanisms. This approach optimizes insulin sensitivity and mitochondrial function.\n\n2. Protein Optimization: Strategic protein distribution (1.6-2.2g/kg of body weight) throughout your eating window supports muscle protein synthesis, neurotransmitter production, and satiety signaling. Emphasis on complete protein sources ensures adequate essential amino acid intake.\n\n3. Whole Food Prioritization: Focusing on minimally processed foods maximizes micronutrient density and supports gut microbiome diversity. This approach ensures adequate phytonutrient intake and fiber consumption, which regulate inflammation and support metabolic health.\n\n4. Hydration Strategy: Consistent water intake supports optimal cellular function, nutrient transport, and metabolic processes. Electrolyte balance is particularly important for neural function and physical performance.\n\nWould you like me to develop a personalized nutrition approach based on your specific goals and current patterns?";
        }
        
        // Generic response for other queries
        return "Thank you for your question. Based on evidence-based principles, I can help you implement strategies that support your specific wellness goals.\n\nRemember that the most effective approaches focus on consistency, progressive adaptation, and alignment with your unique physiological needs.\n\nCould you share more about what specific outcomes you're looking to achieve in this area? This will help me provide more targeted, evidence-based guidance.";
    }
    
    // Set up form submission
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (input && input.value.trim() !== '') {
                const userMessage = input.value.trim();
                
                // Add user message to chat
                addUserMessage(userMessage);
                
                // Clear input
                input.value = '';
                
                // Get AI response
                getAIResponse(userMessage);
            }
        });
    }
    
    // Add focus/blur events to input form for styling
    if (input) {
        input.addEventListener('focus', function() {
            if (form) form.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            if (form) form.classList.remove('focused');
        });
    }
    
    // Add event listener for the toolkit button
    if (toggleToolkitBtn) {
        toggleToolkitBtn.addEventListener('click', function() {
            if (sidebar) sidebar.classList.add('active');
            if (sidebarOverlay) sidebarOverlay.classList.add('active');
            
            // Animate sidebar elements entrance
            const sidebarItems = document.querySelectorAll('.protocol-card');
            sidebarItems.forEach((item, index) => {
                setTimeout(() => {
                    item.classList.add('active');
                }, 100 * index);
            });
        });
    }

    // Add event listener for closing sidebar
    if (closeSidebarBtn) {
        closeSidebarBtn.addEventListener('click', closeSidebar);
    }

    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', closeSidebar);
    }
});

// Initialize current year in footer
document.addEventListener('DOMContentLoaded', function() {
    const currentYearElement = document.getElementById('current-year');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }
});
