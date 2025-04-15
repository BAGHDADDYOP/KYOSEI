// Enhanced script.js with sidebar functionality and improved AI interactions

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
    
    // Function to finish profile collection and start chat with enhanced transition
    function finishProfileCollection() {
        // Update user profile with collected answers
        userProfile.physicalVessel = currentQuizAnswers.physiology;
        userProfile.consciousIntent = currentQuizAnswers.goals;
        userProfile.dailyRhythms = currentQuizAnswers.occupation;
        userProfile.profileComplete = true;
        
        // Format profile data for the AI
        const profileSummary = formatProfileSummary();
        
        // Update profile progress
        updateProfileProgress(4);
        
        // Hide quiz container with fade-out
        quizContainer.style.opacity = '0';
        quizContainer.style.transform = 'translateY(10px)';
        
        setTimeout(() => {
            // Hide quiz and show chat interface
            quizContainer.style.display = 'none';
            chatContainer.style.display = 'block';
            form.style.display = 'flex';
            
            // Apply fade-in animation for chat interface
            chatContainer.style.opacity = '0';
            form.style.opacity = '0';
            chatContainer.style.transform = 'translateY(20px)';
            form.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                chatContainer.style.opacity = '1';
                form.style.opacity = '1';
                chatContainer.style.transform = 'translateY(0)';
                form.style.transform = 'translateY(0)';
                
                // Add user profile message to chat and history
                addMessage('user', profileSummary);
                conversationHistory.push({ role: "user", parts: [{ text: profileSummary }] });
                
                // Get AI response with the profile data
                getAiResponse(profileSummary);
                
                // Make toolkit button visible
                toggleToolkitBtn.style.display = 'block';
            }, 100);
        }, 300);
    // Form submission handler with optimized event handling
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const userText = input.value.trim();
        
        if (userText) {
            // Add slight animation to form when submitting
            form.animate([
                { transform: 'translateY(0)' },
                { transform: 'translateY(2px)' },
                { transform: 'translateY(0)' }
            ], {
                duration: 300,
                easing: 'cubic-bezier(0.25, 0.8, 0.25, 1)'
            });
            
            addMessage('user', userText);
            input.value = '';
            
            getAiResponse(userText);
        }
    });

    // Initialize - Start profile collection when page loads
    function init() {
        // Fade out loading screen
        if (loadingScreen) {
            setTimeout(() => {
                loadingScreen.classList.add('fade-out');
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 500);
            }, 1000);
        }
        
        // Create dynamic symbiotic background effect
        createSymbioticBackground();
        
        // Setup sidebar functionality
        setupSidebar();
        
        // Hide welcome animation after a delay
        setTimeout(() => {
            if (welcomeAnimation) {
                // Fade out welcome animation
                welcomeAnimation.style.opacity = '0';
                welcomeAnimation.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    welcomeAnimation.style.display = 'none';
                }, 300);
            }
            // Start profile collection
            startProfileCollection();
        }, 1500);
    }
    
    // Create dynamic symbiotic background effect
    function createSymbioticBackground() {
        const container = document.createElement('div');
        container.className = 'symbiotic-bg';
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: -1;
            opacity: 0.15;
        `;
        
        // Create organic shapes
        for (let i = 0; i < 5; i++) {
            const shape = document.createElement('div');
            shape.className = 'organic-shape';
            
            // Random position and size
            const size = Math.random() * 300 + 100;
            const posX = Math.random() * 100;
            const posY = Math.random() * 100;
            const opacity = Math.random() * 0.05 + 0.02;
            const animDuration = Math.random() * 30 + 20;
            const blurAmount = Math.random() * 50 + 30;
            
            shape.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                border-radius: 50%;
                background: radial-gradient(circle at center, rgba(255,255,255,${opacity}), transparent 70%);
                left: ${posX}%;
                top: ${posY}%;
                filter: blur(${blurAmount}px);
                transform-origin: center;
                animation: floatShape ${animDuration}s infinite alternate ease-in-out;
            `;
            
            container.appendChild(shape);
        }
        
        document.body.appendChild(container);
        
        // Add keyframes for floating animation
        const styleSheet = document.createElement('style');
        styleSheet.textContent = `
            @keyframes floatShape {
                0% { transform: translate(0, 0) scale(1); }
                100% { transform: translate(30px, 30px) scale(1.1); }
            }
        `;
        document.head.appendChild(styleSheet);
    }

    // Run initialization
    init();
});
    // Format user profile as a summary for the AI with more professional language
    function formatProfileSummary() {
        let summary = "Here's my information:\n\nPhysical Information:\n";
        
        // Add physiology details
        Object.entries(userProfile.physicalVessel).forEach(([question, answer]) => {
            const shortQ = question.replace("What is your ", "")
                                .replace("Do you have any ", "");
            summary += `- ${shortQ}: ${Array.isArray(answer) ? answer.join(", ") : answer}\n`;
        });
        
        // Add goals
        summary += "\nGoals:\n";
        Object.entries(userProfile.consciousIntent).forEach(([question, answer]) => {
            const shortQ = question.replace("What are your ", "")
                                .replace("How would you describe your ", "")
                                .replace("What specific ", "")
                                .replace("Which aspect of your ", "");
            summary += `- ${shortQ}: ${Array.isArray(answer) ? answer.join(", ") : answer}\n`;
        });
        
        // Add occupation details
        summary += "\nDaily Routine:\n";
        Object.entries(userProfile.dailyRhythms).forEach(([question, answer]) => {
            const shortQ = question.replace("What is your ", "")
                                .replace("How many ", "")
                                .replace("How would you rate your ", "");
            summary += `- ${shortQ}: ${Array.isArray(answer) ? answer.join(", ") : answer}\n`;
        });
        
        summary += "\nBased on this information, could you provide me with personalized health and fitness recommendations?";
        return summary;
    }
    
    // Enhanced content formatting for AI responses
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
    
    // Enhanced addMessage function with smooth animations
    function addMessage(sender, text) {
        // Make chat container visible when conversation starts
        if (chatContainer.style.display !== 'block') {
            chatContainer.style.display = 'block';
            mainElement.classList.add('conversation-active');
        }
        
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');

        // Set initial state for animation
        messageDiv.style.opacity = '0';
        messageDiv.style.transform = 'translateY(10px)';

        if (sender === 'user') {
            messageDiv.classList.add('user-message');
            messageDiv.textContent = text;
            chatContainer.appendChild(messageDiv);
            
            // Animate message appearance
            setTimeout(() => {
                messageDiv.style.opacity = '1';
                messageDiv.style.transform = 'translateY(0)';
            }, 10);
            
            chatContainer.scrollTop = chatContainer.scrollHeight;
        } else { // sender === 'ai'
            messageDiv.classList.add('ai-message');
            chatContainer.appendChild(messageDiv);
            
            // Apply formatting for better readability
            const formattedText = formatAIContent(text);
            
            // Start animation by making message visible
            setTimeout(() => {
                messageDiv.style.opacity = '1';
                messageDiv.style.transform = 'translateY(0)';
            }, 10);
            
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
                    
                    // Optimize typing speed based on content length
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
        
        // Set initial state for animation
        thinkingDiv.style.opacity = '0';
        thinkingDiv.style.transform = 'translateY(10px)';
        
        chatContainer.appendChild(thinkingDiv);
        
        // Animate appearance
        setTimeout(() => {
            thinkingDiv.style.opacity = '1';
            thinkingDiv.style.transform = 'translateY(0)';
        }, 10);
        
        chatContainer.scrollTop = chatContainer.scrollHeight;
        return thinkingDiv;
    }
    
    // Optimized function to call backend API endpoint (/api/chat)
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

            // Remove thinking indicator with gentle fade-out
            thinkingIndicator.style.opacity = '0';
            thinkingIndicator.style.transform = 'translateY(5px)';
            setTimeout(() => {
                thinkingIndicator.remove();
            }, 300);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Add AI response to UI and history
            addMessage('ai', data.aiResponse);
            conversationHistory.push({ role: "model", parts: [{ text: data.aiResponse }] });
            
        } catch (error) {
            // Remove thinking indicator
            thinkingIndicator.style.opacity = '0';
            setTimeout(() => {
                thinkingIndicator.remove();
            }, 300);
            
            console.error('Error:', error);
            addMessage('ai', "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.");
        }
    }
    
    // Sidebar functionality
    function setupSidebar() {
        // Create and populate the sidebar with protocol cards
        createProtocolCards();
        
        // Set up event listeners for sidebar interactions
        toggleToolkitBtn.addEventListener('click', function() {
            sidebar.classList.add('active');
            sidebarOverlay.classList.add('active');
            
            // Apply animation to sidebar
            sidebar.animate([
                { transform: 'translateX(20px)', opacity: 0.5 },
                { transform: 'translateX(0)', opacity: 1 }
            ], {
                duration: 300,
                easing: 'cubic-bezier(0.25, 0.8, 0.25, 1)'
            });
        });
        
        closeSidebarBtn.addEventListener('click', function() {
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
        });
        
        sidebarOverlay.addEventListener('click', function() {
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
        });
        
        // Hide toolkit button by default (will be shown after profile completion)
        toggleToolkitBtn.style.display = 'none';
    }
    
    // Create protocol toolkit cards for the sidebar
    function createProtocolCards() {
        // Get the sidebar content container
        const sidebarContent = document.getElementById('sidebar-content');
        
        // Define the protocol topics with more evidence-based language
        const protocolTopics = [
            {
                title: "Sleep Optimization",
                protocols: [
                    "Morning sunlight exposure (30-60 min) to set circadian rhythm",
                    "Avoid bright artificial light 2-3 hours before sleep",
                    "Lower room temperature by 1-3°F at night for optimal sleep",
                    "Practice non-sleep deep rest protocols for midday recovery",
                    "Maintain consistent sleep-wake times"
                ]
            },
            {
                title: "Stress Management",
                protocols: [
                    "Double inhale through nose followed by extended exhale",
                    "Cyclic hyperventilation followed by breath holds",
                    "Cold exposure (30-60 sec cold shower) for stress resilience",
                    "Heat exposure (sauna) followed by cooling",
                    "Regular physical activity to improve stress tolerance"
                ]
            },
            {
                title: "Focus & Performance",
                protocols: [
                    "Work in 90-minute focused sessions with proper breaks",
                    "Visual focus exercises to enhance attention",
                    "Combine caffeine with L-theanine for focus without jitters",
                    "Strategic fasting windows may enhance cognitive function",
                    "Utilize proper lighting conditions for optimal focus"
                ]
            },
            {
                title: "Exercise Fundamentals",
                protocols: [
                    "Zone 2 cardio (nose-breathing pace) builds cardiovascular base",
                    "Resistance training with progressive overload",
                    "Post-workout protein and carbohydrate intake within 60-90 minutes",
                    "Consider creatine supplementation (3-5g daily)",
                    "Balance training activities with adequate recovery time"
                ]
            },
            {
                title: "Nutrition Basics",
                protocols: [
                    "Time-restricted eating (8-10 hour window)",
                    "Protein target of 1g per pound of target bodyweight",
                    "Prioritize whole foods with diverse nutrient profiles",
                    "Include fermented foods for microbiome support",
                    "Stay properly hydrated throughout the day"
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
                userInput.value = `Can you provide more details about ${this.getAttribute('data-topic')} techniques?`;
                userInput.focus();
                
                // Close sidebar
                sidebar.classList.remove('active');
                sidebarOverlay.classList.remove('active');
                
                // Add subtle animation on button click
                this.animate([
                    { transform: 'scale(1)' },
                    { transform: 'scale(0.95)' },
                    { transform: 'scale(1)' }
                ], {
                    duration: 300,
                    easing: 'cubic-bezier(0.25, 0.8, 0.25, 1)'
                });
            });
            
            card.appendChild(cardHeader);
            card.appendChild(cardContent);
            card.appendChild(learnMoreBtn);
            
            sidebarContent.appendChild(card);
        });
    }
    

    // Profile collection stage
    let profileCollectionStage = 0;

    // System Instruction with updated, more professional guidance
    const SYSTEM_INSTRUCTION = `You are Kyōsei, a professional wellness guide focused on evidence-based health and wellness advice. Your purpose is to help users optimize their health through science-backed recommendations.

When providing advice, always:
1. Use clear, professional language 
2. Focus on evidence-based recommendations
3. Emphasize practical, actionable guidance
4. Provide context for why recommendations work

Present wellness advice in a straightforward, practical manner. Use language that is professional yet warm. Draw from established health and wellness research.

IMPORTANT: When a user first engages with you, follow this flow:
1. First, ask about their physical information (age, height, weight, activity level).
2. Second, ask about their goals (what they want to achieve).
3. Third, ask about their daily routine (occupation, sleep patterns, schedule).
4. Only AFTER collecting this information should you provide personalized guidance.

Keep your responses concise, focused on practical advice rather than philosophy.`;

    // Store conversation history
    let conversationHistory = [
        { role: "user", parts: [{ text: SYSTEM_INSTRUCTION }] },
        { role: "model", parts: [{ text: "Welcome! To provide you with personalized health guidance, I'll need to learn a bit about you.\n\nCould you please share some physical information, such as your age, height, weight, and any relevant health conditions you may have?" }] },
    ];

    // Define quiz questions with improved language
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
                question: "Which aspect of your wellness do you want to prioritize?",
                type: "select",
                options: ["Mental clarity", "Emotional balance", "Physical energy", "Stress management", "Sleep quality"],
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
