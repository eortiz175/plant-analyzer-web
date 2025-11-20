class PlantAnalyzer {
    constructor() {
        this.results = {};
    }

    analyzeImage(imageData) {
        return new Promise((resolve) => {
            // Create off-screen canvas for analysis
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                this.analyzePixels(imageData);
                resolve(this.generateResults());
            };
            
            img.src = imageData;
        });
    }

    analyzePixels(imageData) {
        const pixels = imageData.data;
        const totalPixels = pixels.length / 4;
        
        let greenPixels = 0;
        let greenIntensitySum = 0;
        let yellowPixels = 0;
        let brownPixels = 0;
        
        // Sample pixels for performance (every 4th pixel)
        for (let i = 0; i < pixels.length; i += 16) {
            const r = pixels[i];
            const g = pixels[i + 1];
            const b = pixels[i + 2];
            
            // Green detection (plant foliage)
            if (g > r && g > b && g > 50) {
                greenPixels++;
                greenIntensitySum += g;
            }
            
            // Yellow detection (potential issues)
            if (r > 150 && g > 150 && b < 100) {
                yellowPixels++;
            }
            
            // Brown detection (potential issues)
            if (r > 100 && r < 200 && g < r && b < 100) {
                brownPixels++;
            }
        }
        
        const sampledPixels = totalPixels / 4;
        const greenPercentage = (greenPixels / sampledPixels) * 100;
        const avgGreenIntensity = greenIntensitySum / (greenPixels || 1);
        const yellowPercentage = (yellowPixels / sampledPixels) * 100;
        const brownPercentage = (brownPixels / sampledPixels) * 100;
        
        // Calculate health score (simplified algorithm)
        const healthScore = Math.min(100, Math.round(
            (greenPercentage * avgGreenIntensity) / 255
        ));
        
        this.results = {
            healthScore: healthScore,
            greenCoverage: Math.round(greenPercentage * 100) / 100,
            greenIntensity: Math.round(avgGreenIntensity),
            yellowAreas: Math.round(yellowPercentage * 100) / 100,
            brownAreas: Math.round(brownPercentage * 100) / 100,
            totalDiscoloration: Math.round((yellowPercentage + brownPercentage) * 100) / 100
        };
    }

    generateResults() {
        const health = this.results;
        
        // Determine health status
        let healthStatus, healthColor, healthEmoji;
        if (health.healthScore > 70) {
            healthStatus = "Healthy";
            healthColor = "#4caf50";
            healthEmoji = "🌿";
        } else if (health.healthScore > 40) {
            healthStatus = "Moderate";
            healthColor = "#ff9800";
            healthEmoji = "⚠️";
        } else {
            healthStatus = "Needs Attention";
            healthColor = "#f44336";
            healthEmoji = "❌";
        }
        
        // Generate recommendations
        const recommendations = [];
        if (health.healthScore > 70) {
            recommendations.push("Your plant appears healthy! Continue current care routine.");
        } else {
            recommendations.push("Check your watering schedule - ensure proper drainage");
            recommendations.push("Consider using plant-appropriate fertilizer");
        }
        
        if (health.yellowAreas > 10) {
            recommendations.push("Yellowing may indicate overwatering or nutrient deficiency");
        }
        
        if (health.brownAreas > 5) {
            recommendations.push("Browning could mean too much direct sunlight or under-watering");
        }
        
        if (health.greenCoverage < 30) {
            recommendations.push("For better analysis, take a closer photo focused on the plant");
        }
        
        if (recommendations.length === 0) {
            recommendations.push("No specific issues detected. Maintain regular plant care.");
        }
        
        return {
            healthScore: health.healthScore,
            healthStatus,
            healthColor,
            healthEmoji,
            metrics: {
                greenCoverage: health.greenCoverage,
                greenIntensity: health.greenIntensity,
                yellowAreas: health.yellowAreas,
                brownAreas: health.brownAreas,
                totalDiscoloration: health.totalDiscoloration
            },
            recommendations
        };
    }
}
