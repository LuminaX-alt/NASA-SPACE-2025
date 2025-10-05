// Shark Habitat Prediction System - Interactive JavaScript

// Application data from the provided JSON
const appData = {
    satellite_data: [
        {"latitude": -15.055186, "longitude": -113.352146, "chlorophyll_a": 0.415621, "sea_surface_height": 0.374193, "sea_surface_temp": 21.733550, "eddy_kinetic_energy": 0.029726, "bathymetry": 1010.891659, "habitat_suitability": 0.4817},
        {"latitude": 54.085717, "longitude": 15.084341, "chlorophyll_a": 0.437412, "sea_surface_height": 0.077923, "sea_surface_temp": 32.557783, "eddy_kinetic_energy": 0.127078, "bathymetry": 180.001326, "habitat_suitability": 0.3542},
        {"latitude": 27.839273, "longitude": 134.260501, "chlorophyll_a": 0.797336, "sea_surface_height": -0.173659, "sea_surface_temp": 10.799611, "eddy_kinetic_energy": 0.002852, "bathymetry": 561.822923, "habitat_suitability": 0.2891},
        {"latitude": 11.839018, "longitude": 83.600959, "chlorophyll_a": 1.443926, "sea_surface_height": 0.106926, "sea_surface_temp": 19.838597, "eddy_kinetic_energy": 0.047052, "bathymetry": 338.635347, "habitat_suitability": 0.6234}
    ],
    hotspots: [
        {"Hotspot_ID": 0, "Latitude": -41.670, "Longitude": -47.784, "Avg_Suitability": 0.476, "Point_Count": 30},
        {"Hotspot_ID": 1, "Latitude": 31.819, "Longitude": -65.836, "Avg_Suitability": 0.459, "Point_Count": 48},
        {"Hotspot_ID": 2, "Latitude": 34.089, "Longitude": 94.472, "Avg_Suitability": 0.463, "Point_Count": 38},
        {"Hotspot_ID": 3, "Latitude": -16.051, "Longitude": -138.535, "Avg_Suitability": 0.476, "Point_Count": 37},
        {"Hotspot_ID": 4, "Latitude": -23.047, "Longitude": 91.904, "Avg_Suitability": 0.460, "Point_Count": 47}
    ],
    shark_tracking: [
        {"timestamp": "2024-01-01T00:00:00", "latitude": 25.1, "longitude": -79.9, "depth": 45, "temperature": 22.1, "feeding_event": false, "prey_detected": null},
        {"timestamp": "2024-01-01T01:00:00", "latitude": 25.0, "longitude": -80.1, "depth": 67, "temperature": 21.8, "feeding_event": true, "prey_detected": "small_fish"},
        {"timestamp": "2024-01-01T02:00:00", "latitude": 24.9, "longitude": -80.0, "depth": 32, "temperature": 22.5, "feeding_event": false, "prey_detected": null}
    ],
    trophic_model: {"time": [0,5,10,15,20,25,30], "phytoplankton": [100,105,95,98,102,97,101], "zooplankton": [50,45,55,52,48,53,49], "sharks": [10,9,11,10.5,9.5,10.8,10.2]},
    environmental_factors: {"chlorophyll_importance": 30, "temperature_importance": 20, "eddy_importance": 20, "bathymetry_importance": 15, "ssh_importance": 15}
};

// Quiz questions and answers
const quizData = [
    {
        question: "What role do sharks play in ocean ecosystems?",
        options: [
            "Apex predators that maintain ecosystem balance",
            "Bottom feeders that clean the ocean floor", 
            "Plant eaters that consume seaweed",
            "Passive swimmers with no ecological impact"
        ],
        correct: 0,
        explanation: "Correct! Sharks are apex predators that control populations of other marine species, maintaining the delicate balance of ocean ecosystems."
    },
    {
        question: "Which NASA satellite missions provide data for shark habitat prediction?",
        options: [
            "Hubble and James Webb",
            "PACE and SWOT",
            "Landsat and MODIS",
            "Kepler and TESS"
        ],
        correct: 1,
        explanation: "Excellent! PACE tracks phytoplankton and ocean color, while SWOT measures sea surface height and ocean currents - both crucial for understanding shark habitats."
    },
    {
        question: "What does high chlorophyll-a concentration in ocean water indicate?",
        options: [
            "Polluted water unsuitable for marine life",
            "Deep ocean trenches with no sunlight",
            "Rich phytoplankton populations supporting the food web",
            "Areas with high water temperature only"
        ],
        correct: 2,
        explanation: "Perfect! High chlorophyll-a indicates abundant phytoplankton, which forms the base of the ocean food web that ultimately supports shark populations."
    }
];

