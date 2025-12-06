import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Eye,
  EyeOff,
  Utensils,
  Plus,
  ChefHat,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getRecipesForClass } from "../data/recipes";
import "./ResultsDisplay.css";

const ResultsDisplay = ({ result, selectedImage, onAddRecipe, onTrackFood, user }) => {
  const [showAllConfidences, setShowAllConfidences] = useState(false);

  if (!result) return null;

  const formatClassName = (className) => {
    return className
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  const isFresh = result.class.startsWith("fresh");
  const confidence = Math.round(result.confidence * 100);
  const recipeInfo = isFresh ? getRecipesForClass(result.class) : null;

  // Prepare data for the chart
  const chartData = Object.entries(result.all_confidences)
    .map(([className, conf]) => ({
      name: formatClassName(className),
      confidence: Math.round(conf * 100),
      isSelected: className === result.class,
    }))
    .sort((a, b) => b.confidence - a.confidence);

  const topResults = showAllConfidences ? chartData : chartData.slice(0, 5);

  return (
    <div className="results-container">
      <div className="results-header">
        <h2 className="results-title">Classification Results</h2>
        <div className={`confidence-badge ${isFresh ? "fresh" : "rotten"}`}>
          {isFresh ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{confidence}% Confidence</span>
        </div>
      </div>

      <div className="main-result">
        <div className="result-card">
          <div className="result-icon">
            {isFresh ? (
              <CheckCircle size={48} className="fresh-icon" />
            ) : (
              <AlertCircle size={48} className="rotten-icon" />
            )}
          </div>
          <div className="result-content">
            <h3 className="result-class">{formatClassName(result.class)}</h3>
            <p className="result-description">
              {isFresh
                ? "This food appears to be fresh and good to eat! 🍎"
                : "This food appears to be spoiled and should not be consumed. ⚠️"}
            </p>
            {recipeInfo && (
              <div style={{ margin: "0.5rem 0 1rem" }}>
                <Link
                  className="history-button"
                  to={`/recipes/${recipeInfo.slug}`}
                >
                  <Utensils size={16} /> Recipes
                </Link>
              </div>
            )}
            
            {/* User Actions for Logged-in Users */}
            {user && (
              <div className="user-actions">
                <button
                  className="action-button track-food-btn"
                  onClick={() => onTrackFood(result)}
                >
                  <Plus size={16} /> Track Food
                </button>
                {isFresh && (
                  <button
                    className="action-button add-recipe-btn"
                    onClick={() => onAddRecipe(result.class)}
                  >
                    <ChefHat size={16} /> Add Recipe
                  </button>
                )}
              </div>
            )}
            <div className="confidence-bar">
              <div className="confidence-label">Confidence Level</div>
              <div className="confidence-track">
                <div
                  className={`confidence-fill ${isFresh ? "fresh" : "rotten"}`}
                  style={{ width: `${confidence}%` }}
                ></div>
              </div>
              <div className="confidence-value">{confidence}%</div>
            </div>
          </div>
        </div>
      </div>

      <div className="confidence-breakdown">
        <div className="breakdown-header">
          <h3 className="breakdown-title">
            <TrendingUp size={20} />
            Confidence Breakdown
          </h3>
          <button
            className="toggle-button"
            onClick={() => setShowAllConfidences(!showAllConfidences)}
          >
            {showAllConfidences ? <EyeOff size={16} /> : <Eye size={16} />}
            {showAllConfidences ? "Show Top 5" : "Show All"}
          </button>
        </div>

        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={topResults}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                label={{
                  value: "Confidence (%)",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip
                formatter={(value) => [`${value}%`, "Confidence"]}
                labelStyle={{ color: "#1e293b" }}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Bar
                dataKey="confidence"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
                className="confidence-bar-chart"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="image-preview-section">
        <h3 className="preview-title">Analyzed Image</h3>
        <div className="analyzed-image">
          <img
            src={URL.createObjectURL(selectedImage)}
            alt="Analyzed food"
            className="result-image"
          />
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;
