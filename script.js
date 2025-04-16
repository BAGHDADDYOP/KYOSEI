// Enhanced and fixed script.js with complete functionality

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
    
    // FIXED: Loading animation text sequence - changed "Initializing" to "Connecting"
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
                    loadingScreen.style.display = 'none';
                    animateSymbioticBackground();
                    // FIXED: Explicitly start profile collection after loading screen is removed
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

    // System Instruction with more professional language
    const SYSTEM_INSTRUCTION = `You represent Kyōsei, a professional wellness guide focused on evidence-based approaches to optimize health. Your purpose is to provide scientifically validated information about the interconnected systems of physical health, mental wellbeing, and physiological balance.

Always emphasize:
1. Evidence-based approaches backed by peer-reviewed research
2. How physiological systems interact for optimal health outcomes
3. Neuroplasticity and adaptation mechanisms in response to lifestyle interventions
4. The importance of individualized approach based on assessment data

Present wellness as a process of targeted optimization rather than a deficit-correction model. Use professional, evidence-focused terminology reflecting current biomedical understanding. Draw from established principles in exercise physiology, nutritional science, sleep medicine, and cognitive performance optimization.

IMPORTANT: When a user first engages with you, ALWAYS follow this flow:
1. First, ask about their physical vessel (age, height, weight, medical conditions, biomarkers if available).
2. Second, ask about their conscious effort (specific, measurable goals and areas for improvement).
3. Third, ask about their daily rhythms (occupation, sleep schedule, stress factors, current routines).
4. Only AFTER collecting this information should you provide personalized, evidence-based recommendations.

Frame recommendations to highlight specific physiological mechanisms and outcomes supported by research.`;

    // Store conversation history
    let conversationHistory = [
        { role: "user", parts: [{ text: SYSTEM_INSTRUCTION }] },
        { role: "model", parts: [{ text: "Welcome! To provide you with personalized health and fitness guidance, I'd like to learn a bit about you first.\n\nCould you please share some details about your physical vessel such as your age, height, weight, and any health conditions or limitations you may have?" }] },
    ];

    // Define quiz questions with updated terminology
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
                question: "Which aspect of your wellbeing do you want to prioritize?",
                type: "select",
                options: ["Cognitive performance", "Stress management", "Energy levels", "Recovery optimization", "Sleep quality"],
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

    // Define knowledge toolkit protocols with monochromatic styling
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

    // NEW: PDF Generation functionality
    function generatePDF(contentType, data) {
        // Simulate PDF generation - In a real implementation, this would use a PDF library
        const pdfMessage = `Your personalized ${contentType} PDF has been generated. In a production environment, this would create a downloadable PDF document containing: ${JSON.stringify(data).substring(0, 100)}...`;
        
        addAIMessage(pdfMessage);
        
        // Show a modal dialog to simulate PDF generation
        const modal = document.createElement('div');
        modal.className = 'pdf-modal';
        modal.innerHTML = `
            <div class="pdf-modal-content">
                <h3>PDF Generated</h3>
                <p>Your personalized ${contentType} document has been created.</p>
                <div class="pdf-thumbnail">
                    <div class="pdf-icon">PDF</div>
                </div>
                <button class="pdf-download-btn">Download PDF</button>
                <button class="pdf-close-btn">Close</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add functionality to buttons
        modal.querySelector('.pdf-download-btn').addEventListener('click', function() {
            modal.querySelector('.pdf-download-btn').textContent = 'Downloaded!';
            setTimeout(() => {
                document.body.removeChild(modal);
            }, 1500);
        });
        
        modal.querySelector('.pdf-close-btn').addEventListener('click', function() {
            document.body.removeChild(modal);
        });
    }

    // NEW: Interactive roadmap visualization
    function createInteractiveRoadmap(title, steps) {
        const roadmapContainer = document.createElement('div');
        roadmapContainer.className = 'roadmap-container';
        
        const roadmapHeader = document.createElement('div');
        roadmapHeader.className = 'roadmap-header';
        roadmapHeader.innerHTML = `
            <h3>${title}</h3>
            <div class="roadmap-controls">
                <button class="roadmap-fullscreen-btn">Expand</button>
                <button class="roadmap-pdf-btn">Save as PDF</button>
            </div>
        `;
        
        const roadmapContent = document.createElement('div');
        roadmapContent.className = 'roadmap-content';
        
        // Create timeline elements
        const timeline = document.createElement('div');
        timeline.className = 'roadmap-timeline';
        
        steps.forEach((step, index) => {
            const stepElement = document.createElement('div');
            stepElement.className = 'roadmap-step';
            stepElement.innerHTML = `
                <div class="roadmap-step-number">${index + 1}</div>
                <div class="roadmap-step-content">
                    <h4>${step.title}</h4>
                    <p>${step.description}</p>
                    <div class="roadmap-step-timeframe">${step.timeframe}</div>
                </div>
            `;
            
            timeline.appendChild(stepElement);
        });
        
        roadmapContent.appendChild(timeline);
        roadmapContainer.appendChild(roadmapHeader);
        roadmapContainer.appendChild(roadmapContent);
        
        // Add to chat
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message ai-message';
        messageDiv.appendChild(roadmapContainer);
        
        chatContainer.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        
        // Add event listeners
        messageDiv.querySelector('.roadmap-fullscreen-btn').addEventListener('click', function() {
            messageDiv.classList.toggle('roadmap-fullscreen');
            this.textContent = messageDiv.classList.contains('roadmap-fullscreen') ? 'Minimize' : 'Expand';
        });
        
        messageDiv.querySelector('.roadmap-pdf-btn').addEventListener('click', function() {
            generatePDF('Roadmap', {
                title: title,
                steps: steps
            });
        });
        
        return roadmapContainer;
    }

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

    // Populate sidebar with knowledge protocols - Fixed function to avoid duplications
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
            header.addEventListener('click', function() {
                card.classList.toggle('expanded');
            });
            
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

    // NEW: Function to handle protocol inquiries
    function inquireAboutProtocol(protocolName) {
        const inquiryMessage = `I'd like to learn more about the ${protocolName} protocol. Can you provide detailed information and how I can implement it?`;
        addUserMessage(inquiryMessage);
        getAIResponse();
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

    // FIXED: Make these functions global so they can be accessed from inline HTML events
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
    
    // FIXED: Function to submit quiz answer and move to next question with enhanced transition
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