// Global state
let currentTab = 'learn';
let currentQuizQuestion = 0;
let quizScore = 0;
let trophicChart = null;
let trackingInterval = null;
let currentTrackingIndex = 0;

// Initialize the application when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    initializeSliders();
    initializeHotspots();
    initializeTrophicChart();
    initializeTracking();
    initializePrediction();
    initializeQuiz();
    updateProgress();
});

// Tab navigation functionality
function initializeTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Update active tab button
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Update active tab content
            tabContents.forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(targetTab).classList.add('active');
            
            currentTab = targetTab;
            updateProgress();
            
            // Initialize specific tab features
            if (targetTab === 'track') {
                startTracking();
            } else if (targetTab === 'learn' && !trophicChart) {
                setTimeout(() => initializeTrophicChart(), 100);
            }
        });
    });
}

// Initialize interactive sliders for habitat controls
function initializeSliders() {
    const chlorophyllSlider = document.getElementById('chlorophyll-slider');
    const temperatureSlider = document.getElementById('temperature-slider');
    const eddySlider = document.getElementById('eddy-slider');
    
    const chlorophyllValue = document.getElementById('chlorophyll-value');
    const temperatureValue = document.getElementById('temperature-value');
    const eddyValue = document.getElementById('eddy-value');
    
    function updateSuitability() {
        const chlorophyll = parseFloat(chlorophyllSlider.value);
        const temperature = parseFloat(temperatureSlider.value);
        const eddy = parseFloat(eddySlider.value);
        
        // Simple habitat suitability calculation
        let suitability = 0;
        
        // Chlorophyll contribution (30%)
        const chlorophyllScore = Math.max(0, Math.min(1, chlorophyll / 2)) * 0.3;
        
        // Temperature contribution (20%) - optimal range 15-25°C
        const tempScore = Math.max(0, 1 - Math.abs(temperature - 20) / 15) * 0.2;
        
        // Eddy contribution (20%) - moderate activity preferred
        const eddyScore = Math.max(0, 1 - Math.abs(eddy - 0.05) / 0.1) * 0.2;
        
        // Base score for other factors (30%)
        const baseScore = 0.3;
        
        suitability = (chlorophyllScore + tempScore + eddyScore + baseScore) * 100;
        suitability = Math.max(0, Math.min(100, suitability));
        
        // Update display
        document.getElementById('suitability-fill').style.width = suitability + '%';
        document.getElementById('suitability-score').textContent = Math.round(suitability) + '%';
    }
    
    if (chlorophyllSlider) {
        chlorophyllSlider.addEventListener('input', function() {
            chlorophyllValue.textContent = this.value;
            updateSuitability();
        });
    }
    
    if (temperatureSlider) {
        temperatureSlider.addEventListener('input', function() {
            temperatureValue.textContent = this.value;
            updateSuitability();
        });
    }
    
    if (eddySlider) {
        eddySlider.addEventListener('input', function() {
            eddyValue.textContent = this.value;
            updateSuitability();
        });
    }
}

