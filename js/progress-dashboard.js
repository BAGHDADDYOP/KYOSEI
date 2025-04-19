/**
 * Kyōsei Wellness Platform - Progress Dashboard Module
 * 
 * This module manages the progress dashboard functionality, allowing users
 * to track their wellness metrics over time.
 */

const ProgressDashboard = {
    /**
     * Dashboard state
     */
    state: {
      metrics: [],
      activities: [],
      currentView: 'overview',
      timeRange: '7days',
      isInitialized: false
    },
    
    /**
     * Initialize the dashboard
     */
    init() {
      try {
        console.log('Initializing progress dashboard');
        
        // Cache DOM elements
        this.cacheElements();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Load user metrics
        this.loadMetrics();
        
        // Load recent activities
        this.loadActivities();
        
        // Render the dashboard
        this.renderDashboard();
        
        // Mark as initialized
        this.state.isInitialized = true;
        
        return true;
      } catch (error) {
        console.error('Error initializing progress dashboard:', error);
        return false;
      }
    },
    
    /**
     * Cache frequently used DOM elements
     */
    cacheElements() {
      this.elements = {
        dashboard: document.getElementById('progress-dashboard'),
        metricsContainer: document.getElementById('metrics-container'),
        activitiesContainer: document.getElementById('activities-container'),
        viewToggle: document.getElementById('dashboard-view-toggle'),
        timeRangeSelect: document.getElementById('time-range-select'),
        addMetricBtn: document.getElementById('add-metric-btn'),
        metricModal: document.getElementById('add-metric-modal')
      };
    },
    
    /**
     * Set up event listeners for dashboard interactions
     */
    setupEventListeners() {
      // View toggle buttons
      if (this.elements.viewToggle) {
        this.elements.viewToggle.addEventListener('click', (e) => {
          if (e.target.classList.contains('view-btn')) {
            const view = e.target.getAttribute('data-view');
            this.changeView(view);
          }
        });
      }
      
      // Time range selector
      if (this.elements.timeRangeSelect) {
        this.elements.timeRangeSelect.addEventListener('change', (e) => {
          this.changeTimeRange(e.target.value);
        });
      }
      
      // Add metric button
      if (this.elements.addMetricBtn) {
        this.elements.addMetricBtn.addEventListener('click', () => {
          this.openAddMetricModal();
        });
      }
      
      // Add metric form submission
      const addMetricForm = document.getElementById('add-metric-form');
      if (addMetricForm) {
        addMetricForm.addEventListener('submit', (e) => {
          e.preventDefault();
          this.handleAddMetric(e.target);
        });
      }
      
      // Metric delete buttons
      document.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-metric-btn')) {
          const metricId = e.target.closest('.metric-card').getAttribute('data-metric-id');
          this.deleteMetric(metricId);
        }
      });
      
      // Metric update buttons
      document.addEventListener('click', (e) => {
        if (e.target.classList.contains('update-metric-btn')) {
          const metricCard = e.target.closest('.metric-card');
          const metricId = metricCard.getAttribute('data-metric-id');
          const valueInput = metricCard.querySelector('.metric-value-input');
          
          if (valueInput && metricId) {
            this.updateMetricValue(metricId, valueInput.value);
          }
        }
      });
    },
    
    /**
     * Load user metrics from storage
     */
    loadMetrics() {
      try {
        // Get metrics from localStorage
        const storedMetrics = localStorage.getItem('kyosei_metrics');
        
        if (storedMetrics) {
          this.state.metrics = JSON.parse(storedMetrics);
        } else {
          // Initialize with default metrics
          this.state.metrics = this.getDefaultMetrics();
          this.saveMetrics();
        }
        
        console.log('Metrics loaded:', this.state.metrics.length);
      } catch (error) {
        console.error('Error loading metrics:', error);
        this.state.metrics = this.getDefaultMetrics();
        this.saveMetrics();
      }
    },
    
    /**
     * Load recent user activities
     */
    loadActivities() {
      try {
        // Get activities from localStorage
        const storedActivities = localStorage.getItem('kyosei_activities');
        
        if (storedActivities) {
          this.state.activities = JSON.parse(storedActivities);
        } else {
          // Initialize with sample activities
          this.state.activities = this.getSampleActivities();
          this.saveActivities();
        }
        
        console.log('Activities loaded:', this.state.activities.length);
      } catch (error) {
        console.error('Error loading activities:', error);
      this.state.activities = this.getSampleActivities();
      this.saveActivities();
    }
  },
  
  /**
   * Save metrics to localStorage
   */
  saveMetrics() {
    try {
      localStorage.setItem('kyosei_metrics', JSON.stringify(this.state.metrics));
    } catch (error) {
      console.error('Error saving metrics:', error);
    }
  },
  
  /**
   * Save activities to localStorage
   */
  saveActivities() {
    try {
      localStorage.setItem('kyosei_activities', JSON.stringify(this.state.activities));
    } catch (error) {
      console.error('Error saving activities:', error);
    }
  },
  
  /**
   * Generate default metrics for new users
   * 
   * @returns {Array} Default metrics
   */
  getDefaultMetrics() {
    // Current date for reference
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).toISOString();
    const twoDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2).toISOString();
    
    return [
      {
        id: 'weight',
        name: 'Body Weight',
        type: 'number',
        unit: 'kg',
        goal: 'decrease',
        goalValue: 70,
        category: 'physical',
        frequency: 'daily',
        values: [
          { date: twoDaysAgo, value: 74.2 },
          { date: yesterday, value: 73.8 },
          { date: today, value: 73.5 }
        ],
        color: '#4cd964',
        icon: 'weight-scale'
      },
      {
        id: 'sleep',
        name: 'Sleep Duration',
        type: 'time',
        unit: 'hours',
        goal: 'increase',
        goalValue: 8,
        category: 'recovery',
        frequency: 'daily',
        values: [
          { date: twoDaysAgo, value: 6.5 },
          { date: yesterday, value: 7.2 },
          { date: today, value: 7.5 }
        ],
        color: '#5fc9f8',
        icon: 'moon'
      },
      {
        id: 'steps',
        name: 'Daily Steps',
        type: 'number',
        unit: 'steps',
        goal: 'increase',
        goalValue: 10000,
        category: 'activity',
        frequency: 'daily',
        values: [
          { date: twoDaysAgo, value: 7350 },
          { date: yesterday, value: 8200 },
          { date: today, value: 9100 }
        ],
        color: '#ff9500',
        icon: 'footsteps'
      },
      {
        id: 'energy',
        name: 'Energy Level',
        type: 'scale',
        unit: '/10',
        goal: 'increase',
        goalValue: 8,
        category: 'wellness',
        frequency: 'daily',
        values: [
          { date: twoDaysAgo, value: 6 },
          { date: yesterday, value: 7 },
          { date: today, value: 7 }
        ],
        color: '#ff3a30',
        icon: 'lightning'
      }
    ];
  },
  
  /**
   * Generate sample activities for new users
   * 
   * @returns {Array} Sample activities
   */
  getSampleActivities() {
    // Current date for reference
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).toISOString();
    const twoDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2).toISOString();
    
    return [
      {
        id: 'act1',
        type: 'workout',
        name: 'Strength Training',
        details: {
          duration: 45,
          intensity: 'moderate',
          exercises: ['Squats', 'Bench Press', 'Rows', 'Shoulder Press']
        },
        date: today,
        notes: 'Increased weight on squats by 5kg'
      },
      {
        id: 'act2',
        type: 'nutrition',
        name: 'Implemented Intermittent Fasting',
        details: {
          window: '16:8',
          meals: 2
        },
        date: yesterday,
        notes: 'Felt good, moderate hunger in the morning'
      },
      {
        id: 'act3',
        type: 'recovery',
        name: 'Cold Exposure',
        details: {
          duration: 3,
          temperature: 'Cold Shower'
        },
        date: twoDaysAgo,
        notes: 'Cold shower for 3 minutes, felt energized afterward'
      },
      {
        id: 'act4',
        type: 'sleep',
        name: 'Sleep Optimization',
        details: {
          technique: 'Room Temperature Reduction',
          value: '65°F'
        },
        date: twoDaysAgo,
        notes: 'Reduced bedroom temperature to 65°F, slept better'
      }
    ];
  },
  
  /**
   * Render the dashboard based on current state
   */
  renderDashboard() {
    if (!this.elements.dashboard) return;
    
    try {
      // Show the dashboard
      this.elements.dashboard.style.display = 'block';
      
      // Render metrics
      this.renderMetrics();
      
      // Render activities
      this.renderActivities();
      
      // Set active view
      this.setActiveView(this.state.currentView);
      
      // Set active time range
      if (this.elements.timeRangeSelect) {
        this.elements.timeRangeSelect.value = this.state.timeRange;
      }
    } catch (error) {
      console.error('Error rendering dashboard:', error);
      this.showErrorMessage('Failed to render dashboard. Please try refreshing the page.');
    }
  },
  
  /**
   * Render metrics cards
   */
  renderMetrics() {
    if (!this.elements.metricsContainer) return;
    
    try {
      // Clear container
      this.elements.metricsContainer.innerHTML = '';
      
      // Filter metrics based on time range
      const filteredMetrics = this.filterMetricsByTimeRange(this.state.metrics, this.state.timeRange);
      
      if (filteredMetrics.length === 0) {
        this.elements.metricsContainer.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">📊</div>
            <h3>No Metrics Found</h3>
            <p>Start tracking your progress by adding metrics</p>
            <button class="add-metric-btn" id="empty-add-metric-btn">Add Your First Metric</button>
          </div>
        `;
        
        // Add event listener to the new button
        const emptyAddBtn = document.getElementById('empty-add-metric-btn');
        if (emptyAddBtn) {
          emptyAddBtn.addEventListener('click', () => {
            this.openAddMetricModal();
          });
        }
        
        return;
      }
      
      // Create metrics grid
      const metricsGrid = document.createElement('div');
      metricsGrid.className = 'metrics-grid';
      
      // Add metric cards
      filteredMetrics.forEach(metric => {
        const card = this.createMetricCard(metric);
        metricsGrid.appendChild(card);
      });
      
      this.elements.metricsContainer.appendChild(metricsGrid);
      
      // Initialize charts for each metric
      filteredMetrics.forEach(metric => {
        this.initializeMetricChart(metric);
      });
    } catch (error) {
      console.error('Error rendering metrics:', error);
      this.elements.metricsContainer.innerHTML = '<div class="error-message">Failed to load metrics</div>';
    }
  },
  
  /**
   * Create a metric card element
   * 
   * @param {Object} metric - Metric data
   * @returns {HTMLElement} Metric card element
   */
  createMetricCard(metric) {
    const card = document.createElement('div');
    card.className = `metric-card ${metric.category}`;
    card.setAttribute('data-metric-id', metric.id);
    
    // Calculate progress
    const currentValue = metric.values[metric.values.length - 1]?.value || 0;
    const previousValue = metric.values[metric.values.length - 2]?.value || currentValue;
    const progressDirection = currentValue > previousValue ? 'increase' : currentValue < previousValue ? 'decrease' : 'same';
    const progressClass = (metric.goal === 'increase' && progressDirection === 'increase') || 
                          (metric.goal === 'decrease' && progressDirection === 'decrease') ? 
                          'positive' : progressDirection === 'same' ? 'neutral' : 'negative';
    
    const progressValue = previousValue === 0 ? 0 : ((currentValue - previousValue) / previousValue * 100).toFixed(1);
    const progressText = progressDirection === 'same' ? 
                        'No change' : 
                        `${progressDirection === 'increase' ? '+' : ''}${progressValue}%`;
    
    // Calculate goal progress
    let goalProgress = 0;
    if (metric.goal === 'increase') {
      goalProgress = Math.min(100, (currentValue / metric.goalValue) * 100);
    } else {
      // For decrease goals, progress is inverse (lower is better)
      goalProgress = Math.min(100, (metric.goalValue / currentValue) * 100);
    }
    
    card.innerHTML = `
      <div class="metric-header">
        <div class="metric-icon" style="background-color: ${metric.color}">
          <i class="icon-${metric.icon}"></i>
        </div>
        <div class="metric-title">
          <h3>${metric.name}</h3>
          <span class="metric-category">${metric.category}</span>
        </div>
        <div class="metric-actions">
          <button class="delete-metric-btn">×</button>
        </div>
      </div>
      
      <div class="metric-body">
        <div class="metric-current">
          <div class="metric-value">${currentValue}<span class="metric-unit">${metric.unit}</span></div>
          <div class="metric-progress ${progressClass}">
            <span class="progress-arrow">${progressDirection === 'increase' ? '↑' : progressDirection === 'decrease' ? '↓' : '→'}</span>
            ${progressText}
          </div>
        </div>
        
        <div class="metric-chart-container">
          <canvas id="chart-${metric.id}" class="metric-chart"></canvas>
        </div>
        
        <div class="metric-goal">
          <div class="goal-label">Goal: ${metric.goalValue}${metric.unit}</div>
          <div class="goal-progress-bar">
            <div class="goal-progress" style="width: ${goalProgress}%; background-color: ${metric.color}"></div>
          </div>
        </div>
      </div>
      
      <div class="metric-footer">
        <div class="metric-update">
          <input type="number" class="metric-value-input" placeholder="Update value">
          <button class="update-metric-btn">Update</button>
        </div>
      </div>
    `;
    
    return card;
  },
  
  /**
   * Initialize chart for a metric
   * 
   * @param {Object} metric - Metric data
   */
  initializeMetricChart(metric) {
    const chartCanvas = document.getElementById(`chart-${metric.id}`);
    if (!chartCanvas) return;
    
    try {
      // Get date labels and values
      const dateLabels = metric.values.map(item => {
        const date = new Date(item.date);
        return `${date.getMonth() + 1}/${date.getDate()}`;
      });
      
      const values = metric.values.map(item => item.value);
      
      // Create chart
      const ctx = chartCanvas.getContext('2d');
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: dateLabels,
          datasets: [{
            label: metric.name,
            data: values,
            backgroundColor: `${metric.color}33`,
            borderColor: metric.color,
            borderWidth: 2,
            tension: 0.3,
            fill: true,
            pointRadius: 3,
            pointBackgroundColor: metric.color
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              mode: 'index',
              intersect: false
            }
          },
          scales: {
            y: {
              beginAtZero: metric.type !== 'scale'
            },
            x: {
              grid: {
                display: false
              }
            }
          }
        }
      });
    } catch (error) {
      console.error(`Error initializing chart for ${metric.id}:`, error);
      chartCanvas.innerHTML = 'Chart unavailable';
    }
  },
  
  /**
   * Render activities list
   */
  renderActivities() {
    if (!this.elements.activitiesContainer) return;
    
    try {
      // Clear container
      this.elements.activitiesContainer.innerHTML = '';
      
      // Filter activities based on time range
      const filteredActivities = this.filterActivitiesByTimeRange(this.state.activities, this.state.timeRange);
      
      if (filteredActivities.length === 0) {
        this.elements.activitiesContainer.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">📝</div>
            <h3>No Activities Found</h3>
            <p>Record your wellness activities to track your journey</p>
            <button class="add-activity-btn" id="empty-add-activity-btn">Add Your First Activity</button>
          </div>
        `;
        
        // Add event listener to the new button
        const emptyAddBtn = document.getElementById('empty-add-activity-btn');
        if (emptyAddBtn) {
          emptyAddBtn.addEventListener('click', () => {
            this.openAddActivityModal();
          });
        }
        
        return;
      }
      
      // Create activities list
      const activitiesList = document.createElement('div');
      activitiesList.className = 'activities-list';
      
      // Group activities by date
      const groupedActivities = this.groupActivitiesByDate(filteredActivities);
      
      // Add activity items grouped by date
      Object.keys(groupedActivities).forEach(dateStr => {
        const dateGroup = document.createElement('div');
        dateGroup.className = 'activity-date-group';
        
        // Format date heading
        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        let dateHeading = '';
        if (date.toDateString() === today.toDateString()) {
          dateHeading = 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
          dateHeading = 'Yesterday';
        } else {
          dateHeading = date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
        }
        
        dateGroup.innerHTML = `<h3 class="date-heading">${dateHeading}</h3>`;
        
        // Add activities for this date
        groupedActivities[dateStr].forEach(activity => {
          const activityItem = this.createActivityItem(activity);
          dateGroup.appendChild(activityItem);
        });
        
        activitiesList.appendChild(dateGroup);
      });
      
      this.elements.activitiesContainer.appendChild(activitiesList);
    } catch (error) {
      console.error('Error rendering activities:', error);
      this.elements.activitiesContainer.innerHTML = '<div class="error-message">Failed to load activities</div>';
    }
  },
  
  /**
   * Create an activity item element
   * 
   * @param {Object} activity - Activity data
   * @returns {HTMLElement} Activity item element
   */
  createActivityItem(activity) {
    const item = document.createElement('div');
    item.className = `activity-item ${activity.type}`;
    item.setAttribute('data-activity-id', activity.id);
    
    // Get activity icon based on type
    let icon = '';
    switch (activity.type) {
      case 'workout':
        icon = 'dumbbell';
        break;
      case 'nutrition':
        icon = 'food';
        break;
      case 'recovery':
        icon = 'heart-pulse';
        break;
      case 'sleep':
        icon = 'moon';
        break;
      default:
        icon = 'check-circle';
    }
    
    // Format details based on activity type
    let detailsHTML = '';
    if (activity.type === 'workout') {
      detailsHTML = `
        <div class="activity-detail">
          <span class="detail-label">Duration:</span>
          <span class="detail-value">${activity.details.duration} min</span>
        </div>
        <div class="activity-detail">
          <span class="detail-label">Intensity:</span>
          <span class="detail-value">${activity.details.intensity}</span>
        </div>
      `;
    } else if (activity.type === 'nutrition') {
      detailsHTML = `
        <div class="activity-detail">
          <span class="detail-label">Window:</span>
          <span class="detail-value">${activity.details.window}</span>
        </div>
        <div class="activity-detail">
          <span class="detail-label">Meals:</span>
          <span class="detail-value">${activity.details.meals}</span>
        </div>
      `;
    } else if (activity.type === 'recovery') {
      detailsHTML = `
        <div class="activity-detail">
          <span class="detail-label">Duration:</span>
          <span class="detail-value">${activity.details.duration} min</span>
        </div>
        <div class="activity-detail">
          <span class="detail-label">Type:</span>
          <span class="detail-value">${activity.details.temperature}</span>
        </div>
      `;
    } else if (activity.type === 'sleep') {
      detailsHTML = `
        <div class="activity-detail">
          <span class="detail-label">Technique:</span>
          <span class="detail-value">${activity.details.technique}</span>
        </div>
        <div class="activity-detail">
          <span class="detail-label">Setting:</span>
          <span class="detail-value">${activity.details.value}</span>
        </div>
      `;
    }
    
    item.innerHTML = `
      <div class="activity-icon">
        <i class="icon-${icon}"></i>
      </div>
      <div class="activity-content">
        <div class="activity-header">
          <h4 class="activity-name">${activity.name}</h4>
          <span class="activity-type">${activity.type}</span>
        </div>
        <div class="activity-details">
          ${detailsHTML}
        </div>
        <div class="activity-notes">
          <p>${activity.notes}</p>
        </div>
      </div>
      <div class="activity-actions">
        <button class="delete-activity-btn">×</button>
      </div>
    `;
    
    return item;
  },
  
  /**
   * Filter metrics based on selected time range
   * 
   * @param {Array} metrics - Metrics to filter
   * @param {string} timeRange - Selected time range
   * @returns {Array} Filtered metrics
   */
  filterMetricsByTimeRange(metrics, timeRange) {
    if (!metrics || !metrics.length) return [];
    
    const now = new Date();
    let startDate;
    
    switch (timeRange) {
      case '7days':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case '30days':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 30);
        break;
      case '90days':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 90);
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
    }
    
    // Filter each metric's values based on date range
    return metrics.map(metric => {
      const filteredValues = metric.values.filter(item => {
        const valueDate = new Date(item.date);
        return valueDate >= startDate && valueDate <= now;
      });
      
      return {
        ...metric,
        values: filteredValues
      };
    });
  },
  
  /**
   * Filter activities based on selected time range
   * 
   * @param {Array} activities - Activities to filter
   * @param {string} timeRange - Selected time range
   * @returns {Array} Filtered activities
   */
  filterActivitiesByTimeRange(activities, timeRange) {
    if (!activities || !activities.length) return [];
    
    const now = new Date();
    let startDate;
    
    switch (timeRange) {
      case '7days':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case '30days':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 30);
        break;
      case '90days':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 90);
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
    }
    
    // Filter activities based on date range
    return activities.filter(activity => {
      const activityDate = new Date(activity.date);
      return activityDate >= startDate && activityDate <= now;
    });
  },
  
  /**
   * Group activities by date
   * 
   * @param {Array} activities - Activities to group
   * @returns {Object} Activities grouped by date
   */
  groupActivitiesByDate(activities) {
    if (!activities || !activities.length) return {};
    
    const grouped = {};
    
    activities.forEach(activity => {
      const dateStr = activity.date.split('T')[0]; // Get date part only
      
      if (!grouped[dateStr]) {
        grouped[dateStr] = [];
      }
      
      grouped[dateStr].push(activity);
    });
    
    // Sort dates in descending order (newest first)
    return Object.keys(grouped)
      .sort((a, b) => new Date(b) - new Date(a))
      .reduce((result, key) => {
        result[key] = grouped[key];
        return result;
      }, {});
  },
  
  /**
   * Change dashboard view
   * 
   * @param {string} view - View to switch to
   */
  changeView(view) {
    if (view === this.state.currentView) return;
    
    this.state.currentView = view;
    this.setActiveView(view);
  },
  
  /**
   * Set active view in UI
   * 
   * @param {string} view - View to set active
   */
  setActiveView(view) {
    if (!this.elements.viewToggle) return;
    
    // Update view toggle buttons
    const viewButtons = this.elements.viewToggle.querySelectorAll('.view-btn');
    viewButtons.forEach(btn => {
      if (btn.getAttribute('data-view') === view) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    
    // Show/hide containers based on view
    if (this.elements.metricsContainer) {
      this.elements.metricsContainer.style.display = view === 'overview' || view === 'metrics' ? 'block' : 'none';
    }
    
    if (this.elements.activitiesContainer) {
      this.elements.activitiesContainer.style.display = view === 'overview' || view === 'activities' ? 'block' : 'none';
    }
  },
  
  /**
   * Change time range
   * 
   * @param {string} timeRange - Time range to switch to
   */
  changeTimeRange(timeRange) {
    if (timeRange === this.state.timeRange) return;
    
    this.state.timeRange = timeRange;
    
    // Re-render dashboard with new time range
    this.renderMetrics();
    this.renderActivities();
  },
  
  /**
   * Open add metric modal
   */
  openAddMetricModal() {
    if (!this.elements.metricModal) return;
    
    this.elements.metricModal.classList.add('active');
  },
  
  /**
   * Handle adding a new metric
   * 
   * @param {HTMLFormElement} form - Add metric form
   */
  handleAddMetric(form) {
    try {
      // Get form values
      const name = form.querySelector('#metric-name').value;
      const type = form.querySelector('#metric-type').value;
      const unit = form.querySelector('#metric-unit').value;
      const goal = form.querySelector('#metric-goal').value;
      const goalValue = parseFloat(form.querySelector('#metric-goal-value').value);
      const category = form.querySelector('#metric-category').value;
      const initialValue = parseFloat(form.querySelector('#metric-initial-value').value);
      const color = form.querySelector('#metric-color').value;
      
      // Validate inputs
      if (!name || !type || !unit || !goal || isNaN(goalValue) || !category || isNaN(initialValue)) {
        throw new Error('Please fill in all required fields');
      }
      
      // Create new metric
      const newMetric = {
        id: 'metric_' + Date.now(),
        name,
        type,
        unit,
        goal,
        goalValue,
        category,
        frequency: 'daily',
        values: [
          { date: new Date().toISOString(), value: initialValue }
        ],
        color: color || this.getRandomColor(),
        icon: this.getIconForCategory(category)
      };
      
      // Add to metrics array
      this.state.metrics.push(newMetric);
      
      // Save to storage
      this.saveMetrics();
      
      // Close modal
      this.elements.metricModal.classList.remove('active');
      
      // Reset form
      form.reset();
      
      // Re-render metrics
      this.renderMetrics();
      
      // Show success message
      this.showSuccessMessage('Metric added successfully');
    } catch (error) {
      console.error('Error adding metric:', error);
      this.showErrorMessage(error.message || 'Failed to add metric');
    }
  },
  
  /**
   * Delete a metric
   * 
   * @param {string} metricId - ID of metric to delete
   */
  deleteMetric(metricId) {
    if (!metricId) return;
    
    try {
      // Confirm deletion
      if (!confirm('Are you sure you want to delete this metric? This action cannot be undone.')) {
        return;
      }
      
      // Find metric index
      const metricIndex = this.state.metrics.findIndex(m => m.id === metricId);
      
      if (metricIndex === -1) {
        throw new Error('Metric not found');
      }
      
      // Remove metric
      this.state.metrics.splice(metricIndex, 1);
      
      // Save to storage
      this.saveMetrics();
      
      // Re-render metrics
      this.renderMetrics();
      
      // Show success message
      this.showSuccessMessage('Metric deleted successfully');
    } catch (error) {
      console.error('Error deleting metric:', error);
      this.showErrorMessage('Failed to delete metric');
    }
  },
  
  /**
   * Update a metric value
   * 
   * @param {string} metricId - ID of metric to update
   * @param {string|number} value - New value
   */
  updateMetricValue(metricId, value) {
    if (!metricId || !value) return;
    
    try {
      // Parse value as number
      const numValue = parseFloat(value);
      
      if (isNaN(numValue)) {
        throw new Error('Please enter a valid number');
      }
      
      // Find metric
      const metric = this.state.metrics.find(m => m.id === metricId);
      
      if (!metric) {
        throw new Error('Metric not found');
      }
      
      // Add new value
      metric.values.push({
        date: new Date().toISOString(),
        value: numValue
      });
      
      // Save to storage
      this.saveMetrics();
      
      // Re-render metrics
      this.renderMetrics();
      
      // Show success message
      this.showSuccessMessage('Metric updated successfully');
    } catch (error) {
      console.error('Error updating metric:', error);
      this.showErrorMessage(error.message || 'Failed to update metric');
    }
  },
  
  /**
   * Get random color for metrics
   * 
   * @returns {string} Random color hex
   */
  getRandomColor() {
    const colors = [
      '#4cd964', '#5fc9f8', '#ff9500', '#ff3a30', 
      '#af52de', '#5856d6', '#ff2d55', '#34c759'
    ];
    
    return colors[Math.floor(Math.random() * colors.length)];
  },
  
  /**
   * Get icon based on metric category
   * 
   * @param {/**
   * Get icon based on metric category
   * 
   * @param {string} category - Metric category
   * @returns {string} Icon name
   */
  getIconForCategory(category) {
    switch (category.toLowerCase()) {
      case 'physical':
        return 'weight-scale';
      case 'recovery':
        return 'heart-pulse';
      case 'activity':
        return 'footsteps';
      case 'wellness':
        return 'lightning';
      case 'nutrition':
        return 'food';
      case 'sleep':
        return 'moon';
      default:
        return 'chart';
    }
  },
  
  /**
   * Open add activity modal
   */
  openAddActivityModal() {
    const activityModal = document.getElementById('add-activity-modal');
    if (!activityModal) return;
    
    activityModal.classList.add('active');
  },
  
  /**
   * Show success message
   * 
   * @param {string} message - Message to show
   */
  showSuccessMessage(message) {
    if (!message) return;
    
    // Create success toast
    const successToast = document.createElement('div');
    successToast.className = 'toast success-toast';
    successToast.innerHTML = `
      <div class="toast-icon">✓</div>
      <div class="toast-message">${message}</div>
    `;
    
    // Add to document
    document.body.appendChild(successToast);
    
    // Show toast
    setTimeout(() => {
      successToast.classList.add('show');
    }, 10);
    
    // Remove after delay
    setTimeout(() => {
      successToast.classList.remove('show');
      setTimeout(() => {
        if (successToast.parentNode) {
          successToast.parentNode.removeChild(successToast);
        }
      }, 300);
    }, 3000);
  },
  
  /**
   * Show error message
   * 
   * @param {string} message - Message to show
   */
  showErrorMessage(message) {
    if (!message) return;
    
    // Create error toast
    const errorToast = document.createElement('div');
    errorToast.className = 'toast error-toast';
    errorToast.innerHTML = `
      <div class="toast-icon">!</div>
      <div class="toast-message">${message}</div>
    `;
    
    // Add to document
    document.body.appendChild(errorToast);
    
    // Show toast
    setTimeout(() => {
      errorToast.classList.add('show');
    }, 10);
    
    // Remove after delay
    setTimeout(() => {
      errorToast.classList.remove('show');
      setTimeout(() => {
        if (errorToast.parentNode) {
          errorToast.parentNode.removeChild(errorToast);
        }
      }, 300);
    }, 5000);
  },
  
  /**
   * Export data as CSV file
   */
  exportDataCSV() {
    try {
      // Create CSV content
      let csvContent = 'data:text/csv;charset=utf-8,';
      
      // Add headers
      csvContent += 'Metric,Date,Value,Unit,Goal,Category\n';
      
      // Add data for each metric
      this.state.metrics.forEach(metric => {
        metric.values.forEach(value => {
          const date = new Date(value.date).toLocaleDateString();
          csvContent += `"${metric.name}","${date}","${value.value}","${metric.unit}","${metric.goalValue}","${metric.category}"\n`;
        });
      });
      
      // Create download link
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `kyosei_metrics_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      
      // Trigger download
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      
      this.showSuccessMessage('Data exported successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      this.showErrorMessage('Failed to export data');
    }
  },
  
  /**
   * Import data from CSV file
   * 
   * @param {File} file - CSV file to import
   */
  async importDataCSV(file) {
    try {
      if (!file || file.type !== 'text/csv') {
        throw new Error('Please select a valid CSV file');
      }
      
      // Read file
      const text = await this.readFileAsText(file);
      
      // Parse CSV
      const lines = text.split('\n');
      const headers = lines[0].split(',');
      
      // Validate headers
      const requiredHeaders = ['Metric', 'Date', 'Value', 'Unit', 'Goal', 'Category'];
      const hasRequiredHeaders = requiredHeaders.every(header => 
        headers.some(h => h.trim() === header)
      );
      
      if (!hasRequiredHeaders) {
        throw new Error('CSV file is missing required columns');
      }
      
      // Process data
      const metricMap = {};
      
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const values = lines[i].split(',');
        
        const metricName = values[0].replace(/"/g, '').trim();
        const date = values[1].replace(/"/g, '').trim();
        const value = parseFloat(values[2].replace(/"/g, '').trim());
        const unit = values[3].replace(/"/g, '').trim();
        const goal = parseFloat(values[4].replace(/"/g, '').trim());
        const category = values[5].replace(/"/g, '').trim();
        
        if (!metricName || isNaN(value)) continue;
        
        // Create or update metric
        if (!metricMap[metricName]) {
          metricMap[metricName] = {
            id: 'metric_' + Date.now() + '_' + Object.keys(metricMap).length,
            name: metricName,
            type: 'number',
            unit: unit,
            goal: goal > value ? 'increase' : 'decrease',
            goalValue: goal,
            category: category || 'other',
            frequency: 'daily',
            values: [],
            color: this.getRandomColor(),
            icon: this.getIconForCategory(category || 'other')
          };
        }
        
        // Add value
        metricMap[metricName].values.push({
          date: new Date(date).toISOString(),
          value: value
        });
      }
      
      // Sort values by date
      Object.values(metricMap).forEach(metric => {
        metric.values.sort((a, b) => new Date(a.date) - new Date(b.date));
      });
      
      // Merge with existing metrics or replace
      const shouldMerge = confirm('Do you want to merge with existing metrics? Click Cancel to replace all metrics.');
      
      if (shouldMerge) {
        // Merge with existing metrics
        Object.values(metricMap).forEach(newMetric => {
          const existingMetric = this.state.metrics.find(m => m.name === newMetric.name);
          
          if (existingMetric) {
            // Merge values
            newMetric.values.forEach(newValue => {
              const existingValueIndex = existingMetric.values.findIndex(v => 
                new Date(v.date).toDateString() === new Date(newValue.date).toDateString()
              );
              
              if (existingValueIndex === -1) {
                existingMetric.values.push(newValue);
              } else {
                existingMetric.values[existingValueIndex] = newValue;
              }
            });
            
            // Sort values
            existingMetric.values.sort((a, b) => new Date(a.date) - new Date(b.date));
          } else {
            // Add new metric
            this.state.metrics.push(newMetric);
          }
        });
      } else {
        // Replace all metrics
        this.state.metrics = Object.values(metricMap);
      }
      
      // Save to storage
      this.saveMetrics();
      
      // Re-render metrics
      this.renderMetrics();
      
      this.showSuccessMessage('Data imported successfully');
    } catch (error) {
      console.error('Error importing data:', error);
      this.showErrorMessage(error.message || 'Failed to import data');
    }
  },
  
  /**
   * Read file as text
   * 
   * @param {File} file - File to read
   * @returns {Promise<string>} File content
   */
  readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = event => {
        resolve(event.target.result);
      };
      
      reader.onerror = error => {
        reject(error);
      };
      
      reader.readAsText(file);
    });
  }
};

// Initialize the dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Check if dashboard elements exist
  const dashboardElement = document.getElementById('progress-dashboard');
  
  if (dashboardElement) {
    // Initialize Chart.js for metrics
    if (typeof Chart !== 'undefined') {
      // Set default Chart.js options
      Chart.defaults.color = '#aaa';
      Chart.defaults.font.family = "'Helvetica', Arial, sans-serif";
      Chart.defaults.font.size = 11;
      Chart.defaults.elements.line.borderWidth = 2;
      Chart.defaults.elements.point.radius = 3;
      Chart.defaults.plugins.legend.display = false;
      
      // Initialize dashboard
      ProgressDashboard.init();
    } else {
      console.error('Chart.js is required for the progress dashboard');
      dashboardElement.innerHTML = '<div class="error-message">Chart.js is required but not found. Please include Chart.js in your project.</div>';
    }
  }
});