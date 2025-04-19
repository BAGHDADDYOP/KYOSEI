/**
 * Kyōsei Wellness Platform - Authentication Module
 *
 * This module handles user authentication and data syncing
 */

const AuthModule = {
    /**
     * User state and configuration
     */
    state: {
      isAuthenticated: false,
      user: null,
      authToken: null,
      isInitialized: false
    },
    
    /**
     * Initialize the auth module
     */
    init() {
      try {
        console.log('Initializing authentication module');
        
        // Check for existing session
        this.checkExistingSession();
        
        // Set up auth-related event listeners
        this.setupEventListeners();
        
        // Mark as initialized
        this.state.isInitialized = true;
        
        // Dispatch auth ready event
        this.dispatchEvent('auth:ready');
        
        return true;
      } catch (error) {
        console.error('Error initializing authentication module:', error);
        return false;
      }
    },
    
    /**
     * Check for existing user session
     */
    checkExistingSession() {
      try {
        // Check localStorage for auth token
        const storedToken = localStorage.getItem('kyosei_auth_token');
        const storedUser = localStorage.getItem('kyosei_user');
        
        if (storedToken && storedUser) {
          this.state.authToken = storedToken;
          this.state.user = JSON.parse(storedUser);
          this.state.isAuthenticated = true;
          
          console.log('User session restored');
          
          // Refresh token if needed
          this.refreshTokenIfNeeded();
          
          // Sync user data
          this.syncUserData();
          
          return true;
        }
        
        return false;
      } catch (error) {
        console.error('Error checking existing session:', error);
        this.logout(); // Clear potentially corrupted data
        return false;
      }
    },
    
    /**
     * Set up auth-related event listeners
     */
    setupEventListeners() {
      // Login form submission
      const loginForm = document.getElementById('login-form');
      if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const email = document.getElementById('login-email').value;
          const password = document.getElementById('login-password').value;
          this.login(email, password);
        });
      }
      
      // Register form submission
      const registerForm = document.getElementById('register-form');
      if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const name = document.getElementById('register-name').value;
          const email = document.getElementById('register-email').value;
          const password = document.getElementById('register-password').value;
          this.register(name, email, password);
        });
      }
      
      // Logout button
      const logoutBtn = document.getElementById('logout-btn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.logout();
        });
      }
      
      // Network status change
      window.addEventListener('online', () => {
        if (this.state.isAuthenticated) {
          console.log('Network connection restored, syncing data');
          this.syncUserData();
        }
      });
    },
    
    /**
     * Register a new user
     * 
     * @param {string} name - User's name
     * @param {string} email - User's email
     * @param {string} password - User's password
     * @returns {Promise} - Registration result
     */
    async register(name, email, password) {
      try {
        this.dispatchEvent('auth:registering');
        
        // Input validation
        if (!name || !email || !password) {
          throw new Error('Please provide all required fields');
        }
        
        if (!this.validateEmail(email)) {
          throw new Error('Please enter a valid email address');
        }
        
        if (password.length < 8) {
          throw new Error('Password must be at least 8 characters long');
        }
        
        // In a real app, this would be an API call
        const response = await this.mockApiCall({
          endpoint: 'register',
          method: 'POST',
          data: { name, email, password }
        });
        
        // Store auth details
        this.state.user = {
          id: response.user.id,
          name: response.user.name,
          email: response.user.email,
          createdAt: response.user.createdAt
        };
        
        this.state.authToken = response.token;
        this.state.isAuthenticated = true;
        
        // Save to localStorage
        localStorage.setItem('kyosei_auth_token', response.token);
        localStorage.setItem('kyosei_user', JSON.stringify(this.state.user));
        
        console.log('User registered successfully');
        this.dispatchEvent('auth:registered', { user: this.state.user });
        
        // Initialize user data
        this.initializeUserData();
        
        return { success: true, user: this.state.user };
      } catch (error) {
        console.error('Registration error:', error);
        this.dispatchEvent('auth:error', { message: error.message });
        return { success: false, error: error.message };
      }
    },
    
    /**
     * Log in an existing user
     * 
     * @param {string} email - User's email
     * @param {string} password - User's password
     * @returns {Promise} - Login result
     */
    async login(email, password) {
      try {
        this.dispatchEvent('auth:logging-in');
        
        // Input validation
        if (!email || !password) {
          throw new Error('Please provide email and password');
        }
        
        // In a real app, this would be an API call
        const response = await this.mockApiCall({
          endpoint: 'login',
          method: 'POST',
          data: { email, password }
        });
        
        // Store auth details
        this.state.user = {
          id: response.user.id,
          name: response.user.name,
          email: response.user.email,
          createdAt: response.user.createdAt
        };
        
        this.state.authToken = response.token;
        this.state.isAuthenticated = true;
        
        // Save to localStorage
        localStorage.setItem('kyosei_auth_token', response.token);
        localStorage.setItem('kyosei_user', JSON.stringify(this.state.user));
        
        console.log('User logged in successfully');
        this.dispatchEvent('auth:logged-in', { user: this.state.user });
        
        // Fetch user data
        await this.fetchUserData();
        
        return { success: true, user: this.state.user };
      } catch (error) {
        console.error('Login error:', error);
        this.dispatchEvent('auth:error', { message: error.message });
        return { success: false, error: error.message };
      }
    },
    
    /**
     * Log out the current user
     * 
     * @returns {boolean} - Logout result
     */
    logout() {
      try {
        // Clear auth state
        this.state.user = null;
        this.state.authToken = null;
        this.state.isAuthenticated = false;
        
        // Remove from localStorage
        localStorage.removeItem('kyosei_auth_token');
        localStorage.removeItem('kyosei_user');
        
        console.log('User logged out successfully');
        this.dispatchEvent('auth:logged-out');
        
        return true;
      } catch (error) {
        console.error('Logout error:', error);
        return false;
      }
    },
    
    /**
     * Refresh authentication token if needed
     * 
     * @returns {Promise} - Token refresh result
     */
    async refreshTokenIfNeeded() {
      try {
        // Check if token refresh is needed
        const tokenData = this.parseJwt(this.state.authToken);
        const currentTime = Math.floor(Date.now() / 1000);
        
        // If token is still valid and not about to expire, do nothing
        if (tokenData && tokenData.exp && tokenData.exp > currentTime + 300) {
          return { success: true, refreshed: false };
        }
        
        // Token needs refresh
        console.log('Refreshing authentication token');
        
        const response = await this.mockApiCall({
          endpoint: 'refresh-token',
          method: 'POST',
          data: { token: this.state.authToken }
        });
        
        // Update token
        this.state.authToken = response.token;
        localStorage.setItem('kyosei_auth_token', response.token);
        
        console.log('Token refreshed successfully');
        return { success: true, refreshed: true };
      } catch (error) {
        console.error('Token refresh error:', error);
        
        // If token refresh fails, log the user out
        if (error.status === 401) {
          this.logout();
        }
        
        return { success: false, error: error.message };
      }
    },
    
    /**
   * Initialize user data for a new account
   * 
   * @returns {Promise} - Initialization result
   */
  async initializeUserData() {
    try {
      if (!this.state.isAuthenticated) {
        throw new Error('User must be authenticated');
      }
      
      console.log('Initializing user data');
      
      // Get any locally stored profile data
      const localProfile = localStorage.getItem('kyosei_user_profile');
      const localConversation = localStorage.getItem('kyosei_conversation');
      
      // Prepare data payload
      const userData = {
        userId: this.state.user.id,
        profile: localProfile ? JSON.parse(localProfile) : {},
        conversationHistory: localConversation ? JSON.parse(localConversation) : []
      };
      
      // In a real app, this would be an API call
      await this.mockApiCall({
        endpoint: 'user-data/initialize',
        method: 'POST',
        data: userData,
        auth: true
      });
      
      console.log('User data initialized successfully');
      this.dispatchEvent('user:data-initialized');
      
      return { success: true };
    } catch (error) {
      console.error('User data initialization error:', error);
      this.dispatchEvent('user:data-error', { message: error.message });
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Fetch user data from the server
   * 
   * @returns {Promise} - Fetch result
   */
  async fetchUserData() {
    try {
      if (!this.state.isAuthenticated) {
        throw new Error('User must be authenticated');
      }
      
      console.log('Fetching user data');
      
      // In a real app, this would be an API call
      const response = await this.mockApiCall({
        endpoint: `user-data/${this.state.user.id}`,
        method: 'GET',
        auth: true
      });
      
      // Update local storage with fetched data
      if (response.data.profile) {
        localStorage.setItem('kyosei_user_profile', JSON.stringify(response.data.profile));
      }
      
      if (response.data.conversationHistory) {
        localStorage.setItem('kyosei_conversation', JSON.stringify(response.data.conversationHistory));
      }
      
      console.log('User data fetched successfully');
      this.dispatchEvent('user:data-fetched', { data: response.data });
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('User data fetch error:', error);
      this.dispatchEvent('user:data-error', { message: error.message });
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Sync user data with the server
   * 
   * @returns {Promise} - Sync result
   */
  async syncUserData() {
    try {
      if (!this.state.isAuthenticated) {
        throw new Error('User must be authenticated');
      }
      
      // Check network connectivity
      if (!navigator.onLine) {
        console.log('Offline, queueing sync for later');
        this.queueOfflineSync();
        return { success: false, offline: true };
      }
      
      console.log('Syncing user data');
      
      // Get local data
      const localProfile = localStorage.getItem('kyosei_user_profile');
      const localConversation = localStorage.getItem('kyosei_conversation');
      
      // Prepare data payload
      const userData = {
        userId: this.state.user.id,
        profile: localProfile ? JSON.parse(localProfile) : {},
        conversationHistory: localConversation ? JSON.parse(localConversation) : [],
        lastSynced: new Date().toISOString()
      };
      
      // In a real app, this would be an API call
      await this.mockApiCall({
        endpoint: 'user-data/sync',
        method: 'POST',
        data: userData,
        auth: true
      });
      
      console.log('User data synced successfully');
      this.dispatchEvent('user:data-synced');
      
      return { success: true };
    } catch (error) {
      console.error('User data sync error:', error);
      this.dispatchEvent('user:data-error', { message: error.message });
      
      // Queue for offline sync if network error
      if (error.name === 'NetworkError') {
        this.queueOfflineSync();
      }
      
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Queue data for offline sync
   */
  queueOfflineSync() {
    try {
      console.log('Queueing data for offline sync');
      
      // Register for background sync if supported
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        navigator.serviceWorker.ready.then(registration => {
          registration.sync.register('sync-user-data');
        });
      } else {
        // Fallback for browsers that don't support background sync
        localStorage.setItem('kyosei_needs_sync', 'true');
      }
    } catch (error) {
      console.error('Error queueing offline sync:', error);
    }
  },
  
  /**
   * Check if sync is needed after coming back online
   */
  checkOfflineSync() {
    const needsSync = localStorage.getItem('kyosei_needs_sync');
    if (needsSync === 'true') {
      this.syncUserData().then(() => {
        localStorage.removeItem('kyosei_needs_sync');
      });
    }
  },
  
  /**
   * Parse JWT token to get expiration time
   * 
   * @param {string} token - JWT token
   * @returns {object|null} - Decoded token payload or null
   */
  parseJwt(token) {
    try {
      if (!token) return null;
      
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error parsing JWT:', error);
      return null;
    }
  },
  
  /**
   * Validate email format
   * 
   * @param {string} email - Email to validate
   * @returns {boolean} - Validation result
   */
  validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },
  
  /**
   * Dispatch custom event
   * 
   * @param {string} eventName - Event name
   * @param {object} data - Event data
   */
  dispatchEvent(eventName, data = {}) {
    const event = new CustomEvent(eventName, { detail: data });
    document.dispatchEvent(event);
  },
  
  /**
   * Mock API call for development
   * 
   * @param {object} options - API call options
   * @returns {Promise} - API response
   */
  mockApiCall({ endpoint, method, data, auth }) {
    return new Promise((resolve, reject) => {
      // Simulate network delay
      setTimeout(() => {
        try {
          console.log(`Mock API call: ${method} ${endpoint}`);
          
          // Check auth token for authorized endpoints
          if (auth && !this.state.authToken) {
            return reject({ status: 401, message: 'Unauthorized' });
          }
          
          // Mock responses for different endpoints
          switch (endpoint) {
            case 'register':
              resolve({
                success: true,
                token: 'mock_jwt_token_' + Date.now(),
                user: {
                  id: 'user_' + Date.now(),
                  name: data.name,
                  email: data.email,
                  createdAt: new Date().toISOString()
                }
              });
              break;
              
            case 'login':
              // Simple validation
              if (data.email !== 'demo@example.com' && data.email !== 'test@example.com') {
                return reject({ status: 401, message: 'Invalid credentials' });
              }
              
              resolve({
                success: true,
                token: 'mock_jwt_token_' + Date.now(),
                user: {
                  id: 'user_12345',
                  name: 'Demo User',
                  email: data.email,
                  createdAt: '2023-01-01T00:00:00Z'
                }
              });
              break;
              
            case 'refresh-token':
              resolve({
                success: true,
                token: 'mock_jwt_token_refreshed_' + Date.now()
              });
              break;
              
            case 'user-data/initialize':
              resolve({
                success: true,
                message: 'User data initialized'
              });
              break;
              
            case 'user-data/sync':
              resolve({
                success: true,
                message: 'User data synced',
                lastSynced: new Date().toISOString()
              });
              break;
              
            case `user-data/${this.state.user?.id}`:
              // Return mock user data
              resolve({
                success: true,
                data: {
                  profile: data?.profile || {
                    physicalVessel: {
                      0: "25-34",
                      1: "175 cm",
                      2: "70 kg",
                      3: ["None"],
                      4: "Moderate - Occasional fatigue"
                    },
                    consciousIntent: {
                      0: ["Weight management", "Muscle development", "Energy optimization"],
                      1: "Intermediate - Regular activity",
                      2: ["Strength", "Endurance", "Metabolic efficiency"]
                    },
                    dailyRhythms: {
                      0: "Office/Desk work",
                      1: "Mostly sedentary (sitting)",
                      2: "Standard schedule (6-8am wake)"
                    },
                    profileComplete: true
                  },
                  conversationHistory: []
                }
              });
              break;
              
            default:
              reject({ status: 404, message: 'Endpoint not found' });
          }
        } catch (error) {
          reject({ status: 500, message: error.message });
        }
      }, 800); // Simulate network delay
    });
  }
};