// Initialize hotspots display
function initializeHotspots() {
    const hotspotsGrid = document.getElementById('hotspots-grid');
    if (!hotspotsGrid) return;
    
    appData.hotspots.forEach((hotspot, index) => {
        const hotspotCard = document.createElement('div');
        hotspotCard.className = 'hotspot-card';
        
        const regions = ['South Atlantic', 'North Atlantic', 'Indian Ocean', 'Central Pacific', 'Indo-Pacific'];
        const region = regions[index] || 'Ocean Region ' + (index + 1);
        
        hotspotCard.innerHTML = `
            <div class="hotspot-title">Hotspot ${hotspot.Hotspot_ID + 1}: ${region}</div>
            <div class="hotspot-coords">${hotspot.Latitude.toFixed(1)}°, ${hotspot.Longitude.toFixed(1)}°</div>
            <div class="hotspot-suitability">Suitability: ${Math.round(hotspot.Avg_Suitability * 100)}%</div>
            <div class="hotspot-points">${hotspot.Point_Count} data points</div>
        `;
        
        hotspotCard.addEventListener('click', function() {
            showHotspotDetails(hotspot, region);
        });
        
        hotspotsGrid.appendChild(hotspotCard);
    });
}

// Show hotspot details in a tooltip or modal
function showHotspotDetails(hotspot, region) {
    alert(`Foraging Hotspot: ${region}\n\nLocation: ${hotspot.Latitude.toFixed(2)}°, ${hotspot.Longitude.toFixed(2)}°\nAverage Habitat Suitability: ${Math.round(hotspot.Avg_Suitability * 100)}%\nData Points: ${hotspot.Point_Count}\n\nThis area shows high concentrations of prey species and favorable environmental conditions for shark foraging behavior.`);
}

// Initialize trophic cascade chart
function initializeTrophicChart() {
    const ctx = document.getElementById('trophicChart');
    if (!ctx || trophicChart) return;
    
    trophicChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: appData.trophic_model.time,
            datasets: [
                {
                    label: 'Phytoplankton',
                    data: appData.trophic_model.phytoplankton,
                    borderColor: '#34D399',
                    backgroundColor: 'rgba(52, 211, 153, 0.1)',
                    borderWidth: 3,
                    fill: true
                },
                {
                    label: 'Zooplankton',
                    data: appData.trophic_model.zooplankton,
                    borderColor: '#60A5FA',
                    backgroundColor: 'rgba(96, 165, 250, 0.1)',
                    borderWidth: 3,
                    fill: true
                },
                {
                    label: 'Sharks',
                    data: appData.trophic_model.sharks,
                    borderColor: '#F87171',
                    backgroundColor: 'rgba(248, 113, 113, 0.1)',
                    borderWidth: 3,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Ocean Food Web Dynamics Over Time'
                },
                legend: {
                    position: 'top'
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time (Days)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Population Level'
                    }
                }
            },
            animation: {
                duration: 2000,
                easing: 'easeInOutQuart'
            }
        }
    });
}

// Initialize shark tracking simulation
function initializeTracking() {
    populateTimeline();
    updateCurrentSensorData();
}

// Start real-time tracking simulation
function startTracking() {
    if (trackingInterval) clearInterval(trackingInterval);
    
    currentTrackingIndex = 0;
    trackingInterval = setInterval(() => {
        updateCurrentSensorData();
        currentTrackingIndex = (currentTrackingIndex + 1) % appData.shark_tracking.length;
    }, 3000);
}

// Update sensor data display
function updateCurrentSensorData() {
    const currentData = appData.shark_tracking[currentTrackingIndex];
    if (!currentData) return;
    
    const locationEl = document.getElementById('current-location');
    const depthEl = document.getElementById('current-depth');
    const tempEl = document.getElementById('current-temp');
    const statusEl = document.getElementById('feeding-status');
    
    if (locationEl) locationEl.textContent = `${currentData.latitude.toFixed(1)}°N, ${Math.abs(currentData.longitude).toFixed(1)}°W`;
    if (depthEl) depthEl.textContent = `${currentData.depth} m`;
    if (tempEl) tempEl.textContent = `${currentData.temperature.toFixed(1)}°C`;
    if (statusEl) {
        statusEl.textContent = currentData.feeding_event ? 'Feeding' : 'Hunting';
        statusEl.style.color = currentData.feeding_event ? '#10B981' : '#F59E0B';
    }
}

