// Enhanced script.js with improved functionality

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

    // Store conversation history
    let conversationHistory = [];

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
                        
                        // Add initial personalized recommendations based on quiz data
                        addPersonalizedRecommendations();
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
        getAIResponse(inquiryMessage, true); // Pass true to indicate this is a protocol request
    }
    
    // NEW FUNCTION: Generate personalized recommendations based on quiz data
    function addPersonalizedRecommendations() {
        // Start with a welcoming message
        let welcomeMessage = "Thank you for completing your profile. Based on your responses, I've created a personalized wellness plan for you.";
        addAIMessage(welcomeMessage);
        
        // Show thinking indicator while "processing" the profile
        const thinkingDiv = showThinking();
        
        // Simulate processing time for better UX
        setTimeout(() => {
            // Remove thinking indicator
            if (thinkingDiv && thinkingDiv.parentNode) {
                thinkingDiv.parentNode.removeChild(thinkingDiv);
            }
            
            // Generate personalized recommendations
            const recommendations = generatePersonalizedRecommendations();
            addAIMessage(recommendations);
        }, 1500);
    }
    
    // NEW FUNCTION: Generate personalized recommendations based on quiz data
    function generatePersonalizedRecommendations() {
        let recommendations = "";
        
        // Extract key information from the profile
        const age = userProfile.physicalVessel[0] || "Unknown";
        const goalsList = Array.isArray(userProfile.consciousIntent[0]) 
            ? userProfile.consciousIntent[0] 
            : [userProfile.consciousIntent[0] || "General wellness"];
        const fitnessLevel = userProfile.consciousIntent[1] || "Unknown";
        const healthConditions = Array.isArray(userProfile.physicalVessel[3]) 
            ? userProfile.physicalVessel[3] 
            : [userProfile.physicalVessel[3] || "None"];
        const energyLevel = userProfile.physicalVessel[4] || "Unknown";
        const activityLevel = userProfile.dailyRhythms[1] || "Unknown";
        const sleepPattern = userProfile.dailyRhythms[2] || "Unknown";
        
        // Create personalized overview
        recommendations += `Based on your profile, I see you're in the ${age} age range with ${
            healthConditions.includes("None") ? "no reported health conditions" : "the following health considerations: " + healthConditions.join(", ")
        }. You describe your current energy levels as "${energyLevel}" and your fitness level as "${fitnessLevel}".`;
        
        recommendations += `\n\nYour primary wellness goals include: ${goalsList.join(", ")}, and your daily activity level is "${activityLevel}" with a "${sleepPattern}" sleep pattern.`;
        
        // Core recommendations section
        recommendations += "\n\n🔍 PERSONALIZED RECOMMENDATIONS:";
        
        // Add goal-specific recommendations
        if (goalsList.includes("Weight management")) {
            recommendations += "\n\n1️⃣ METABOLISM OPTIMIZATION:";
            recommendations += "\n• Implement time-restricted eating (10-hour window) aligned with your circadian rhythm";
            recommendations += "\n• Prioritize protein intake (1.6-2.2g/kg) with emphasis on complete protein sources";
            recommendations += "\n• Incorporate Zone 2 cardio training (moderate intensity where conversation is still possible) 3-4x weekly";
            
            if (activityLevel.includes("sedentary") || activityLevel.includes("Light activity")) {
                recommendations += "\n• Add 2-3 daily movement breaks (3-5 minutes each) to counteract prolonged sitting";
            }
        }
        
        if (goalsList.includes("Muscle development") || goalsList.includes("Strength")) {
            recommendations += "\n\n2️⃣ STRENGTH DEVELOPMENT:";
            recommendations += "\n• Progressive resistance training 3-4x weekly with 48h recovery between muscle groups";
            recommendations += "\n• Focus on compound movements (squat, hinge, push, pull) for optimal hormonal response";
            recommendations += "\n• Strategic protein timing (0.3-0.4g/kg within 2 hours post-training)";
            
            if (fitnessLevel.includes("Beginner") || fitnessLevel.includes("Novice")) {
                recommendations += "\n• Begin with bodyweight competency before adding external load";
            } else {
                recommendations += "\n• Implement periodized approach with volume/intensity manipulation";
            }
        }
        
        if (goalsList.includes("Sleep improvement") || sleepPattern.includes("Irregular") || energyLevel.includes("Low") || energyLevel.includes("Very low")) {
            recommendations += "\n\n3️⃣ SLEEP OPTIMIZATION:";
            recommendations += "\n• Morning light exposure (5-10 minutes) within 30-60 minutes of waking";
            recommendations += "\n• Evening temperature reduction (65-68°F/18-20°C) for optimal deep sleep";
            recommendations += "\n• Digital sunset protocol (blue light reduction 2-3 hours before bed)";
            recommendations += "\n• Consistent sleep/wake schedule even on weekends (±30 minute variance)";
        }
        
        if (goalsList.includes("Stress reduction") || healthConditions.includes("High blood pressure") || energyLevel.includes("Low")) {
            recommendations += "\n\n4️⃣ STRESS REGULATION:";
            recommendations += "\n• Physiological sigh practice 3x daily (double inhale through nose, extended exhale through mouth)";
            recommendations += "\n• Strategic low-intensity movement upon waking and during afternoon energy dips";
            recommendations += "\n• Attentional control training (structured mindfulness) starting with 5 minutes daily";
            
            if (fitnessLevel.includes("Intermediate") || fitnessLevel.includes("Advanced") || fitnessLevel.includes("Athletic")) {
                recommendations += "\n• Consider hormetic stress exposure (cold/heat contrast) for enhanced resilience";
            }
        }
        
        if (goalsList.includes("Cognitive performance") || goalsList.includes("Energy optimization")) {
            recommendations += "\n\n5️⃣ COGNITIVE ENHANCEMENT:";
            recommendations += "\n• Ultradian rhythm alignment (90min focused work with 15-20min complete breaks)";
            recommendations += "\n• Strategic protein/fat consumption for sustained attention and mental energy";
            recommendations += "\n• Dual-task inhibition (removal of attention-splitting triggers during deep work)";
            
            if (activityLevel.includes("sedentary") || activityLevel.includes("Light activity")) {
                recommendations += "\n• Movement integration (stand/walk during calls, movement micro-breaks)";
            }
        }
        
        // Add conclusion with next steps
        recommendations += "\n\n🔄 IMPLEMENTATION STRATEGY:";
        recommendations += "\n\nStart with implementing 2-3 of these recommendations that align most closely with your primary goals. Focus on consistency over perfection, and progressively integrate additional components as the initial changes become habitual.";
        recommendations += "\n\nWould you like me to provide more specific details about any of these recommendation areas or create a structured implementation plan for the coming week?";
        
        return recommendations;
    }
    
    // Function to add user message to chat
    function addUserMessage(text) {
        if (!text || !chatContainer) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user-message';
        messageDiv.textContent = text;
        
        chatContainer.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        
        // Add to conversation history
        conversationHistory.push({
            role: "user",
            parts: [{ text: text }]
        });
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
                
                // Handle bullet points with proper formatting
                if (paragraph.includes('\n•')) {
                    const bulletPoints = paragraph.split('\n•');
                    const headerText = bulletPoints[0];
                    
                    if (headerText) {
                        const header = document.createElement('strong');
                        header.textContent = headerText;
                        p.appendChild(header);
                        p.appendChild(document.createElement('br'));
                    }
                    
                    for (let i = 1; i < bulletPoints.length; i++) {
                        const bulletPoint = document.createElement('div');
                        bulletPoint.className = 'bullet-point';
                        bulletPoint.innerHTML = `• ${bulletPoints[i]}`;
                        p.appendChild(bulletPoint);
                    }
                } else {
                    p.textContent = paragraph;
                }
                
                messageDiv.appendChild(p);
            }
        });
        
        chatContainer.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        
        // Add to conversation history
        conversationHistory.push({
            role: "model",
            parts: [{ text: text }]
        });
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
    function getAIResponse(userMessage, isProtocolRequest = false) {
        // Show thinking indicator
        const thinkingDiv = showThinking();
        
        // Simulate API call with a delay
        setTimeout(() => {
            // Remove thinking indicator
            if (thinkingDiv && thinkingDiv.parentNode) {
                thinkingDiv.parentNode.removeChild(thinkingDiv);
            }
            
            // Generate appropriate response based on user message and profile data
            let aiResponse = generateResponse(userMessage, isProtocolRequest);
            
            // Add AI response to chat
            addAIMessage(aiResponse);
        }, 1500);
    }
    
    // Function to generate appropriate response (simulated AI logic with profile awareness)
    function generateResponse(userMessage, isProtocolRequest = false) {
        if (!userMessage) return "I'm not sure I understand. Could you please clarify your question?";
        
        const lowerMessage = userMessage.toLowerCase();
        
        // Check if this is a protocol inquiry
        if (isProtocolRequest || lowerMessage.includes('protocol')) {
            if (lowerMessage.includes('sleep optimization')) {
                return generateProtocolResponse('sleep', userProfile);
            }
            
            if (lowerMessage.includes('stress management')) {
                return generateProtocolResponse('stress', userProfile);
            }
            
            if (lowerMessage.includes('focus') || lowerMessage.includes('performance')) {
                return generateProtocolResponse('focus', userProfile);
            }
            
            if (lowerMessage.includes('physical training') || lowerMessage.includes('exercise')) {
                return generateProtocolResponse('training', userProfile);
            }
            
            if (lowerMessage.includes('nutrition')) {
                return generateProtocolResponse('nutrition', userProfile);
            }
        }
        
        // Check for goal-specific queries
        if (lowerMessage.includes('weight') || lowerMessage.includes('fat loss') || lowerMessage.includes('metabolism')) {
            return generateGoalSpecificResponse('weight', userProfile);
        }
        
        if (lowerMessage.includes('muscle') || lowerMessage.includes('strength') || lowerMessage.includes('build')) {
            return generateGoalSpecificResponse('muscle', userProfile);
        }
        
        if (lowerMessage.includes('sleep') || lowerMessage.includes('rest') || lowerMessage.includes('tired')) {
            return generateGoalSpecificResponse('sleep', userProfile);
        }
        
        if (lowerMessage.includes('stress') || lowerMessage.includes('anxiety') || lowerMessage.includes('relax')) {
            return generateGoalSpecificResponse('stress', userProfile);
        }
        
        if (lowerMessage.includes('focus') || lowerMessage.includes('energy') || lowerMessage.includes('productivity')) {
            return generateGoalSpecificResponse('focus', userProfile);
        }
        
        // Check for implementation questions
        if (lowerMessage.includes('plan') || lowerMessage.includes('schedule') || lowerMessage.includes('implement')) {
            return generateImplementationResponse(userProfile);
        }
        
        // Check for progress-related questions
        if (lowerMessage.includes('progress') || lowerMessage.includes('track') || lowerMessage.includes('measure')) {
            return generateProgressTrackingResponse(userProfile);
        }
        
        // Generic response with profile awareness
        return generateGenericResponse(userProfile);
    }
    
    // NEW FUNCTION: Generate protocol-specific personalized response
    function generateProtocolResponse(protocolType, profile) {
        // Extract relevant profile data for personalization
        const fitnessLevel = profile.consciousIntent[1] || "Intermediate";
        const activityLevel = profile.dailyRhythms[1] || "Moderate activity";
        const sleepPattern = profile.dailyRhythms[2] || "Standard schedule";
        const healthConditions = Array.isArray(profile.physicalVessel[3]) ? profile.physicalVessel[3] : [profile.physicalVessel[3] || "None"];
        
        let response = "";
        
        switch(protocolType) {
            case 'sleep':
                response = "Based on your profile, here's a personalized Sleep Optimization protocol:\n\n";
                response += "1. CIRCADIAN ENTRAINMENT:\n";
                
                if (sleepPattern.includes("Early riser")) {
                    response += "• Morning light exposure: 5-10 minutes of direct sunlight immediately upon waking (ideally before 7am)";
                } else if (sleepPattern.includes("Night owl") || sleepPattern.includes("Later schedule")) {
                    response += "• Morning light exposure: 10-15 minutes of direct sunlight within 30 minutes of waking (critical for phase-advancing your circadian rhythm)";
                } else {
                    response += "• Morning light exposure: 5-10 minutes of direct sunlight within 30-60 minutes of waking";
                }
                
                response += "\n\n2. TEMPERATURE REGULATION:\n";
                response += "• Set bedroom temperature to 65-68°F (18-20°C) in the evening";
                response += "\n• Consider a cooling mattress pad or light, breathable bedding";
                
                if (healthConditions.includes("Hot flashes") || healthConditions.includes("Night sweats")) {
                    response += "\n• Layer bedding for easy removal during night interruptions";
                }
                
                response += "\n\n3. SCHEDULE CONSISTENCY:\n";
                
                if (sleepPattern.includes("Irregular")) {
                    response += "• Prioritize wake-up time consistency rather than bedtime initially - set a fixed wake time 7 days/week";
                    response += "\n• Gradually shift bedtime earlier by 15-minute increments weekly";
                } else {
                    response += "• Maintain consistent sleep-wake times (±30 minute variance) even on weekends";
                    response += "\n• Align sleep timing with natural circadian tendency when possible";
                }
                
                response += "\n\n4. EVENING WIND-DOWN:\n";
                response += "• Begin reducing blue light exposure 2-3 hours before bed (screen filters, dimmed lights)";
                response += "\n• Establish a 20-30 minute pre-sleep routine that includes:";
                response += "\n  - Light stretching or relaxation breathing (physiological sighs)";
                response += "\n  - Avoiding work-related or stimulating content";
                
                if (activityLevel.includes("sedentary") || activityLevel.includes("Light activity")) {
                    response += "\n  - Brief evening walk (10-15 minutes) 2-3 hours before bed to deepen subsequent sleep";
                }
                
                response += "\n\nWould you like a day-by-day implementation guide for this protocol based on your specific schedule?";
                break;
                
            case 'stress':
                response = "Based on your profile, here's a personalized Stress Management protocol:\n\n";
                response += "1. RESPIRATORY REGULATION:\n";
                response += "• Physiological sigh practice: Double inhale through nose followed by extended exhale through mouth";
                response += "\n• Strategic timing: 3-5 cycles upon waking, before meals, and during high-stress periods";
                response += "\n• Autonomic reset: 30-second practice immediately following stress triggers";
                
                response += "\n\n2. THERMAL EXPOSURE:\n";
                
                if (fitnessLevel.includes("Beginner") || fitnessLevel.includes("Novice")) {
                    response += "• Begin with contrast showering: 60 seconds warm, 15-30 seconds cool, repeat 3-4 cycles";
                    response += "\n• Progress gradually to colder temperatures as adaptation occurs";
                } else {
                    response += "• Cold exposure: 2-3 minute cold shower (55-60°F) in the morning";
                    response += "\n• Heat exposure: 15-20 minutes sauna session (if available) 2-3x weekly";
                    response += "\n• Contrast approach: Alternating between thermal extremes for enhanced adaptation";
                }
                
                response += "\n\n3. MOVEMENT INTEGRATION:\n";
                
                if (activityLevel.includes("sedentary") || activityLevel.includes("Light activity")) {
                    response += "• Morning activation: 5 minutes of gentle movement immediately after waking";
                    response += "\n• Workday integration: 2-minute movement breaks every 60-90 minutes";
                    response += "\n• Focus on joint mobility and sympathetic downregulation";
                } else {
                    response += "• Zone 2 cardio: 30-45 minutes 3x weekly at conversational pace";
                    response += "\n• Nature exposure: Outdoor activity when possible for combined stress reduction";
                    response += "\n• Movement snacks: Brief activity bursts (5-10 pushups, air squats) throughout day";
                }
                
                response += "\n\n4. ATTENTIONAL CONTROL:\n";
                response += "• Focused attention practice: Start with 5 minutes daily, progressively build to 20 minutes";
                response += "\n• Environmental optimization: Designated space for practice with minimal distraction";
                response += "\n• Progressive protocol: Begin with breath focus, advance to open monitoring as capacity develops";
                
                response += "\n\nI've tailored this protocol to align with your current lifestyle and fitness level. Would you like me to develop a specific implementation schedule for integrating these practices?";
                break;
                
            case 'focus':
                response = "Based on your profile, here's a personalized Focus & Performance protocol:\n\n";
                response += "1. ULTRADIAN RHYTHM ALIGNMENT:\n";
                response += "• Work blocks: 90-minute focused sessions aligned with your natural energy peaks";
                
                if (sleepPattern.includes("Early riser")) {
                    response += "\n• Schedule highest cognitive demand tasks in the morning (8-11am)";
                } else if (sleepPattern.includes("Night owl")) {
                    response += "\n• Schedule highest cognitive demand tasks in late afternoon/evening (4-7pm)";
                } else {
                    response += "\n• Schedule highest cognitive demand tasks mid-morning (9am-12pm)";
                }
                
                response += "\n• Recovery intervals: 15-20 minute complete breaks between focus blocks";
                response += "\n• Implement technological boundaries during deep work intervals";
                
                response += "\n\n2. NUTRITIONAL SUPPORT:\n";
                response += "• Pre-cognitive work: Protein-rich, moderate fat meal or snack (eggs, nuts, yogurt)";
                response += "\n• Hydration strategy: Minimum 16oz water upon waking, 8oz hourly";
                response += "\n• Strategic caffeine timing: 30-60 minutes before peak performance needs";
                response += "\n• Blood glucose regulation: Minimize refined carbohydrates during focus periods";
                
                response += "\n\n3. ENVIRONMENT OPTIMIZATION:\n";
                response += "• Workspace organization: Minimal visual complexity, task-relevant cues only";
                response += "\n• Lighting considerations: Natural light or full-spectrum lighting when possible";
                response += "\n• Sound management: White/brown noise or consistent ambient sound for focus periods";
                response += "\n• Technology arrangement: Single-task dedicated screens, notifications paused";
                
                response += "\n\n4. RECOVERY PROTOCOLS:\n";
                response += "• Between-block movement: Non-cognitive physical activity during breaks";
                response += "\n• Afternoon reset: 10-minute outdoor walk to replenish directed attention";
                
                if (activityLevel.includes("sedentary") || activityLevel.includes("Light activity")) {
                    response += "\n• Movement integration: Standing or walking during calls/meetings";
                }
                
                response += "\n• Daily attentional reset: 20 minutes of nature exposure or non-directed attention";
                
                response += "\n\nWould you like me to create a structured daily schedule that incorporates these principles based on your typical day?";
                break;
                
            case 'training':
                response = "Based on your profile, here's a personalized Physical Training protocol:\n\n";
                response += "1. CARDIOVASCULAR DEVELOPMENT:\n";
                
                if (fitnessLevel.includes("Beginner") || fitnessLevel.includes("Novice")) {
                    response += "• Zone 2 foundation: 20-30 minutes of steady-state activity (walking, cycling, swimming) at conversational pace";
                    response += "\n• Frequency: 2-3x weekly initially, building to 3-4x weekly";
                    response += "\n• Progressive overload: Add 5 minutes weekly until reaching 30-45 minute sessions";
                } else {
                    response += "• Zone 2 base: 30-45 minutes at ventilatory threshold 1 (conversation possible but requires focus)";
                    response += "\n• Frequency: 3-4x weekly for optimal mitochondrial development";
                    response += "\n• Strategic intensity: One weekly session with 4-6 zone 4 intervals (30-60 seconds) for VO2max stimulus";
                }
                
                response += "\n\n2. RESISTANCE TRAINING:\n";
                
                if (fitnessLevel.includes("Beginner") || fitnessLevel.includes("Novice")) {
                    response += "• Movement competency: Master fundamental patterns with bodyweight before adding load";
                    response += "\n• Full-body approach: 2-3 weekly sessions targeting all major movement patterns";
                    response += "\n• Rep range: 8-12 reps per set with focus on technique acquisition";
                } else {
                    response += "• Split routine: Upper/lower or push/pull/legs based on training availability";
                    response += "\n• Periodization structure: 3-4 week progressive loading followed by 1 week deload";
                    response += "\n• Variable stimulus: Strategic rotation between strength (3-6 reps), hypertrophy (8-12 reps), and metabolic (12-15 reps) phases";
                }
                
                response += "\n\n3. RECOVERY OPTIMIZATION:\n";
                response += "• Protein timing: 0.3-0.4g/kg high-quality protein within 2 hours post-training";
                response += "\n• Sleep prioritization: Ensure 7-9 hours with consistent sleep/wake times";
                
                if (fitnessLevel.includes("Advanced") || fitnessLevel.includes("Athletic")) {
                    response += "\n• Active recovery: Dedicated mobility/tissue work on non-training days";
                    response += "\n• Stress management: Integrated nervous system regulation practices between training sessions";
                } else {
                    response += "\n• Between-session recovery: Minimum 48 hours between training same muscle groups";
                    response += "\n• Recovery indicators: Morning resting heart rate, perceived readiness, sleep quality";
                }
                
                response += "\n\n4. MOVEMENT DIVERSITY:\n";
                response += "• Skill acquisition: Incorporate novel movement patterns to enhance motor learning";
                response += "\n• Environmental variation: Utilize different training settings (indoor, outdoor, varied surfaces)";
                response += "\n• Implement unilateral (single-limb) exercises for balance and coordination development";
                
                response += "\n\nI've customized this protocol based on your current fitness level and goals. Would you like me to create a specific weekly training schedule integrating these components?";
                break;
                
            case 'nutrition':
                response = "Based on your profile, here's a personalized Nutrition Foundations protocol:\n\n";
                response += "1. TIME-RESTRICTED FEEDING:\n";
                
                if (sleepPattern.includes("Early riser")) {
                    response += "• Eating window: 7am-5pm (10 hours) aligned with circadian rhythm";
                } else if (sleepPattern.includes("Night owl") || sleepPattern.includes("Later schedule")) {
                    response += "• Eating window: 10am-8pm (10 hours) aligned with your circadian pattern";
                } else {
                    response += "• Eating window: 8am-6pm (10 hours) for optimal metabolic function";
                }
                
                response += "\n• Implementation: Begin with 12-hour window, reduce by 30 minutes weekly until reaching target";
                response += "\n• Consistency: Maintain similar timing on weekends with ±1 hour flexibility";
                
                response += "\n\n2. PROTEIN OPTIMIZATION:\n";
                response += "• Daily target: 1.6-2.2g/kg body weight for optimal muscle preservation and satiety";
                response += "\n• Distribution: 25-30g complete protein per meal, minimum 3 meals daily";
                response += "\n• Sources prioritization: Whole food proteins (eggs, fish, poultry, dairy, legumes) before supplements";
                
                if (fitnessLevel.includes("Advanced") || fitnessLevel.includes("Athletic")) {
                    response += "\n• Training days: Additional 20-25g protein in post-exercise meal for enhanced recovery";
                }
                
                response += "\n\n3. WHOLE FOOD PRIORITIZATION:\n";
                response += "• Vegetable intake: Minimum 4-6 cups daily with diverse colors for phytonutrient variety";
                response += "\n• Carbohydrate quality: Emphasize whole food sources (fruits, starchy vegetables, whole grains)";
                response += "\n• Fat sources: Prioritize omega-3 rich foods, olive oil, avocados, nuts/seeds";
                response += "\n• Fiber target: 30-35g daily from varied sources for microbiome diversity";
                
                response += "\n\n4. HYDRATION STRATEGY:\n";
                response += "• Base intake: 30-40ml/kg body weight daily (increased on training days)";
                response += "\n• Timing approach: 16-20oz upon waking, consistent intake throughout day";
                response += "\n• Electrolyte consideration: Added minerals during high activity or heat exposure";
                
                if (activityLevel.includes("Very active") || fitnessLevel.includes("Athletic")) {
                    response += "\n• Performance hydration: Additional 16-24oz with electrolytes around training sessions";
                }
                
                response += "\n\nWould you like me to develop a sample meal plan that incorporates these principles while accounting for your specific preferences and schedule?";
                break;
                
            default:
                response = "Based on your profile, I can provide personalized recommendations for various evidence-based wellness protocols. These include sleep optimization, stress management, focus enhancement, physical training, and nutrition foundations.\n\nEach protocol can be specifically tailored to your unique physiological needs, current lifestyle patterns, and wellness goals.\n\nWhich specific area would you like to explore first?";
        }
        
        return response;
    }
    
    // NEW FUNCTION: Generate goal-specific personalized response
    function generateGoalSpecificResponse(goalType, profile) {
        // Extract relevant profile data for personalization
        const fitnessLevel = profile.consciousIntent[1] || "Intermediate";
        const activityLevel = profile.dailyRhythms[1] || "Moderate activity";
        const sleepPattern = profile.dailyRhythms[2] || "Standard schedule";
        const healthConditions = Array.isArray(profile.physicalVessel[3]) ? profile.physicalVessel[3] : [profile.physicalVessel[3] || "None"];
        
        let response = "";
        
        switch(goalType) {
            case 'weight':
                response = "Based on your profile, here are personalized recommendations for weight management:\n\n";
                response += "METABOLIC APPROACH:\n";
                response += "• Implement 10-hour eating window aligned with your circadian rhythm";
                
                if (sleepPattern.includes("Early riser")) {
                    response += " (7am-5pm ideal for your early schedule)";
                } else if (sleepPattern.includes("Night owl")) {
                    response += " (10am-8pm to match your later sleep pattern)";
                } else {
                    response += " (8am-6pm optimal for standard schedules)";
                }
                
                response += "\n• Protein target: 1.8-2.2g/kg to preserve muscle mass and enhance satiety";
                response += "\n• Strategic carbohydrate timing: Higher intake in morning/midday, reduced in evening";
                
                response += "\n\nMOVEMENT STRATEGY:\n";
                response += "• Zone 2 cardio: 30-45 minutes at conversational pace 3-4x weekly for fat oxidation";
                response += "\n• Resistance training: 2-3x weekly full-body sessions to maintain metabolic tissue";
                
                if (activityLevel.includes("sedentary") || activityLevel.includes("Light activity")) {
                    response += "\n• NEAT enhancement: Add 3-5 daily movement breaks (5 minutes each) for cumulative caloric effect";
                }
                
                response += "\n\nHORMONAL OPTIMIZATION:\n";
                response += "• Sleep priority: 7-8 hours consistent sleep for leptin/ghrelin regulation";
                response += "\n• Stress regulation: Daily physiological sigh practice to manage cortisol";
                response += "\n• Meal structure: Begin with protein/fiber, end with carbohydrates/fats";
                
                response += "\n\nI've tailored these recommendations specifically to your profile data. Would you like a detailed implementation plan for the coming week?";
                break;
                
            case 'muscle':
                response = "Based on your profile, here are personalized recommendations for muscle development:\n\n";
                response += "TRAINING ARCHITECTURE:\n";
                
                if (fitnessLevel.includes("Beginner") || fitnessLevel.includes("Novice")) {
                    response += "• Training frequency: 3x weekly full-body sessions with 48h recovery between workouts";
                    response += "\n• Exercise selection: Compound movements (squat, hinge, push, pull patterns)";
                    response += "\n• Volume approach: 2-3 sets per exercise, 8-12 reps, focusing on technique mastery";
                } else {
                    response += "• Training split: Upper/lower or push/pull/legs based on your availability (4-5 sessions weekly)";
                    response += "\n• Progressive overload: Systematic weight increases (2-5% when target reps achieved)";
                    response += "\n• Volume periodization: 3-week intensification, 1-week deload cycles";
                }
                
                response += "\n\nNUTRITIONAL STRATEGY:\n";
                response += "• Protein intake: 1.8-2.2g/kg daily, distributed across 4-5 meals (25-40g per meal)";
                response += "\n• Energy surplus: 300-500 calories above maintenance for optimal growth";
                response += "\n• Peri-workout nutrition: 20-30g protein + 30-50g carbohydrates within 2 hours post-training";
                
                response += "\n\nRECOVERY PROTOCOL:\n";
                response += "• Sleep optimization: Prioritize 8+ hours for optimal hormonal environment";
                response += "\n• Stress management: Implement daily parasympathetic activation techniques";
                
                if (fitnessLevel.includes("Intermediate") || fitnessLevel.includes("Advanced") || fitnessLevel.includes("Athletic")) {
                    response += "\n• Active recovery: Dedicated mobility work on non-training days";
                    response += "\n• Systemic recovery: Cold exposure (2-3 minutes) post-training 2x weekly";
                }
                
                response += "\n\nWould you like me to create a specific training program with exercise selection and progression based on your current fitness level?";
                break;
                
            case 'sleep':
                response = "Based on your profile, here are personalized recommendations for sleep enhancement:\n\n";
                response += "CIRCADIAN OPTIMIZATION:\n";
                
                if (sleepPattern.includes("Irregular") || sleepPattern.includes("Night owl")) {
                    response += "• Morning light: 10-15 minutes direct sunlight immediately upon waking (critical for resetting)";
                    response += "\n• Wake-time consistency: Establish fixed wake time 7 days/week (even weekends)";
                    response += "\n• Progressive shift: Move sleep time earlier by 15 minutes weekly until target achieved";
                } else {
                    response += "• Morning light: 5-10 minutes direct sunlight within 30-60 minutes of waking";
                    response += "\n• Schedule consistency: Maintain regular sleep/wake times (±30 minute variance)";
                    response += "\n• Midday brightness: Ensure adequate daytime light exposure for circadian contrast";
                }
                
                response += "\n\nEVENING PROTOCOL:\n";
                response += "• Light management: Reduce blue light exposure 2-3 hours before bed";
                response += "\n• Temperature reduction: Set bedroom to 65-68°F (18-20°C) for optimal sleep architecture";
                response += "\n• Digital sunset: Screen removal 60 minutes before bed for melatonin production";
                response += "\n• Wind-down routine: Consistent 20-30 minute relaxation sequence (reading, stretching, breathing)";
                
                response += "\n\nSLEEP ENVIRONMENT:\n";
                response += "• Darkness optimization: Blackout curtains and elimination of all LED sources";
                response += "\n• Sound control: White/pink noise or quality earplugs if environment is disruptive";
                response += "\n• Bedding comfort: Evaluate mattress, pillow and bedding for optimal support and temperature";
                
                if (healthConditions.includes("Back problems") || healthConditions.includes("Joint pain")) {
                    response += "\n• Position adaptation: Consider supportive pillows for spine/joint alignment";
                }
                
                response += "\n\nWould you like me to create a comprehensive evening routine tailored to your specific schedule and preferences?";
                break;
                
            case 'stress':
                response = "Based on your profile, here are personalized recommendations for stress reduction:\n\n";
                response += "AUTONOMIC REGULATION:\n";
                response += "• Physiological sigh practice: Double inhale through nose, extended exhale through mouth";
                response += "\n• Implementation timing: 3-5 cycles, 3x daily (morning, midday, evening)";
                response += "\n• Stress interrupt: 30-second practice immediately following stress triggers";
                
                response += "\n\nBIOLOGICAL SIGNALING:\n";
                
                if (fitnessLevel.includes("Beginner") || fitnessLevel.includes("Novice")) {
                    response += "• Morning movement: 5-minute gentle mobility routine upon waking";
                    response += "\n• Nature exposure: 10-15 minute outdoor breaks daily (ideally morning)";
                    response += "\n• Temperature contrast: End showers with 15-30 seconds cool water";
                } else {
                    response += "• Zone 2 cardio: 30 minutes at conversational pace 3-4x weekly";
                    response += "\n• Cold exposure: 1-3 minute cold shower or immersion 3-4x weekly";
                    response += "\n• Heat exposure: Sauna sessions (if available) 1-2x weekly";
                }
                
                response += "\n\nCOGNITIVE APPROACH:\n";
                response += "• Attentional training: 5-10 minutes structured focus practice daily";
                response += "\n• Task boundaries: Implementing specific start/stop times for work periods";
                response += "\n• Digital hygiene: Scheduled disconnection periods from devices";
                
                if (activityLevel.includes("sedentary") || activityLevel.includes("Light activity")) {
                    response += "\n• Environment shifting: Change physical location briefly between tasks (2 minutes)";
                }
                
                response += "\n\nI've customized these recommendations based on your profile data. Would you like me to create a daily stress management routine that integrates these practices into your schedule?";
                break;
                
            case 'focus':
                response = "Based on your profile, here are personalized recommendations for cognitive enhancement:\n\n";
                response += "ATTENTION ARCHITECTURE:\n";
                response += "• Work cycles: 90-minute focused blocks with 15-20 minute complete breaks";
                
                if (sleepPattern.includes("Early riser")) {
                    response += "\n• Peak cognitive scheduling: Prioritize complex tasks between 7-11am";
                } else if (sleepPattern.includes("Night owl")) {
                    response += "\n• Peak cognitive scheduling: Prioritize complex tasks between 4-8pm";
                } else {
                    response += "\n• Peak cognitive scheduling: Prioritize complex tasks between 9am-1pm";
                }
                
                response += "\n• Environmental optimization: Dedicated workspace with minimal visual complexity";
                response += "\n• Technological boundaries: Notification elimination, single-task focus";
                
                response += "\n\nBIOLOGICAL SUPPORT:\n";
                response += "• Morning protein: 25-30g complete protein within 1 hour of waking";
                response += "• Hydration protocol: 16oz water upon waking, 8oz hourly throughout day";
                response += "• Strategic movement: 3-5 minute activity breaks between cognitive blocks";
                
                if (energyLevel.includes("Low") || energyLevel.includes("Very low")) {
                    response += "\n• Energy intervention: Brief (10-15 second) exercises hourly (air squats, wall push-ups)";
                }
                
                response += "\n\nCOGNITIVE RECOVERY:\n";
                response += "• Attention restoration: 20 minutes of nature exposure or non-directed attention daily";
                response += "• Mental reset: Midday outdoor walk for 10-15 minutes";
                response += "• Sleep quality: 7-9 hours with consistent timing for memory consolidation";
                
                response += "\n\nWould you like me to develop a structured daily schedule that incorporates these cognitive enhancement strategies based on your typical daily pattern?";
                break;
                
            default:
                response = "Based on your profile, I can provide personalized recommendations for various wellness goals including weight management, muscle development, sleep optimization, stress reduction, and cognitive enhancement.\n\nEach recommendation area will be specifically tailored to your unique physiology, current lifestyle patterns, and preferences.\n\nWhich specific goal would you like detailed recommendations for first?";
        }
        
        return response;
    }
    
    // NEW FUNCTION: Generate implementation-focused response
    function generateImplementationResponse(profile) {
        const fitnessLevel = profile.consciousIntent[1] || "Intermediate";
        const activityLevel = profile.dailyRhythms[1] || "Moderate activity";
        const sleepPattern = profile.dailyRhythms[2] || "Standard schedule";
        const goalsList = Array.isArray(profile.consciousIntent[0]) 
            ? profile.consciousIntent[0] 
            : [profile.consciousIntent[0] || "General wellness"];
        
        let response = "Based on your profile, here's a structured implementation approach for your wellness goals:\n\n";
        response += "IMPLEMENTATION FRAMEWORK:\n";
        response += "• Start with 2-3 highest-impact habits rather than overwhelming system change";
        response += "\n• Focus on consistency over perfection for behavioral adoption";
        response += "\n• Build implementation intentions: specific when-where-how plans for each habit";
        response += "\n• Track adherence with simple daily check-in system";
        
        response += "\n\nWEEK 1 FOCUS: FOUNDATION HABITS\n";
        
        // Recommend personalized starting habits based on goals
        if (goalsList.includes("Sleep improvement") || energyLevel.includes("Low") || energyLevel.includes("Very low")) {
            response += "• Morning sunlight: 5-10 minutes of direct sunlight exposure within 30-60 minutes of waking";
            
            if (sleepPattern.includes("Irregular") || sleepPattern.includes("Night owl")) {
                response += "\n• Consistent wake time: Set fixed wake time 7 days/week with maximum 30-minute variance";
            } else {
                response += "\n• Evening wind-down: Begin 20-minute pre-sleep routine at same time each night";
            }
        } else if (goalsList.includes("Stress reduction")) {
            response += "• Physiological sigh practice: 3-5 cycles, 3x daily (morning, midday, evening)";
            response += "\n• Nature exposure: 15-minute outdoor break daily, preferably in morning";
        } else if (goalsList.includes("Weight management")) {
            response += "• Eating window: Establish 12-hour feeding period aligned with circadian rhythm";
            response += "\n• Protein prioritization: Consume 25-30g protein within 1 hour of waking";
        } else {
            response += "• Morning movement: 5-10 minutes gentle mobility work upon waking";
            response += "\n• Hydration protocol: 16oz water upon waking, minimum 64oz total daily";
        }
        
        // Third foundation habit based on activity level
        if (activityLevel.includes("sedentary") || activityLevel.includes("Light activity")) {
            response += "\n• Movement integration: Implement 3-5 daily movement breaks (3-5 minutes each)";
        } else {
            response += "\n• Strategic recovery: 5-minute parasympathetic activation practice before bed";
        }
        
        response += "\n\nWEEK 2-4: PROGRESSIVE EXPANSION\n";
        response += "• Week 2: Maintain foundation habits with 80%+ consistency, add one nutrition focus";
        response += "\n• Week 3: Add structured movement protocol based on goals/fitness level";
        response += "\n• Week 4: Integrate environment optimization for sleep and cognitive function";
        
        response += "\n\nMONITORING APPROACH:\n";
        response += "• Daily habit tracking: Simple yes/no completion record for each practice";
        response += "\n• Weekly reflection: Brief assessment of energy, sleep quality, stress levels";
        response += "\n• Bi-weekly measurement: Select relevant metrics based on primary goals (weight, performance, etc.)";
        
        response += "\n\nWould you like me to create a detailed day-by-day implementation schedule for your first week based on your specific lifestyle and constraints?";
        
        return response;
    }
    
    // NEW FUNCTION: Generate progress tracking response
    function generateProgressTrackingResponse(profile) {
        const goalsList = Array.isArray(profile.consciousIntent[0]) 
            ? profile.consciousIntent[0] 
            : [profile.consciousIntent[0] || "General wellness"];
        
        let response = "Based on your profile, here's a personalized progress tracking framework:\n\n";
        response += "MEASUREMENT PRINCIPLES:\n";
        response += "• Focus on process metrics (habits completed) over outcome metrics initially";
        response += "\n• Establish consistent measurement timing and conditions for valid comparison";
        response += "\n• Track subjective and objective metrics for comprehensive assessment";
        response += "\n• Implement appropriate measurement frequency to avoid data fixation";
        
        response += "\n\nDAILY TRACKING:\n";
        response += "• Habit completion: Simple check-in system for key practices";
        response += "\n• Energy assessment: 1-10 scale morning and evening rating";
        response += "\n• Sleep quality: Brief morning reflection (duration, continuity, refreshment)";
        
        response += "\n\nWEEKLY MEASUREMENTS:\n";
        
        // Goal-specific metrics
        if (goalsList.includes("Weight management")) {
            response += "• Body composition: Morning weight under consistent conditions (after bathroom, before eating)";
            response += "\n• Circumference measurements: Waist, hips, chest, and limbs (bi-weekly)";
            response += "\n• Energy levels: Subjective ratings throughout day (1-10 scale)";
            response += "\n• Photo documentation: Consistent lighting and positioning (bi-weekly)";
        } 
        
        if (goalsList.includes("Muscle development") || goalsList.includes("Strength")) {
            response += "• Performance tracking: Key lifts/movements with load, reps, and RPE";
            response += "\n• Recovery metrics: Morning resting heart rate and readiness assessment";
            response += "\n• Body composition trends: Weight and circumference measurements";
            response += "\n• Visual documentation: Consistent photos under same conditions (bi-weekly)";
        }
        
        if (goalsList.includes("Sleep improvement")) {
            response += "• Sleep duration: Total hours and time in bed";
            response += "\n• Sleep latency: Time to fall asleep";
            response += "\n• Wake episodes: Frequency and duration of night waking";
            response += "\n• Morning feeling: Subjective rating of refreshment and alertness";
        }
        
        if (goalsList.includes("Stress reduction") || goalsList.includes("Energy optimization")) {
            response += "• Stress inventory: Weekly rating of key life domains (1-10 scale)";
            response += "\n• Energy pattern: Hourly ratings (1-10) to identify fluctuations";
            response += "\n• Recovery capacity: Heart rate recovery after standard exercise";
            response += "\n• Focus duration: Sustained attention periods without distraction";
        }
        
        response += "\n\nMONTHLY ASSESSMENT:\n";
        response += "• Comprehensive measurement of all relevant metrics";
        response += "\n• Reflection on habit adherence and consistency";
        response += "\n• Adaptation assessment: Evaluation of protocol efficacy";
        response += "\n• Program adjustment: Strategic modifications based on data";
        
        response += "\n\nWould you like me to create a specific tracking template based on your primary goals that you can begin using immediately?";
        
        return response;
    }
    
    // Generate a generic but still personalized response
    function generateGenericResponse(profile) {
        const goalsList = Array.isArray(profile.consciousIntent[0]) 
            ? profile.consciousIntent[0] 
            : [profile.consciousIntent[0] || "General wellness"];
        
        let primaryGoal = goalsList[0] || "wellness optimization";
        
        let response = `Based on your profile, I can provide personalized guidance for your ${primaryGoal} goal.\n\n`;
        
        response += "I've analyzed your profile data including your physical metrics, goals, and lifestyle factors. I can offer evidence-based recommendations in several key areas:\n\n";
        
        response += "• Personalized protocols for sleep, stress, focus, physical training and nutrition\n";
        response += "• Customized implementation plans based on your specific schedule and constraints\n";
        response += "• Goal-specific strategies for " + goalsList.join(", ") + "\n";
        response += "• Progress tracking frameworks to measure your advancement\n\n";
        
        response += "What specific aspect would you like me to elaborate on first? I can provide detailed recommendations for any protocol, create an implementation plan, or develop a roadmap for a specific goal.";
        
        return response;
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

