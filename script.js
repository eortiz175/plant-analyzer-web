class PlantAnalyzerApp {
    constructor() {
        this.analyzer = new PlantAnalyzer();
        this.initializeElements();
        this.setupEventListeners();
        this.stream = null;
    }

    initializeElements() {
        this.elements = {
            uploadBox: document.getElementById('uploadBox'),
            cameraSection: document.getElementById('cameraSection'),
            previewSection: document.getElementById('previewSection'),
            loadingSection: document.getElementById('loadingSection'),
            resultsSection: document.getElementById('resultsSection'),
            errorSection: document.getElementById('errorSection'),
            
            cameraBtn: document.getElementById('cameraBtn'),
            uploadBtn: document.getElementById('uploadBtn'),
            fileInput: document.getElementById('fileInput'),
            cameraView: document.getElementById('cameraView'),
            captureBtn: document.getElementById('captureBtn'),
            cancelCameraBtn: document.getElementById('cancelCameraBtn'),
            photoCanvas: document.getElementById('photoCanvas'),
            previewImage: document.getElementById('previewImage'),
            analyzeBtn: document.getElementById('analyzeBtn'),
            newPhotoBtn: document.getElementById('newPhotoBtn')
        };
    }

    setupEventListeners() {
        this.elements.cameraBtn.addEventListener('click', () => this.startCamera());
        this.elements.uploadBtn.addEventListener('click', () => this.elements.fileInput.click());
        this.elements.fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        this.elements.captureBtn.addEventListener('click', () => this.capturePhoto());
        this.elements.cancelCameraBtn.addEventListener('click', () => this.stopCamera());
        this.elements.analyzeBtn.addEventListener('click', () => this.analyzePlant());
        this.elements.newPhotoBtn.addEventListener('click', () => this.showUploadSection());
    }

    async startCamera() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' } 
            });
            this.elements.cameraView.srcObject = this.stream;
            this.showSection(this.elements.cameraSection);
            this.hideSection(this.elements.uploadBox);
        } catch (error) {
            this.showError('Camera access denied. Please allow camera access to use this feature.');
        }
    }

    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        this.showUploadSection();
    }

    capturePhoto() {
        const canvas = this.elements.photoCanvas;
        const video = this.elements.cameraView;
        const context = canvas.getContext('2d');
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        this.currentImageData = canvas.toDataURL('image/jpeg');
        this.elements.previewImage.src = this.currentImageData;
        
        this.stopCamera();
        this.showPreviewSection();
    }

    handleFileUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.currentImageData = e.target.result;
                this.elements.previewImage.src = this.currentImageData;
                this.showPreviewSection();
            };
            reader.readAsDataURL(file);
        }
    }

    showPreviewSection() {
        this.hideAllSections();
        this.showSection(this.elements.previewSection);
    }

    async analyzePlant() {
        if (!this.currentImageData) return;
        
        this.hideAllSections();
        this.showSection(this.elements.loadingSection);
        
        try {
            // Simulate processing time for better UX
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            const results = await this.analyzer.analyzeImage(this.currentImageData);
            this.displayResults(results);
        } catch (error) {
            this.showError('Error analyzing image. Please try again with a different photo.');
        }
    }

    displayResults(results) {
        this.hideAllSections();
        this.showSection(this.elements.resultsSection);
        
        const scorePercent = (results.healthScore / 100) * 360;
        
        const resultsHTML = `
            <div class="health-card">
                <div class="health-score">
                    <div class="score-circle" style="--score-percent: ${scorePercent}deg">
                        <div class="score-value">${results.healthScore}</div>
                    </div>
                    <h2 style="color: ${results.healthColor}">
                        ${results.healthEmoji} ${results.healthStatus}
                    </h2>
                    <p>Overall Plant Health Score</p>
                </div>
                
                <div class="metrics-grid">
                    <div class="metric-card">
                        <div class="metric-label">Green Coverage</div>
                        <div class="metric-value">${results.metrics.greenCoverage}%</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-label">Green Intensity</div>
                        <div class="metric-value">${results.metrics.greenIntensity}/255</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-label">Yellow Areas</div>
                        <div class="metric-value">${results.metrics.yellowAreas}%</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-label">Brown Areas</div>
                        <div class="metric-value">${results.metrics.brownAreas}%</div>
                    </div>
                </div>
                
                <div class="recommendations">
                    <h3>💡 Care Recommendations</h3>
                    <ul>
                        ${results.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                    </ul>
                </div>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
                <button onclick="app.showUploadSection()" class="btn primary">
                    🌿 Analyze Another Plant
                </button>
            </div>
        `;
        
        this.elements.resultsSection.innerHTML = resultsHTML;
    }

    showUploadSection() {
        this.hideAllSections();
        this.showSection(this.elements.uploadBox);
        this.currentImageData = null;
        this.elements.fileInput.value = '';
    }

    showError(message) {
        this.hideAllSections();
        this.showSection(this.elements.errorSection);
        this.elements.errorSection.innerHTML = `
            <h3>❌ Error</h3>
            <p>${message}</p>
            <button onclick="app.showUploadSection()" class="btn primary" style="margin-top: 20px;">
                Try Again
            </button>
        `;
    }

    hideAllSections() {
        const sections = [
            this.elements.uploadBox,
            this.elements.cameraSection,
            this.elements.previewSection,
            this.elements.loadingSection,
            this.elements.resultsSection,
            this.elements.errorSection
        ];
        sections.forEach(section => this.hideSection(section));
    }

    showSection(section) {
        section.style.display = 'block';
    }

    hideSection(section) {
        section.style.display = 'none';
    }
}

// Initialize the app when the page loads
const app = new PlantAnalyzerApp();