// Populate timeline with tracking events
function populateTimeline() {
    const timeline = document.getElementById('shark-timeline');
    if (!timeline) return;
    
    timeline.innerHTML = '';
    
    appData.shark_tracking.forEach((event, index) => {
        const timelineEvent = document.createElement('div');
        timelineEvent.className = 'timeline-event';
        
        const time = new Date(event.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        let description = `Depth: ${event.depth}m, Temp: ${event.temperature.toFixed(1)}°C`;
        
        if (event.feeding_event && event.prey_detected) {
            description += ` - 🍽️ Fed on ${event.prey_detected}`;
        }
        
        timelineEvent.innerHTML = `
            <div class="timeline-time">${time}</div>
            <div class="timeline-description">${description}</div>
        `;
        
        timeline.appendChild(timelineEvent);
    });
}

// Initialize prediction functionality
function initializePrediction() {
    const predictBtn = document.getElementById('predict-btn');
    if (!predictBtn) return;
    
    predictBtn.addEventListener('click', function() {
        generatePrediction();
    });
}

// Generate habitat prediction
function generatePrediction() {
    const season = document.getElementById('season-select').value;
    const region = document.getElementById('region-select').value;
    
    // Simple prediction algorithm based on season and region
    let baseSuitability = 50;
    let confidence = 70;
    
    // Season adjustments
    const seasonAdjustments = {
        'spring': 10,
        'summer': 15,
        'fall': 5,
        'winter': -5
    };
    
    // Region adjustments
    const regionAdjustments = {
        'atlantic': 15,
        'pacific': 10,
        'indian': 12,
        'southern': -10
    };
    
    baseSuitability += seasonAdjustments[season] || 0;
    baseSuitability += regionAdjustments[region] || 0;
    
    // Add some randomness
    baseSuitability += Math.random() * 20 - 10;
    baseSuitability = Math.max(10, Math.min(95, baseSuitability));
    
    confidence += Math.random() * 20 - 10;
    confidence = Math.max(60, Math.min(95, confidence));
    
    // Determine action
    let action = 'Monitor closely';
    if (baseSuitability > 75) action = 'Increase protection measures';
    else if (baseSuitability < 40) action = 'Low priority area';
    else if (baseSuitability > 60) action = 'Establish monitoring station';
    
    // Display results
    document.getElementById('predicted-suitability').textContent = Math.round(baseSuitability) + '%';
    document.getElementById('prediction-confidence').textContent = Math.round(confidence) + '%';
    document.getElementById('recommended-action').textContent = action;
    document.getElementById('prediction-results').style.display = 'block';
}

// Initialize quiz functionality
function initializeQuiz() {
    loadQuizQuestion();
    
    const shareBtn = document.getElementById('share-results');
    if (shareBtn) {
        shareBtn.addEventListener('click', function() {
            shareQuizResults();
        });
    }
}

// Load current quiz question
function loadQuizQuestion() {
    if (currentQuizQuestion >= quizData.length) {
        showQuizResults();
        return;
    }
    
    const question = quizData[currentQuizQuestion];
    const questionEl = document.getElementById('quiz-question');
    const optionsEl = document.querySelector('.quiz-options');
    const feedbackEl = document.getElementById('quiz-feedback');
    const progressEl = document.querySelector('.quiz-progress span');
    
    if (questionEl) questionEl.textContent = question.question;
    if (progressEl) progressEl.textContent = `Question ${currentQuizQuestion + 1} of ${quizData.length}`;
    
    if (optionsEl) {
        optionsEl.innerHTML = '';
        question.options.forEach((option, index) => {
            const btn = document.createElement('button');
            btn.className = 'quiz-option';
            btn.textContent = option;
            btn.addEventListener('click', () => handleQuizAnswer(index));
            optionsEl.appendChild(btn);
        });
    }
    
    if (feedbackEl) {
        feedbackEl.style.display = 'none';
    }
}

// Handle quiz answer selection
function handleQuizAnswer(selectedIndex) {
    const question = quizData[currentQuizQuestion];
    const options = document.querySelectorAll('.quiz-option');
    const feedbackEl = document.getElementById('quiz-feedback');
    
    // Disable all options
    options.forEach(option => option.disabled = true);
    
    // Highlight correct and incorrect answers
    options.forEach((option, index) => {
        if (index === question.correct) {
            option.classList.add('correct');
        } else if (index === selectedIndex && selectedIndex !== question.correct) {
            option.classList.add('incorrect');
        }
    });
    
    // Show feedback
    if (feedbackEl) {
        feedbackEl.innerHTML = `<p>${question.explanation}</p>`;
        feedbackEl.style.display = 'block';
    }
    
    // Update score
    if (selectedIndex === question.correct) {
        quizScore++;
    }
    
    // Move to next question after delay
    setTimeout(() => {
        currentQuizQuestion++;
        loadQuizQuestion();
    }, 3000);
}

// Show quiz results
function showQuizResults() {
    document.getElementById('quiz-container').style.display = 'none';
    document.getElementById('quiz-results').style.display = 'block';
    
    const scoreEl = document.getElementById('final-score');
    if (scoreEl) {
        scoreEl.textContent = `You scored ${quizScore} out of ${quizData.length}!`;
    }
    
    // Update message based on score
    const messageEl = document.querySelector('#quiz-results p');
    if (messageEl) {
        if (quizScore === quizData.length) {
            messageEl.textContent = '🎉 Perfect! You\'re a shark conservation expert!';
        } else if (quizScore >= quizData.length * 0.7) {
            messageEl.textContent = '🌟 Great job! You have a solid understanding of shark ecology.';
        } else {
            messageEl.textContent = '📚 Good effort! Review the materials to learn more about shark conservation.';
        }
    }
}

// Share quiz results
function shareQuizResults() {
    const text = `I just completed the Shark Habitat Prediction System quiz and scored ${quizScore}/${quizData.length}! Learn about shark conservation using NASA satellite data. 🦈🛰️`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Shark Habitat Prediction System Quiz Results',
            text: text,
            url: window.location.href
        });
    } else {
        // Fallback - copy to clipboard
        navigator.clipboard.writeText(text + '\n' + window.location.href).then(() => {
            alert('Results copied to clipboard! Share with your friends.');
        }).catch(() => {
            alert('Share this: ' + text);
        });
    }
}

