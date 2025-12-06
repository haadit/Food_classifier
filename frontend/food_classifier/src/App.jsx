import { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import { 
  Brain, 
  History, 
  User, 
  BarChart3, 
  LogIn, 
  LogOut, 
  Camera, 
  Activity, 
  Apple, 
  Carrot, 
  HeartPulse, 
  Scale, 
  BookOpen, 
  Dumbbell, 
  CheckCircle,
  BarChart2,
  Smartphone,
  Cloud,
  ShieldCheck,
  Zap as Lightning
} from "lucide-react";
import ImageUpload from "./components/ImageUpload";
import ResultsDisplay from "./components/ResultsDisplay";
import AuthModal from "./components/AuthModal";
import UserProfile from "./components/UserProfile";
import FoodTrackingDashboard from "./components/FoodTrackingDashboard";
import AddRecipe from "./components/AddRecipe";
import AddFoodTracking from "./components/AddFoodTracking";
import { Link } from "react-router-dom";
import { foodClassifierAPI } from "./services/api";
import { loadHistory, saveHistoryItem, clearHistory } from "./services/history";
import { useAuth } from "./contexts/AuthContext";
import "./App.css";

function App() {
  const { user, signOut } = useAuth();
  const [selectedImage, setSelectedImage] = useState(null);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [serverStatus, setServerStatus] = useState(null);
  const [historyItems, setHistoryItems] = useState([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showDashboardModal, setShowDashboardModal] = useState(false);
  const [showAddRecipeModal, setShowAddRecipeModal] = useState(false);
  const [showAddTrackingModal, setShowAddTrackingModal] = useState(false);
  const [selectedFoodCategory, setSelectedFoodCategory] = useState(null);
  const [selectedPrediction, setSelectedPrediction] = useState(null);

  // Check server health on component mount
  useEffect(() => {
    const checkServerHealth = async () => {
      try {
        const health = await foodClassifierAPI.checkHealth();
        setServerStatus(health);
      } catch (error) {
        setServerStatus({ status: "error", message: error.message });
      }
    };

    const loadHistoryData = async () => {
      try {
        const history = await loadHistory(); // Don't pass user?.id
        setHistoryItems(history);
      } catch (error) {
        console.error("Failed to load history:", error);
      }
    };

    checkServerHealth();
    loadHistoryData();
  }, []); // Remove user dependency

  const handleImageSelect = (imageFile, options = {}) => {
    setSelectedImage(imageFile);
    setResult(null);
    setError(null);
    if (options.autoAnalyze) {
      // Defer slightly to ensure state updates
      setTimeout(() => handlePredict(), 50);
    }
  };

  const handlePredict = async () => {
    if (!selectedImage) return;

    setIsLoading(true);
    setError(null);

    try {
      const prediction = await foodClassifierAPI.predictFood(selectedImage);
      setResult(prediction);

      // Persist to history with Supabase
      try {
        const entry = {
          label: prediction.class,
          confidence: prediction.confidence,
          all_confidences: prediction.all_confidences,
          timestamp: new Date().toISOString(),
          id: crypto?.randomUUID?.() || `${Date.now()}`,
        };
        console.log('Attempting to save prediction to history...', { entry, userId: user?.id });
        const savedEntry = await saveHistoryItem(entry, selectedImage, user?.id);
        console.log('Prediction saved to history:', savedEntry);
        setHistoryItems(prev => [savedEntry, ...prev]);
      } catch (historyError) {
        console.error("Failed to save to history:", historyError);
        // Don't fail the entire prediction if history save fails
        // Show a warning to user
        setError(`Prediction successful but failed to save to history: ${historyError.message}`);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setResult(null);
    setError(null);
  };

  const handleAddRecipe = (foodCategory) => {
    setSelectedFoodCategory(foodCategory);
    setShowAddRecipeModal(true);
  };

  const handleTrackFood = (prediction) => {
    setSelectedPrediction(prediction);
    setShowAddTrackingModal(true);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-icon" aria-hidden="true">
              <Brain size={32} />
            </div>
            <h1 className="app-title">Fresh vs Stale Food Classifier</h1>
          </div>
          <div className="server-status">
            {serverStatus && (
              <div
                className={`status-indicator ${
                  serverStatus.status === "ok" ? "online" : "offline"
                }`}
              >
                <div className="status-dot" aria-hidden="true"></div>
                <span>
                  {serverStatus.status === "ok"
                    ? `Server Online (${serverStatus.num_classes} classes)`
                    : "Server Offline"}
                </span>
              </div>
            )}
            <div className="header-actions">
              <Link className="history-button" to="/history">
                <History size={16} /> History
              </Link>
              {user ? (
                <>
                  <button 
                    className="dashboard-button"
                    onClick={() => setShowDashboardModal(true)}
                  >
                    <BarChart3 size={16} /> Dashboard
                  </button>
                  <button 
                    className="profile-button"
                    onClick={() => setShowProfileModal(true)}
                  >
                    <User size={16} /> Profile
                  </button>
                  <button 
                    className="logout-button"
                    onClick={async () => {
                      try {
                        await signOut();
                      } catch (error) {
                        console.error('Logout failed:', error);
                        setError('Failed to logout. Please try again.');
                      }
                    }}
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </>
              ) : (
                <button 
                  className="login-button"
                  onClick={() => setShowAuthModal(true)}
                >
                  <LogIn size={16} /> Login
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="app-main">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <div className="hero-badge">
              <span>AI-Powered Nutrition Analysis</span>
            </div>
            <h1 className="hero-title">Transform Your Health with Intelligent Food Recognition</h1>
            <p className="hero-description">
              Harness the power of artificial intelligence to analyze food, track nutrition, and make informed dietary choices. 
              Our advanced algorithms provide instant insights about your meals, helping you maintain a balanced and healthy lifestyle.
            </p>
            <div className="hero-cta">
              <button className="btn btn-primary btn-lg">
                <Camera size={20} className="mr-2" />
                Analyze Food Now
              </button>
              <button className="btn btn-outline ml-4">
                <BookOpen size={20} className="mr-2" />
                Learn More
              </button>
            </div>
          </div>
          <div className="hero-image">
            <div className="floating-elements" aria-hidden="true">
              <div className="floating-element el-1">
                <Apple size={32} aria-hidden="true" />
                <span>Fresh Fruits</span>
              </div>
              <div className="floating-element el-2">
                <Carrot size={32} aria-hidden="true" />
                <span>Vegetables</span>
              </div>
              <div className="floating-element el-3">
                <Dumbbell size={32} aria-hidden="true" />
                <span>Fitness</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section">
          <div className="section-header">
            <h2>Powerful Features for Your Health Journey</h2>
            <p>Discover how our AI-powered platform can transform your relationship with food</p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <Camera size={32} />
              </div>
              <h3>Instant Food Recognition</h3>
              <p>Simply take a photo of your meal and let our AI identify the food items with high accuracy, analyzing portion sizes and ingredients.</p>
              <ul className="feature-list">
                <li><CheckCircle size={16} /> 95%+ recognition accuracy</li>
                <li><CheckCircle size={16} /> Works with complex meals</li>
                <li><CheckCircle size={16} /> Multiple food items detection</li>
              </ul>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <Activity size={32} />
              </div>
              <h3>Nutrition Tracking</h3>
              <p>Get detailed nutritional breakdown including calories, macronutrients, vitamins, and minerals for every meal you log.</p>
              <ul className="feature-list">
                <li><CheckCircle size={16} /> Macro and micronutrient tracking</li>
                <li><CheckCircle size={16} /> Daily nutrition goals</li>
                <li><CheckCircle size={16} /> Water intake monitoring</li>
              </ul>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <HeartPulse size={32} />
              </div>
              <h3>Health Insights</h3>
              <p>Personalized recommendations based on your dietary preferences, health goals, and nutritional needs.</p>
              <ul className="feature-list">
                <li><CheckCircle size={16} /> Personalized meal suggestions</li>
                <li><CheckCircle size={16} /> Allergen detection</li>
                <li><CheckCircle size={16} /> Health trend analysis</li>
              </ul>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <Scale size={32} />
              </div>
              <h3>Weight Management</h3>
              <p>Set and track your weight goals with our comprehensive weight management tools and progress tracking.</p>
              <ul className="feature-list">
                <li><CheckCircle size={16} /> Goal setting and tracking</li>
                <li><CheckCircle size={16} /> Progress visualization</li>
                <li><CheckCircle size={16} /> Calorie deficit/surplus tracking</li>
              </ul>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <BookOpen size={32} />
              </div>
              <h3>Recipe Database</h3>
              <p>Access thousands of healthy recipes tailored to your dietary preferences and nutritional goals.</p>
              <ul className="feature-list">
                <li><CheckCircle size={16} /> Filter by dietary needs</li>
                <li><CheckCircle size={16} /> Step-by-step instructions</li>
                <li><CheckCircle size={16} /> Save favorites</li>
              </ul>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <BarChart2 size={32} />
              </div>
              <h3>Detailed Analytics</h3>
              <p>Comprehensive reports and visualizations of your eating habits and nutritional intake over time.</p>
              <ul className="feature-list">
                <li><CheckCircle size={16} /> Weekly/Monthly reports</li>
                <li><CheckCircle size={16} /> Nutrient balance charts</li>
                <li><CheckCircle size={16} /> Exportable data</li>
              </ul>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="how-it-works">
          <div className="section-header">
            <h2>How It Works</h2>
            <p>Get started in just a few simple steps</p>
          </div>
          
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Take a Photo</h3>
              <p>Snap a clear picture of your meal or select an existing photo from your gallery.</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>AI Analysis</h3>
              <p>Our advanced AI processes the image to identify food items and portion sizes.</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Get Insights</h3>
              <p>Receive detailed nutritional information and personalized recommendations.</p>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="benefits">
          <div className="benefits-content">
            <div className="benefits-text">
              <h2>Why Choose Our Platform?</h2>
              <div className="benefit-item">
                <ShieldCheck size={24} className="benefit-icon" />
                <div>
                  <h3>Accurate & Reliable</h3>
                  <p>Powered by state-of-the-art AI trained on millions of food images for precise recognition.</p>
                </div>
              </div>
              <div className="benefit-item">
                <Lightning size={24} className="benefit-icon" />
                <div>
                  <h3>Lightning Fast</h3>
                  <p>Get instant results and real-time analysis without any delays.</p>
                </div>
              </div>
              <div className="benefit-item">
                <Smartphone size={24} className="benefit-icon" />
                <div>
                  <h3>Mobile Friendly</h3>
                  <p>Works seamlessly across all your devices, anytime, anywhere.</p>
                </div>
              </div>
              <div className="benefit-item">
                <Cloud size={24} className="benefit-icon" />
                <div>
                  <h3>Cloud Sync</h3>
                  <p>Your data is securely stored and synced across all your devices.</p>
                </div>
              </div>
            </div>
            <div className="benefits-image">
              {/* Placeholder for app screenshot */}
              <div className="app-preview">
                <div className="phone-mockup">
                  <div className="screen">
                    <div className="app-screen">
                      <div className="food-item">
                        <div className="food-image"></div>
                        <div className="food-details">
                          <h4>Chicken Salad</h4>
                          <div className="nutrition-facts">
                            <span>450 cal</span>
                            <span>35g protein</span>
                            <span>25g carbs</span>
                            <span>22g fat</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="testimonials">
          <div className="section-header">
            <h2>What Our Users Say</h2>
            <p>Join thousands of satisfied users who transformed their health</p>
          </div>
          
          <div className="testimonial-cards">
            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>"This app changed my relationship with food. I've lost 15 pounds in 3 months by tracking my meals and following the personalized recommendations."</p>
                <div className="testimonial-author">
                  <div className="author-avatar">JD</div>
                  <div className="author-info">
                    <h4>John D.</h4>
                    <p>Verified User</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>"The food recognition is incredibly accurate, even with complex dishes. It's made tracking my macros so much easier!"</p>
                <div className="testimonial-author">
                  <div className="author-avatar">MS</div>
                  <div className="author-info">
                    <h4>Maria S.</h4>
                    <p>Fitness Enthusiast</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>"As someone with dietary restrictions, the allergen detection has been a game-changer. I feel much more confident about my food choices now."</p>
                <div className="testimonial-author">
                  <div className="author-avatar">AT</div>
                  <div className="author-info">
                    <h4>Alex T.</h4>
                    <p>Health Conscious</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="cta-content">
            <h2>Ready to Transform Your Health?</h2>
            <p>Join thousands of users who have already started their journey to better health with our platform.</p>
            <div className="cta-buttons">
              <button className="btn btn-primary btn-lg">
                Get Started for Free
              </button>
              <button className="btn btn-outline btn-lg ml-4">
                Learn More
              </button>
            </div>
          </div>
        </section>
        <div className="upload-section">
          <ImageUpload
            onImageSelect={handleImageSelect}
            selectedImage={selectedImage}
            isLoading={isLoading}
          />

          {selectedImage && !result && (
            <div className="action-buttons">
              <button
                type="button"
                className="predict-button"
                onClick={handlePredict}
                disabled={isLoading}
              >
                {isLoading ? 'Analyzing...' : 'Analyze Food'}
              </button>
              <button
                type="button"
                className="reset-button"
                onClick={handleReset}
                disabled={isLoading}
              >
                Reset
              </button>
            </div>
          )}

          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}
        </div>

        {result && (
          <ResultsDisplay 
            result={result} 
            selectedImage={selectedImage}
            onAddRecipe={handleAddRecipe}
            onTrackFood={handleTrackFood}
            user={user}
          />
        )}
      </main>

      {/* Modals */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
      <UserProfile 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)} 
      />
      <FoodTrackingDashboard 
        isOpen={showDashboardModal} 
        onClose={() => setShowDashboardModal(false)} 
      />
      <AddRecipe 
        isOpen={showAddRecipeModal} 
        onClose={() => {
          setShowAddRecipeModal(false);
          setSelectedFoodCategory(null);
        }}
        foodCategory={selectedFoodCategory}
      />
      <AddFoodTracking 
        isOpen={showAddTrackingModal} 
        onClose={() => setShowAddTrackingModal(false)}
        prediction={selectedPrediction}
      />

      <footer className="app-footer">
        <p>Powered by TensorFlow & React • Built with ❤️ for food safety</p>
      </footer>
    </div>
  );
}

export default App;