// Update progress indicator
function updateProgress() {
    const progressFill = document.querySelector('.progress-fill');
    if (!progressFill) return;
    
    const tabOrder = ['learn', 'explore', 'track', 'protect'];
    const currentIndex = tabOrder.indexOf(currentTab);
    const progress = ((currentIndex + 1) / tabOrder.length) * 100;
    
    progressFill.style.width = progress + '%';
    
    const progressText = document.querySelector('.progress-indicator p');
    if (progressText) {
        progressText.textContent = `Progress: ${currentIndex + 1} of ${tabOrder.length} sections completed`;
    }
}

// Cleanup function for intervals
function cleanup() {
    if (trackingInterval) {
        clearInterval(trackingInterval);
    }
}

// Handle page visibility change to manage resources
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        cleanup();
    } else if (currentTab === 'track') {
        startTracking();
    }
});

// Handle window beforeunload
window.addEventListener('beforeunload', cleanup);

// Add some fun sound effects (optional, commented out for compatibility)
/*
function playSound(type) {
    const sounds = {
        click: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+...', // Base64 encoded click sound
        success: '...',
        water: '...'
    };
    
    if (sounds[type]) {
        const audio = new Audio(sounds[type]);
        audio.play().catch(() => {}); // Ignore errors
    }
}
*/

// Add click sound to buttons (commented out)
/*
document.addEventListener('click', function(e) {
    if (e.target.matches('.btn, .tab-btn, .quiz-option')) {
        playSound('click');
    }
});
*/

// Add some educational tooltips
function addTooltips() {
    const tooltipElements = [
        { selector: '.module-icon', text: 'Click to learn more about this topic' },
        { selector: '.sensor-card', text: 'Real-time data from smart shark tags' },
        { selector: '.hotspot-card', text: 'Click to see detailed information about this foraging area' }
    ];
    
    tooltipElements.forEach(({ selector, text }) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            el.title = text;
        });
    });
}

// Initialize tooltips after DOM load
setTimeout(addTooltips, 1000);

console.log('Shark Habitat Prediction System initialized successfully! 🦈🛰️');
